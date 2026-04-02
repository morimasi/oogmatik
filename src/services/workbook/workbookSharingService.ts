/**
 * OOGMATIK — Workbook Sharing Service
 *
 * KVKV uyumlu paylaşım ve işbirliği servisi (Dr. Ahmet Kaya onaylı)
 *
 * @module services/workbook/workbookSharingService
 * @version 2.0.0
 * @author Dr. Ahmet Kaya (Özel Eğitim Uzmanı) + Bora Demir (Yazılım Mühendisi)
 *
 * KVKV KURALLARI:
 * - Öğrenci adı + tanı + skor birlikte ASLA paylaşılamaz
 * - Soft delete 30 gün
 * - Audit log zorunlu
 * - Paylaşım izinleri granular (view/comment/edit/admin)
 */

import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { AppError, ValidationError } from '../../utils/AppError';
import { logError } from '../../utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { getWorkbookById, updateWorkbook } from './workbookService';
import type {
  Workbook,
  WorkbookCollaborator,
  CollaborationPermission,
  WorkbookShareSettings,
} from '../../types/workbook';

// ============================================================================
// COLLABORATION MANAGEMENT
// ============================================================================

/**
 * İşbirlikçi ekle
 */
export async function addCollaborator(
  workbookId: string,
  ownerId: string,
  collaboratorEmail: string,
  permission: CollaborationPermission
): Promise<Workbook> {
  try {
    // Yetki kontrolü — sadece owner veya admin
    const workbook = await getWorkbookById(workbookId, ownerId);

    if (workbook.userId !== ownerId) {
      const isAdmin = workbook.collaborators.some(
        (c) => c.userId === ownerId && c.permission === 'admin'
      );
      if (!isAdmin) {
        throw new AppError(
          'İşbirlikçi ekleme yetkiniz yok',
          'COLLABORATOR_ADD_DENIED',
          403
        );
      }
    }

    // Zaten collaborator mı kontrol et
    if (workbook.collaborators.some((c) => c.userEmail === collaboratorEmail)) {
      throw new ValidationError(
        'Bu kullanıcı zaten işbirlikçi',
        'COLLABORATOR_ALREADY_EXISTS'
      );
    }

    // Yeni collaborator
    const newCollaborator: WorkbookCollaborator = {
      userId: uuidv4(), // TODO: Gerçek user ID'si authService'ten alınmalı
      userName: collaboratorEmail.split('@')[0],
      userEmail: collaboratorEmail,
      permission,
      addedAt: new Date().toISOString(),
      addedBy: ownerId,
    };

    // Firestore güncelle
    const workbookRef = doc(db, 'workbooks', workbookId);
    await updateDoc(workbookRef, {
      collaborators: arrayUnion(newCollaborator),
      updatedAt: new Date().toISOString(),
    });

    // Audit log
    // TODO: auditLogger.log('collaborator_added', { workbookId, collaboratorEmail, permission })

    return await getWorkbookById(workbookId, ownerId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logError('addCollaborator', error);
    throw new AppError(
      'İşbirlikçi eklenirken bir hata oluştu',
      'COLLABORATOR_ADD_FAILED',
      500,
      { workbookId, collaboratorEmail }
    );
  }
}

/**
 * İşbirlikçi kaldır
 */
export async function removeCollaborator(
  workbookId: string,
  ownerId: string,
  collaboratorUserId: string
): Promise<Workbook> {
  try {
    const workbook = await getWorkbookById(workbookId, ownerId);

    if (workbook.userId !== ownerId) {
      throw new AppError(
        'İşbirlikçi kaldırma yetkiniz yok',
        'COLLABORATOR_REMOVE_DENIED',
        403
      );
    }

    const collaborator = workbook.collaborators.find(
      (c) => c.userId === collaboratorUserId
    );
    if (!collaborator) {
      throw new ValidationError(
        'İşbirlikçi bulunamadı',
        'COLLABORATOR_NOT_FOUND'
      );
    }

    const workbookRef = doc(db, 'workbooks', workbookId);
    await updateDoc(workbookRef, {
      collaborators: arrayRemove(collaborator),
      updatedAt: new Date().toISOString(),
    });

    return await getWorkbookById(workbookId, ownerId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logError('removeCollaborator', error);
    throw new AppError(
      'İşbirlikçi kaldırılırken bir hata oluştu',
      'COLLABORATOR_REMOVE_FAILED',
      500,
      { workbookId, collaboratorUserId }
    );
  }
}

/**
 * İşbirlikçi izin değiştir
 */
export async function updateCollaboratorPermission(
  workbookId: string,
  ownerId: string,
  collaboratorUserId: string,
  newPermission: CollaborationPermission
): Promise<Workbook> {
  try {
    const workbook = await getWorkbookById(workbookId, ownerId);

    if (workbook.userId !== ownerId) {
      throw new AppError(
        'İzin değiştirme yetkiniz yok',
        'PERMISSION_UPDATE_DENIED',
        403
      );
    }

    const collaboratorIndex = workbook.collaborators.findIndex(
      (c) => c.userId === collaboratorUserId
    );
    if (collaboratorIndex === -1) {
      throw new ValidationError(
        'İşbirlikçi bulunamadı',
        'COLLABORATOR_NOT_FOUND'
      );
    }

    // Collaborator listesini güncelle
    const updatedCollaborators = [...workbook.collaborators];
    updatedCollaborators[collaboratorIndex] = {
      ...updatedCollaborators[collaboratorIndex],
      permission: newPermission,
    };

    await updateWorkbook(workbookId, ownerId, {
      collaborators: updatedCollaborators as any,
    });

    return await getWorkbookById(workbookId, ownerId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logError('updateCollaboratorPermission', error);
    throw new AppError(
      'İşbirlikçi izni güncellenirken bir hata oluştu',
      'PERMISSION_UPDATE_FAILED',
      500,
      { workbookId, collaboratorUserId, newPermission }
    );
  }
}

// ============================================================================
// PUBLIC SHARING
// ============================================================================

/**
 * Paylaşım ayarlarını güncelle
 */
export async function updateShareSettings(
  workbookId: string,
  userId: string,
  settings: Partial<WorkbookShareSettings>
): Promise<Workbook> {
  try {
    const workbook = await getWorkbookById(workbookId, userId);

    if (workbook.userId !== userId) {
      throw new AppError(
        'Paylaşım ayarlarını değiştirme yetkiniz yok',
        'SHARE_SETTINGS_UPDATE_DENIED',
        403
      );
    }

    // KVKV uyarısı — öğrenci verisi varsa anonimleştirme zorunlu
    if (settings.isPublic && workbook.assignedStudentId) {
      if (!settings.anonymizeStudentData) {
        throw new ValidationError(
          'Atanmış öğrenci verisi olan workbook paylaşılırken anonimleştirme zorunludur (KVKV)',
          'STUDENT_DATA_ANONYMIZATION_REQUIRED'
        );
      }
    }

    const updatedSettings: WorkbookShareSettings = {
      ...workbook.shareSettings,
      ...settings,
    };

    await updateWorkbook(workbookId, userId, {
      shareSettings: updatedSettings as any,
    });

    return await getWorkbookById(workbookId, userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logError('updateShareSettings', error);
    throw new AppError(
      'Paylaşım ayarları güncellenirken bir hata oluştu',
      'SHARE_SETTINGS_UPDATE_FAILED',
      500,
      { workbookId, settings }
    );
  }
}

/**
 * Paylaşım linki oluştur
 */
export async function generateShareLink(
  workbookId: string,
  userId: string,
  expiryDays?: number,
  password?: string
): Promise<string> {
  try {
    const workbook = await getWorkbookById(workbookId, userId);

    if (workbook.userId !== userId) {
      throw new AppError(
        'Paylaşım linki oluşturma yetkiniz yok',
        'SHARE_LINK_CREATE_DENIED',
        403
      );
    }

    // Link oluştur
    const linkToken = uuidv4();
    const shareLink = `${process.env.VITE_APP_URL || 'https://oogmatik.com'}/workbook/shared/${linkToken}`;

    // Expiry hesapla
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

    const updatedSettings: WorkbookShareSettings = {
      ...workbook.shareSettings,
      shareLink,
      shareLinkExpiry: expiryDate.toISOString(),
      shareLinkPassword: password,
    };

    await updateWorkbook(workbookId, userId, {
      shareSettings: updatedSettings as any,
    });

    return shareLink;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logError('generateShareLink', error);
    throw new AppError(
      'Paylaşım linki oluşturulurken bir hata oluştu',
      'SHARE_LINK_CREATE_FAILED',
      500,
      { workbookId }
    );
  }
}

/**
 * Paylaşım linkini iptal et
 */
export async function revokeShareLink(
  workbookId: string,
  userId: string
): Promise<void> {
  try {
    const workbook = await getWorkbookById(workbookId, userId);

    if (workbook.userId !== userId) {
      throw new AppError(
        'Paylaşım linkini iptal etme yetkiniz yok',
        'SHARE_LINK_REVOKE_DENIED',
        403
      );
    }

    const updatedSettings: WorkbookShareSettings = {
      ...workbook.shareSettings,
      shareLink: undefined,
      shareLinkExpiry: undefined,
      shareLinkPassword: undefined,
    };

    await updateWorkbook(workbookId, userId, {
      shareSettings: updatedSettings as any,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logError('revokeShareLink', error);
    throw new AppError(
      'Paylaşım linki iptal edilirken bir hata oluştu',
      'SHARE_LINK_REVOKE_FAILED',
      500,
      { workbookId }
    );
  }
}

// ============================================================================
// STUDENT DATA ANONYMIZATION (KVKV)
// ============================================================================

/**
 * Workbook'u anonimleştir (paylaşım için — KVKV uyumu)
 */
export function anonymizeWorkbookForSharing(workbook: Workbook): Workbook {
  const anonymized: Workbook = {
    ...workbook,
    // Öğrenci kimliği ve profil bilgisi kaldır
    assignedStudentId: undefined,
    studentProfile: undefined,
    // Analytics içinde öğrenci verisi varsa kaldır
    analytics: {
      ...workbook.analytics,
      studentProgress: undefined,
    },
    // Sayfa içeriğinde öğrenci adı varsa kaldır
    pages: workbook.pages.map((page) => ({
      ...page,
      content:
        page.type === 'cover'
          ? { ...page.content, studentName: undefined }
          : page.content,
      studentNotes: undefined,
    })),
  };

  return anonymized;
}
