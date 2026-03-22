## 2025-05-14 - [Auth Bypass & Hardcoded Secrets]
**Vulnerability:** Authentication middleware (`permissionValidator.ts`) was trusting unverified `x-user-id` and `x-user-role` headers for identity, allowing easy identity spoofing. Additionally, `JWTService` had a hardcoded fallback secret.
**Learning:** The application had JWT infrastructure but it was not fully integrated into the middleware, leading to a "security theater" where headers were used instead of verified tokens.
**Prevention:** Always prioritize verified tokens (JWT) in middleware. Enforce the presence of security secrets via environment variables and throw errors in production if they are missing. Restricted unverified header fallbacks to non-production environments.
