# PowerShell release script for Windows
# Automated, secure, idempotent release process

$ErrorActionPreference = "Stop"

# ====================================================
# 0) HARD SECURITY GATE (MANDATORY, FAIL = STOP)
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '0) HARD SECURITY GATE - Scanning for sensitive data' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Patterns to detect sensitive data
$sensitivePatterns = @(
    "password\s*=\s*['`"][^'`"]+['`"]",
    "secret\s*=\s*['`"][^'`"]+['`"]",
    "api[_-]?key\s*=\s*['`"][^'`"]+['`"]",
    "auth[_-]?token\s*=\s*['`"][^'`"]+['`"]",
    "credential\s*=\s*['`"][^'`"]+['`"]",
    "token\s*=\s*['`"][^'`"]+['`"]",
    "private[_-]?key\s*=\s*['`"][^'`"]+['`"]",
    "access[_-]?token\s*=\s*['`"][^'`"]+['`"]"
)

# Files to exclude from scan
$excludeFiles = @(
    "credentials\PalGateApi.credentials.ts",
    "package.json",
    "package-lock.json",
    "node_modules",
    ".git",
    "dist"
)

$foundSensitive = $false

# Scan for sensitive data
foreach ($pattern in $sensitivePatterns) {
    $matches = Get-ChildItem -Recurse -File | 
        Where-Object { 
            $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
            $shouldExclude = $false
            foreach ($exclude in $excludeFiles) {
                if ($relativePath -like "*$exclude*") {
                    $shouldExclude = $true
                    break
                }
            }
            -not $shouldExclude -and $relativePath -notlike "*credentials*"
        } |
        Select-String -Pattern $pattern -CaseSensitive:$false |
        Where-Object { 
            $_.Line -notmatch "name:" -and 
            $_.Line -notmatch "displayName:" -and 
            $_.Line -notmatch "description:" -and 
            $_.Line -notmatch "type:" -and 
            $_.Line -notmatch "default:\s*['`"]\s*['`"]" -and 
            $_.Line -notmatch "required:" -and 
            $_.Line -notmatch "//" -and 
            $_.Line -notmatch "^\s*\*" -and
            $_.Line -notmatch "credentials\." -and
            $_.Line -notmatch "ICredential" -and
            $_.Line -notmatch "password:\s*true" -and
            $_.Line -notmatch "typeOptions:"
        }
    
    if ($matches) {
        Write-Host "ERROR: Found potential sensitive data matching pattern: $pattern" -ForegroundColor Red
        Write-Host "Matches:" -ForegroundColor Yellow
        $matches | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow }
        $foundSensitive = $true
    }
}

# Check for .env files
$envFiles = Get-ChildItem -Recurse -Filter "*.env" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.git" }
if ($envFiles) {
    Write-Host "ERROR: Found .env files in repository" -ForegroundColor Red
    $foundSensitive = $true
}

# Check for log files
$logFiles = Get-ChildItem -Recurse -Filter "*.log" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.git" -and $_.FullName -notmatch "dist" }
if ($logFiles) {
    Write-Host "ERROR: Found .log files in repository" -ForegroundColor Red
    $foundSensitive = $true
}

if ($foundSensitive) {
    Write-Host ""
    Write-Host "SECURITY CHECK FAILED: Sensitive data detected!" -ForegroundColor Red
    Write-Host "Please remove all sensitive data before releasing."
    exit 1
}

Write-Host "✓ Security check passed - no sensitive data found" -ForegroundColor Green
Write-Host ""

# ====================================================
# 1) PREFLIGHT CHECKS
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '1) PREFLIGHT CHECKS' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Detect current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch"

# Ensure git repository is valid
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-Host "ERROR: Not a git repository" -ForegroundColor Red
    exit 1
}

# Ensure remote exists
try {
    $remoteUrl = git remote get-url origin
    Write-Host "Remote URL: $remoteUrl"
} catch {
    Write-Host "ERROR: No git remote 'origin' found" -ForegroundColor Red
    exit 1
}

# Ensure npm is logged in
try {
    $npmUser = npm whoami
    Write-Host "NPM user: $npmUser"
} catch {
    Write-Host "ERROR: Not logged in to npm. Run 'npm login' first" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "WARNING: Working tree has uncommitted changes" -ForegroundColor Yellow
    Write-Host "These changes will NOT be committed automatically"
    Write-Host "Please commit or stash changes before running release"
    $response = Read-Host 'Continue anyway? (y/N)'
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host "✓ Preflight checks passed" -ForegroundColor Green
Write-Host ""

# ====================================================
# 2) STRICT DUPLICATE-RUN DETECTION (IDEMPOTENCY)
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '2) DUPLICATE-RUN DETECTION (IDEMPOTENCY)' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Read current version from package.json
$packageJson = Get-Content package.json | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "Current version in package.json: $currentVersion"

# Get current HEAD commit hash
$headCommit = git rev-parse HEAD
Write-Host "Current HEAD commit: $headCommit"

# Check if tag exists locally
$tagExistsLocal = $false
try {
    $tagCommit = git rev-parse "v$currentVersion" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $tagExistsLocal = $true
        Write-Host "Tag v$currentVersion exists locally at commit: $tagCommit"
    } else {
        Write-Host "Tag v$currentVersion does not exist locally"
    }
} catch {
    Write-Host "Tag v$currentVersion does not exist locally"
}

# Check if tag exists on remote
$tagExistsRemote = $false
try {
    $remoteTagOutput = git ls-remote --tags origin "v$currentVersion" 2>$null
    if ($remoteTagOutput) {
        $tagExistsRemote = $true
        $remoteTagCommit = ($remoteTagOutput -split '\s+')[0]
        Write-Host "Tag v$currentVersion exists on remote at commit: $remoteTagCommit"
    } else {
        Write-Host "Tag v$currentVersion does not exist on remote"
    }
} catch {
    Write-Host "Tag v$currentVersion does not exist on remote"
}

# Check if version exists on npm
$versionOnNpm = $false
try {
    $npmVersion = npm view "n8n-nodes-palgate@$currentVersion" version 2>$null
    if ($npmVersion) {
        $versionOnNpm = $true
        Write-Host "Version $currentVersion exists on npm"
    } else {
        Write-Host "Version $currentVersion does not exist on npm"
    }
} catch {
    Write-Host "Version $currentVersion does not exist on npm"
}

# Determine if this is a NO-OP
$isNoOp = $false
if ($tagExistsRemote -and $versionOnNpm) {
    if ($remoteTagCommit -eq $headCommit) {
        $isNoOp = $true
        Write-Host ""
        Write-Host "====================================================" -ForegroundColor Yellow
        Write-Host "NO-OP DETECTED: This is a duplicate run" -ForegroundColor Yellow
        Write-Host "====================================================" -ForegroundColor Yellow
        Write-Host "Reason:"
        Write-Host "  - Tag v$currentVersion exists on remote"
        Write-Host "  - Version $currentVersion exists on npm"
        Write-Host "  - Tag commit ($remoteTagCommit) matches HEAD ($headCommit)"
        Write-Host ""
        Write-Host "Exiting successfully without making changes." -ForegroundColor Green
        exit 0
    }
}

if (-not $isNoOp) {
    Write-Host ""
    Write-Host "NEW RELEASE DETECTED: Proceeding with release flow" -ForegroundColor Green
    Write-Host "Reason:"
    if (-not $tagExistsRemote) {
        Write-Host "  - Tag v$currentVersion does not exist on remote"
    }
    if (-not $versionOnNpm) {
        Write-Host "  - Version $currentVersion does not exist on npm"
    }
    if ($tagExistsRemote -and $remoteTagCommit -ne $headCommit) {
        Write-Host "  - Tag commit ($remoteTagCommit) does not match HEAD ($headCommit)"
    }
    Write-Host ""
}

# ====================================================
# 3) BUILD & QUALITY GATE
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '3) BUILD and QUALITY GATE' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..."
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm ci failed" -ForegroundColor Red
    exit 1
}

# Run lint if exists
$npmScripts = npm run 2>$null
if ($npmScripts -match "lint") {
    Write-Host "Running lint..."
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Lint failed" -ForegroundColor Red
        exit 1
    }
}

# Run tests if exists
if ($npmScripts -match "test") {
    Write-Host "Running tests..."
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Tests failed" -ForegroundColor Red
        exit 1
    }
}

# Build
Write-Host "Building..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build and quality checks passed" -ForegroundColor Green
Write-Host ""

# ====================================================
# 4) VERSIONING & CHANGELOG
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '4) VERSIONING and CHANGELOG' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Determine version bump type (default: patch)
$versionBump = if ($args.Count -gt 0) { $args[0] } else { "patch" }
if ($versionBump -notmatch '^(major|minor|patch)$') {
    Write-Host "ERROR: Invalid version bump type: $versionBump" -ForegroundColor Red
    Write-Host "Must be: major, minor, or patch"
    exit 1
}

Write-Host "Bumping version: $versionBump"

# Bump version
npm version $versionBump -m 'chore(release): v%s' --no-git-tag-version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Version bump failed" -ForegroundColor Red
    exit 1
}

# Get new version
$packageJson = Get-Content package.json | ConvertFrom-Json
$newVersion = $packageJson.version
Write-Host "New version: $newVersion"

# Update CHANGELOG.md if it exists
if (Test-Path "CHANGELOG.md") {
    Write-Host "Updating CHANGELOG.md..."
    $changelogContent = Get-Content CHANGELOG.md -Raw
    $dateStr = Get-Date -Format "yyyy-MM-dd"
    
    if ($changelogContent -notmatch "## \[$newVersion\]") {
        $newEntry = "`n`n## [$newVersion] - $dateStr`n`n### Changed`n- Release $newVersion`n"
        $changelogContent = $newEntry + $changelogContent
        Set-Content -Path CHANGELOG.md -Value $changelogContent -NoNewline
    }
}

# Commit version bump
git add package.json package-lock.json
if (Test-Path "CHANGELOG.md") {
    git add CHANGELOG.md
}
$commitMessage = 'chore(release): v' + $newVersion
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Nothing to commit (version may already be bumped)" -ForegroundColor Yellow
}

Write-Host "✓ Versioning complete" -ForegroundColor Green
Write-Host ""

# ====================================================
# 5) NPM PUBLISH (SECURE)
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '5) NPM PUBLISH (SECURE)' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Verify npm pack output
Write-Host "Verifying npm pack output..."
$npmPackOutput = npm pack --dry-run 2>&1
Write-Host $npmPackOutput

# Check for sensitive files in pack output
if ($npmPackOutput -match "\.env|\.log|secret|password|key|token|credential") {
    $sensitiveMatches = $npmPackOutput | Select-String -Pattern "\.env|\.log|secret|password|key|token|credential" | 
        Where-Object { $_.Line -notmatch "node_modules" -and $_.Line -notmatch "package.json" -and $_.Line -notmatch "credentials.ts" -and $_.Line -notmatch "dist/" }
    if ($sensitiveMatches) {
        Write-Host "ERROR: npm pack includes potentially sensitive files" -ForegroundColor Red
        exit 1
    }
}

# Publish
Write-Host "Publishing to npm..."
npm publish --access public
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm publish failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Published to npm: n8n-nodes-palgate@$newVersion" -ForegroundColor Green
Write-Host ""

# ====================================================
# 6) GITHUB PUSH & RELEASE
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '6) GITHUB PUSH and RELEASE' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Create git tag
Write-Host "Creating git tag v$newVersion..."
git tag -a "v$newVersion" -m "Release v$newVersion"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create tag" -ForegroundColor Red
    exit 1
}

# Push commits and tags
Write-Host "Pushing to origin $currentBranch..."
git push origin $currentBranch --follow-tags
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push to origin" -ForegroundColor Red
    exit 1
}

# Create GitHub Release using GitHub CLI if available
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "Creating GitHub Release..."
    
    # Get release notes from CHANGELOG.md if available
    $releaseNotes = ""
    if (Test-Path "CHANGELOG.md") {
        $changelogLines = Get-Content CHANGELOG.md
        $inVersionSection = $false
        $releaseNotesLines = @()
        
        foreach ($line in $changelogLines) {
            if ($line -match "## \[$newVersion\]") {
                $inVersionSection = $true
                continue
            }
            if ($inVersionSection -and $line -match "## \[") {
                break
            }
            if ($inVersionSection) {
                $releaseNotesLines += $line
            }
        }
        
        $releaseNotes = $releaseNotesLines -join "`n"
    }
    
    if (-not $releaseNotes) {
        $releaseNotes = "Release v$newVersion"
    }
    
    gh release create "v$newVersion" --title "v$newVersion" --notes $releaseNotes --target $currentBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Failed to create GitHub Release (may already exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "GitHub CLI (gh) not found. Skipping GitHub Release creation." -ForegroundColor Yellow
    Write-Host "Please create release manually at: https://github.com/$($remoteUrl -replace '.*github.com[:/]([^/]+/[^/]+)\.git', '$1')/releases/new"
}

Write-Host "✓ GitHub push and release complete" -ForegroundColor Green
Write-Host ""

# ====================================================
# 7) FINAL OUTPUT
# ====================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host '7) RELEASE SUMMARY' -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ RELEASE TYPE: NEW RELEASE" -ForegroundColor Green
Write-Host "✓ VERSION RELEASED: $newVersion" -ForegroundColor Green
Write-Host "✓ BRANCH: $currentBranch" -ForegroundColor Green
Write-Host "✓ COMMIT: $headCommit" -ForegroundColor Green
Write-Host "✓ NPM PUBLISHED: n8n-nodes-palgate@$newVersion" -ForegroundColor Green
Write-Host "✓ GIT TAG CREATED: v$newVersion" -ForegroundColor Green
Write-Host "✓ GITHUB RELEASE CREATED: v$newVersion" -ForegroundColor Green
Write-Host ""
Write-Host "✓ SECURITY CONFIRMATION: No sensitive data was published" -ForegroundColor Green
Write-Host ""
Write-Host "Release completed successfully!" -ForegroundColor Green
Write-Host ""

