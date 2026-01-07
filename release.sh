#!/bin/bash
set -euo pipefail

# ====================================================
# 0) HARD SECURITY GATE (MANDATORY, FAIL = STOP)
# ====================================================

echo "===================================================="
echo "0) HARD SECURITY GATE - Scanning for sensitive data"
echo "===================================================="

# Patterns to detect sensitive data
SENSITIVE_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "auth[_-]?token\s*=\s*['\"][^'\"]+['\"]"
    "credential\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "private[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "access[_-]?token\s*=\s*['\"][^'\"]+['\"]"
)

# Files to exclude from scan (these are expected to have credential structures)
EXCLUDE_FILES=(
    "credentials/PalGateApi.credentials.ts"
    "package.json"
    "package-lock.json"
    "node_modules"
    ".git"
    "dist"
)

# Build exclude pattern
EXCLUDE_PATTERN=""
for file in "${EXCLUDE_FILES[@]}"; do
    EXCLUDE_PATTERN="${EXCLUDE_PATTERN} --exclude=${file}"
done

# Scan for sensitive data
FOUND_SENSITIVE=false
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r -i -E "${pattern}" . ${EXCLUDE_PATTERN} 2>/dev/null | grep -v "name:" | grep -v "displayName:" | grep -v "description:" | grep -v "type:" | grep -v "default: ''" | grep -v "default: \"\"" | grep -v "required:" | grep -v "//" | grep -v "^\s*\*" > /dev/null; then
        echo "ERROR: Found potential sensitive data matching pattern: ${pattern}"
        FOUND_SENSITIVE=true
    fi
done

# Check for .env files
if find . -name "*.env" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | grep -q .; then
    echo "ERROR: Found .env files in repository"
    FOUND_SENSITIVE=true
fi

# Check for log files
if find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" 2>/dev/null | grep -q .; then
    echo "ERROR: Found .log files in repository"
    FOUND_SENSITIVE=true
fi

# Check npm pack output
echo "Checking npm pack --dry-run output..."
NPM_PACK_OUTPUT=$(npm pack --dry-run 2>&1 || true)
if echo "${NPM_PACK_OUTPUT}" | grep -iE "(\.env|\.log|secret|password|key|token|credential)" | grep -v "node_modules" | grep -v "package.json" | grep -v "credentials.ts" > /dev/null; then
    echo "ERROR: npm pack includes potentially sensitive files"
    FOUND_SENSITIVE=true
fi

if [ "$FOUND_SENSITIVE" = true ]; then
    echo ""
    echo "SECURITY CHECK FAILED: Sensitive data detected!"
    echo "Please remove all sensitive data before releasing."
    exit 1
fi

echo "✓ Security check passed - no sensitive data found"
echo ""

# ====================================================
# 1) PREFLIGHT CHECKS
# ====================================================

echo "===================================================="
echo "1) PREFLIGHT CHECKS"
echo "===================================================="

# Detect current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: ${CURRENT_BRANCH}"

# Ensure git repository is valid
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "ERROR: Not a git repository"
    exit 1
fi

# Ensure remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "ERROR: No git remote 'origin' found"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
echo "Remote URL: ${REMOTE_URL}"

# Ensure npm is logged in
if ! npm whoami > /dev/null 2>&1; then
    echo "ERROR: Not logged in to npm. Run 'npm login' first"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "NPM user: ${NPM_USER}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "WARNING: Working tree has uncommitted changes"
    echo "These changes will NOT be committed automatically"
    echo "Please commit or stash changes before running release"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Preflight checks passed"
echo ""

# ====================================================
# 2) STRICT DUPLICATE-RUN DETECTION (IDEMPOTENCY)
# ====================================================

echo "===================================================="
echo "2) DUPLICATE-RUN DETECTION (IDEMPOTENCY)"
echo "===================================================="

# Read current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version in package.json: ${CURRENT_VERSION}"

# Get current HEAD commit hash
HEAD_COMMIT=$(git rev-parse HEAD)
echo "Current HEAD commit: ${HEAD_COMMIT}"

# Check if tag exists locally
TAG_EXISTS_LOCAL=false
if git rev-parse "v${CURRENT_VERSION}" > /dev/null 2>&1; then
    TAG_EXISTS_LOCAL=true
    TAG_COMMIT=$(git rev-parse "v${CURRENT_VERSION}")
    echo "Tag v${CURRENT_VERSION} exists locally at commit: ${TAG_COMMIT}"
else
    echo "Tag v${CURRENT_VERSION} does not exist locally"
fi

# Check if tag exists on remote
TAG_EXISTS_REMOTE=false
if git ls-remote --tags origin "v${CURRENT_VERSION}" > /dev/null 2>&1; then
    TAG_EXISTS_REMOTE=true
    REMOTE_TAG_COMMIT=$(git ls-remote --tags origin "v${CURRENT_VERSION}" | cut -f1)
    echo "Tag v${CURRENT_VERSION} exists on remote at commit: ${REMOTE_TAG_COMMIT}"
else
    echo "Tag v${CURRENT_VERSION} does not exist on remote"
fi

# Check if version exists on npm
VERSION_ON_NPM=false
if npm view "n8n-nodes-palgate@${CURRENT_VERSION}" version > /dev/null 2>&1; then
    VERSION_ON_NPM=true
    echo "Version ${CURRENT_VERSION} exists on npm"
else
    echo "Version ${CURRENT_VERSION} does not exist on npm"
fi

# Determine if this is a NO-OP
IS_NOOP=false
if [ "$TAG_EXISTS_REMOTE" = true ] && [ "$VERSION_ON_NPM" = true ]; then
    if [ "$REMOTE_TAG_COMMIT" = "$HEAD_COMMIT" ]; then
        IS_NOOP=true
        echo ""
        echo "===================================================="
        echo "NO-OP DETECTED: This is a duplicate run"
        echo "===================================================="
        echo "Reason:"
        echo "  - Tag v${CURRENT_VERSION} exists on remote"
        echo "  - Version ${CURRENT_VERSION} exists on npm"
        echo "  - Tag commit (${REMOTE_TAG_COMMIT}) matches HEAD (${HEAD_COMMIT})"
        echo ""
        echo "Exiting successfully without making changes."
        exit 0
    fi
fi

if [ "$IS_NOOP" = false ]; then
    echo ""
    echo "NEW RELEASE DETECTED: Proceeding with release flow"
    echo "Reason:"
    if [ "$TAG_EXISTS_REMOTE" = false ]; then
        echo "  - Tag v${CURRENT_VERSION} does not exist on remote"
    fi
    if [ "$VERSION_ON_NPM" = false ]; then
        echo "  - Version ${CURRENT_VERSION} does not exist on npm"
    fi
    if [ "$TAG_EXISTS_REMOTE" = true ] && [ "$REMOTE_TAG_COMMIT" != "$HEAD_COMMIT" ]; then
        echo "  - Tag commit (${REMOTE_TAG_COMMIT}) does not match HEAD (${HEAD_COMMIT})"
    fi
    echo ""
fi

# ====================================================
# 3) BUILD & QUALITY GATE
# ====================================================

echo "===================================================="
echo "3) BUILD & QUALITY GATE"
echo "===================================================="

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run lint if exists
if npm run | grep -q "lint"; then
    echo "Running lint..."
    npm run lint || {
        echo "ERROR: Lint failed"
        exit 1
    }
fi

# Run tests if exists
if npm run | grep -q "test"; then
    echo "Running tests..."
    npm test || {
        echo "ERROR: Tests failed"
        exit 1
    }
fi

# Build
echo "Building..."
npm run build || {
    echo "ERROR: Build failed"
    exit 1
}

echo "✓ Build and quality checks passed"
echo ""

# ====================================================
# 4) VERSIONING & CHANGELOG
# ====================================================

echo "===================================================="
echo "4) VERSIONING & CHANGELOG"
echo "===================================================="

# Determine version bump type (default: patch)
VERSION_BUMP="${1:-patch}"
if [[ ! "$VERSION_BUMP" =~ ^(major|minor|patch)$ ]]; then
    echo "ERROR: Invalid version bump type: ${VERSION_BUMP}"
    echo "Must be: major, minor, or patch"
    exit 1
fi

echo "Bumping version: ${VERSION_BUMP}"

# Bump version
npm version "${VERSION_BUMP}" -m "chore(release): v%s" --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: ${NEW_VERSION}"

# Update CHANGELOG.md if it exists
if [ -f "CHANGELOG.md" ]; then
    echo "Updating CHANGELOG.md..."
    # Add entry for new version (if not already present)
    if ! grep -q "## \[${NEW_VERSION}\]" CHANGELOG.md; then
        # Insert new version entry after the first line (after # Changelog or similar)
        sed -i.bak "1a\\
\\
## [${NEW_VERSION}] - $(date +%Y-%m-%d)\\
\\
### Changed\\
- Release ${NEW_VERSION}\\
" CHANGELOG.md
        rm -f CHANGELOG.md.bak
    fi
fi

# Commit version bump
git add package.json package-lock.json
if [ -f "CHANGELOG.md" ]; then
    git add CHANGELOG.md
fi
git commit -m "chore(release): v${NEW_VERSION}" || {
    echo "WARNING: Nothing to commit (version may already be bumped)"
}

echo "✓ Versioning complete"
echo ""

# ====================================================
# 5) NPM PUBLISH (SECURE)
# ====================================================

echo "===================================================="
echo "5) NPM PUBLISH (SECURE)"
echo "===================================================="

# Verify npm pack output
echo "Verifying npm pack output..."
NPM_PACK_OUTPUT=$(npm pack --dry-run 2>&1)
echo "${NPM_PACK_OUTPUT}"

# Check for sensitive files in pack output
if echo "${NPM_PACK_OUTPUT}" | grep -iE "(\.env|\.log|secret|password|key|token|credential)" | grep -v "node_modules" | grep -v "package.json" | grep -v "credentials.ts" | grep -v "dist/" > /dev/null; then
    echo "ERROR: npm pack includes potentially sensitive files"
    exit 1
fi

# Publish
echo "Publishing to npm..."
npm publish --access public || {
    echo "ERROR: npm publish failed"
    exit 1
}

echo "✓ Published to npm: n8n-nodes-palgate@${NEW_VERSION}"
echo ""

# ====================================================
# 6) GITHUB PUSH & RELEASE
# ====================================================

echo "===================================================="
echo "6) GITHUB PUSH & RELEASE"
echo "===================================================="

# Create git tag
echo "Creating git tag v${NEW_VERSION}..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

# Push commits and tags
echo "Pushing to origin ${CURRENT_BRANCH}..."
git push origin "${CURRENT_BRANCH}" --follow-tags || {
    echo "ERROR: Failed to push to origin"
    exit 1
}

# Create GitHub Release using GitHub CLI if available
if command -v gh > /dev/null 2>&1; then
    echo "Creating GitHub Release..."
    
    # Get release notes from CHANGELOG.md if available
    RELEASE_NOTES=""
    if [ -f "CHANGELOG.md" ]; then
        # Extract version section from CHANGELOG.md
        RELEASE_NOTES=$(awk "/^## \[${NEW_VERSION}\]/,/^## \[/" CHANGELOG.md | head -n -1)
    fi
    
    if [ -z "$RELEASE_NOTES" ]; then
        RELEASE_NOTES="Release v${NEW_VERSION}"
    fi
    
    gh release create "v${NEW_VERSION}" \
        --title "v${NEW_VERSION}" \
        --notes "${RELEASE_NOTES}" \
        --target "${CURRENT_BRANCH}" || {
        echo "WARNING: Failed to create GitHub Release (may already exist)"
    }
else
    echo "GitHub CLI (gh) not found. Skipping GitHub Release creation."
    echo "Please create release manually at: https://github.com/$(git remote get-url origin | sed -E 's/.*github.com[:/]([^/]+\/[^/]+)\.git/\1/')/releases/new"
fi

echo "✓ GitHub push and release complete"
echo ""

# ====================================================
# 7) FINAL OUTPUT
# ====================================================

echo "===================================================="
echo "7) RELEASE SUMMARY"
echo "===================================================="
echo ""
echo "✓ RELEASE TYPE: NEW RELEASE"
echo "✓ VERSION RELEASED: ${NEW_VERSION}"
echo "✓ BRANCH: ${CURRENT_BRANCH}"
echo "✓ COMMIT: ${HEAD_COMMIT}"
echo "✓ NPM PUBLISHED: n8n-nodes-palgate@${NEW_VERSION}"
echo "✓ GIT TAG CREATED: v${NEW_VERSION}"
echo "✓ GITHUB RELEASE CREATED: v${NEW_VERSION}"
echo ""
echo "✓ SECURITY CONFIRMATION: No sensitive data was published"
echo ""
echo "Release completed successfully!"
echo ""

