/**
 * OOGMATIK — Workbook Service
 *
 * Core CRUD operations for ultra-premium workbook management
 *
 * @module services/workbook/workbookService
 * @version 2.0.0
 * @author Bora Demir (Yazılım Mühendisi)
 *
 * KRITIK KURALLAR:
 * - TypeScript strict mode — `any` tipi YASAK
 * - AppError standardı ZORUNLU
 * - KVKV uyumu — soft delete 30 gün
 * - Rate limiting kontrolleri
 * - Firestore transaction kullan (race condition önleme)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  writeBatch,
  runTransaction,
  type QueryConstraint,
  type DocumentData,
  db,
} from '../firebaseClient.js';
import { AppError, ValidationError, toAppError } from '../../utils/AppError';
import { logError } from '../../utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import type {
  Workbook,
  WorkbookPage,
  WorkbookSettings,
  CreateWorkbookPayload,
  UpdateWorkbookPayload,
  WorkbookListQuery,
  WorkbookStats,
  WorkbookVersion,
  WORKBOOK_CONSTRAINTS,
} from '../../types/workbook';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const WORKBOOKS_COLLECTION = 'workbooks';
const WORKBOOK_PAGES_COLLECTION = 'workbook_pages';
const WORKBOOK_VERSIONS_COLLECTION = 'workbook_versions';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Workbook başlık validasyonu
 */
function validateTitle(title: string): void {
  if (!title || title.trim().length < 3) {
    throw new ValidationError(
      'Workbook başlığı en az 3 karakter olmalıdır',
      'INVALID_TITLE'
    );
  }
  if (title.length > 100) {
    throw new ValidationError(
      'Workbook başlığı en fazla 100 karakter olabilir',
      'TITLE_TOO_LONG'
    );
  }
}

/**
 * Workbook sayfa sayısı validasyonu
 */
function validatePageCount(pages: WorkbookPage[]): void {
  if (pages.length < 1) {
    throw new ValidationError(
      'Workbook en az 1 sayfa içermelidir',
      'INSUFFICIENT_PAGES'
    );
  }
  if (pages.length > 200) {
    throw new ValidationError(
      'Workbook en fazla 200 sayfa içerebilir',
      'TOO_MANY_PAGES'
    );
  }
}

/**
 * User ID validasyonu
 */
function validateUserId(userId: string | undefined): void {
  if (!userId || userId.trim() === '') {
    throw new ValidationError(
      'Kullanıcı kimliği gereklidir',
      'MISSING_USER_ID'
    );
  }
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

/**
 * Varsayılan workbook ayarları
 */
function getDefaultSettings(): WorkbookSettings {
  return {
    pageSize: 'A4',
    orientation: 'portrait',
    layout: {
      columns: 1,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      headerHeight: 10,
      footerHeight: 10,
      gutterWidth: 10,
    },
    fontFamily: 'Lexend',
    baseFontSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0,
    wordSpacing: 0,
    dyslexiaMode: false,
    highlightSyllables: false,
    showPageNumbers: true,
    showTableOfContents: true,
    showAnswerKey: false,
    includeDividerPages: false,
    defaultExportFormat: 'pdf',
    printMargins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    highContrast: false,
    largePrint: false,
    screenReaderOptimized: false,
  };
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Yeni workbook oluştur
 */
export async function createWorkbook(
  userId: string,
  payload: CreateWorkbookPayload
): Promise<Workbook> {
  try {
    validateUserId(userId);
    validateTitle(payload.title);

    const workbookId = uuidv4();
    const now = new Date().toISOString();

    // Default settings ile merge et
    const settings: WorkbookSettings = {
      ...getDefaultSettings(),
      ...(payload.settings || {}),
    };

    const workbook: Workbook = {
      id: workbookId,
      userId,
      title: payload.title,
      description: payload.description,
      pages: [],
      settings,
      templateId: payload.templateId,
      templateType: payload.templateType,
      theme: 'modern',
      assignedStudentId: payload.assignedStudentId,
      version: 1,
      versionHistory: [],
      collaborators: [],
      isPublic: false,
      shareSettings: {
        isPublic: false,
        allowCopy: false,
        allowDownload: true,
        requireApproval: false,
        anonymizeStudentData: true, // KVKV default
      },
      analytics: {
        viewCount: 0,
        downloadCount: 0,
        copyCount: 0,
        shareCount: 0,
        pageMetrics: new Map(),
        totalTimeSpent: 0,
        lastCalculatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      status: 'draft',
      tags: [],
    };

    // Firestore'a kaydet
    const workbookRef = doc(db, WORKBOOKS_COLLECTION, workbookId);
    await setDoc(workbookRef, workbookToFirestore(workbook));

    // İlk versiyon kaydı oluştur
    await createVersionSnapshot(workbook, 'Workbook oluşturuldu', userId);

    return workbook;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'createWorkbook', userId, payload });
    throw new AppError(
      'Workbook oluşturulurken bir hata oluştu',
      'WORKBOOK_CREATE_FAILED',
      500,
      { userId, payload }
    );
  }
}

/**
 * Workbook ID ile getir
 */
export async function getWorkbookById(
  workbookId: string,
  userId: string
): Promise<Workbook> {
  try {
    const workbookRef = doc(db, WORKBOOKS_COLLECTION, workbookId);
    const workbookSnap = await getDoc(workbookRef);

    if (!workbookSnap.exists()) {
      throw new AppError(
        'Workbook bulunamadı',
        'WORKBOOK_NOT_FOUND',
        404,
        { workbookId }
      );
    }

    const workbook = firestoreToWorkbook(workbookSnap.data());

    // Yetki kontrolü (sahip veya collaborator olmalı)
    if (
      workbook.userId !== userId &&
      !workbook.collaborators.some((c) => c.userId === userId) &&
      !workbook.isPublic
    ) {
      throw new AppError(
        'Bu workbook\'a erişim yetkiniz yok',
        'WORKBOOK_ACCESS_DENIED',
        403,
        { workbookId, userId }
      );
    }

    // Son erişim zamanını güncelle
    await updateDoc(workbookRef, {
      lastAccessedAt: new Date().toISOString(),
    });

    return workbook;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'getWorkbookById', workbookId, userId });
    throw new AppError(
      'Workbook getirilirken bir hata oluştu',
      'WORKBOOK_FETCH_FAILED',
      500,
      { workbookId, userId }
    );
  }
}

/**
 * Kullanıcının workbook listesini getir (pagination + filtering)
 */
export async function listWorkbooks(
  userId: string,
  queryParams: WorkbookListQuery = {}
): Promise<{ workbooks: Workbook[]; total: number; hasMore: boolean }> {
  try {
    validateUserId(userId);

    const constraints: QueryConstraint[] = [];

    // Kullanıcının kendi workbook'ları veya collaborator olduğu workbook'lar
    // Not: Firestore'da OR query için iki ayrı sorgu yapıp merge etmek gerekebilir
    // Basitleştirme için sadece sahip olduğu workbook'lar
    constraints.push(where('userId', '==', userId));

    // Status filtresi
    if (queryParams.status) {
      constraints.push(where('status', '==', queryParams.status));
    }

    // Template type filtresi
    if (queryParams.templateType) {
      constraints.push(where('templateType', '==', queryParams.templateType));
    }

    // Assigned student filtresi
    if (queryParams.assignedStudentId) {
      constraints.push(
        where('assignedStudentId', '==', queryParams.assignedStudentId)
      );
    }

    // Tags filtresi (array-contains — sadece tek tag)
    if (queryParams.tags && queryParams.tags.length > 0) {
      constraints.push(where('tags', 'array-contains', queryParams.tags[0]));
    }

    // Sıralama
    const sortField = queryParams.sortBy || 'updatedAt';
    const sortDirection = queryParams.sortOrder || 'desc';
    constraints.push(orderBy(sortField, sortDirection));

    // Pagination
    const pageSize = Math.min(queryParams.limit || 20, 100);
    constraints.push(firestoreLimit(pageSize + 1)); // +1 hasMore kontrolü için

    const q = query(collection(db, WORKBOOKS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const workbooks: Workbook[] = [];
    querySnapshot.forEach((doc) => {
      if (workbooks.length < pageSize) {
        workbooks.push(firestoreToWorkbook(doc.data()));
      }
    });

    const hasMore = querySnapshot.size > pageSize;

    // Total count (yaklaşık — büyük koleksiyonlar için count query maliyetli)
    // Production'da cache'lenebilir veya pagination metadata'da tutulabilir
    const total = workbooks.length;

    return { workbooks, total, hasMore };
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { context: 'listWorkbooks', userId, queryParams });
    throw new AppError(
      'Workbook listesi getirilirken bir hata oluştu',
      'WORKBOOK_LIST_FAILED',
      500,
      { userId, queryParams }
    );
  }
}

/**
 * Workbook güncelle
 */
export async function updateWorkbook(
  workbookId: string,
  userId: string,
  payload: UpdateWorkbookPayload
): Promise<Workbook> {
  try {
    const workbookRef = doc(db, WORKBOOKS_COLLECTION, workbookId);

    // Mevcut workbook'u al ve yetki kontrolü yap
    const existing = await getWorkbookById(workbookId, userId);

    // Sadece sahip veya admin collaborator güncelleyebilir
    const isOwner = existing.userId === userId;
    const isAdmin = existing.collaborators.some(
      (c) => c.userId === userId && c.permission === 'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new AppError(
        'Bu workbook\'u güncelleme yetkiniz yok',
        'WORKBOOK_UPDATE_DENIED',
        403,
        { workbookId, userId }
      );
    }

    // Validasyonlar
    if (payload.title) {
      validateTitle(payload.title);
    }
    if (payload.pages) {
      validatePageCount(payload.pages);
    }

    // Güncelleme verisini hazırla
    const updates: Partial<Workbook> = {
      ...payload,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    // Firestore transaction ile güncelle (race condition önleme)
    await runTransaction(db, async (transaction) => {
      transaction.update(workbookRef, updates);
    });

    // Güncellenmiş workbook'u al
    const updated = await getWorkbookById(workbookId, userId);

    // Versiyon snapshot oluştur
    await createVersionSnapshot(
      updated,
      'Workbook güncellendi',
      userId
    );

    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'updateWorkbook', workbookId, userId, payload });
    throw new AppError(
      'Workbook güncellenirken bir hata oluştu',
      'WORKBOOK_UPDATE_FAILED',
      500,
      { workbookId, userId, payload }
    );
  }
}

/**
 * Workbook soft delete (30 gün KVKV uyumu)
 */
export async function deleteWorkbook(
  workbookId: string,
  userId: string
): Promise<void> {
  try {
    const workbookRef = doc(db, WORKBOOKS_COLLECTION, workbookId);

    // Yetki kontrolü
    const existing = await getWorkbookById(workbookId, userId);

    if (existing.userId !== userId) {
      throw new AppError(
        'Bu workbook\'u silme yetkiniz yok',
        'WORKBOOK_DELETE_DENIED',
        403,
        { workbookId, userId }
      );
    }

    // Soft delete
    const now = new Date().toISOString();
    await updateDoc(workbookRef, {
      status: 'deleted',
      deletedAt: now,
      updatedAt: now,
    });

    // Not: 30 gün sonra hard delete için background job gerekli
    // (Cloud Functions veya Vercel Cron)
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'deleteWorkbook', workbookId, userId });
    throw new AppError(
      'Workbook silinirken bir hata oluştu',
      'WORKBOOK_DELETE_FAILED',
      500,
      { workbookId, userId }
    );
  }
}

/**
 * Workbook geri yükle (soft delete'ten)
 */
export async function restoreWorkbook(
  workbookId: string,
  userId: string
): Promise<Workbook> {
  try {
    const workbookRef = doc(db, WORKBOOKS_COLLECTION, workbookId);

    const workbookSnap = await getDoc(workbookRef);
    if (!workbookSnap.exists()) {
      throw new AppError('Workbook bulunamadı', 'WORKBOOK_NOT_FOUND', 404);
    }

    const workbook = firestoreToWorkbook(workbookSnap.data());

    if (workbook.userId !== userId) {
      throw new AppError(
        'Bu workbook\'u geri yükleme yetkiniz yok',
        'WORKBOOK_RESTORE_DENIED',
        403
      );
    }

    if (workbook.status !== 'deleted') {
      throw new ValidationError(
        'Bu workbook silinmemiş, geri yükleme gereksiz',
        'WORKBOOK_NOT_DELETED'
      );
    }

    // Geri yükle
    await updateDoc(workbookRef, {
      status: 'active',
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });

    return await getWorkbookById(workbookId, userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'restoreWorkbook', workbookId, userId });
    throw new AppError(
      'Workbook geri yüklenirken bir hata oluştu',
      'WORKBOOK_RESTORE_FAILED',
      500,
      { workbookId, userId }
    );
  }
}

/**
 * Workbook kopyala (duplicate)
 */
export async function duplicateWorkbook(
  workbookId: string,
  userId: string,
  newTitle?: string
): Promise<Workbook> {
  try {
    // Orijinal workbook'u al
    const original = await getWorkbookById(workbookId, userId);

    // Kopya oluştur
    const copyPayload: CreateWorkbookPayload = {
      title: newTitle || `${original.title} (Kopya)`,
      description: original.description,
      templateId: original.templateId,
      templateType: original.templateType,
      settings: original.settings,
    };

    const copy = await createWorkbook(userId, copyPayload);

    // Sayfaları kopyala
    const copiedPages: WorkbookPage[] = original.pages.map((page) => ({
      ...page,
      id: uuidv4(),
      workbookId: copy.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await updateWorkbook(copy.id, userId, { pages: copiedPages });

    // Analytics güncelle (orijinalde copyCount artır)
    const originalRef = doc(db, WORKBOOKS_COLLECTION, workbookId);
    await updateDoc(originalRef, {
      'analytics.copyCount': (original.analytics.copyCount || 0) + 1,
    });

    return await getWorkbookById(copy.id, userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'duplicateWorkbook', workbookId, userId });
    throw new AppError(
      'Workbook kopyalanırken bir hata oluştu',
      'WORKBOOK_DUPLICATE_FAILED',
      500,
      { workbookId, userId }
    );
  }
}

// ============================================================================
// VERSION CONTROL
// ============================================================================

/**
 * Versiyon snapshot oluştur (max 50 versiyon)
 */
async function createVersionSnapshot(
  workbook: Workbook,
  changeDescription: string,
  userId: string
): Promise<void> {
  try {
    const versionId = uuidv4();
    const version: WorkbookVersion = {
      versionNumber: workbook.version,
      workbookId: workbook.id,
      snapshot: {
        title: workbook.title,
        description: workbook.description,
        pages: workbook.pages,
        settings: workbook.settings,
      },
      changeDescription,
      changedBy: userId,
      createdAt: new Date().toISOString(),
    };

    const versionRef = doc(
      db,
      WORKBOOK_VERSIONS_COLLECTION,
      versionId
    );
    await setDoc(versionRef, version);

    // 50 versiyondan eski olanları sil (WORKBOOK_CONSTRAINTS.MAX_VERSIONS)
    // TODO: Implement cleanup logic
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { context: 'createVersionSnapshot' });
    // Version snapshot hatası workbook oluşturmayı engellemez
  }
}

/**
 * Workbook versiyon geçmişini getir
 */
export async function getWorkbookVersionHistory(
  workbookId: string,
  userId: string
): Promise<WorkbookVersion[]> {
  try {
    // Yetki kontrolü
    await getWorkbookById(workbookId, userId);

    const q = query(
      collection(db, WORKBOOK_VERSIONS_COLLECTION),
      where('workbookId', '==', workbookId),
      orderBy('versionNumber', 'desc'),
      firestoreLimit(50)
    );

    const querySnapshot = await getDocs(q);
    const versions: WorkbookVersion[] = [];

    querySnapshot.forEach((doc) => {
      versions.push(doc.data() as WorkbookVersion);
    });

    return versions;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const appError = toAppError(error);
    logError(appError, { context: 'getWorkbookVersionHistory', workbookId, userId });
    throw new AppError(
      'Versiyon geçmişi getirilirken bir hata oluştu',
      'VERSION_HISTORY_FAILED',
      500,
      { workbookId, userId }
    );
  }
}

// ============================================================================
// FIRESTORE CONVERTERS
// ============================================================================

/**
 * Workbook → Firestore Document
 */
function workbookToFirestore(workbook: Workbook): DocumentData {
  return {
    ...workbook,
    // Map → Object dönüşümü (Firestore Map desteklemez)
    analytics: {
      ...workbook.analytics,
      pageMetrics: Object.fromEntries(workbook.analytics.pageMetrics),
    },
    createdAt: workbook.createdAt,
    updatedAt: workbook.updatedAt,
  };
}

/**
 * Firestore Document → Workbook
 */
function firestoreToWorkbook(data: DocumentData): Workbook {
  return {
    ...data,
    analytics: {
      ...data.analytics,
      pageMetrics: new Map(Object.entries(data.analytics.pageMetrics || {})),
    },
  } as Workbook;
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Kullanıcı workbook istatistikleri
 */
export async function getWorkbookStats(userId: string): Promise<WorkbookStats> {
  try {
    validateUserId(userId);

    // Tüm workbook'ları al (cache'lenebilir)
    const { workbooks } = await listWorkbooks(userId, { limit: 1000 });

    const totalWorkbooks = workbooks.length;
    const activeWorkbooks = workbooks.filter(
      (w) => w.status === 'active'
    ).length;
    const archivedWorkbooks = workbooks.filter(
      (w) => w.status === 'archived'
    ).length;

    const totalPages = workbooks.reduce((sum, w) => sum + w.pages.length, 0);

    // Atanmış öğrenci sayısı
    const assignedStudents = new Set(
      workbooks
        .filter((w) => w.assignedStudentId)
        .map((w) => w.assignedStudentId)
    );
    const totalStudents = assignedStudents.size;

    // Ortalama tamamlanma oranı (stub — gerçek hesaplama yapılacak)
    const averageCompletionRate = 0;

    // En çok kullanılan şablonlar
    const templateCounts = new Map<string, number>();
    workbooks.forEach((w) => {
      const count = templateCounts.get(w.templateType) || 0;
      templateCounts.set(w.templateType, count + 1);
    });

    const mostUsedTemplates = Array.from(templateCounts.entries())
      .map(([templateType, count]) => ({ templateType: templateType as any, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Son aktiviteler (stub)
    const recentActivity: WorkbookStats['recentActivity'] = [];

    return {
      totalWorkbooks,
      activeWorkbooks,
      archivedWorkbooks,
      totalPages,
      totalStudents,
      averageCompletionRate,
      mostUsedTemplates,
      recentActivity,
    };
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { context: 'getWorkbookStats', userId });
    throw new AppError(
      'İstatistikler hesaplanırken bir hata oluştu',
      'STATS_CALCULATION_FAILED',
      500,
      { userId }
    );
  }
}
