# Release runner script - Sets up PATH and runs release
$ErrorActionPreference = "Stop"

# Add git to PATH
$gitPath = "C:\Program Files\Git\bin"
if (Test-Path $gitPath) {
    $env:PATH = "$gitPath;$env:PATH"
    Write-Host "Added Git to PATH: $gitPath" -ForegroundColor Green
}

# Add npm to PATH
$npmPath = "C:\Program Files\nodejs"
if (Test-Path $npmPath) {
    $env:PATH = "$npmPath;$env:PATH"
    Write-Host "Added npm to PATH: $npmPath" -ForegroundColor Green
}

# Verify tools are available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: git not found" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm not found" -ForegroundColor Red
    exit 1
}

Write-Host "Tools verified:" -ForegroundColor Green
Write-Host "  git: $(git --version)"
Write-Host "  npm: $(npm --version)"
Write-Host ""

# Run release script
$versionBump = if ($args.Count -gt 0) { $args[0] } else { "patch" }
Write-Host "Running release script with version bump: $versionBump" -ForegroundColor Cyan
Write-Host ""

.\release.ps1 $versionBump
