import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useStudentStore } from '../../../store/useStudentStore';
import { SavedAssessment, SavedWorksheet, User, Curriculum } from '../../../types';
import { assessmentService } from '../../../services/assessmentService';
import { worksheetService } from '../../../services/worksheetService';
import { curriculumService } from '../../../services/curriculumService';
import { AppError } from '../../../utils/AppError';
import { logError } from '../../../utils/errorHandler';
import { ProfileData } from '../../../types/profile';

export const useProfileData = (targetUser?: User): ProfileData => {
  const { user: authUser } = useAuthStore();
  const { students } = useStudentStore();

  const user = targetUser || authUser;
  const isReadOnly = !!targetUser && targetUser.id !== authUser?.id;

  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [asData, wsResult, plData] = await Promise.all([
        assessmentService.getUserAssessments(user.id),
        worksheetService.getUserWorksheets(user.id, 0, 1000),
        curriculumService.getUserCurriculums(user.id),
      ]);
      setAssessments(asData);
      setWorksheets(wsResult.items);
      setCurriculums(plData);
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError(String(e), 'LOAD_DATA_ERROR', 500);
      logError(err, { context: 'useProfileData.loadData' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]);

  const performanceTrends = useMemo(() => {
    if (assessments.length < 2) return null;
    return assessments
      .slice(0, 5)
      .reverse()
      .map((a: SavedAssessment) => ({
        date: a.createdAt,
        puan: a.report.scores.attention || 0,
      }));
  }, [assessments]);

  const monthlyNewStudents = useMemo(() => {
    const now = new Date();
    return students.filter((s: any) => {
      if (!s.createdAt) return false;
      const created = new Date(s.createdAt);
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    }).length;
  }, [students]);

  const avgScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const total = assessments.reduce(
      (sum: number, a: SavedAssessment) => sum + (a.report.scores.attention || 0),
      0
    );
    return Math.round(total / assessments.length);
  }, [assessments]);

  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalMaterials: worksheets.length,
    totalAssessments: assessments.length,
    totalPlans: curriculums.length,
    avgScore,
    monthlyNewStudents,
    weeklyProduction: Math.round(worksheets.filter((w: SavedWorksheet) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(w.createdAt) > weekAgo;
    }).length),
    streak: 0, // TODO: Implement streak calculation
  }), [students.length, worksheets.length, assessments.length, curriculums.length, avgScore, monthlyNewStudents, worksheets]);

  const refreshData = async () => {
    await loadData();
  };

  return {
    user,
    isReadOnly,
    assessments: assessments as unknown as Record<string, unknown>[],
    worksheets,
    curriculums: curriculums as unknown as Record<string, unknown>[],
    loading,
    stats,
    performanceTrends,
    refreshData,
  };
};