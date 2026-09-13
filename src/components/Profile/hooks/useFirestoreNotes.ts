/**
 * useFirestoreNotes — Profil Modülü Evrensel Not Senkronizasyonu
 *
 * Kullanım: useFirestoreNotes('overview' | 'analysis' | 'reports')
 *
 * - İlk açılışta localStorage → Firestore migration (sessiz, tek seferlik)
 * - Optimistic update: UI önce güncellenir, Firestore asenkron yazar
 * - Hata durumunda rollback (eski state'e dönülür)
 * - users/{userId}/profile_notes/{scope} dökümanında string[] olarak saklanır
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { db } from '../../../services/firebaseClient';
import {
  doc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { logError } from '../../../utils/errorHandler';
import { AppError } from '../../../utils/AppError';

type NoteScope = 'overview' | 'analysis' | 'reports';

interface UseFirestoreNotesReturn {
  notes: string[];
  loading: boolean;
  addNote: (text: string) => Promise<void>;
  editNote: (idx: number, text: string) => Promise<void>;
  deleteNote: (idx: number) => Promise<void>;
}

const LS_MIGRATION_KEY = (userId: string, scope: NoteScope) =>
  `bdmind_notes_migrated_${userId}_${scope}`;

const LS_LEGACY_KEYS: Record<NoteScope, string> = {
  overview: 'overview_notes',
  analysis: 'analysis_notes',
  reports: 'report_notes',
};

export const useFirestoreNotes = (scope: NoteScope): UseFirestoreNotesReturn => {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<Unsubscribe | null>(null);

  const getDocRef = useCallback(
    (uid: string) => doc(db, 'users', uid, 'profile_notes', scope),
    [scope]
  );

  // localStorage → Firestore migration (tek seferlik, sessiz)
  const runMigrationIfNeeded = useCallback(async (
    uid: string,
    existingNotes: string[],
    writeBack: (next: string[]) => Promise<void>
  ): Promise<string[]> => {
    const migrationKey = LS_MIGRATION_KEY(uid, scope);
    if (localStorage.getItem(migrationKey)) return existingNotes;
    const legacyKey = LS_LEGACY_KEYS[scope];
    try {
      const raw = localStorage.getItem(legacyKey);
      if (raw) {
        const legacyNotes: string[] = JSON.parse(raw);
        if (legacyNotes.length > 0) {
          const merged = [...new Set([...existingNotes, ...legacyNotes])];
          await writeBack(merged);
          localStorage.setItem(migrationKey, '1');
          return merged;
        }
      }
    } catch {
      // migration hatasi kritik degil - sessizce gec
    }
    localStorage.setItem(migrationKey, '1');
    return existingNotes;
  }, [scope]);

  // Firestore realtime listener
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const uid = user.id;
    const ref = getDocRef(uid);
    let migrated = false;

    setLoading(true);
    const unsub = onSnapshot(ref, async (snap) => {
      const data = snap.data();
      const firestoreNotes: string[] = Array.isArray(data?.notes) ? data.notes : [];

      if (!migrated) {
        migrated = true;
        const final = await runMigrationIfNeeded(
          uid,
          firestoreNotes,
          async (merged) => { await setDoc(ref, { notes: merged }, { merge: true }); }
        );
        setNotes(final);
      } else {
        setNotes(firestoreNotes);
      }
      setLoading(false);
    }, (err) => {
      logError(
        new AppError(String(err), 'FIRESTORE_NOTES_ERROR', 500),
        { context: `useFirestoreNotes.${scope}` }
      );
      setLoading(false);
    });

    unsubRef.current = unsub;
    return () => { unsub(); unsubRef.current = null; };
  }, [user?.id, getDocRef, runMigrationIfNeeded, scope]);

  // Firestore yazma yardimcisi (optimistic + rollback)
  const persistNotes = useCallback(async (
    uid: string,
    next: string[],
    rollback: string[]
  ) => {
    try {
      await setDoc(getDocRef(uid), { notes: next }, { merge: true });
    } catch (e) {
      logError(
        new AppError(String(e), 'FIRESTORE_NOTES_WRITE_ERROR', 500),
        { context: `useFirestoreNotes.persist.${scope}` }
      );
      setNotes(rollback);
    }
  }, [getDocRef, scope]);

  const addNote = useCallback(async (text: string) => {
    if (!user?.id || !text.trim()) return;
    const prev = notes;
    const next = [...prev, text.trim()];
    setNotes(next);
    await persistNotes(user.id, next, prev);
  }, [user?.id, notes, persistNotes]);

  const editNote = useCallback(async (idx: number, text: string) => {
    if (!user?.id || !text.trim()) return;
    const prev = notes;
    const next = prev.map((n, i) => (i === idx ? text.trim() : n));
    setNotes(next);
    await persistNotes(user.id, next, prev);
  }, [user?.id, notes, persistNotes]);

  const deleteNote = useCallback(async (idx: number) => {
    if (!user?.id) return;
    const prev = notes;
    const next = prev.filter((_, i) => i !== idx);
    setNotes(next);
    await persistNotes(user.id, next, prev);
  }, [user?.id, notes, persistNotes]);

  return { notes, loading, addNote, editNote, deleteNote };
};
