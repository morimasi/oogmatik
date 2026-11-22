/**
 * BDMIND - Canlı Okuma Seansı Veritabanı ve Senkronizasyon Servisi
 * Öğrencinin WCPM hızı, fonolojik hataları, prozodi skoru ve okuduğunu anlama
 * sonuçlarını Firestore ve yerel depolamada saklar, BEP profiline senkronize eder.
 * 
 * Liderler: Bora Demir (Sistem Mimarı) & Dr. Canan Kaya (Psikometri) & Elif Yıldız (Pedagoji)
 */

import { db } from './firebaseClient';
import * as firestore from 'firebase/firestore';
import { ReadingSessionMetrics } from './phonological/phonologicalScoringEngine';
import { ReadingPassage } from '../components/LiveReadingStudio/sampleStories';
import { useStudentStore } from '../store/useStudentStore';
import { logError } from '../utils/logger';

const { collection, setDoc, query, where, getDocs, doc, deleteDoc } = firestore;

export interface SavedReadingSession {
  id: string;
  userId: string;
  studentId?: string;
  studentName: string;
  passageId: string;
  passageTitle: string;
  targetSkill: string;
  level: string;
  createdAt: string;
  metrics: ReadingSessionMetrics;
  comprehensionAnswers?: Record<string, number>;
}

const LOCAL_STORAGE_KEY = 'bdmind_saved_reading_sessions_v1';

export const readingSessionService = {
  /**
   * Tamamlanan okuma seansını kaydeder (Firestore + LocalStorage hibrit).
   * Deterministik ID: `reading_{userId}_{timestamp}`
   * Öğrenci profili seçiliyse BEP notlarını günceller.
   */
  saveSession: async (
    userId: string,
    studentId: string | undefined,
    studentName: string,
    passage: ReadingPassage,
    metrics: ReadingSessionMetrics,
    comprehensionAnswers?: Record<string, number>
  ): Promise<string> => {
    const timestamp = Date.now();
    const docId = `reading_${userId || 'guest'}_${timestamp}`;

    const payload: SavedReadingSession = {
      id: docId,
      userId: userId || 'guest',
      studentId: studentId || undefined,
      studentName: studentName || 'Öğrenci',
      passageId: passage.id,
      passageTitle: passage.title,
      targetSkill: passage.targetSkill,
      level: passage.level,
      createdAt: new Date().toISOString(),
      metrics: JSON.parse(JSON.stringify(metrics)) as ReadingSessionMetrics,
      comprehensionAnswers: comprehensionAnswers ? { ...comprehensionAnswers } : undefined,
    };

    // 1. Yerel Önbelleğe Kaydet (Offline Güvenliği)
    try {
      const existing = readingSessionService.getLocalSessions();
      existing.unshift(payload);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // LocalStorage doluysa sessizce devam et
    }

    // 2. Firestore'a Kaydet
    try {
      if (userId && userId !== 'guest') {
        await setDoc(doc(db, 'saved_reading_sessions', docId), payload);
      }
    } catch (err) {
      logError('Okuma seansı Firestore kaydı başarısız (yerel kopya saklandı)', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // 3. BEP Senkronizasyonu (Öğrenci Profili Varsa)
    if (studentId) {
      try {
        const { updateStudent, students } = useStudentStore.getState();
        const currentStudent = students.find((s) => s.id === studentId);
        const errorWords = metrics.errorBreakdown
          ? Object.entries(metrics.errorBreakdown)
              .filter(([_, count]) => count > 0)
              .map(([code, count]) => `${code}: ${count}`)
          : [];

        const bepNote = `[Okuma Seansı ${new Date().toLocaleDateString('tr-TR')}] Metin: "${passage.title}" · Hız: ${metrics.wcpm} WCPM (%${metrics.accuracyPercentage} doğruluk) · Prozodi: ${metrics.prosodyScore}/100${
          errorWords.length > 0 ? ` · Odak: ${errorWords.join(', ')}` : ''
        }`;

        const existingNotes = currentStudent?.notes ? `${currentStudent.notes}\n` : '';
        updateStudent(studentId, {
          notes: `${existingNotes}${bepNote}`.trim(),
        });
      } catch (bepErr) {
        logError('Okuma seansı BEP senkronizasyonu hatası', {
          error: bepErr instanceof Error ? bepErr.message : String(bepErr),
        });
      }
    }

    return docId;
  },

  /**
   * Yerel oturumları döndürür
   */
  getLocalSessions: (): SavedReadingSession[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedReadingSession[]) : [];
    } catch {
      return [];
    }
  },

  /**
   * Kullanıcının geçmiş tüm sesli okuma seanslarını çeker
   */
  getUserSessions: async (userId: string): Promise<SavedReadingSession[]> => {
    if (!userId || userId === 'guest') {
      return readingSessionService.getLocalSessions();
    }

    try {
      const q = query(collection(db, 'saved_reading_sessions'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const remoteSessions: SavedReadingSession[] = [];
      snapshot.forEach((d) => {
        remoteSessions.push(d.data() as SavedReadingSession);
      });

      // Yerel oturumlarla birleştir (duplicate önleme)
      const local = readingSessionService.getLocalSessions();
      const map = new Map<string, SavedReadingSession>();
      remoteSessions.forEach((s) => map.set(s.id, s));
      local.forEach((s) => {
        if (!map.has(s.id)) map.set(s.id, s);
      });

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      logError('Okuma seansları yüklenemedi, yerel veriler kullanılıyor', {
        error: err instanceof Error ? err.message : String(err),
      });
      return readingSessionService.getLocalSessions();
    }
  },

  /**
   * Belirli bir öğrenciye ait seansları çeker
   */
  getStudentSessions: async (studentId: string): Promise<SavedReadingSession[]> => {
    try {
      const q = query(
        collection(db, 'saved_reading_sessions'),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      const list: SavedReadingSession[] = [];
      snapshot.forEach((d) => list.push(d.data() as SavedReadingSession));
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      logError('Öğrenci okuma seansları yüklenemedi', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  },

  /**
   * Seans kaydını siler
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'saved_reading_sessions', sessionId));
    } catch {
      // devam et
    }

    try {
      const list = readingSessionService.getLocalSessions().filter((s) => s.id !== sessionId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // devam et
    }
  },
};
