# Authentication: current prototype and production gap

## Executive summary

The repository contains a Supabase client configuration, but the inspected sign-in and registration UI currently follows a local demo-profile flow. These are separate things and should not be conflated.

## Current prototype flow

1. A visitor opens the authentication route.
2. The auth panel validates basic form input in the browser.
3. The panel simulates a short delay.
4. It calls the demo-session helper to select a local profile.
5. The profile is stored in browser session storage and the UI navigates into the prototype.

The current login component includes a comment stating that the forms validate and sign in to a local profile on the tab, with no account created or checked. The demo profile helper also states that nothing is sent anywhere.

## Supabase client configuration

The client in `src/integrations/supabase/client.ts` is configured with:
- Supabase URL and publishable key.
- A brokered preview storage adapter.
- `persistSession: true`.
- `autoRefreshToken: true`.

The preview storage helper supports session coordination in supported Lovable preview contexts. It is not itself an authentication provider and does not prove that the auth form uses Supabase Auth.

## Credential and token handling

In the current demo sign-in flow:
- The form password is validated locally but is not sent to Supabase Auth by the inspected flow.
- The demo profile is browser-local state, not a verified server identity.
- The remember-me behaviour stores the email preference, not a persistent authenticated session.
- The demo profile should not be treated as a secure access-control boundary.

The separate local credentials helper refers to demo certificates and badges; those are not login passwords, access tokens or refresh tokens.

## Production implementation requirements

Before real accounts or private data are enabled:
1. Use Supabase Auth methods such as `signInWithPassword`, `signUp` and `resetPasswordForEmail`.
2. Handle auth state changes and session restoration through the Supabase client.
3. Never store plaintext passwords in local storage, session storage or application tables.
4. Keep the publishable/anon key in client configuration only; never expose a service-role key.
5. Enforce role and resource permissions with database policies (for example, Supabase Row Level Security) and trusted server-side checks.
6. Validate email verification, password reset, logout, token expiry and refresh behaviour.
7. Protect privileged staff and administrative routes using server-verified roles, not client-side profile selection.
8. Add tests for unauthenticated access, role escalation attempts and cross-user data access.

## Reference implementation shape

The following is illustrative only; it is not a claim that these calls are already wired into the current form:

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  // Show a safe, user-friendly error.
}
```

Registration and password reset should use the corresponding Supabase Auth methods and verified redirect URLs. Define the profile and role model before wiring the UI to production data.
