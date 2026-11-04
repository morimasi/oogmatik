// ============================================================
// VisionStudio — Firebase Storage Yükleme Servisi
// ============================================================
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { storage, db } from '../firebaseClient';
import { AppError } from '../../utils/AppError';
import type { UploadedFile, GeneratedActivity, ActivityStatus, AuditLogEntry } from '../../types/visionStudio';
import { v4 as uuid } from 'uuid';

// ---- Yükleme ----
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function uploadActivityFile(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<UploadedFile> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AppError(
      'Yalnızca PDF, JPEG, PNG veya WebP dosyası yükleyebilirsiniz.',
      'INVALID_FILE_TYPE',
      400
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new AppError('Dosya 20 MB\'dan büyük olamaz.', 'FILE_TOO_LARGE', 400);
  }

  const id = uuid();
  const ext = file.name.split('.').pop() ?? 'bin';
  const storagePath = `visionStudio/${userId}/${id}.${ext}`;
  const storageRef = ref(storage, storagePath);

  await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve(task.snapshot)
    );
  });

  const downloadUrl = await getDownloadURL(storageRef);

  const record: UploadedFile = {
    id,
    storagePath,
    downloadUrl,
    fileName: file.name,
    fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
    fileSizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
  };

  // Firestore'a kayıt
  await setDoc(doc(db, 'visionStudioUploads', id), {
    ...record,
    uploadedAt: serverTimestamp(),
  });

  return record;
}

// ---- Etkinlik kaydetme / güncelleme ----
export async function saveGeneratedActivity(activity: GeneratedActivity): Promise<void> {
  const ref = doc(db, 'visionStudioActivities', activity.id);
  await setDoc(ref, {
    ...activity,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateActivityStatus(
  activityId: string,
  newStatus: ActivityStatus,
  actorId: string,
  actorRole: 'teacher' | 'admin',
  reason?: string
): Promise<void> {
  const actRef = doc(db, 'visionStudioActivities', activityId);
  const snap = await getDoc(actRef);
  if (!snap.exists()) {
    throw new AppError('Etkinlik bulunamadı.', 'NOT_FOUND', 404);
  }
  const current = snap.data() as GeneratedActivity;

  // Geçerli geçiş kontrolü
  const allowed = getAllowedTransitions(current.status);
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `'${current.status}' durumundan '${newStatus}' durumuna geçiş yapılamaz.`,
      'INVALID_TRANSITION',
      409
    );
  }

  const logEntry: AuditLogEntry = {
    from: current.status,
    to: newStatus,
    actorId,
    actorRole,
    at: new Date().toISOString(),
    reason,
  };

  await updateDoc(actRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    ...(newStatus === 'approved' ? { approvedBy: actorId, approvedAt: Timestamp.now() } : {}),
    ...(newStatus === 'rejected' ? { rejectionReason: reason ?? '' } : {}),
  });

  // Audit log alt koleksiyonu
  const logRef = doc(collection(actRef, 'auditLog'));
  await setDoc(logRef, logEntry);
}

// Durum makinesi geçiş tablosu
function getAllowedTransitions(from: ActivityStatus): ActivityStatus[] {
  const map: Record<ActivityStatus, ActivityStatus[]> = {
    uploading:  ['analyzing'],
    analyzing:  ['ready'],
    ready:      ['pending'],
    pending:    ['approved', 'rejected'],
    approved:   [],
    rejected:   ['pending'],
  };
  return map[from] ?? [];
}

// ---- Öğretmene ait etkinlikleri listele ----
export async function getTeacherActivities(userId: string): Promise<GeneratedActivity[]> {
  const q = query(
    collection(db, 'visionStudioActivities'),
    where('ownerId', '==', userId),
    where('deletedAt', '==', null),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GeneratedActivity);
}

// ---- Admin: onay bekleyen etkinlikler ----
export async function getPendingActivities(): Promise<GeneratedActivity[]> {
  const q = query(
    collection(db, 'visionStudioActivities'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GeneratedActivity);
}

// ---- Admin: yayınlanan etkinlikler (kategoriye göre) ----
export async function getApprovedActivities(category?: string): Promise<GeneratedActivity[]> {
  let q = query(
    collection(db, 'visionStudioActivities'),
    where('status', '==', 'approved'),
    orderBy('approvedAt', 'desc')
  );
  if (category) {
    q = query(q, where('category', '==', category));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GeneratedActivity);
}
