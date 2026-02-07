# Changelog

All notable changes to FemtoLogger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] - 2026-02-07

### Added
- Initial release of FemtoLogger
- `FemtoLogger` core class with `info()`, `warn()`, `error()` methods
- `TelegramTransport` for sending logs to Telegram Bot API
- Transport-based architecture (Strategy pattern)
- Multi-transport support with `Promise.allSettled`
- Log level filtering (info/warn/error)
- HTML message formatting for Telegram
- TypeScript type definitions
- Dual package (ESM + CJS) via tsup
- 64 unit and integration tests (97.67% coverage)
- GitHub Actions CI/CD with auto-publish to GitHub Packages

### Security
- Input validation for transport options
- HTML escaping for Telegram messages
- Graceful error handling (never crashes the app)

[unreleased]: https://github.com/frederictriquet/FemtoLogger/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/frederictriquet/FemtoLogger/releases/tag/v0.1.0
