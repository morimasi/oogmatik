# 🔧 CRITICAL FIXES IMPLEMENTATION PLAN
## Priority Issues & Solutions

**Created:** 2026-05-05  
**Status:** Ready for Implementation

---

## FIX-001: Consolidate JSON Repair Logic

### Problem
JSON repair logic is duplicated in 4 locations with variations:
1. `src/services/ocrService.ts` (lines 85-110)
2. `src/services/ocrVariationService.ts` (lines 73-88)
3. `src/services/geminiClient.ts` (uses `/api/generate` which has repair)
4. `src/utils/jsonRepair.ts` (canonical version)

### Solution
Replace all duplicate implementations with imports from `jsonRepair.ts`

### Implementation Steps

#### Step 1: Verify jsonRepair.ts has all needed functionality
```typescript
// src/utils/jsonRepair.ts should export:
export function tryRepairJson(text: string): any;
export function repairJsonWithBracketCompletion(text: string): string;
export function cleanJsonString(text: string): string;
```

#### Step 2: Update ocrService.ts
Replace lines 85-110 with:
```typescript
import { tryRepairJson } from '../utils/jsonRepair.js';

// In callGeminiWithImage function:
const parsed = tryRepairJson(text);
return parsed;
```

#### Step 3: Update ocrVariationService.ts
Replace lines 73-88 with:
```typescript
import { tryRepairJson } from '../utils/jsonRepair.js';

// In callGeminiDirect function:
const parsed = tryRepairJson(text);
return parsed;
```

### Testing
```bash
npx vitest run tests/OCRService.test.ts
npx vitest run tests/OCRVariation.test.ts
```

---

## FIX-002: Implement Offline Infographic Generators

### Problem
Infographic generators throw error in fast mode:
```typescript
if (options.mode === 'fast') {
    throw new AppError('Fast mode triggered AI fn', 'ROUTING_ERROR', 500);
}
```

### Solution
Create comprehensive offline generators for all infographic activities

### Implementation

Create `src/services/offlineGenerators/infographic.ts`:

```typescript
import { GeneratorOptions, WorksheetData } from '../../types';
import { AppError } from '../../utils/AppError';

/**
 * Offline infographic generator - rule-based content generation
 */
export const generateOfflineInfographic = async (
  activityType: string,
  options: GeneratorOptions
): Promise<WorksheetData> => {
  const {
    topic = 'Genel',
    ageGroup = '8-10',
    difficulty = 'Orta',
    profile = 'general',
    itemCount = 5
  } = options;

  // Template-based generation for offline mode
  const templates = getInfographicTemplates(activityType);
  const content = generateContentFromTemplate(templates, {
    topic,
    ageGroup,
    difficulty,
    itemCount
  });

  return {
    id: `infographic_offline_${Date.now()}`,
    type: activityType as any,
    title: `${topic} - İnfografik Aktivite`,
    description: `Hızlı mod üretilmiş ${topic} konusu infografik aktivite`,
    content,
    difficulty,
    targetSkills: generateTargetSkills(activityType, topic),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Get templates for infographic activity type
 */
function getInfographicTemplates(activityType: string) {
  const templates: Record<string, any> = {
    INFOGRAPHIC_SHORT_ANSWER: {
      structure: 'question-answer',
      formats: ['multiple-choice', 'fill-blank'],
      visualElements: ['icons', 'simple-diagrams']
    },
    INFOGRAPHIC_MATCHING: {
      structure: 'two-column-matching',
      formats: ['line-matching', 'box-matching'],
      visualElements: ['arrows', 'numbered-items']
    },
    // Add more templates as needed
  };

  return templates[activityType] || templates.INFOGRAPHIC_SHORT_ANSWER;
}

/**
 * Generate content from template
 */
function generateContentFromTemplate(template: any, params: any) {
  const { topic, difficulty, itemCount } = params;
  
  // Generate structured HTML content based on template
  let html = `<div class="infographic-activity" style="font-family:'Lexend',sans-serif;">`;
  html += `<h2 style="color:#2c3e50; margin-bottom:12px;">${topic} - İnfografik Etkinlik</h2>`;
  
  // Generate questions/items based on count
  for (let i = 1; i <= itemCount; i++) {
    html += generateQuestionItem(i, template, topic, difficulty);
  }
  
  html += `</div>`;
  return html;
}

/**
 * Generate individual question item
 */
function generateQuestionItem(index: number, template: any, topic: string, difficulty: string) {
  const difficultyModifier = difficulty === 'Kolay' ? 1 : difficulty === 'Zor' ? 3 : 2;
  
  return `
    <div class="question-item" style="margin-bottom:12px; padding:8px; border:1px solid #e0e0e0; border-radius:4px;">
      <p style="font-size:11px; line-height:1.4; margin:0;">
        <strong>Soru ${index}:</strong> ${topic} hakkında aşağıdakilerden hangisi doğrudur?
      </p>
      <div class="options" style="margin-top:6px; display:grid; grid-template-columns:1fr 1fr; gap:4px;">
        <div style="padding:4px 8px; background:#f5f5f5; border-radius:3px;">A) Seçenek 1</div>
        <div style="padding:4px 8px; background:#f5f5f5; border-radius:3px;">B) Seçenek 2</div>
        <div style="padding:4px 8px; background:#f5f5f5; border-radius:3px;">C) Seçenek 3</div>
        <div style="padding:4px 8px; background:#f5f5f5; border-radius:3px;">D) Seçenek 4</div>
      </div>
    </div>
  `;
}

/**
 * Generate target skills based on activity type
 */
function generateTargetSkills(activityType: string, topic: string): string[] {
  const skills: Record<string, string[]> = {
    INFOGRAPHIC_SHORT_ANSWER: ['Kısa cevap yazma', 'Bilgi hatırlama', 'Konu kavrama'],
    INFOGRAPHIC_MATCHING: ['Eşleştirme becerisi', 'İlişkilendirme', 'Görsel algı'],
  };

  return skills[activityType] || ['Bilgi', 'Beceri'];
}
```

### Testing
```bash
npx vitest run tests/activityStudio/
```

---

## FIX-003: Fix PrivacyService Test Failures

### Problem
39/39 tests failing in PrivacyService

### Likely Causes
1. Function export/import mismatch
2. Hash function implementation error
3. Regex patterns not matching
4. Test environment configuration

### Solution

#### Step 1: Check privacyService.ts exports
```typescript
// Ensure proper exports
export const privacyService = {
  hashTcNo,
  anonymizeStudent,
  sanitizeForAI,
  redactSensitiveData,
  // ... all functions
};

// Also export standalone functions for testing
export { hashTcNo, anonymizeStudent, sanitizeForAI, redactSensitiveData };
```

#### Step 2: Verify hash function
```typescript
export function hashTcNo(tcNo: string): string {
  if (!tcNo || tcNo.length !== 11) {
    throw new ValidationError('TC Kimlik No 11 haneli olmalıdır');
  }
  
  // Simple hash - ensure it works
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(tcNo).digest('hex');
}
```

#### Step 3: Run tests with verbose output
```bash
npx vitest run tests/PrivacyService.test.ts --reporter=verbose
```

#### Step 4: Check test mocks
```typescript
// Ensure proper mocking in test file
import { privacyService } from '../src/services/privacyService';

describe('PrivacyService', () => {
  it('should hash valid TC No', () => {
    const hash = privacyService.hashTcNo('12345678901');
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 hash length
  });
});
```

---

## FIX-004: Parallelize Batch Processing

### Problem
ActivityService processes batches sequentially

### Solution
Update `src/services/generators/ActivityService.ts` lines 145-160:

```typescript
// BEFORE (Sequential):
if (activeMode === 'ai' && itemCount > 10) {
    logInfo(`[ActivityService] Large batch detected (${itemCount}). Processing in sub-batches...`);
    const BATCH_SIZE = 5;
    const batches = Math.ceil(itemCount / BATCH_SIZE);
    
    for (let i = 0; i < batches; i++) {
        const subItemCount = Math.min(BATCH_SIZE, itemCount - (i * BATCH_SIZE));
        const subOptions = { ...options, itemCount: subItemCount };
        
        logInfo(`[ActivityService] Batch ${i + 1}/${batches} starting (${subItemCount} items)...`);
        const subData = await generator.generate(subOptions);
        
        if (Array.isArray(subData)) {
            safeData = [...safeData, ...subData];
        } else if (subData) {
            safeData.push(subData);
        }
    }
}

// AFTER (Parallel):
if (activeMode === 'ai' && itemCount > 10) {
    logInfo(`[ActivityService] Large batch detected (${itemCount}). Processing in parallel sub-batches...`);
    const BATCH_SIZE = 5;
    const batches = Math.ceil(itemCount / BATCH_SIZE);
    
    // Create all batch promises
    const batchPromises = Array.from({ length: batches }, async (_, i) => {
        const subItemCount = Math.min(BATCH_SIZE, itemCount - (i * BATCH_SIZE));
        const subOptions = { ...options, itemCount: subItemCount };
        
        logInfo(`[ActivityService] Batch ${i + 1}/${batches} starting (${subItemCount} items)...`);
        return await generator.generate(subOptions);
    });
    
    // Execute all batches in parallel
    const batchResults = await Promise.all(batchPromises);
    
    // Flatten results
    safeData = batchResults.flat().filter(Boolean);
}
```

### Performance Impact
- **Before:** 10 batches × 5s = 50s
- **After:** Parallel execution ≈ 5-7s
- **Improvement:** 7-10x faster

---

## FIX-005: Add Firestore Persistence for Activity Studio

### Problem
Activity studio uses in-memory Map stores that are lost on redeploy

### Solution

Create `src/services/activityStudioStore.ts`:

```typescript
import { db } from '../services/firebaseClient.js';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';

export interface ApprovalRecord {
  activityId: string;
  reviewerId: string;
  action: 'approve' | 'revise' | 'reject';
  note: string;
  timestamp: string;
}

export interface DraftRecord {
  id: string;
  userId: string;
  name: string;
  payload: Record<string, unknown>;
  updatedAt: string;
}

const APPROVALS_COLLECTION = 'activity_studio_approvals';
const DRAFTS_COLLECTION = 'activity_studio_drafts';

/**
 * Approval Store with Firestore persistence
 */
export const activityStudioStore = {
  /**
   * Save approval record
   */
  async saveApproval(record: ApprovalRecord): Promise<void> {
    const docRef = doc(db, APPROVALS_COLLECTION, record.activityId);
    await setDoc(docRef, {
      ...record,
      createdAt: new Date().toISOString()
    });
  },

  /**
   * Get approval record
   */
  async getApproval(activityId: string): Promise<ApprovalRecord | null> {
    const docRef = doc(db, APPROVALS_COLLECTION, activityId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ApprovalRecord;
    }
    return null;
  },

  /**
   * Save draft
   */
  async saveDraft(draft: DraftRecord): Promise<void> {
    const docRef = doc(db, DRAFTS_COLLECTION, draft.id);
    await setDoc(docRef, {
      ...draft,
      createdAt: new Date().toISOString()
    });
  },

  /**
   * Get all drafts for user
   */
  async getUserDrafts(userId: string): Promise<DraftRecord[]> {
    const draftsRef = collection(db, DRAFTS_COLLECTION);
    const q = query(draftsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as DraftRecord);
  },

  /**
   * Update draft
   */
  async updateDraft(id: string, updates: Partial<DraftRecord>): Promise<DraftRecord | null> {
    const docRef = doc(db, DRAFTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const existing = docSnap.data() as DraftRecord;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, updated);
    return updated;
  }
};
```

Then update `api/activity-studio/[action].ts` to use this store instead of in-memory Maps.

---

## FIX-006: Fix Rate Limiter Configuration

### Problem
Rate limiter test failures suggest configuration issues

### Solution

#### Step 1: Review rateLimiter.ts configuration
```typescript
// src/services/rateLimiter.ts
const RATE_LIMITS = {
  free: {
    apiGeneration: 10,      // 10 requests per window
    apiQuery: 50,           // 50 requests per window
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  pro: {
    apiGeneration: 100,
    apiQuery: 500,
    windowMs: 60 * 60 * 1000
  },
  admin: {
    apiGeneration: 1000,
    apiQuery: 5000,
    windowMs: 60 * 60 * 1000
  }
};
```

#### Step 2: Verify token bucket implementation
```typescript
class RateLimiter {
  private store: Map<string, { tokens: number; lastRefill: number }>;

  constructor() {
    this.store = new Map();
  }

  async enforceLimit(userId: string, tier: 'free' | 'pro' | 'admin', endpoint: string): Promise<void> {
    const limits = RATE_LIMITS[tier];
    const key = `${userId}:${endpoint}`;
    
    const now = Date.now();
    let bucket = this.store.get(key);
    
    if (!bucket || (now - bucket.lastRefill > limits.windowMs)) {
      // Refill tokens
      bucket = { tokens: limits[endpoint], lastRefill: now };
      this.store.set(key, bucket);
    }
    
    if (bucket.tokens <= 0) {
      throw new RateLimitError('Rate limit exceeded');
    }
    
    bucket.tokens--;
  }
}
```

#### Step 3: Run tests
```bash
npx vitest run tests/RateLimiter.test.ts
```

---

## FIX-007: Move Test Mocks to Top Level

### Problem
Vitest warnings about mock placement

### Solution

Update all test files to move `vi.mock()` calls to the top:

```typescript
// BEFORE:
import { someFunction } from '../src/services/geminiClient';

describe('MyTest', () => {
  vi.mock('../src/services/geminiClient', () => ({
    someFunction: vi.fn()
  }));
  
  it('should work', () => {
    // test
  });
});

// AFTER:
vi.mock('../src/services/geminiClient', () => ({
  someFunction: vi.fn()
}));

import { someFunction } from '../src/services/geminiClient';

describe('MyTest', () => {
  it('should work', () => {
    // test
  });
});
```

---

## IMPLEMENTATION PRIORITY

### Immediate (Do Now)
1. ✅ FIX-001: Consolidate JSON Repair (30 min)
2. ✅ FIX-003: Fix PrivacyService Tests (1-2 hours)
3. ✅ FIX-007: Move Test Mocks (30 min)

### Short-Term (This Week)
4. ✅ FIX-002: Implement Offline Infographic Generators (1 day)
5. ✅ FIX-004: Parallelize Batch Processing (2 hours)
6. ✅ FIX-006: Fix Rate Limiter (3-4 hours)

### Medium-Term (Next Week)
7. ✅ FIX-005: Add Firestore Persistence (1 day)

---

## VERIFICATION

After implementing each fix:

```bash
# Run specific test
npx vitest run tests/[TestFile].test.ts

# Run all tests
npx vitest run

# Check for TypeScript errors
npx tsc --noEmit

# Lint check
npm run lint
```

---

**Status:** Ready for Implementation  
**Estimated Total Time:** 2-3 days  
**Risk Level:** LOW (all fixes are isolated and testable)
