# Yandex Metrics Export

[![CI](https://github.com/nicshik/yandex-metrics-export/actions/workflows/ci.yml/badge.svg)](https://github.com/nicshik/yandex-metrics-export/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Universal web interface for exporting raw visits and hits from the Yandex Metrika Logs API.

## Features

- Create Logs API export requests for visits and hits.
- Select fields, date range, source type, and attribution model.
- View existing log requests for a Metrika counter.
- Download prepared TSV parts.
- Clean prepared log requests to free quota.
- Use built-in guidance for OAuth token setup and Logs API limits.

## Input Data

The user provides:

- a Yandex OAuth token with the `metrika:read` permission;
- a Yandex Metrika counter ID, for example `12345678`, or a counter page link from Metrika.

Counter links are normalized in the browser. Only the numeric counter ID is stored and used for API requests.

## Data Storage

The OAuth token and normalized counter ID are stored only in the user's browser `localStorage`.

Requests to Yandex Metrika are sent through the server-side proxy route `/api/metrika/[...path]`, which forwards the token as an OAuth authorization header.

No tokens, counter IDs, client URLs, exports, or analytics reports are committed to the repository.

## API Proxy

The proxy route forwards requests to the official Yandex Metrika API endpoint:

```text
https://api-metrika.yandex.net
```

The browser must send the OAuth token in the `x-metrika-token` header. Without this header, the proxy returns `401`.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Yandex Metrika Logs API

## Development

Requirements:

- Node.js 18.17 or newer.
- npm.

```bash
npm install
npm run dev
```

The local development server runs at `http://localhost:3000` by default.

## Production Build

```bash
npm run check
npm run start
```

## Contributing

Issues and pull requests are welcome. Before opening a PR, run:

```bash
npm run check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project workflow and [SECURITY.md](SECURITY.md) for responsible disclosure.

## License

MIT. See [LICENSE](LICENSE).
