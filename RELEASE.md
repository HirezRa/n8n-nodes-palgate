# Release Process

This repository uses an automated, secure, and idempotent release process.

## Quick Start

### Linux/macOS:
```bash
./release.sh [patch|minor|major]
```

### Windows (PowerShell):
```powershell
.\release.ps1 [patch|minor|major]
```

### Using npm scripts:
```bash
npm run release:patch   # Patch version (1.0.14 -> 1.0.15)
npm run release:minor   # Minor version (1.0.14 -> 1.1.0)
npm run release:major   # Major version (1.0.14 -> 2.0.0)
```

## Release Process Overview

The release process follows these steps:

### 0. Security Gate (MANDATORY)
- Scans for sensitive data (passwords, secrets, API keys, tokens, credentials)
- Checks for `.env` and `.log` files
- Verifies npm pack output doesn't include sensitive files
- **FAIL = STOP** - Release will not proceed if sensitive data is detected

### 1. Preflight Checks
- Detects current git branch
- Validates git repository and remote
- Ensures npm is logged in
- Checks for uncommitted changes

### 2. Duplicate-Run Detection (Idempotency)
- Checks if version already exists on npm
- Checks if git tag exists on remote
- Compares tag commit hash with HEAD
- **NO-OP**: If tag exists, version on npm, and commits match → Exit successfully
- **NEW RELEASE**: Otherwise → Continue with release

### 3. Build & Quality Gate
- Installs dependencies (`npm ci`)
- Runs lint (`npm run lint`)
- Runs tests (`npm test`) if available
- Builds project (`npm run build`)
- **FAIL = STOP** - Release will not proceed if any step fails

### 4. Versioning & Changelog
- Bumps version in `package.json` (patch/minor/major)
- Updates `CHANGELOG.md` if it exists
- Commits version bump

### 5. NPM Publish (Secure)
- Verifies npm pack output
- Publishes to npm (`npm publish --access public`)
- Ensures no sensitive data is published

### 6. GitHub Push & Release
- Creates git tag (`vX.Y.Z`)
- Pushes commits and tags to origin
- Creates GitHub Release (if `gh` CLI is available)

### 7. Final Output
- Displays release summary
- Confirms no sensitive data was published

## Security Features

- **Automatic scanning** for sensitive data patterns
- **Excludes** credential structure files (expected to have password/key fields)
- **Verifies** npm pack output before publishing
- **Blocks** release if sensitive data is detected

## Idempotency

The release process is **idempotent**:
- Running the same release twice with the same commit will result in a **NO-OP**
- The script will detect duplicate runs and exit successfully without making changes
- This prevents accidental duplicate releases

## Prerequisites

1. **Git** configured with remote origin
2. **npm** logged in (`npm login`)
3. **GitHub CLI** (optional, for automatic release creation)
4. **Clean working tree** (or commit/stash changes first)

## Version Bumping

- **patch**: Bug fixes, minor changes (1.0.14 → 1.0.15)
- **minor**: New features, backward compatible (1.0.14 → 1.1.0)
- **major**: Breaking changes (1.0.14 → 2.0.0)

Default is **patch** if not specified.

## Troubleshooting

### "Not logged in to npm"
```bash
npm login
```

### "Working tree has uncommitted changes"
```bash
git add .
git commit -m "Your commit message"
# OR
git stash
```

### "Security check failed"
- Remove sensitive data from code
- Use environment variables or secure placeholders
- Ensure `.env` files are in `.gitignore`

### "Build/Lint/Test failed"
- Fix the issues reported
- Ensure all tests pass
- Ensure lint passes

### "npm publish failed"
- Check npm permissions
- Verify package name is available
- Check if version already exists (use different version)

## Manual Release Steps

If you need to release manually:

1. **Security check**: Ensure no sensitive data
2. **Bump version**: `npm version patch|minor|major`
3. **Build**: `npm run build`
4. **Publish**: `npm publish --access public`
5. **Tag**: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
6. **Push**: `git push origin <branch> --follow-tags`
7. **GitHub Release**: Create release manually on GitHub

## Files Included in Release

Only the `dist` directory is published to npm (as specified in `package.json` `files` field).

The `.npmignore` file ensures:
- Source files (`nodes/`, `credentials/`) are excluded
- Development files are excluded
- Only compiled `dist/` files are published

## Support

For issues or questions about the release process, please open an issue on GitHub.

