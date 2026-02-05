# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.34] - 2026-02-05

### Changed
- Security: remove Cursor/Rules references from SECURITY.md and CHANGELOG (public docs)
- Add .cursor/ and *.mdc to .npmignore (do not publish to NPM)
- Remove internal documentation files from repository tracking

## [1.0.33] - 2026-02-05

### Changed
- Security: remove Postman links from docs, add postman/ to .npmignore
- Remove tracked test log files; add IDE and local project folders to .gitignore

## [1.0.31] - 2025-02-04

### Added
- Verification report (VERIFICATION_REPORT.md) – build, lint, and structure check documented

### Changed
- Release and documentation alignment

## [1.0.24] - 2026-01-13

### Added
- Initial production release
- Authentication support with token caching
- Places operations (Get All, Get One)
- Users operations (Get All, Add, Update, Delete, Find)
- Groups operations (Get All)
- Devices operations (Get Info)
- Comprehensive error handling with detailed messages
- Input validation for all operations
- Detailed logging for debugging
- Safety checks for delete operations
- Phone number validation
- Empty array prevention

### Security
- Phone number validation on all operations
- Empty array prevention for delete operations
- Warning messages for destructive operations
- Input sanitization

### Known Limitations
- Vehicle operations not supported (API limitation - endpoints return 404)
- Delete operation may have API-side issues - use with caution and verify results
- API accepts empty phone numbers (node validates to prevent this)

### Documentation
- Complete README with usage examples
- API endpoint documentation
- Error handling guide
- Safety features documentation
- Test results and coverage

### Testing
- Comprehensive automated test suite
- API endpoint discovery
- 17 tests covering all operations
- 12/17 tests passing (70.6%)
- All core functionality verified

## [1.0.30] - 2026-01-13

### Fixed
- Fixed author field format to comply with n8n lint requirements (author.name)
- Maintained author name as "HiRez10" as required

## [1.0.29] - 2026-01-13

### Fixed
- Updated NPM package description to reflect delete user operation is fully working (v1.0.28+)
- Fixed package.json author field to match requirements ("HiRez10")
- Updated documentation to clarify delete operation status

## [1.0.28] - 2026-01-13

### Fixed
- Delete operation now handles number types correctly (not just strings)
- Fixed error 4101 "Check delete number list" when phone number is passed as number instead of string
- Value expression now accepts both string and number types for phone numbers
- Improved null/undefined/empty value checking

## [1.0.27] - 2026-01-13

### Maintenance
- Version bump for cleanup and maintenance release

## [1.0.26] - 2026-01-13

### Fixed
- Delete operation phone number formatting: automatically formats phone numbers to 972XXXXXXXXX format
- Handles phone numbers starting with 0 (converts to 972)
- Handles phone numbers without country code (adds 972 prefix)
- Removes spaces, dashes, and parentheses from phone numbers
- Fixes error 4101 "Check delete number list" by ensuring correct phone format

## [1.0.25] - 2026-01-13

### Fixed
- Delete user operation now uses correct API format (POST /delete-many-users with userList)
- Fixed delete endpoint from `/users` (DELETE) to `/delete-many-users` (POST)
- Fixed body format from `{ phones: [...] }` to `{ userList: [...] }`

### Verified
- Delete operation tested and verified: only specified user is deleted
- Comprehensive test suite confirms correct behavior
- User count accuracy verified

## [Unreleased]

### Planned
- Vehicle operations (when API endpoints become available)
- Enhanced delete operation verification
- Additional error recovery mechanisms
- Performance optimizations
