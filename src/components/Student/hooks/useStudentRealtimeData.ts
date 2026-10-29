import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebaseClient';
import { SavedWorksheet, SavedAssessment, Curriculum } from '../../../types';
import { logInfo, logError } from '../../../utils/logger';
import { toAppError } from '../../../utils/AppError';

export interface UseStudentRealtimeDataReturn {
  studentWorksheets: SavedWorksheet[];
  studentAssessments: SavedAssessment[];
  studentCurriculums: Curriculum[];
  loadingDetails: boolean;
}

export function useStudentRealtimeData(
  selectedStudentId: string | null,
  fetchStudentAssignments: (studentId: string) => () => void
): UseStudentRealtimeDataReturn {
  const [studentWorksheets, setStudentWorksheets] = useState<SavedWorksheet[]>([]);
  const [studentAssessments, setStudentAssessments] = useState<SavedAssessment[]>([]);
  const [studentCurriculums, setStudentCurriculums] = useState<Curriculum[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const realtimeUnsubs = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentWorksheets([]);
      setStudentAssessments([]);
      setStudentCurriculums([]);
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);

    // Önceki dinleyicileri temizle
    realtimeUnsubs.current.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        logError(toAppError(e), { context: 'useStudentRealtimeData unsub cleanup' });
      }
    });
    realtimeUnsubs.current = [];

    try {
      // 1. Atamalar Dinleyicisi
      const unsubAssignments = fetchStudentAssignments(selectedStudentId);
      realtimeUnsubs.current.push(unsubAssignments);

      // 2. Kayıtlı Çalışma Kağıtları Dinleyicisi
      const qWorksheets = query(
        collection(db, 'saved_worksheets'),
        where('studentId', '==', selectedStudentId)
      );
      const unsubWorksheets = onSnapshot(qWorksheets, {
        next: (snapshot) => {
          logInfo(`[StudentDashboard] saved_worksheets (${selectedStudentId}): ${snapshot.docs.length} belge`);
          const ws = snapshot.docs.map((doc) => {
            const raw = doc.data() as Record<string, unknown>;
            if (typeof raw.worksheetData === 'string') {
              try {
                raw.worksheetData = JSON.parse(raw.worksheetData);
              } catch {
                raw.worksheetData = [];
              }
            }
            return { id: doc.id, ...raw } as unknown as SavedWorksheet;
          });
          setStudentWorksheets(ws);
          setLoadingDetails(false);
        },
        error: (err) => {
          logError(toAppError(err), { context: 'Worksheets listener error' });
          setLoadingDetails(false);
        },
      });
      realtimeUnsubs.current.push(unsubWorksheets);

      // 3. Değerlendirme Raporları Dinleyicisi
      const qAssessments = query(
        collection(db, 'saved_assessments'),
        where('studentId', '==', selectedStudentId)
      );
      const unsubAssessments = onSnapshot(qAssessments, {
        next: (snapshot) => {
          logInfo(`[StudentDashboard] saved_assessments (${selectedStudentId}): ${snapshot.docs.length} belge`);
          const asList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Record<string, unknown>),
          })) as unknown as SavedAssessment[];
          setStudentAssessments(asList);
        },
        error: (err) => logError(toAppError(err), { context: 'Assessments listener error' }),
      });
      realtimeUnsubs.current.push(unsubAssessments);

      // 4. Müfredat Planları Dinleyicisi
      const qCurriculums = query(
        collection(db, 'saved_curriculums'),
        where('studentId', '==', selectedStudentId)
      );
      const unsubCurriculums = onSnapshot(qCurriculums, {
        next: (snapshot) => {
          const crList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Record<string, unknown>),
          })) as unknown as Curriculum[];
          setStudentCurriculums(crList);
        },
        error: (err) => logError(toAppError(err), { context: 'Curriculums listener error' }),
      });
      realtimeUnsubs.current.push(unsubCurriculums);
    } catch (err) {
      logError(toAppError(err), { context: 'Error setting up real-time student listeners' });
      setLoadingDetails(false);
    }

    return () => {
      realtimeUnsubs.current.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          logError(toAppError(e), { context: 'useStudentRealtimeData return cleanup' });
        }
      });
      realtimeUnsubs.current = [];
    };
  }, [selectedStudentId, fetchStudentAssignments]);

  return {
    studentWorksheets,
    studentAssessments,
    studentCurriculums,
    loadingDetails,
  };
}
