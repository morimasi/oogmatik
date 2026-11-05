// ============================================================
// VisionStudio — Firestore / Storage Veri Erişimi
// - Düzenlemeleri (merge) kalıcılaştırır
// - Sorguları bileşik index gerektirmeyecek şekilde sadeleştirir
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
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { storage, db } from '../firebaseClient';
import { AppError } from '../../utils/AppError';
import type { UploadedFile, GeneratedActivity, ActivityStatus, AuditLogEntry } from '../../types/visionStudio';
import { canTransition } from './statusMachine';
import { decodeActivity, encodeSections } from '../../utils/visionStudio/persistenceCodec';
import { v4 as uuid } from 'uuid';

// ---- Yükleme ----
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const ACTIVITIES_COLLECTION = 'visionStudioActivities';

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

  // Meta kaydı bilinçli olarak yazılmıyor: dosyanın kendisi Storage'da ve
  // analiz kaydı visionStudioJobs'ta tutuluyor. İstemci Firestore yazımı,
  // kurallar farklı bir ortamda eski kaldığında akışı gereksiz yere uyarıyordu.
  return record;
}

// ---- Etkinlik düzenlemelerini kaydetme ----
const EDITABLE_FIELDS = [
  'title',
  'instructions',
  'sections',
  'pedagogicalNote',
  'teacherNotes',
  'answerKey',
  'objectives',
  'difficulty',
  'durationMinutes',
] as const;

/**
 * Öğretmenin A4 önizlemede yaptığı düzenlemeleri kalıcılaştırır.
 * `createdAt` korunur; yalnızca düzenlenebilir alanlar merge edilir.
 */
export async function persistActivityEdits(activity: GeneratedActivity): Promise<void> {
  const activityRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };

  for (const field of EDITABLE_FIELDS) {
    if (activity[field] === undefined) continue;
    patch[field] = field === 'sections' ? encodeSections(activity.sections ?? []) : activity[field];
  }

  await setDoc(activityRef, patch, { merge: true });
}

// ---- Durum makinesi ----
export { canTransition } from './statusMachine';

export async function updateActivityStatus(
  activityId: string,
  newStatus: ActivityStatus,
  actorId: string,
  actorRole: 'teacher' | 'admin',
  reason?: string
): Promise<void> {
  const actRef = doc(db, ACTIVITIES_COLLECTION, activityId);
  const snap = await getDoc(actRef);
  if (!snap.exists()) {
    throw new AppError('Etkinlik bulunamadı.', 'NOT_FOUND', 404);
  }
  const current = snap.data() as GeneratedActivity;

  if (!canTransition(current.status, newStatus)) {
    throw new AppError(
      `'${current.status}' durumundan '${newStatus}' durumuna geçiş yapılamaz.`,
      'INVALID_TRANSITION',
      409
    );
  }

  if ((newStatus === 'approved' || newStatus === 'rejected') && actorRole !== 'admin') {
    throw new AppError('Yalnızca yönetici onaylayabilir veya reddedebilir.', 'FORBIDDEN', 403);
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

function createdTime(value: unknown): number {
  if (typeof value === 'string') {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  if (value && typeof value === 'object' && 'toMillis' in value) {
    const toMillis = (value as { toMillis?: () => number }).toMillis;
    return typeof toMillis === 'function' ? toMillis() : 0;
  }
  return 0;
}

function isVisible(activity: GeneratedActivity): boolean {
  return !activity.deletedAt;
}

// ---- Öğretmene ait etkinlikler ----
export async function getTeacherActivities(userId: string): Promise<GeneratedActivity[]> {
  // orderBy('createdAt') bileşik index gerektirdiği için sıralama istemcide yapılır.
  const q = query(collection(db, ACTIVITIES_COLLECTION), where('ownerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => decodeActivity(d.data()))
    .filter(isVisible)
    .sort((a, b) => createdTime(b.createdAt) - createdTime(a.createdAt));
}

// ---- Admin: onay bekleyen etkinlikler ----
export async function getPendingActivities(): Promise<GeneratedActivity[]> {
  const q = query(collection(db, ACTIVITIES_COLLECTION), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => decodeActivity(d.data()))
    .filter(isVisible)
    .sort((a, b) => createdTime(a.createdAt) - createdTime(b.createdAt));
}

// ---- Arşiv: onaylanmış etkinlikler ----
export async function getApprovedActivities(category?: string): Promise<GeneratedActivity[]> {
  const q = category
    ? query(
        collection(db, ACTIVITIES_COLLECTION),
        where('status', '==', 'approved'),
        where('category', '==', category)
      )
    : query(collection(db, ACTIVITIES_COLLECTION), where('status', '==', 'approved'));

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => decodeActivity(d.data()))
    .filter(isVisible)
    .sort((a, b) => createdTime(b.approvedAt ?? b.createdAt) - createdTime(a.approvedAt ?? a.createdAt));
}
