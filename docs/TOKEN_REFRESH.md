# Token Management

## Overview

Tokens are managed automatically behind the scenes. The library handles token refresh, re-authentication, and session recovery without any manual intervention.

## Basic Usage

```typescript
import createKeycloakFacade from 'keycloak-typescript';

const keycloakFacade = await createKeycloakFacade(
    {
        clientId: 'admin-cli',
        username: 'your-username',
        password: 'your-password'
    },
    'master',
    'http://localhost:8080',
    true
);

// That's it! Token management is automatic
const users = await keycloakFacade.userManager.getUsers('username', 'admin');
```

Your application can now run indefinitely. The library automatically:
- Refreshes tokens before they expire
- Re-authenticates when refresh tokens expire
- Requests `offline_access` scope for longer-lived sessions
- Adapts to your Keycloak token configuration

## Configuration

### requestOfflineAccess: boolean (default: true)

Controls whether the library requests the `offline_access` scope during authentication. This scope provides longer-lived refresh tokens not tied to SSO idle timeout.

```typescript
const keycloakFacade = await createKeycloakFacade(
    {
        clientId: 'admin-cli',
        username: 'your-username',
        password: 'your-password',
        requestOfflineAccess: false // Disable if needed
    },
    'master',
    'http://localhost:8080',
    true
);
```

**Note:** Without offline access, sessions are limited by your Keycloak SSO Session Max setting.


## How It Works

The library uses an internal `TokenManager` that handles all token operations:

1. **Initial Authentication** - When you call `createKeycloakFacade()`, the library authenticates and schedules automatic token refresh
2. **Automatic Refresh** - Before tokens expire, the library refreshes them automatically using the refresh token
3. **Re-authentication** - If refresh fails (e.g., SSO session expired), the library re-authenticates using stored credentials

All of this happens transparently. Your code never needs to handle token expiration manually.

## SSO Session Expiration

Keycloak's SSO Session Max setting limits the maximum session lifetime. When this timeout is reached, refresh tokens become invalid. **The library handles this automatically by re-authenticating.**

### Testing

To verify automatic re-authentication works:

1. **Configure short timeouts in Keycloak:**
   ```
   Realm Settings → Tokens:
   - Access Token Lifespan: 1 minute
   - Refresh Token Max: 3 minutes
   - SSO Session Max: 5 minutes
   ```

2. **Run your application:**
   ```typescript
   const keycloakFacade = await createKeycloakFacade(credentials, 'master', 'http://localhost:8080', true);
   
   setInterval(async () => {
     const users = await keycloakFacade.userManager.getUsers('username', 'admin');
     console.log('Users retrieved:', users.length);
   }, 30000);
   ```

3. **Expected behavior:**
   - ✓ Tokens refresh automatically every ~1 minute
   - ✓ After 5 minutes, re-authentication occurs automatically
   - ✓ No errors or interruptions

## Keycloak Configuration

To enable `offline_access` scope in Keycloak:

1. Go to Clients → Your Client → Client Scopes
2. Ensure "Offline Access" is in the assigned default scopes
3. Configure "Offline Session" settings in Realm Settings → Tokens

## Troubleshooting

### "Cannot re-authenticate: username or password not stored"

**Cause:** Credentials weren't provided during initialization.

**Solution:** Ensure you provide both username and password:

```typescript
const keycloakFacade = await createKeycloakFacade(
  {
    clientId: 'admin-cli',
    username: 'your-username',  // Required
    password: 'your-password'   // Required
  },
  'master',
  'http://localhost:8080',
  true
);
```

### Token Refresh Warnings

**Cause:** Token lifetimes are shorter than 60 seconds.

**What Happens:** The library refreshes immediately instead of scheduling.

**Solution (Optional):** Increase token lifetimes in Keycloak for better performance:
```
Realm Settings → Tokens:
- Access Token Lifespan: 5 minutes (recommended minimum)
- Refresh Token Max: 30 minutes (recommended)
```

## Additional Resources

- [Keycloak Token Settings Documentation](https://www.keycloak.org/docs/latest/server_admin/#_timeouts)
- [OAuth 2.0 Offline Access](https://openid.net/specs/openid-connect-core-1_0.html#OfflineAccess)
