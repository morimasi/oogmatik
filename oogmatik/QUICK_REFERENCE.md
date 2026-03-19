# Quick Reference Guide - Error Handling & Rate Limiting

## 🎯 Frontend Error Display

### Basic Usage
```tsx
import { ErrorDisplay } from '@/components/ErrorDisplay';

export const MyComponent = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <ErrorDisplay
      error={error}
      onDismiss={() => setError(null)}
      onRetry={() => handleRetry()}
      isRetrying={isRetrying}
    />
  );
};
```

### Supported Error Types
- `ValidationError` - Orange badge, non-retryable
- `RateLimitError` - Yellow badge, retryable with countdown
- `TimeoutError` - Blue badge, retryable
- `AuthenticationError` - Red badge, non-retryable
- Generic `Error` - Red badge, non-retryable

---

## 🔒 API Validation

### Generate Activity Validation
```typescript
// Input validation happens automatically in api/generate.ts
POST /api/generate
{
  "prompt": "Create exercise",        // Required: string, min 10 chars
  "schema": { "type": "object" },     // Required: valid JSON schema
  "image": "base64string",            // Optional
  "mimeType": "image/jpeg",           // Optional: jpeg|png|gif|webp
  "useSearch": false                  // Optional: boolean
}

// Error Response
{
  "error": {
    "message": "Geçersiz resim formatı. JPEG, PNG, GIF veya WebP kullanınız.",
    "code": "VALIDATION_ERROR",
    "retryable": false,
    "timestamp": "2026-03-11T..."
  }
}
```

### Feedback Validation
```typescript
POST /api/feedback
{
  "activityType": "reading",          // Required: string
  "activityTitle": "Title",           // Required: string, max 200
  "rating": 4,                        // Required: 1-5
  "message": "Feedback text",         // Required: string, 5-500 chars
  "email": "user@example.com",        // Optional: valid email
  "timestamp": "ISO string"           // Optional
}
```

---

## ⏱️ Rate Limiting

### Check Rate Limit Status
```typescript
import { RateLimiter } from '@/services/rateLimiter';

const limiter = new RateLimiter();

// Check without consuming
const status = limiter.getStatus(userId, 'free', 'apiGeneration');
console.log(`${status.remaining}/${status.total} remaining`);
console.log(`Resets at: ${status.resetsAt}`);

// Check and consume
const result = await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
if (result.allowed) {
  // Proceed
} else {
  console.log(`Reset after ${result.resetAfterMs}ms`);
}

// Enforce with error throwing
try {
  await limiter.enforceLimit(userId, 'free', 'apiGeneration');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(error.userMessage); // "Çok hızlı istek gönderdiniz..."
  }
}
```

### Limit Types
```typescript
type LimitKey = 'apiGeneration' | 'apiQuery' | 'worksheetSave' | 'ocrScan';
```

---

## 🛡️ Input Validation Functions

### Basic Validators
```typescript
import { 
  validateEmail, 
  validatePassword, 
  validateName,
  validateURL 
} from '@/utils/schemas';

// Returns boolean
validateEmail('user@example.com');     // true
validatePassword('MyPass123');         // { valid: true, errors: [] }
validateName('John Doe');              // { valid: true, error: undefined }
validateURL('https://example.com');    // true
```

### Request Validators
```typescript
import {
  validateLoginRequest,
  validateRegisterRequest,
  validateGenerateActivityRequest,
  validateFeedbackRequest,
  validateOCRScanRequest
} from '@/utils/schemas';

// Returns { valid: boolean, errors: Record<string, string> }
const result = validateLoginRequest({
  email: 'user@example.com',
  password: 'Password123'
});

if (!result.valid) {
  Object.entries(result.errors).forEach(([field, message]) => {
    console.error(`${field}: ${message}`);
  });
}
```

### Sanitization
```typescript
import { sanitizeInput, sanitizeHtml } from '@/utils/schemas';

// Escape HTML entities
sanitizeInput('<script>alert("xss")</script>');
// → '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

// Remove dangerous HTML
sanitizeHtml('<div onclick="alert()">Click</div>');
// → '<div>Click</div>'
```

---

## 🔄 Error Handling Utilities

### Retry with Backoff
```typescript
import { retryWithBackoff } from '@/utils/errorHandler';

const result = await retryWithBackoff(
  async () => {
    // Your async operation
    return await geminiClient.generate(params);
  },
  {
    maxRetries: 3,                    // Default: 3
    initialDelay: 1000,               // ms, default: 1000
    shouldRetry: (error) => {
      // Only retry if error is retryable
      return error instanceof TimeoutError;
    }
  }
);
```

### Timeout Wrapper
```typescript
import { withTimeout } from '@/utils/errorHandler';

const result = await withTimeout(
  fetchLargeDataset(),
  30000,              // timeout in ms
  'Data Fetch'        // operation name for error message
);
// Throws TimeoutError if exceeds 30 seconds
```

### Logging
```typescript
import { logError } from '@/utils/errorHandler';

const error = new ValidationError('Invalid input');

logError(error, {
  context: 'API Request',
  userId: 'user123',
  endpoint: '/api/generate',
  customData: { /* ... */ }
});
// Logs with context for debugging
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test -- AppError.test.ts
npm run test -- RateLimiter.test.ts
npm run test -- Validators.test.ts
npm run test -- Integration.test.ts
```

### Run with UI
```bash
npm run test:ui
```

### Test Coverage
```bash
npm run test -- --coverage
```

---

## ⚠️ Common Error Codes

| Code | Status | Retryable | Meaning |
|------|--------|-----------|---------|
| VALIDATION_ERROR | 400 | ❌ | Input data is invalid |
| AUTH_ERROR | 401 | ❌ | Authentication required |
| AUTHORIZATION_ERROR | 403 | ❌ | Permission denied |
| NOT_FOUND | 404 | ❌ | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | ✅ | Too many requests |
| TIMEOUT | 504 | ✅ | Operation took too long |
| NETWORK_ERROR | 503 | ✅ | Network unavailable |
| INTERNAL_SERVER_ERROR | 500 | ✅ | Server error |
| API_QUOTA_EXCEEDED | 429 | ✅ | API usage limit reached |

---

## 📋 API Headers

### Request Headers
```
Content-Type: application/json
x-user-tier: free|pro|admin        (optional, default: free)
x-user-id: <user-identifier>       (optional, default: anonymous)
```

### Response Headers
```
Content-Type: application/json; charset=utf-8
Cache-Control: no-store, no-cache, must-revalidate
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Retry-After: <seconds>             (only on rate limit)
```

---

## 🔌 Integration Checklist

### Backend Setup
- [x] Add validation to `api/generate.ts`
- [x] Add validation to `api/feedback.ts`
- [x] Add rate limiting to both endpoints
- [ ] Add CORS headers (done)
- [ ] Add security headers (done)
- [ ] Test with curl/Postman
- [ ] Monitor error logs

### Frontend Setup
- [x] Create `ErrorDisplay.tsx` component
- [ ] Integrate into `GeneratorView.tsx`
- [ ] Integrate into `AuthModal.tsx`
- [ ] Add error state management
- [ ] Add retry UI
- [ ] Test error scenarios

### Database Setup
- [ ] Update user tier in Firestore
- [ ] Add rate limit tracking (optional: Redis)
- [ ] Create error logging collection
- [ ] Setup monitoring dashboard

---

## 🐛 Debugging Tips

### Check Rate Limit Status
```typescript
const limiter = new RateLimiter();
const status = limiter.getStatus('test-user', 'free', 'apiGeneration');
console.log(status); // { remaining, total, resetsAt }
```

### Reset Rate Limit (Testing Only)
```typescript
limiter.reset('test-user', 'apiGeneration');
// or reset all operations
limiter.reset('test-user');
```

### View Error Details
```typescript
const error = new ValidationError('Test', { field1: 'error1' });
console.log(error.toJSON());
// {
//   name: 'ValidationError',
//   code: 'VALIDATION_ERROR',
//   userMessage: 'Test',
//   httpStatus: 400,
//   isRetryable: false,
//   details: { field1: 'error1' },
//   timestamp: '...'
// }
```

---

## 📚 Related Files

- `utils/AppError.ts` - Error class definitions
- `utils/errorHandler.ts` - Error handling utilities
- `utils/schemas.ts` - Validation functions
- `services/rateLimiter.ts` - Rate limiting service
- `components/ErrorDisplay.tsx` - Error UI component
- `api/generate.ts` - Enhanced generation endpoint
- `api/feedback.ts` - Enhanced feedback endpoint
- `tests/*.test.ts` - Test suites

---

## 🎓 Best Practices

### 1. Always Validate User Input
```typescript
try {
  validateFeedbackRequest(req.body);
} catch (error) {
  // Handle validation error
}
```

### 2. Use Proper Error Types
```typescript
// ❌ Don't
throw new Error('Invalid email');

// ✅ Do
throw new ValidationError('Geçersiz e-posta adresi');
```

### 3. Log Errors with Context
```typescript
logError(error, {
  context: 'User Registration',
  email: user.email,
  timestamp: new Date(),
});
```

### 4. Display User-Friendly Messages
```typescript
// The AppError.userMessage is already Turkish and friendly
// Don't expose technical details to users
```

### 5. Implement Retry Logic
```typescript
// Use retryWithBackoff for flaky operations
const result = await retryWithBackoff(
  async () => await apiCall(),
  { maxRetries: 3, shouldRetry: (err) => err.isRetryable }
);
```

---

**Daha fazla sorular için: Check IMPLEMENTATION_SUMMARY.md**
