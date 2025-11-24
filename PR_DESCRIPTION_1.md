# LinkedIn OAuth Integration

## Summary

Added LinkedIn OAuth authentication support following the same patterns as Google and GitHub OAuth.

## Changes

- Added LinkedIn OAuth login and callback routes
- Implemented LinkedIn OAuth strategy and guard
- Auto-verify emails for OAuth users (Google, GitHub, LinkedIn)
- Added `passport-oauth2` dependency for LinkedIn OpenID Connect

## Files Modified

- `src/auth/auth.service.ts` - LinkedIn OAuth methods and email verification
- `src/auth/auth.controller.ts` - LinkedIn OAuth routes
- `src/auth/auth.module.ts` - Registered LinkedinStrategy
- `src/auth/constants.ts` - LinkedIn OAuth constants
- `package.json` - Added passport-oauth2
- `.env.example` - Added LinkedIn env variables

## Files Created

- `src/auth/strategies/linkedin.strategy.ts`
- `src/auth/guards/linkedin.guard.ts`

## Environment Variables

```env
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_CALLBACK_URL="http://localhost:8080/api/v1/auth/linkedin/callback"
```
