import { describe, expect, it } from 'vitest';
import { AdvancedStudent, GradeEntry, createAdvancedStudent, createDefaultIEP } from '../src/types/student-advanced';
import { Student } from '../src/types/student';
import {
  completeSmartGoal,
  createSmartGoal,
  evaluateSmartGoal,
  scorePlanSmartness,
  validateBEPCompliance,
  withGoalProgress,
} from '../src/services/smartGoalGenerator';
import { buildCognitiveProfile } from '../src/services/cognitiveProfileService';
import {
  createStudentRef,
  exportReportToHtml,
  exportReportToJson,
  generateAcademicReport,
} from '../src/services/academicReportService';

const baseStudent: Student = {
  id: 'student-abc-123',
  teacherId: 'teacher-1',
  name: 'Deneme Öğrenci',
  age: 10,
  grade: '4',
  avatar: '',
  diagnosis: [],
  interests: [],
  strengths: [],
  weaknesses: [],
  learningStyle: 'Görsel',
  createdAt: new Date('2026-01-05').toISOString(),
};

const grade = (id: string, subject: string, score: number, date: string): GradeEntry => ({
  id,
  subject,
  type: 'exam',
  score,
  maxScore: 100,
  date,
  weight: 1,
});

const buildStudent = (): AdvancedStudent => {
  const student = createAdvancedStudent(baseStudent);
  student.academic = {
    grades: [
      grade('g1', 'Türkçe', 70, '2026-02-01'),
      grade('g2', 'Türkçe', 82, '2026-03-01'),
      grade('g3', 'Matematik', 60, '2026-02-10'),
      grade('g4', 'Matematik', 65, '2026-03-10'),
    ],
    metrics: {
      gpa: 69,
      subjectAverages: { Türkçe: 76, Matematik: 62.5 },
      attendanceRate: 92,
      participationRate: 70,
      homeworkCompletionRate: 64,
      strongestSubject: 'Türkçe',
      weakestSubject: 'Matematik',
      recentTrend: 'up',
    },
  };
  student.attendance = {
    records: [],
    stats: {
      totalDays: 40,
      present: 37,
      absent: 3,
      late: 0,
      excused: 0,
      attendanceRate: 92,
      trend: 'stable',
    },
  };
  return student;
};

describe('smartGoalGenerator', () => {
  it('üretilen hedef SMART kriterlerinin çoğunu karşılar', () => {
    const goal = createSmartGoal({
      title: 'Dakikada okunan doğru kelime sayısını artırma',
      category: 'academic',
      baselineValue: 40,
      targetValue: 70,
    });

    const evaluation = evaluateSmartGoal(goal);
    expect(goal.targetDate).toBeTruthy();
    expect(goal.successCriteria).toContain('70');
    expect(evaluation.score).toBeGreaterThanOrEqual(60);
    expect(evaluation.missing).not.toContain('measurable');
  });

  it('eksik alanlı hedef tamamlandığında SMART puanı yükselir', () => {
    const incomplete = { ...createSmartGoal({ title: 'Kısa hedef' }), strategies: [], resources: [], successCriteria: '' };
    const before = evaluateSmartGoal(incomplete).score;
    const after = evaluateSmartGoal(completeSmartGoal(incomplete)).score;
    expect(after).toBeGreaterThan(before);
  });

  it('ilerleme 100 olduğunda hedef tamamlandı durumuna geçer', () => {
    const goal = withGoalProgress(createSmartGoal({ title: 'Okuma akıcılığı hedefi' }), 100);
    expect(goal.status).toBe('achieved');
  });

  it('tanı koyucu dili hata olarak işaretler', () => {
    const plan = createDefaultIEP('student-abc-123');
    const goal = createSmartGoal({ title: 'Okuma desteği hedefi' });
    plan.goals = [{ ...goal, description: 'Öğrencinin disleksisi var ve yapamıyor.' }];

    const report = validateBEPCompliance(plan);
    expect(report.compliant).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'DIAGNOSTIC_LANGUAGE')).toBe(true);
    expect(report.recommendations.some((item) => item.includes('desteğine ihtiyacı var'))).toBe(true);
  });

  it('temiz plan uyumlu kabul edilir', () => {
    const plan = createDefaultIEP('student-abc-123');
    plan.goals = [createSmartGoal({ title: 'Haftada üç kez akıcı okuma çalışması' })];
    plan.endDate = new Date(new Date(plan.startDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const report = validateBEPCompliance(plan);
    expect(report.issues.filter((issue) => issue.severity === 'error')).toHaveLength(0);
    expect(scorePlanSmartness(plan)).toBeGreaterThan(0);
  });
});

describe('cognitiveProfileService', () => {
  it('gerçek not ve devamsızlık verisinden gösterge üretir', () => {
    const summary = buildCognitiveProfile(buildStudent());
    expect(summary.observationalOnly).toBe(true);
    expect(summary.indicators.length).toBeGreaterThan(0);
    expect(summary.dataCompleteness).toBeGreaterThan(0);

    const attendance = summary.indicators.find((indicator) => indicator.key === 'sustained_attention');
    expect(attendance?.value).toBe(92);
  });

  it('veri yoksa çökmez ve veri doluluğu düşük kalır', () => {
    const summary = buildCognitiveProfile(createAdvancedStudent(baseStudent));
    expect(summary.indicators.length).toBeGreaterThan(0);
    expect(summary.dataCompleteness).toBeLessThan(100);
  });
});

describe('academicReportService', () => {
  it('rapor öğrenci adını içermez, anonim referans kullanır', () => {
    const report = generateAcademicReport(buildStudent());
    const serialized = exportReportToJson(report);

    expect(report.studentRef.startsWith('Öğrenci #')).toBe(true);
    expect(serialized).not.toContain(baseStudent.name);
    expect(report.kvkk.anonymized).toBe(true);
    expect(report.subjects.length).toBe(2);
    expect(report.attendanceRate).toBe(92);
  });

  it('ders ortalamalarını gerçek notlardan hesaplar', () => {
    const report = generateAcademicReport(buildStudent());
    const turkish = report.subjects.find((subject) => subject.subject === 'Türkçe');
    expect(turkish?.average).toBe(76);
    // Dörtten az kayıtta eğilim yorumu yapılmaz (gürültüyü önlemek için).
    expect(turkish?.trend).toBe('stable');
    expect(report.sufficientData).toBe(true);
  });

  it('en az dört kayıtta yükseliş eğilimini tespit eder', () => {
    const student = buildStudent();
    student.academic.grades = [
      grade('t1', 'Türkçe', 55, '2026-02-01'),
      grade('t2', 'Türkçe', 58, '2026-02-15'),
      grade('t3', 'Türkçe', 80, '2026-03-01'),
      grade('t4', 'Türkçe', 85, '2026-03-15'),
    ];
    const report = generateAcademicReport(student);
    expect(report.subjects[0].trend).toBe('up');
  });

  it('HTML çıktısı yazdırılabilir ve anonimdir', () => {
    const report = generateAcademicReport(buildStudent());
    const html = exportReportToHtml(report);
    expect(html).toContain('Akademik Rapor');
    expect(html).toContain(report.studentRef);
    expect(html).not.toContain(baseStudent.name);
  });

  it('anonim referans deterministiktir', () => {
    expect(createStudentRef('abc')).toBe(createStudentRef('abc'));
    expect(createStudentRef('abc')).not.toBe(createStudentRef('abd'));
  });
});
