# Security

## No secrets in this repository

- **Do not commit** passwords, API tokens, or any real credentials.
- **Do not commit** real environment identifiers: place IDs, org IDs, device serials, or phone numbers that identify real users/accounts.
- **Do not commit** Postman/HAR exports that contain live session data (URLs with real IDs, tokens).

Tests and scripts use **environment variables only**. Copy `.env.example` to `.env`, fill in values locally, and never commit `.env`.

## If you accidentally pushed secrets

1. Rotate all exposed credentials and tokens immediately.
2. Treat the repository history as compromised; consider deleting the repo or rewriting history to remove secrets.
3. Re-push only after ensuring no sensitive data remains in the working tree or history.

## Reporting a vulnerability

If you find a security issue in this project, do not open a public issue. Contact the maintainer privately.
