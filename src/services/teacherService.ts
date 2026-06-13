import { db } from './firebaseClient';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, arrayRemove, QueryDocumentSnapshot, writeBatch } from "firebase/firestore";
import { authService } from './authService';
import { assessmentService } from './assessmentService';
import { activityLogService } from './activityLogService';
import { User } from '../types';
import type { Student } from '../types/student';
import { TeacherListItem, TeacherDetail, TeacherAnalytics, TeacherActivity, TeacherActivityType, TeacherStudentSummary } from '../types/teacher';

const _prepareDocData = (snap: QueryDocumentSnapshot): Record<string, unknown> => {
  const data = snap.data();
  return { id: snap.id, ...data };
};

export const teacherService = {
  getAllTeachers: async (): Promise<TeacherListItem[]> => {
    try {
      const { users: allUsers } = await authService.getAllUsers(0, 500);
      const teachers = allUsers.filter((u: User) => u.role === 'teacher' || u.role === 'admin') as User[];

      const items: TeacherListItem[] = await Promise.all(
        teachers.map(async (t: User) => {
          let studentCount = 0;
          let assessmentCount = 0;
          let planCount = 0;
          let reportCount = 0;

          try {
            const [ownSnap, assignedSnap] = await Promise.all([
              getDocs(query(collection(db, 'students'), where('teacherId', '==', t.id))),
              getDocs(query(collection(db, 'students'), where('assignedTeachers', 'array-contains', t.id)))
            ]);
            const seen = new Set<string>();
            [...ownSnap.docs, ...assignedSnap.docs].forEach(d => seen.add(d.id));
            studentCount = seen.size;

            if (studentCount > 0) {
              const assessmentsSnap = await getDocs(query(collection(db, 'saved_assessments'), where('userId', '==', t.id)));
              assessmentCount = assessmentsSnap.size;
              reportCount = assessmentsSnap.docs.filter(d => {
                const data = d.data();
                const report = data.report as Record<string, unknown> | undefined;
                return report?.scores != null;
              }).length;
            }

            const plansSnap = await getDocs(query(collection(db, 'saved_curriculums'), where('userId', '==', t.id)));
            planCount = plansSnap.size;
          } catch {
            // Silently handle per-teacher fetch errors
          }

          return {
            id: t.id,
            name: t.name,
            email: t.email,
            avatar: t.avatar,
            role: t.role,
            status: t.status,
            createdAt: t.createdAt,
            lastLogin: t.lastLogin,
            studentCount,
            worksheetCount: t.worksheetCount || 0,
            assessmentCount,
            planCount,
            reportCount,
            subscriptionPlan: t.subscriptionPlan || 'free',
          };
        })
      );

      return items.sort((a, b) => b.studentCount - a.studentCount);
    } catch {
      return [];
    }
  },

  getTeacherDetail: async (teacherId: string): Promise<TeacherDetail | null> => {
    try {
      const allUsers = (await authService.getAllUsers(0, 500)).users as User[];
      const user = allUsers.find((u: User) => u.id === teacherId);
      if (!user) return null;

      const [ownStudentsSnap, assignedSnap] = await Promise.all([
        getDocs(query(collection(db, 'students'), where('teacherId', '==', teacherId))),
        getDocs(query(collection(db, 'students'), where('assignedTeachers', 'array-contains', teacherId)))
      ]);
      const seenIds = new Set<string>();
      const studentsSnapDocs = [...ownStudentsSnap.docs, ...assignedSnap.docs].filter(d => {
        if (seenIds.has(d.id)) return false;
        seenIds.add(d.id);
        return true;
      });
      const studentsSnap = { docs: studentsSnapDocs, size: studentsSnapDocs.length } as any;
      const studentIds = studentsSnapDocs.map(d => d.id);
      const studentNames = studentsSnapDocs.map(d => (d.data().name || '') as string);

      const assessmentsSnap = await getDocs(query(collection(db, 'saved_assessments'), where('userId', '==', teacherId)));
      const worksheetSnap = await getDocs(query(collection(db, 'saved_worksheets'), where('userId', '==', teacherId)));
      const plansSnap = await getDocs(query(collection(db, 'saved_curriculums'), where('userId', '==', teacherId)));

      const assessments = assessmentsSnap.docs.map(d => _prepareDocData(d));
      const worksheets = worksheetSnap.docs.map(d => _prepareDocData(d));
      const plans = plansSnap.docs.map(d => _prepareDocData(d));

      const assessmentCount = assessments.length;
      const worksheetCount = worksheets.length;
      const planCount = plans.length;
      const totalStudents = studentsSnap.size;

      const totalAssessments = assessments.length;
      const totalReports = assessments.filter(a => (a.report as Record<string, unknown> | undefined)?.scores).length;

      let totalScore = 0;
      let scoreCount = 0;
      for (const a of assessments) {
        const report = a.report as Record<string, unknown> | undefined;
        if (report?.scores) {
          const scores = report.scores as Record<string, number>;
          const vals = Object.values(scores);
          if (vals.length > 0) {
            totalScore += vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
            scoreCount++;
          }
        }
      }
      const avgStudentScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

      const recentActivity: TeacherActivity[] = [];

      worksheets.slice(0, 20).forEach((w) => {
        recentActivity.push({
          id: (w.id as string) || '',
          type: 'worksheet',
          title: (w.title as string) || 'Çalışma Kağıdı',
          details: `Oluşturuldu: ${(w.studentName as string) || 'Belirtilmemiş'}`,
          createdAt: (w.createdAt as string) || new Date().toISOString(),
          targetId: (w.id as string) || '',
        });
      });

      assessments.slice(0, 20).forEach((a) => {
        recentActivity.push({
          id: (a.id as string) || '',
          type: 'assessment',
          title: `Değerlendirme - ${(a.studentName as string) || 'Öğrenci'}`,
          details: `Puan: ${avgStudentScore}`,
          createdAt: (a.createdAt as string) || new Date().toISOString(),
          targetId: (a.id as string) || '',
        });
      });

      plans.slice(0, 20).forEach((p) => {
        recentActivity.push({
          id: (p.id as string) || '',
          type: 'plan',
          title: (p.studentName as string) ? `${(p.studentName as string)} için Plan` : 'Müfredat Planı',
          details: `${(p.durationDays as number) || 0} gün`,
          createdAt: (p.createdAt as string) || new Date().toISOString(),
          targetId: (p.id as string) || '',
        });
      });

      const logData = await activityLogService.getUserActivities(teacherId);
      logData.activities.forEach((a: any) => {
        if (a.type === 'login' || a.type === 'export' || a.type === 'student_added') {
          recentActivity.push({
            id: a.id || '',
            type: a.type as TeacherActivityType,
            title: a.title || '',
            details: a.details || '',
            createdAt: a.createdAt || new Date().toISOString(),
            targetId: a.targetId || '',
            metadata: a.metadata || undefined,
          });
        }
      });

      recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const now = new Date();
      const dailyActivity: Array<{ date: string; count: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = recentActivity.filter(a => a.createdAt.startsWith(dateStr)).length;
        dailyActivity.push({ date: dateStr, count });
      }

      const activityByType: Record<TeacherActivityType, number> = {
        worksheet: worksheetCount,
        assessment: assessmentCount,
        plan: planCount,
        report: totalReports,
        login: logData.typeCounts['login'] || 0,
        export: logData.typeCounts['export'] || 0,
        student_added: logData.typeCounts['student_added'] || 0,
      };

      const monthlyTrend: Array<{ month: string; worksheets: number; assessments: number; plans: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthWorksheets = worksheets.filter(w => (w.createdAt as string || '').startsWith(monthKey)).length;
        const monthAssessments = assessments.filter(a => (a.createdAt as string || '').startsWith(monthKey)).length;
        const monthPlans = plans.filter(p => (p.createdAt as string || '').startsWith(monthKey)).length;
        monthlyTrend.push({ month: monthKey, worksheets: monthWorksheets, assessments: monthAssessments, plans: monthPlans });
      }

      const students: TeacherStudentSummary[] = await Promise.all(
        studentsSnap.docs.map(async (doc: any) => {
          const data = doc.data();
          const sAssessments = await assessmentService.getAssessmentsByStudent(doc.id);
          const scores = sAssessments
            .map(a => {
              const r = a.report as { scores?: Record<string, number> };
              if (r?.scores) {
                const vals = Object.values(r.scores);
                return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
              }
              return 0;
            })
            .filter(s => s > 0);

          return {
            id: doc.id,
            name: (data.name as string) || 'Öğrenci',
            grade: (data.grade as string) || '',
            age: (data.age as number) || 0,
            lastActivity: sAssessments[0]?.createdAt || '',
            assessmentCount: sAssessments.length,
            avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            status: sAssessments.length > 0 ? 'active' : 'inactive',
          } as TeacherStudentSummary;
        })
      );

      const analytics: TeacherAnalytics = {
        totalWorksheets: worksheetCount,
        totalAssessments: assessmentCount,
        totalPlans: planCount,
        totalStudents,
        totalReports,
        avgStudentScore,
        activeStudents: students.filter(s => s.status === 'active').length,
        lastActiveDate: recentActivity[0]?.createdAt || user.lastLogin,
        dailyActivity,
        activityByType,
        monthlyTrend,
      };

      return {
        user,
        analytics,
        recentActivity: recentActivity.slice(0, 50),
        students,
      };
    } catch {
      return null;
    }
  },

  getActivityPreview: async (type: string, targetId: string): Promise<Record<string, unknown> | null> => {
    try {
      const collections: Record<string, string> = {
        worksheet: 'saved_worksheets',
        assessment: 'saved_assessments',
        plan: 'saved_curriculums',
      };
      const col = collections[type];
      if (!col) return null;
      const docSnap = await getDoc(doc(db, col, targetId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch {
      return null;
    }
  },

  getStudentPreview: async (studentId: string): Promise<Record<string, unknown> | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'students', studentId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch {
      return null;
    }
  },

  getAllStudents: async (): Promise<Student[]> => {
    try {
      const snap = await getDocs(collection(db, 'students'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
    } catch {
      return [];
    }
  },

  assignStudentToTeacher: async (teacherId: string, studentId: string): Promise<void> => {
    await updateDoc(doc(db, 'students', studentId), {
      assignedTeachers: arrayUnion(teacherId)
    });
  },

  assignStudentsToTeacher: async (teacherId: string, studentIds: string[]): Promise<void> => {
    const batch = writeBatch(db);
    studentIds.forEach(id => {
      batch.update(doc(db, 'students', id), { assignedTeachers: arrayUnion(teacherId) });
    });
    await batch.commit();
  },

  removeStudentFromTeacher: async (teacherId: string, studentId: string): Promise<void> => {
    await updateDoc(doc(db, 'students', studentId), {
      assignedTeachers: arrayRemove(teacherId)
    });
  },
};
