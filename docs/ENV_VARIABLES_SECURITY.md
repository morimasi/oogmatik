# OOGMATIK - Environment Variables Security Guide

## ⚠️ CRITICAL: VITE_ Prefix Security Issue

### Problem
VITE_ prefixed environment variables are **EXPOSED TO THE BROWSER** in the production bundle.

```bash
# ❌ NEVER DO THIS - API keys exposed to browser!
VITE_GEMINI_API_KEY=your-secret-key-here
VITE_GOOGLE_API_KEY=your-secret-key-here
```

### Solution
Use server-side only environment variables (no VITE_ prefix):

```bash
# ✅ CORRECT - Server-side only
GEMINI_API_KEY=your-secret-key-here
GOOGLE_API_KEY=your-secret-key-here
API_KEY=fallback-key-here
```

## Environment Variables Structure

### Server-Side (Vercel Serverless Functions)
These are **NOT exposed** to the browser:
```bash
# AI API Keys
GEMINI_API_KEY=xxx
GOOGLE_API_KEY=xxx
API_KEY=xxx

# Security
TC_HASH_SALT=your-production-salt-minimum-32-chars
STUDENT_ID_SALT=your-student-salt-minimum-32-chars

# Firebase Admin (if needed)
FIREBASE_ADMIN_SDK_KEY=xxx
```

### Client-Side (Browser)
Only use VITE_ prefix for **NON-SENSITIVE** data:
```bash
# ✅ OK - Public app version
VITE_APP_VERSION=1.0.3

# ✅ OK - Public Firebase config
VITE_FIREBASE_API_KEY=xxx  # This is OK - Firebase client key is public
VITE_FIREBASE_AUTH_DOMAIN=oogmatik.firebaseapp.com
```

## Vercel Deployment

### Add Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your secret key
   - **Environment**: Production, Preview, Development
   - **⚠️ IMPORTANT**: Do NOT check "Expose to client"

### Migration from VITE_ Variables

If you have existing VITE_ prefixed secrets:

```bash
# 1. Remove old VITE_ variables from Vercel
# 2. Add new server-side variables
vercel env add GEMINI_API_KEY production
vercel env add GOOGLE_API_KEY production

# 3. Redeploy
vercel --prod
```

## Code Changes Made

### api/generate.ts
```typescript
// ❌ OLD - Exposed to browser
const apiKey = process.env.VITE_GEMINI_API_KEY || ...

// ✅ NEW - Server-side only
const apiKey = process.env.GEMINI_API_KEY ||
               process.env.GOOGLE_API_KEY ||
               process.env.API_KEY;
```

## Security Checklist

- [x] Remove VITE_ prefix from all API keys
- [x] Update api/generate.ts to use server-side env vars
- [x] Add TC_HASH_SALT for privacy service
- [x] Add STUDENT_ID_SALT for anonymization
- [ ] Update Vercel environment variables
- [ ] Redeploy to production

## Testing

Test locally:
```bash
# .env.local (gitignored)
GEMINI_API_KEY=test-key-here

npm run dev
```

Verify in browser console:
```javascript
// Should be undefined (not exposed)
console.log(import.meta.env.VITE_GEMINI_API_KEY);  // undefined ✅
```

## References
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- IYILESTIRME_PLANI.md - Sprint 1, Item #4
