# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2026-03-11

**Backwards compatible** - No code changes required. The library now requests `offline_access` scope by default; if your Keycloak client doesn't support it, set `requestOfflineAccess: false` in credentials.

### Added
- **Automatic re-authentication**: When refresh tokens expire (e.g., SSO Session Max timeout), the library re-authenticates automatically using stored credentials
- **Offline access support**: `offline_access` scope now requested by default for longer-lived sessions (configurable via `requestOfflineAccess`)
- **Dynamic token refresh scheduling**: Refresh intervals recalculate after each token refresh based on actual expiration times
- **Infinite loop prevention**: Added `isRefreshing` flag to prevent simultaneous refresh attempts
- New `requestOfflineAccess` property in `KeycloakLogin` interface (defaults to `true`)

### Fixed
- **Critical**: Server crashes from expired refresh tokens (400 errors) now caught and handled via re-authentication
- **Critical**: Infinite loop when tokens too short to schedule near session expiration
- Memory leaks from stale refresh intervals (now properly cleared before rescheduling)
- `clientSecret` now conditionally added to request body (only if provided)

### Changed
- Token refresh now wrapped in try-catch with automatic fallback to re-authentication on failure
- Credentials (username/password) stored in memory for automatic re-authentication
- `scheduleTokenRefresh()` extracted as separate method, called after every token refresh
- Refresh interval calculation improved to handle `refresh_expires_in=0` (offline_access mode)
- Short token warning (< 60s)

### Documentation
- Added comprehensive token management guide (`docs/TOKEN_REFRESH.md`)
- Documented offline_access configuration and SSO session handling
