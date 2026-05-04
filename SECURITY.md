# Security Policy

## Supported Versions

Security fixes are accepted for the current `main` branch.

## Reporting a Vulnerability

Please report vulnerabilities privately through GitHub Security Advisories for this repository.

Do not open public issues containing OAuth tokens, real counter IDs, exported logs, or analytics data.

## Data Handling

The app stores the OAuth token and normalized counter ID only in the user's browser `localStorage`.

The server-side proxy forwards requests to `https://api-metrika.yandex.net` and does not store tokens, counter IDs, exports, or reports.
