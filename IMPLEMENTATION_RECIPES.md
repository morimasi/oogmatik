# 🔧 OOGMATIK - PROFESYONEL İYİLEŞTİRME REÇETESI
**Türkçe: Adım Adım Çözüm Kılavuzu**

---

## 1️⃣ API KEY GÜVENLIĞI - TAMAMEN YENİDEN TASARLANMALI

### Problem Özeti
- Frontend'de API key'ler localStorage'da saklanıyor
- Client-side'dan doğrudan Gemini API'ye çağrı yapılıyor
- Herhangi biri DevTools'da anahtarı görebilir ve sınırsız cost oluşturabilir

### Çözüm: Backend Proxy Mimarisi

#### ADIM 1: Yeni API Endpoint Oluştur
**Dosya: `api/generateContent.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const MASTER_MODEL = "gemini-3-flash-preview";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS ayarla
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        // 2. Authentication kontrol et
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const user = await verifyFirebaseToken(token); // ← Firebase SDK ile verify et
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // 3. Rate limiting kontrol et
        const rateLimitKey = `user:${user.uid}`;
        const remaining = await checkRateLimit(rateLimitKey, 100, 3600); // 100 req/hour
        
        if (remaining < 0) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded',
                retryAfter: 3600 
            });
        }

        // 4. Input validation
        const { prompt, image, mimeType, schema, thinkingBudget } = req.body;
        
        if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
            return res.status(400).json({ 
                error: 'Invalid prompt: must be string, 1-5000 chars' 
            });
        }

        // 5. Gemini API çağrısı (Backend'de - Secure!)
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_API_KEY not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const config: any = {
            temperature: 0,
            responseMimeType: "application/json",
            maxOutputTokens: 32000,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        };

        if (thinkingBudget) {
            config.thinkingConfig = { thinkingBudget };
        }

        let parts: any[] = [];
        if (image) {
            const base64Data = image.includes(',') ? image.split(',')[1] : image;
            parts.push({
                inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data
                }
            });
        }
        parts.push({ text: prompt });

        const result = await ai.models.generateContent({
            model: MASTER_MODEL,
            contents: { parts },
            config
        });

        // 6. Başarılı yanıt
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        const responseData = {
            success: true,
            data: result.text,
            usage: {
                timestamp: new Date().toISOString(),
                userId: user.uid,
            }
        };

        return res.status(200).json(responseData);

    } catch (error: any) {
        console.error('[GenerateAPI] Error:', error);
        
        // 7. Error handling
        const statusCode = 
            error.message?.includes('rate') ? 429 :
            error.message?.includes('invalid') ? 400 :
            error.message?.includes('auth') ? 401 :
            500;

        return res.status(statusCode).json({
            error: 'Content generation failed',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Helper functions
async function verifyFirebaseToken(token: string) {
    try {
        const { auth } = require('./firebaseClient');
        const decoded = await auth.verifyIdToken(token);
        return decoded;
    } catch (e) {
        return null;
    }
}

async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
    // Redis veya simple in-memory cache kullan
    // return remaining tokens
    // Production'da Redis gerekir
    return limit;
}
```

#### ADIM 2: Frontend'deki Çağrıyı Güncelle
**Dosya: `services/geminiClient.ts` (REFACTOR)**

```typescript
/**
 * FRONTEND: Artık doğrudan Gemini API çağrısı YOK
 * Tüm çağrılar Backend Proxy'nin üzerinden geçer
 */

import { useAuth } from '../context/AuthContext';

export const generateCreativeMultimodal = async (params: {
    prompt: string,
    schema?: any,
    files?: { data: string; mimeType: string }[],
    temperature?: number,
    thinkingBudget?: number
}) => {
    // Frontend'de API key YOK
    // Kullanıcının JWT token'ı var
    
    const response = await fetch('/api/generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getFirebaseToken()}` // ← JWT kullan
        },
        body: JSON.stringify({
            prompt: params.prompt,
            image: params.files?.[0]?.data,
            mimeType: params.files?.[0]?.mimeType,
            schema: params.schema,
            thinkingBudget: params.thinkingBudget ?? 2000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }

    const result = await response.json();
    return result.data;
};

function getFirebaseToken(): string {
    // Firebase SDK'den mevcut user token'ı al
    const auth = require('firebase/auth').getAuth();
    return auth.currentUser?.getIdToken() || '';
}
```

#### ADIM 3: Environment Variables Güvenliği
**Dosya: `.env.local` (Production Vercel Dashboard'da)**

```bash
# Production ortamında SADECE bu key'i sakla
GOOGLE_API_KEY=AIza_xxxxxxxxxxx

# Frontend'e iletilmeyecek!
NODE_ENV=production

# Frontend'e güvenli olarak aktarılabilecek:
VITE_FIREBASE_PROJECT_ID=bursa-disleksi-ai
VITE_FRONTEND_URL=https://yourapp.com
```

---

## 2️⃣ ERROR HANDLING - KOMPLETTİR

### Problem: Try-catch'ler başarısız, kullanıcılar hiç hata mesajı almıyor

### Çözüm: Centralized Error Management

#### ADIM 1: Custom Error Class Oluştur
**Dosya: `utils/AppError.ts`**

```typescript
export class AppError extends Error {
    constructor(
        public userMessage: string,        // Kullanıcı dostu
        public code: string,               // Sistem kodı
        public httpStatus: number = 500,   // HTTP durum
        public details?: Record<string, any> // Debug bilgileri
    ) {
        super(userMessage);
        this.name = 'AppError';
    }
}

// Özel error tiplemeleri
export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter: number = 60) {
        super(
            `Çok hızlı istek gönderdin. ${retryAfter} saniye sonra tekrar dene.`,
            'RATE_LIMIT_EXCEEDED',
            429,
            { retryAfter }
        );
    }
}

export class NetworkError extends AppError {
    constructor(message?: string) {
        super(
            message || 'İnternet bağlantısında sorun. Lütfen kontrol et.',
            'NETWORK_ERROR',
            503
        );
    }
}

export class AuthenticationError extends AppError {
    constructor() {
        super('Oturumun sona erdi. Lütfen yeniden giriş yap.', 'AUTH_ERROR', 401);
    }
}
```

#### ADIM 2: Error Handling Utility
**Dosya: `utils/errorHandler.ts`**

```typescript
import { AppError, ValidationError, NetworkError } from './AppError';

export const handleApiError = (error: unknown): AppError => {
    // Network hatası
    if (!navigator.onLine) {
        return new NetworkError();
    }

    // AppError
    if (error instanceof AppError) {
        logError(error);
        return error;
    }

    // Fetch API hatası
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return new NetworkError('Sunucuya ulaşılamadı.');
    }

    // Timeout
    if (error instanceof Error && error.message.includes('timeout')) {
        return new AppError(
            'İslem çok uzun sürüyor. Lütfen yeniden dene.',
            'TIMEOUT',
            504
        );
    }

    // Firebase hatası
    if (error instanceof Error && error.code?.includes('auth')) {
        return new AppError('Doğrulama hatası oluştu.', 'AUTH_ERROR', 401);
    }

    // Genel hata
    if (error instanceof Error) {
        return new AppError(
            'Bir hata oluştu. Lütfen destekle iletişime geçin.',
            'UNKNOWN_ERROR',
            500,
            { originalMessage: error.message }
        );
    }

    return new AppError('Bilinmeyen hata', 'UNKNOWN', 500);
};

export const logError = (error: AppError) => {
    // Production'da external service'e gönder (Sentry, Loggly vb)
    if (process.env.NODE_ENV === 'production') {
        // sendToSentry(error);
    }

    // Console'da debug
    console.error('[AppError]', {
        code: error.code,
        status: error.httpStatus,
        message: error.message,
        details: error.details
    });
};

export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Exponential backoff
            const delay = initialDelayMs * Math.pow(2, attempt);
            const jitter = Math.random() * delay * 0.1;
            
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay + jitter));
            }
        }
    }

    throw lastError;
};
```

#### ADIM 3: Service'lerde Kullan
**Dosya: `services/worksheetService.ts` (REFACTOR)**

```typescript
import { AppError, ValidationError } from '../utils/AppError';
import { handleApiError, retryWithBackoff } from '../utils/errorHandler';

export const worksheetService = {
    saveWorksheet: async (
        userId: string,
        name: string,
        activityType: ActivityType,
        data: SingleWorksheetData[],
        // ... other params
    ): Promise<SavedWorksheet> => {
        try {
            // Input validation
            if (!userId || !name?.trim()) {
                throw new ValidationError('Kullanıcı ve isim gereklidir');
            }

            if (data.length === 0) {
                throw new ValidationError('En az bir aktivite gereklidir');
            }

            const payload: any = {
                userId,
                name: name.trim(),
                activityType,
                worksheetData: serializeData(data),
                createdAt: new Date().toISOString(),
            };

            // Retry logic: network hatası varsa 3 kez dene
            const docRef = await retryWithBackoff(() =>
                addDoc(collection(db, "saved_worksheets"), payload)
            );

            // Count güncelle
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { worksheetCount: increment(1) }).catch(
                err => console.warn("Count update failed, continuing...", err)
            );

            return {
                ...mapDbToWorksheet(payload, docRef.id),
                worksheetData: data
            };

        } catch (error: unknown) {
            const appError = handleApiError(error);
            
            // Kullanıcı dostu mesaj göster
            throw appError;
        }
    },

    getUserWorksheets: async (
        userId: string,
        page: number = 0,
        pageSize: number = 20
    ): Promise<{ items: SavedWorksheet[]; count: number }> => {
        try {
            // Firestore query with error handling
            const q = query(
                collection(db, "saved_worksheets"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(pageSize + 1) // Sonraki sayfa var mı?
            );

            const snapshot = await retryWithBackoff(() => getDocs(q));
            
            const items = snapshot.docs.map(doc =>
                mapDbToWorksheet(doc.data(), doc.id)
            );

            return {
                items: items.slice(0, pageSize),
                count: items.length > pageSize ? -1 : items.length // -1 = more available
            };

        } catch (error: unknown) {
            const appError = handleApiError(error);
            
            if (appError.code === 'FIRESTORE_QUERY_ERROR') {
                // Fallback: In-memory filter
                console.warn('Using fallback client-side query');
                // ... fallback implementation
            }
            
            throw appError;
        }
    }
};
```

#### ADIM 4: React Komponenti'nde Göster
**Dosya: `components/GeneratorView.tsx` (REFACTOR)**

```tsx
import React, { useState } from 'react';
import { AppError } from '../utils/AppError';

export const GeneratorView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AppError | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleGenerateActivity = async (prompt: string) => {
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const result = await worksheetService.generateActivity(prompt);
            setSuccessMessage('Aktivite başarıyla oluşturuldu!');
            // Process result...

        } catch (err: unknown) {
            const appError = err instanceof AppError 
                ? err 
                : new AppError('Bilinmeyen hata', 'UNKNOWN', 500);
            
            setError(appError);
            
            // Optional: Track error
            console.error('Activity generation failed:', appError.code);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Error Alert */}
            {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <h4 className="font-bold text-red-800">Hata Oluştu</h4>
                    <p className="text-red-700 text-sm">{error.userMessage}</p>
                    {error.code === 'RATE_LIMIT_EXCEEDED' && (
                        <p className="text-xs text-red-600 mt-2">
                            Lütfen {error.details?.retryAfter || 60} saniye sonra deneyin.
                        </p>
                    )}
                </div>
            )}

            {/* Success Alert */}
            {successMessage && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-blue-700">İşleniyor...</span>
                </div>
            )}

            {/* Form */}
            <button
                onClick={() => handleGenerateActivity('...')}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                {isLoading ? 'Bekleniyor...' : 'Aktivite Oluştur'}
            </button>
        </div>
    );
};
```

---

## 3️⃣ RATE LIMITING - UYGULANMALI

### Problem: API'ye sınırsız çağrı mümkün (cost explosion riski)

### Çözüm: Token Bucket Algorithm

**Dosya: `services/rateLimitService.ts`**

```typescript
/**
 * Token Bucket Rate Limiter
 * - Her user: 100 requests/hour
 * - Admin: 500 requests/hour
 * - System refills tokens linearly
 */

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

export class RateLimiter {
    private buckets = new Map<string, TokenBucket>();
    
    private readonly limits: Record<string, { tokens: number; windowMs: number }> = {
        'user': { tokens: 100, windowMs: 3600000 }, // 100/hour
        'admin': { tokens: 500, windowMs: 3600000 },
        'ai_generation': { tokens: 50, windowMs: 3600000 },
    };

    constructor() {
        // Eski buckets'ları temizle (her 1 saat)
        setInterval(() => this.cleanup(), 3600000);
    }

    async checkLimit(userId: string, tier: keyof typeof this.limits): Promise<boolean> {
        const limit = this.limits[tier];
        const bucket = this.buckets.get(userId) || { tokens: limit.tokens, lastRefill: Date.now() };

        // Refill tokens
        const now = Date.now();
        const timePassed = now - bucket.lastRefill;
        const tokensToAdd = (timePassed / limit.windowMs) * limit.tokens;
        
        bucket.tokens = Math.min(bucket.tokens + tokensToAdd, limit.tokens);
        bucket.lastRefill = now;

        // Check limit
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            this.buckets.set(userId, bucket);
            return true;
        }

        return false;
    }

    getRemaining(userId: string, tier: keyof typeof this.limits): number {
        const bucket = this.buckets.get(userId);
        return bucket ? Math.floor(bucket.tokens) : this.limits[tier].tokens;
    }

    reset(userId: string) {
        this.buckets.delete(userId);
    }

    private cleanup() {
        const oneHourAgo = Date.now() - 3600000;
        for (const [userId, bucket] of this.buckets.entries()) {
            if (bucket.lastRefill < oneHourAgo) {
                this.buckets.delete(userId);
            }
        }
    }
}

export const rateLimiter = new RateLimiter();
```

**Backend'de Middleware'e Ekle:**

```typescript
// api/generateContent.ts
const tier = user.role === 'admin' ? 'admin' : 'user';
const allowed = await rateLimiter.checkLimit(user.uid, tier);

if (!allowed) {
    const remaining = rateLimiter.getRemaining(user.uid, tier);
    return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 3600,
        remaining
    });
}
```

---

## 4️⃣ INPUT VALIDATION - ZOD İLE GÜÇLENDIR

### Problem: User input'ler kontrol edilmiyor

### Çözüm: Schema-based Validation

**Dosya: `utils/schemas.ts`**

```typescript
import { z } from 'zod';

// Aktivite oluşturma
export const GenerateActivitySchema = z.object({
    prompt: z.string()
        .min(5, 'Prompt en az 5 karakter olmalı')
        .max(5000, 'Prompt 5000 karakterden fazla olamaz')
        .refine(
            (val) => !val.includes('DROP TABLE'),  // SQL injection check
            'Geçersiz ifade kullanıldı'
        ),
    
    activityType: z.enum([
        'READING_COMPREHENSION',
        'MATH_PROBLEMS',
        'VISUAL_ATTENTION',
        // ... all valid types
    ]),
    
    studentAge: z.number().min(5).max(18).optional(),
    
    studentProfile: z.object({
        name: z.string().max(100),
        diagnosis: z.enum(['DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'ADHD']).optional(),
        learningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC']).optional(),
    }).optional(),

    image: z.object({
        data: z.string().max(5_000_000), // 5MB
        mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    }).optional(),
});

// Kullanıcı profili güncelleme
export const UpdateProfileSchema = z.object({
    name: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    profession: z.enum(['TEACHER', 'PARENT', 'THERAPIST', 'ADMIN']).optional(),
});

// Paylaşım
export const ShareWorksheetSchema = z.object({
    worksheetId: z.string().uuid(),
    shareWithEmails: z.array(z.string().email()).min(1).max(10),
    permissions: z.enum(['VIEW', 'EDIT']).default('VIEW'),
});
```

**API'de Kullan:**

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        // Validate request body
        const validated = GenerateActivitySchema.parse(req.body);

        // Proceed with validated data
        const result = await generateActivity(validated);
        return res.json({ success: true, data: result });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Geçersiz istek',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }

        // ... handle other errors
    }
}
```

---

## 5️⃣ TEST COVERAGE - BAŞTAN BAŞLA

### Minimum Target: 75% coverage

**Dosya: `tests/services/worksheetService.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { worksheetService } from '../../services/worksheetService';
import { AppError } from '../../utils/AppError';

describe('worksheetService', () => {
    
    describe('saveWorksheet', () => {
        it('should save a valid worksheet', async () => {
            const result = await worksheetService.saveWorksheet(
                'user123',
                'Test Sheet',
                'READING_COMPREHENSION',
                [{ /* valid data */ }],
                'fa-book'
            );

            expect(result).toHaveProperty('id');
            expect(result.name).toBe('Test Sheet');
        });

        it('should reject empty data', async () => {
            expect(() =>
                worksheetService.saveWorksheet(
                    'user123',
                    'Test',
                    'READING_COMPREHENSION',
                    [], // ← Empty!
                    'fa-book'
                )
            ).rejects.toThrow(ValidationError);
        });

        it('should retry on network failure', async () => {
            const mockError = new Error('Network timeout');
            let attempts = 0;

            vi.mock('firebase/firestore', () => ({
                addDoc: vi.fn(() => {
                    attempts++;
                    if (attempts < 3) throw mockError;
                    return { id: 'doc123' };
                })
            }));

            // Should retry and eventually succeed
            const result = await worksheetService.saveWorksheet(...);
            expect(attempts).toBe(3);
        });
    });

    describe('getUserWorksheets', () => {
        it('should paginate correctly', async () => {
            const page1 = await worksheetService.getUserWorksheets('user123', 0, 20);
            const page2 = await worksheetService.getUserWorksheets('user123', 1, 20);

            expect(page1.items.length).toBeLessThanOrEqual(20);
            expect(page1.items[0].id).not.toBe(page2.items[0].id);
        });

        it('should return empty array for new user', async () => {
            const result = await worksheetService.getUserWorksheets('newuser', 0, 20);
            expect(result.items).toEqual([]);
            expect(result.count).toBe(0);
        });
    });
});
```

**API Tests:**

```typescript
// tests/api/generateContent.test.ts
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../api/generateContent';

describe('POST /api/generateContent', () => {
    it('should require authentication', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { prompt: 'test' }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(401);
    });

    it('should validate prompt', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: 'Bearer valid_token' },
            body: { prompt: 'a' } // Too short
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });

    it('should rate limit requests', async () => {
        // Mock rate limiter
        // Send 101 requests
        // Expect 429 on 101st
    });
});
```

---

## 6️⃣ FIRESTORE OPTİMİZASYON

### Problem: Missing composite indexes, N+1 queries

**Dosya: `database/firestore.rules`**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.token.admin == true;
      allow write: if request.auth.uid == userId;
      allow delete: if request.auth.token.admin == true;
    }

    // Saved worksheets
    match /saved_worksheets/{worksheetId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow read: if request.auth.uid == resource.data.userId 
                     || request.auth.uid in resource.data.sharedWith;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
    }

    // Activity history
    match /activity_history/{historyId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow read: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
    }

    // Audit logs (admin only)
    match /audit_logs/{logId} {
      allow read: if request.auth.token.admin == true;
      allow write: if false; // Server-only
    }
  }
}
```

**Firestore Console'da Composite Indexes:**

1. `saved_worksheets` collection:
   - Composite: `userId` + `createdAt DESC`
   - Composite: `userId` + `sharedWith` + `createdAt DESC`

2. `activity_history` collection:
   - Composite: `userId` + `activityType` + `timestamp DESC`

---

## SONUÇ: UYGULAMA ÖNCELİĞİ

| # | Task | Dosya | Zaman | Kritiklik |
|---|------|-------|-------|-----------|
| 1 | API Key Güvenliği | api/generateContent.ts | 3-4 saat | 🔴 KRİTİK |
| 2 | Error Handling | utils/ | 4-5 saat | 🔴 KRİTİK |
| 3 | Rate Limiting | services/rateLimitService.ts | 2-3 saat | 🔴 KRİTİK |
| 4 | Input Validation | utils/schemas.ts | 3-4 saat | 🔴 KRİTİK |
| 5 | Test Suite | tests/ | 20-30 saat | 🟡 YÜKSEK |
| 6 | Firestore Rules | database/firestore.rules | 2-3 saat | 🟡 YÜKSEK |

**TOPLAM: ~40-50 saat = 1 senior developer = 1 hafta**

Başla bugün! 🚀
