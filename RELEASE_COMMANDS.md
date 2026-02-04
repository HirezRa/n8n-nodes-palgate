# Release v1.0.25 - Commands Executed

## ✅ Completed Automatically

### 1. Preflight
```bash
npm whoami
# Result: hirez10 ✅
```

### 2. Install Dependencies
```bash
cd "C:\AiProjects\Cursor API Creator\n8n-nodes-PalGate"
npm ci
# Result: ✅ 503 packages installed, 0 vulnerabilities
```

### 3. Quality Gate
```bash
npm run lint
# Result: ✅ Passed (no errors)

npm run build
# Result: ✅ Build successful
```

### 4. Version Bump
```bash
npm version patch -m "chore(release): v%s"
# Result: ✅ v1.0.25
# Warning: Git tag not created (git not in PATH)
```

### 5. Publish to npm
```bash
npm publish --access public
# Result: ✅ Published successfully
# Package: n8n-nodes-palgate@1.0.25
# Registry: https://registry.npmjs.org/
```

---

## ⚠️ Manual Git Operations Required

Since git is not available in PATH, execute these commands manually:

### 1. Check Status
```bash
git status
git branch --show-current
```

### 2. Commit Changes
```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): v1.0.25"
```

### 3. Create Tag
```bash
git tag -a v1.0.25 -m "chore(release): v1.0.25"
```

### 4. Push to GitHub
```bash
git push origin main --follow-tags
# Or if branch is master:
# git push origin master --follow-tags
```

### 5. Create GitHub Release

**Using GitHub CLI:**
```bash
gh release create v1.0.25 \
  --title "v1.0.25" \
  --notes "$(cat CHANGELOG.md | sed -n '/## \[1.0.25\]/,/## \[1.0.24\]/p' | sed '$d')"
```

**Or via GitHub Web UI:**
- URL: https://github.com/HirezRa/n8n-nodes-palgate/releases/new
- Tag: `v1.0.25`
- Title: `v1.0.25`
- Description: Copy from CHANGELOG.md section for v1.0.25

---

## Release Notes for GitHub

```markdown
## [1.0.25] - 2026-01-13

### Fixed
- Delete user operation now uses correct API format (POST /delete-many-users with userList)
- Fixed delete endpoint from `/users` (DELETE) to `/delete-many-users` (POST)
- Fixed body format from `{ phones: [...] }` to `{ userList: [...] }`

### Verified
- Delete operation tested and verified: only specified user is deleted
- Comprehensive test suite confirms correct behavior
- User count accuracy verified
```

---

**Release Date:** 2026-01-13  
**Version:** 1.0.25  
**Status:** ✅ Published to npm, ⚠️ Git operations pending
