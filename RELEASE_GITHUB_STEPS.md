# שלבים ל-GitHub Release – v1.0.31

**סטטוס:** ✅ Lint עבר | ✅ Build עבר | ✅ **פורסם ל-npm:** `n8n-nodes-palgate@1.0.31`

---

## פקודות להרצה (מתוך תיקיית הנוד)

### 1. Commit גרסה ו-CHANGELOG

```powershell
cd "c:\n8n-nodes\n8n-nodes-PalGate - API Creator\n8n-nodes-PalGate"

git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): v1.0.31"
```

### 2. יצירת Tag ודחיפה ל-GitHub

```powershell
git tag -a v1.0.31 -m "Release v1.0.31"
git push origin main --follow-tags
```

אם הענף הראשי שלך שונה (למשל `master`):

```powershell
git push origin master --follow-tags
```

### 3. יצירת GitHub Release

**אם מותקן GitHub CLI (`gh`):**

```powershell
gh release create v1.0.31 --title "v1.0.31" --notes "## [1.0.31] - 2025-02-04

### Added
- Verification report (VERIFICATION_REPORT.md) – build, lint, and structure check documented

### Changed
- Release and documentation alignment"
```

**או בדפדפן:**

1. גלוש ל: https://github.com/HirezRa/n8n-nodes-palgate/releases/new  
2. **Choose a tag:** בחר או הקלד `v1.0.31`  
3. **Release title:** `v1.0.31`  
4. **Describe this release:** העתק את התוכן מ-CHANGELOG.md תחת `## [1.0.31]`  
5. לחץ **Publish release**

---

**סיום:** אחרי Push ו-Release – הגרסה v1.0.31 מפורסמת ב-npm וב-GitHub.
