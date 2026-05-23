import { db } from './firebaseClient';
import { collection, query, where, getDocs, getDoc, doc, QueryDocumentSnapshot } from "firebase/firestore";
import { authService } from './authService';
import { assessmentService } from './assessmentService';
import { User } from '../types';
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
            const studentsSnap = await getDocs(query(collection(db, 'students'), where('teacherId', '==', t.id)));
            studentCount = studentsSnap.size;

            const studentIds = studentsSnap.docs.map(d => d.id);

            if (studentIds.length > 0) {
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

      const studentsSnap = await getDocs(query(collection(db, 'students'), where('teacherId', '==', teacherId)));
      const studentIds = studentsSnap.docs.map(d => d.id);
      const studentNames = studentsSnap.docs.map(d => (d.data().name || '') as string);

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
        login: 0,
        export: 0,
        student_added: 0,
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
        studentsSnap.docs.map(async (doc) => {
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
};
