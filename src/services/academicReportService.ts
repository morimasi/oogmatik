/**
 * Akademik Rapor Servisi — BEP Modülü
 *
 * AdvancedStudent içindeki gerçek not, devamsızlık ve BEP verilerinden
 * akademik rapor üretir. Rapor KVKK Madde 6 gereği anonim referansla çalışır:
 * öğrenci adı rapora hiçbir aşamada yazılmaz.
 */

import { AdvancedStudent, GradeEntry } from '../types/student-advanced';
import {
  buildCognitiveProfile,
  CognitiveProfileSummary,
  gradePercent,
  subjectAveragesFromGrades,
} from './cognitiveProfileService';
import { calculateGoalProgress, scorePlanSmartness } from './smartGoalGenerator';

export type PerformanceBand = 'above_expectations' | 'at_expectations' | 'below_expectations' | 'insufficient_data';
export type TrendDirection = 'up' | 'stable' | 'down';

export interface SubjectReport {
  subject: string;
  average: number;
  entryCount: number;
  trend: TrendDirection;
  comment: string;
}

export interface KvkkInfo {
  anonymized: boolean;
  excludedFields: string[];
  notes: string[];
}

export interface AcademicReport {
  reportId: string;
  generatedAt: string;
  periodStart: string | null;
  periodEnd: string | null;
  /** Öğrenci adı yerine kullanılan anonim referans (KVKK Md. 6). */
  studentRef: string;
  gradeLevel: string;
  sufficientData: boolean;
  gpa: number;
  overallPerformance: PerformanceBand;
  subjects: SubjectReport[];
  attendanceRate: number;
  iepGoalCount: number;
  iepGoalsProgress: number;
  iepGoalsAchieved: number;
  smartScore: number;
  cognitive: CognitiveProfileSummary;
  recommendations: string[];
  kvkk: KvkkInfo;
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

const clamp = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

/**
 * Öğrenci kimliğinden deterministik, geri döndürülemez kısa referans üretir.
 * İsim veya doğrudan tanımlayıcı asla kullanılmaz.
 */
export const createStudentRef = (studentId: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < studentId.length; index += 1) {
    hash ^= studentId.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `Öğrenci #${hex.slice(0, 6)}`;
};

const trendOf = (grades: GradeEntry[]): TrendDirection => {
  if (grades.length < 4) return 'stable';
  const sorted = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half).map(gradePercent);
  const secondHalf = sorted.slice(half).map(gradePercent);
  const firstAverage = firstHalf.reduce((sum, value) => sum + value, 0) / Math.max(1, firstHalf.length);
  const secondAverage = secondHalf.reduce((sum, value) => sum + value, 0) / Math.max(1, secondHalf.length);
  const delta = secondAverage - firstAverage;
  if (delta >= 3) return 'up';
  if (delta <= -3) return 'down';
  return 'stable';
};

const commentFor = (average: number): string => {
  if (average >= 85) return 'Bu alanda güçlü performans gözleniyor.';
  if (average >= 70) return 'Beklenen düzeyde ilerliyor.';
  if (average >= 50) return 'Kısa tekrar ve görsel destekle güçlendirilebilir.';
  return 'Hedeflenen düzeye ulaşmak için ek destek planlanmalı.';
};

const buildSubjectReports = (grades: GradeEntry[]): SubjectReport[] => {
  const averages = subjectAveragesFromGrades(grades);
  return Object.entries(averages)
    .map(([subject, average]) => {
      const subjectGrades = grades.filter((entry) => entry.subject === subject);
      return {
        subject,
        average: round1(average),
        entryCount: subjectGrades.length,
        trend: trendOf(subjectGrades),
        comment: commentFor(average),
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject, 'tr'));
};

const performanceBand = (gpa: number, sufficientData: boolean): PerformanceBand => {
  if (!sufficientData) return 'insufficient_data';
  if (gpa >= 80) return 'above_expectations';
  if (gpa >= 60) return 'at_expectations';
  return 'below_expectations';
};

const dateRange = (grades: GradeEntry[]): { start: string | null; end: string | null } => {
  if (grades.length === 0) return { start: null, end: null };
  const timestamps = grades
    .map((entry) => new Date(entry.date).getTime())
    .filter((value) => Number.isFinite(value));
  if (timestamps.length === 0) return { start: null, end: null };
  return {
    start: new Date(Math.min(...timestamps)).toISOString(),
    end: new Date(Math.max(...timestamps)).toISOString(),
  };
};

/**
 * Öğrencinin mevcut verilerinden akademik rapor üretir.
 */
export const generateAcademicReport = (student: AdvancedStudent): AcademicReport => {
  const grades = student.academic?.grades ?? [];
  const subjects = buildSubjectReports(grades);
  const sufficientData = grades.length > 0;

  const subjectValues = subjects.map((subject) => subject.average);
  const computedGpa =
    subjectValues.length > 0
      ? round1(subjectValues.reduce((sum, value) => sum + value, 0) / subjectValues.length)
      : clamp(student.academic?.metrics?.gpa ?? 0);

  const attendanceRate = clamp(
    student.attendance?.stats?.attendanceRate ?? student.academic?.metrics?.attendanceRate ?? 0
  );

  const goals = student.iep?.goals ?? [];
  const iepGoalsProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + calculateGoalProgress(goal).percentage, 0) / goals.length)
      : 0;
  const iepGoalsAchieved = goals.filter((goal) => calculateGoalProgress(goal).percentage >= 100).length;

  const cognitive = buildCognitiveProfile(student);
  const range = dateRange(grades);

  const recommendations: string[] = [];
  if (!sufficientData) {
    recommendations.push('Rapor için yeterli not kaydı yok; en az bir ölçme sonucu girilmelidir.');
  }
  if (attendanceRate < 90) {
    recommendations.push('Devam oranını yükseltmek için veli ile birlikte kısa vadeli bir plan oluşturun.');
  }
  if (goals.length === 0) {
    recommendations.push('BEP sekmesinden en az bir SMART hedef tanımlayın.');
  }

  const subjectsNeedingSupport = subjects.filter((subject) => subject.average < 70);
  subjectsNeedingSupport.slice(0, 3).forEach((subject) => {
    recommendations.push(
      subject.average < 60
        ? `${subject.subject} dersinde ortalama ${subject.average}; kısa tekrar, görsel destek ve küçük adımlı çalışma planlanmalı.`
        : `${subject.subject} dersinde ortalama ${subject.average}; haftalık kısa tekrar planı ile hedefe yaklaşılabilir.`
    );
  });

  // Zayıf ders varken "tüm göstergeler dengeli" ifadesi çelişki yaratır; bu durumda eklenmez.
  const cognitiveInterventions = cognitive.recommendedInterventions.filter(
    (item) => subjectsNeedingSupport.length === 0 || !item.includes('Tüm göstergeler dengeli')
  );
  recommendations.push(...cognitiveInterventions.slice(0, 3));

  return {
    reportId: `report-${student.id}-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    periodStart: range.start,
    periodEnd: range.end,
    studentRef: createStudentRef(student.id),
    gradeLevel: student.grade || '-',
    sufficientData,
    gpa: computedGpa,
    overallPerformance: performanceBand(computedGpa, sufficientData),
    subjects,
    attendanceRate,
    iepGoalCount: goals.length,
    iepGoalsProgress,
    iepGoalsAchieved,
    smartScore: student.iep ? scorePlanSmartness(student.iep) : 0,
    cognitive,
    recommendations,
    kvkk: {
      anonymized: true,
      excludedFields: ['name', 'avatar', 'contactPhone', 'contactEmail', 'personalInfo', 'familyInfo', 'healthInfo'],
      notes: [
        'Rapor anonim öğrenci referansı ile üretilir; ad ve iletişim bilgisi içermez.',
        'Tanı bilgisi rapora yazılmaz; yalnızca destek gereksinimi ifade edilir.',
      ],
    },
  };
};

export const exportReportToJson = (report: AcademicReport): string => JSON.stringify(report, null, 2);

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const PERFORMANCE_LABELS: Record<PerformanceBand, string> = {
  above_expectations: 'Beklentinin üzerinde',
  at_expectations: 'Beklenen düzeyde',
  below_expectations: 'Gelişim desteği gerekli',
  insufficient_data: 'Yeterli veri yok',
};

/**
 * A4 baskıya uygun, Lexend fontlu HTML rapor üretir (window.print ile PDF alınır).
 */
export const exportReportToHtml = (report: AcademicReport): string => {
  const subjectRows = report.subjects
    .map(
      (subject) => `
        <tr>
          <td>${escapeHtml(subject.subject)}</td>
          <td class="num">${subject.average}</td>
          <td class="num">${subject.entryCount}</td>
          <td>${subject.comment}</td>
        </tr>`
    )
    .join('');

  const indicatorRows = report.cognitive.indicators
    .map(
      (indicator) => `
        <tr>
          <td>${escapeHtml(indicator.label)}</td>
          <td class="num">${indicator.value}</td>
          <td>${escapeHtml(indicator.description)}</td>
        </tr>`
    )
    .join('');

  const recommendationItems = report.recommendations
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>Akademik Rapor — ${escapeHtml(report.studentRef)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: Lexend, 'Segoe UI', sans-serif; color: #1e293b; font-size: 11pt; }
  h1 { font-size: 16pt; margin: 0 0 4mm; }
  h2 { font-size: 12pt; margin: 6mm 0 2mm; }
  .meta { font-size: 9pt; color: #475569; margin-bottom: 6mm; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
  th, td { border: 1px solid #cbd5e1; padding: 2mm; text-align: left; font-size: 9.5pt; }
  th { background: #f1f5f9; }
  .num { text-align: right; font-weight: 700; }
  .kpi { display: flex; gap: 4mm; margin-bottom: 4mm; }
  .kpi div { flex: 1; border: 1px solid #cbd5e1; border-radius: 3mm; padding: 3mm; }
  .kpi strong { display: block; font-size: 14pt; }
  .footer { margin-top: 6mm; font-size: 8pt; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 2mm; }
  ul { margin: 0; padding-left: 5mm; }
</style>
</head>
<body>
  <h1>Akademik Rapor</h1>
  <p class="meta">
    ${escapeHtml(report.studentRef)} &middot; Sınıf: ${escapeHtml(report.gradeLevel)} &middot;
    Rapor No: ${escapeHtml(report.reportId)} &middot; Tarih: ${new Date(report.generatedAt).toLocaleDateString('tr-TR')}
  </p>

  <div class="kpi">
    <div><strong>${report.gpa}</strong>Genel ortalama</div>
    <div><strong>%${report.attendanceRate}</strong>Devam oranı</div>
    <div><strong>%${report.iepGoalsProgress}</strong>BEP ilerlemesi</div>
    <div><strong>${report.smartScore}</strong>SMART puanı</div>
  </div>

  <p><strong>Genel değerlendirme:</strong> ${PERFORMANCE_LABELS[report.overallPerformance]}</p>

  <h2>Ders Bazında Sonuçlar</h2>
  <table>
    <thead><tr><th>Ders</th><th>Ortalama</th><th>Kayıt</th><th>Değerlendirme</th></tr></thead>
    <tbody>${subjectRows || '<tr><td colspan="4">Not kaydı bulunmuyor.</td></tr>'}</tbody>
  </table>

  <h2>Bilişsel Gözlem Göstergeleri</h2>
  <p class="meta">Bu göstergeler okul verilerinden türetilmiştir; klinik değerlendirme veya tanı değildir.</p>
  <table>
    <thead><tr><th>Gösterge</th><th>Değer</th><th>Açıklama</th></tr></thead>
    <tbody>${indicatorRows}</tbody>
  </table>

  <h2>Öneriler</h2>
  <ul>${recommendationItems || '<li>Öneri bulunmuyor.</li>'}</ul>

  <div class="footer">
    ${report.kvkk.notes.map((note) => escapeHtml(note)).join('<br />')}
  </div>
</body>
</html>`;
};

/**
 * Raporu tarayıcıda indirir. Sunucu tarafında çağrıldığında sessizce döner.
 */
export const downloadReport = (report: AcademicReport, format: 'json' | 'html'): boolean => {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return false;

  const isJson = format === 'json';
  const content = isJson ? exportReportToJson(report) : exportReportToHtml(report);
  const blob = new Blob([content], { type: isJson ? 'application/json;charset=utf-8' : 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `akademik-rapor-${report.studentRef.replace(/[^A-Za-z0-9]+/g, '-')}.${isJson ? 'json' : 'html'}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
};
