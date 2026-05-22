# Profile Modülleri — Paylaşım + CRUD Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add share (direct user-to-user) and CRUD (create/read/update/delete) to Overview, Reports, Analysis, and Plans profile modules.

**Architecture:** Phase 1: Extend `ShareModal` for module sharing, create `profileShareService.ts` for Firestore, add share buttons to each module, create `SharedContentPanel.tsx`. Phase 2: Add inline editing, note CRUD, plan CRUD, and filter view saving to each module.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Firebase Firestore + Zustand + Vitest

---

## Phase 1: Share Infrastructure

### Task 1: `profileShareService.ts` — Firestore share operations

**Files:**
- Create: `src/services/profileShareService.ts`
- Test: `tests/services/profileShareService.test.ts`

- [ ] **Step 1: Create the service file**

```typescript
// src/services/profileShareService.ts
import { db } from './firebaseClient';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

export type SharedModuleType = 'overview' | 'reports' | 'analysis' | 'plans';
export type SharePermission = 'view' | 'edit';

export interface SharedContent {
  id?: string;
  ownerId: string;
  ownerName: string;
  recipientId: string;
  moduleType: SharedModuleType;
  contentId?: string;
  permission: SharePermission;
  message?: string;
  createdAt: string;
  readAt?: string;
}

const COLLECTION = 'shared_profile_content';

export const profileShareService = {
  async shareModule(data: Omit<SharedContent, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch {
      return null;
    }
  },

  async getSharedWithMe(userId: string): Promise<SharedContent[]> {
    try {
      const q = query(collection(db, COLLECTION), where('recipientId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SharedContent))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  async getMySharedContent(ownerId: string): Promise<SharedContent[]> {
    try {
      const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SharedContent))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  async removeShare(shareId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION, shareId));
      return true;
    } catch {
      return false;
    }
  },

  async markAsRead(shareId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, COLLECTION, shareId), {
        readAt: Timestamp.now().toDate().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/services/profileShareService.ts
git commit -m "feat: add profileShareService for Firestore share operations"
```

### Task 2: `useProfileShare.ts` — Share state management hook

**Files:**
- Create: `src/components/Profile/hooks/useProfileShare.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/components/Profile/hooks/useProfileShare.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { profileShareService, SharedContent, SharedModuleType, SharePermission } from '../../../services/profileShareService';

interface UseProfileShareReturn {
  sharedItems: SharedContent[];
  loading: boolean;
  shareModule: (recipientId: string, moduleType: SharedModuleType, permission: SharePermission, contentId?: string, message?: string) => Promise<boolean>;
  removeShare: (shareId: string) => Promise<boolean>;
  refreshSharedItems: () => Promise<void>;
  unreadCount: number;
}

export const useProfileShare = (): UseProfileShareReturn => {
  const { user } = useAuthStore();
  const [sharedItems, setSharedItems] = useState<SharedContent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSharedItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const items = await profileShareService.getSharedWithMe(user.id);
    setSharedItems(items);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshSharedItems();
  }, [refreshSharedItems]);

  const shareModule = useCallback(async (
    recipientId: string,
    moduleType: SharedModuleType,
    permission: SharePermission,
    contentId?: string,
    message?: string,
  ): Promise<boolean> => {
    if (!user) return false;
    const id = await profileShareService.shareModule({
      ownerId: user.id,
      ownerName: user.name || 'Bilinmiyor',
      recipientId,
      moduleType,
      permission,
      contentId,
      message,
    });
    return id !== null;
  }, [user]);

  const removeShare = useCallback(async (shareId: string): Promise<boolean> => {
    const ok = await profileShareService.removeShare(shareId);
    if (ok) setSharedItems(prev => prev.filter(s => s.id !== shareId));
    return ok;
  }, []);

  const unreadCount = sharedItems.filter(s => !s.readAt).length;

  return { sharedItems, loading, shareModule, removeShare, refreshSharedItems, unreadCount };
};
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: Pass

- [ ] **Step 3: Commit**

```bash
git add src/components/Profile/hooks/useProfileShare.ts
git commit -m "feat: add useProfileShare hook"
```

### Task 3: Extend `ShareModal` for module sharing

**Files:**
- Modify: `src/components/ShareModal.tsx`

- [ ] **Step 1: Read current ShareModal**

- [ ] **Step 2: Extend with moduleType support + permission selector + message field**

Key changes:
- Add `moduleType?: SharedModuleType` and `contentId?: string` props
- Add permission selector ('view' | 'edit') dropdown
- Add optional message textarea
- Pass permission and message to `onShare` callback
- Update `onShare` signature to `(receiverIds: string[], permission: SharePermission, message?: string) => void`

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/components/ShareModal.tsx
git commit -m "feat: extend ShareModal for module sharing with permission and message"
```

### Task 4: `SharedContentPanel.tsx` — Received shares panel

**Files:**
- Create: `src/components/Profile/components/SharedContentPanel.tsx`

- [ ] **Step 1: Create panel component**

Displays received shared items as cards with:
- Owner name + avatar
- Module type badge (Özet, Raporlar, Analiz, Planlar)
- Permission badge (Görüntüle / Düzenle)
- Message if present
- Date
- Click to open module in profile
- "Okundu" badge for unread

- [ ] **Step 2: Build**

- [ ] **Step 3: Commit**

### Task 5: Add share button to each module

**Files:**
- Modify: `src/components/Profile/modules/OverviewModule.tsx`
- Modify: `src/components/Profile/modules/ReportsModule.tsx`
- Modify: `src/components/Profile/modules/AnalysisModule.tsx`
- Modify: `src/components/Profile/modules/PlansModule.tsx`
- Modify: `src/components/Profile/index.tsx`

- [ ] **Step 1: Add `onShare` prop to each module interface**
- [ ] **Step 2: Add share button with `fa-share-nodes` icon to each module header**
- [ ] **Step 3: In Profile/index.tsx, add shareModal state + ShareModal rendering + pass onShare to each module**
- [ ] **Step 4: Integrate useProfileShare in Profile/index.tsx for shared items count badge**
- [ ] **Step 5: Build and verify**
- [ ] **Step 6: Commit**

### Task 6: Add "Benimle Paylaşılanlar" to profile tabs

**Files:**
- Modify: `src/components/Profile/constants.ts`
- Modify: `src/components/Profile/index.tsx`

- [ ] **Step 1: Add 'shared' tab to PROFILE_TABS**
- [ ] **Step 2: Add shared case in renderActiveModule**
- [ ] **Step 3: Add unread badge on tab**
- [ ] **Step 4: Build and commit**

---

## Phase 2: CRUD

### Task 7: OverviewModule CRUD — Custom notes widget

**Files:**
- Modify: `src/components/Profile/modules/OverviewModule.tsx`

- [ ] **Step 1: Add editable notes section below existing content**
- [ ] **Step 2: Add note add/edit/delete inline**
- [ ] **Step 3: Persist notes to Firestore or local state**
- [ ] **Step 4: Build and commit**

### Task 8: ReportsModule CRUD — Report notes

**Files:**
- Modify: `src/components/Profile/modules/ReportsModule.tsx`

- [ ] **Step 1: Add teacher note field per report row**
- [ ] **Step 2: Add delete action for assessments**
- [ ] **Step 3: Build and commit**

### Task 9: AnalysisModule CRUD — Analysis notes + saved filter views

**Files:**
- Modify: `src/components/Profile/modules/AnalysisModule.tsx`

- [ ] **Step 1: Add analysis note section below radar chart**
- [ ] **Step 2: Add save/load filter view functionality**
- [ ] **Step 3: Build and commit**

### Task 10: PlansModule CRUD — Full plan editing

**Files:**
- Modify: `src/components/Profile/modules/PlansModule.tsx`

- [ ] **Step 1: Add plan status change (inline dropdown)**
- [ ] **Step 2: Add progress edit (inline slider)**
- [ ] **Step 3: Add BEP goal add/remove inline**
- [ ] **Step 4: Connect to curriculumService for persistence**
- [ ] **Step 5: Build and commit**

---

## Verification

- [ ] **Final build check**: `npm run build` — zero errors
- [ ] **All share buttons visible** in Overview, Reports, Analysis, Plans
- [ ] **ShareModal opens** with permission selector + message field
- [ ] **Shared content** appears in recipient's "Benimle Paylaşılanlar" tab
- [ ] **CRUD operations** persist correctly in each module
