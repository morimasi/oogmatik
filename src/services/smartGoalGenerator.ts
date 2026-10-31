/**
 * SMART Hedef Üretici — BEP Modülü
 *
 * Specific / Measurable / Achievable / Relevant / Time-bound hedefler üretir,
 * mevcut BEP hedeflerini değerlendirir ve KVKK uyumluluğunu denetler.
 *
 * Klinik kural: tanı koyucu dil yasak (MEB 573 KHK, KVKK Madde 6).
 * Bağımlılık yok — tamamen deterministik, test edilebilir.
 */

import { IEPGoal, IEPPlan } from '../types/student-advanced';

// ═══════════════════════════════════════════════════════════════════════════════
// SMART DEĞERLENDİRME
// ═══════════════════════════════════════════════════════════════════════════════

export type SmartCriterionKey = 'specific' | 'measurable' | 'achievable' | 'relevant' | 'timeBound';

export interface SmartCriterionResult {
  key: SmartCriterionKey;
  label: string;
  passed: boolean;
  hint: string;
}

export interface SmartGoalEvaluation {
  /** 0-100 arası SMART olgunluk puanı */
  score: number;
  passedCount: number;
  criteria: SmartCriterionResult[];
  missing: SmartCriterionKey[];
}

const CRITERION_LABELS: Record<SmartCriterionKey, string> = {
  specific: 'Belirli (Specific)',
  measurable: 'Ölçülebilir (Measurable)',
  achievable: 'Ulaşılabilir (Achievable)',
  relevant: 'İlgili (Relevant)',
  timeBound: 'Zamanlı (Time-bound)',
};

const PLACEHOLDER_CRITERIA = ['kriterlenmedi', 'belirtilmedi', 'yok', '-'];

const normalize = (value: string): string => value.toLocaleLowerCase('tr-TR').trim();

const isMeaningful = (value: string | undefined, minLength: number): boolean => {
  if (!value) return false;
  const trimmed = normalize(value);
  if (trimmed.length < minLength) return false;
  return !PLACEHOLDER_CRITERIA.includes(trimmed);
};

const parseDate = (value: string | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Bir IEP hedefini SMART kriterlerine göre değerlendirir.
 */
export const evaluateSmartGoal = (goal: IEPGoal): SmartGoalEvaluation => {
  const baselineDate = parseDate(goal.baseline?.measurementDate);
  const targetDate = parseDate(goal.targetDate);
  const today = new Date();

  const criteria: SmartCriterionResult[] = [
    {
      key: 'specific',
      label: CRITERION_LABELS.specific,
      passed: isMeaningful(goal.title, 8) && isMeaningful(goal.shortTermObjective || goal.description, 15),
      hint: 'Başlık ve kısa vadeli hedef, hangi becerinin geliştirileceğini açıkça yazmalı.',
    },
    {
      key: 'measurable',
      label: CRITERION_LABELS.measurable,
      passed: isMeaningful(goal.successCriteria, 10) && isMeaningful(goal.baseline?.description, 8),
      hint: 'Başarı kriteri ve başlangıç düzeyi ölçülebilir biçimde yazılmalı.',
    },
    {
      key: 'achievable',
      label: CRITERION_LABELS.achievable,
      passed:
        goal.progress >= 0 &&
        goal.progress <= 100 &&
        (goal.strategies?.length ?? 0) > 0 &&
        (goal.resources?.length ?? 0) > 0,
      hint: 'En az bir strateji ve bir destek kaynağı tanımlanmalı.',
    },
    {
      key: 'relevant',
      label: CRITERION_LABELS.relevant,
      passed: Boolean(goal.category) && (goal.priority === 'high' || goal.priority === 'medium' || goal.priority === 'low'),
      hint: 'Hedef alanı ve öncelik, öğrencinin BEP gereksinimleriyle ilişkilendirilmeli.',
    },
    {
      key: 'timeBound',
      label: CRITERION_LABELS.timeBound,
      passed:
        targetDate !== null &&
        baselineDate !== null &&
        targetDate.getTime() > baselineDate.getTime() &&
        targetDate.getTime() > new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).getTime(),
      hint: 'Hedef tarihi, başlangıç ölçümünden sonra ve geçmişte kalmamış olmalı.',
    },
  ];

  const passedCount = criteria.filter((criterion) => criterion.passed).length;
  const missing = criteria.filter((criterion) => !criterion.passed).map((criterion) => criterion.key);

  return {
    score: Math.round((passedCount / criteria.length) * 100),
    passedCount,
    criteria,
    missing,
  };
};

/**
 * Plan genelindeki SMART olgunluğunu puanlar (0-100).
 */
export const scorePlanSmartness = (plan: IEPPlan): number => {
  if (plan.goals.length === 0) return 0;
  const total = plan.goals.reduce((sum, goal) => sum + evaluateSmartGoal(goal).score, 0);
  return Math.round(total / plan.goals.length);
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEDEF ÜRETİMİ
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateSmartGoalInput {
  title: string;
  description?: string;
  category?: IEPGoal['category'];
  baselineDescription?: string;
  baselineValue?: number;
  targetValue?: number;
  measurementMethod?: IEPGoal['baseline']['measurementMethod'];
  successCriteria?: string;
  shortTermObjective?: string;
  strategies?: string[];
  resources?: string[];
  priority?: IEPGoal['priority'];
  evaluationMethod?: IEPGoal['evaluationMethod'];
  targetDate?: string;
}

const DEFAULT_STRATEGIES = ['Doğrudan öğretim', 'Tekrarlı alıştırma', 'Görsel destekleme'];

const clampPercent = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

const addDays = (base: Date, days: number): Date => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * Geçerli bir IEP hedefi üretir. Eksik alanlar pedagojik varsayılanlarla doldurulur.
 */
export const createSmartGoal = (input: CreateSmartGoalInput): IEPGoal => {
  const now = new Date();
  const baselineValue = clampPercent(input.baselineValue ?? 0);
  const targetValue = clampPercent(Math.max(input.targetValue ?? baselineValue + 20, baselineValue));
  const measurementMethod = input.measurementMethod ?? 'observation';

  const successCriteria =
    input.successCriteria ??
    `Ölçüm sonucunda ${targetValue} seviyesine ulaşması (başlangıç düzeyi: ${baselineValue}).`;

  const baselineDescription =
    input.baselineDescription ?? `Başlangıç düzeyi ${baselineValue} olarak gözlemlendi.`;

  return {
    id: `goal-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    category: input.category ?? 'academic',
    title: input.title.trim() || 'Yeni BEP Hedefi',
    description: input.description ?? input.title,
    baseline: {
      description: baselineDescription,
      measurementDate: now.toISOString(),
      measurementMethod,
    },
    shortTermObjective: input.shortTermObjective ?? input.title,
    successCriteria,
    targetDate: input.targetDate ?? addDays(now, 90).toISOString(),
    status: 'not_started',
    progress: 0,
    priority: input.priority ?? 'medium',
    strategies: input.strategies?.length ? input.strategies : [...DEFAULT_STRATEGIES],
    resources: input.resources?.length ? input.resources : ['BEP destek materyalleri'],
    evaluationMethod: input.evaluationMethod ?? (measurementMethod === 'test' ? 'test' : 'observation'),
    reviews: [],
  };
};

/**
 * Mevcut bir hedefin eksik SMART alanlarını doldurur.
 */
export const completeSmartGoal = (goal: IEPGoal): IEPGoal => {
  const now = new Date();
  return {
    ...goal,
    shortTermObjective: isMeaningful(goal.shortTermObjective, 10)
      ? goal.shortTermObjective
      : goal.title,
    successCriteria: isMeaningful(goal.successCriteria, 10)
      ? goal.successCriteria
      : `Hedef, bağımsız olarak %80 doğrulukla gerçekleştirilir.`,
    baseline: {
      ...goal.baseline,
      description: isMeaningful(goal.baseline?.description, 8)
        ? goal.baseline.description
        : 'Başlangıç düzeyi gözlem ile belirlendi.',
      measurementDate: goal.baseline?.measurementDate || now.toISOString(),
      measurementMethod: goal.baseline?.measurementMethod || 'observation',
    },
    strategies: goal.strategies?.length ? goal.strategies : [...DEFAULT_STRATEGIES],
    resources: goal.resources?.length ? goal.resources : ['BEP destek materyalleri'],
    targetDate: parseDate(goal.targetDate) ? goal.targetDate : addDays(now, 90).toISOString(),
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// İLERLEME
// ═══════════════════════════════════════════════════════════════════════════════

export interface GoalProgressResult {
  percentage: number;
  status: IEPGoal['status'];
  remaining: number;
  /** Başlangıçtan bugüne geçen süreye göre beklenen ilerleme (0-100). */
  expectedPercentage: number;
  onTrack: boolean;
  daysRemaining: number;
}

/**
 * Hedefin ilerlemesini, beklenen ilerlemeyle karşılaştırarak raporlar.
 */
export const calculateGoalProgress = (goal: IEPGoal, referenceDate: Date = new Date()): GoalProgressResult => {
  const percentage = clampPercent(goal.progress ?? 0);
  const baselineDate = parseDate(goal.baseline?.measurementDate);
  const targetDate = parseDate(goal.targetDate);

  const start = baselineDate ?? referenceDate;
  const totalMs = targetDate ? targetDate.getTime() - start.getTime() : 0;
  const elapsedMs = referenceDate.getTime() - start.getTime();

  const expectedPercentage =
    totalMs > 0 ? clampPercent((elapsedMs / totalMs) * 100) : percentage >= 100 ? 100 : 0;

  const daysRemaining = targetDate
    ? Math.ceil((targetDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  let status: IEPGoal['status'];
  if (goal.status === 'deferred') status = 'deferred';
  else if (percentage >= 100) status = 'achieved';
  else if (percentage === 0) status = 'not_started';
  else if (targetDate !== null && daysRemaining < 0) status = 'needs_revision';
  else status = 'in_progress';

  return {
    percentage,
    status,
    remaining: Math.max(0, 100 - percentage),
    expectedPercentage,
    onTrack: percentage + 10 >= expectedPercentage,
    daysRemaining,
  };
};

/**
 * Hedef ilerlemesini güncelleyip yeni bir hedef nesnesi döndürür.
 */
export const withGoalProgress = (goal: IEPGoal, progress: number): IEPGoal => {
  const percentage = clampPercent(progress);
  const next: IEPGoal = { ...goal, progress: percentage };
  next.status = calculateGoalProgress(next).status;
  return next;
};

// ═══════════════════════════════════════════════════════════════════════════════
// KVKK / DİL DENETİMİ
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiagnosticLanguageMatch {
  pattern: string;
  suggestion: string;
}

/** Tanı koyucu ifadeler ve pedagojik karşılıkları. */
export const DIAGNOSTIC_LANGUAGE_RULES: DiagnosticLanguageMatch[] = [
  { pattern: 'disleksisi var', suggestion: 'disleksi desteğine ihtiyacı var' },
  { pattern: 'disleksi var', suggestion: 'okuma desteğine ihtiyacı var' },
  { pattern: 'disleksik', suggestion: 'okuma güçlüğü desteği alan öğrenci' },
  { pattern: 'dehbli', suggestion: 'dikkat gelişimi desteğine ihtiyacı var' },
  { pattern: 'hiperaktif', suggestion: 'hareket etme ihtiyacı yüksek' },
  { pattern: 'engelli', suggestion: 'özel eğitim desteğine ihtiyacı var' },
  { pattern: 'özürlü', suggestion: 'özel eğitim desteğine ihtiyacı var' },
  { pattern: 'gerizekalı', suggestion: 'öğrenme desteğine ihtiyacı var' },
  { pattern: 'başarısız öğrenci', suggestion: 'hedeflenen düzeye ulaşmak için desteğe ihtiyacı var' },
  { pattern: 'yapamıyor', suggestion: 'bu beceride desteğe ihtiyacı var' },
];

const findDiagnosticLanguage = (text: string): DiagnosticLanguageMatch[] => {
  const normalized = normalize(text);
  return DIAGNOSTIC_LANGUAGE_RULES.filter((rule) => normalized.includes(rule.pattern));
};

export type ComplianceSeverity = 'error' | 'warning';

export interface ComplianceIssue {
  code: string;
  severity: ComplianceSeverity;
  message: string;
  field?: string;
}

export interface BepComplianceReport {
  compliant: boolean;
  score: number;
  issues: ComplianceIssue[];
  recommendations: string[];
}

/**
 * BEP planını mevzuat, dil ve SMART bütünlüğü açısından denetler.
 */
export const validateBEPCompliance = (plan: IEPPlan): BepComplianceReport => {
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];

  if (!plan.studentId) {
    issues.push({
      code: 'MISSING_STUDENT_ID',
      severity: 'error',
      message: 'Plan bir öğrenciye bağlı değil; KVKK Madde 6 gereği kayıt ilişkilendirilmelidir.',
      field: 'studentId',
    });
    recommendations.push('Planı kaydetmeden önce öğrenci kaydını ilişkilendirin.');
  }

  const startDate = parseDate(plan.startDate);
  const endDate = parseDate(plan.endDate);
  if (!startDate || !endDate) {
    issues.push({
      code: 'INVALID_DATES',
      severity: 'error',
      message: 'BEP başlangıç ve bitiş tarihleri geçerli olmalıdır.',
      field: 'startDate',
    });
  } else if (endDate.getTime() <= startDate.getTime()) {
    issues.push({
      code: 'INVALID_DATE_ORDER',
      severity: 'error',
      message: 'BEP bitiş tarihi başlangıç tarihinden sonra olmalıdır.',
      field: 'endDate',
    });
    recommendations.push('Plan dönemini en az bir eğitim-öğretim yılı olacak şekilde ayarlayın.');
  }

  if ((plan.goals ?? []).length === 0) {
    issues.push({
      code: 'NO_GOALS',
      severity: 'error',
      message: 'Plan en az bir SMART hedef içermelidir.',
      field: 'goals',
    });
    recommendations.push('Öğrencinin gereksinimine göre 2-3 SMART hedef ekleyin.');
  }

  const goals = plan.goals ?? [];
  const textFields: string[] = [
    plan.aiSummary ?? '',
    ...(plan.needs ?? []),
    ...(plan.strengths ?? []),
    ...goals.flatMap((goal) => [goal.title, goal.description, goal.successCriteria, goal.shortTermObjective]),
  ];

  const matches = textFields.flatMap(findDiagnosticLanguage);
  if (matches.length > 0) {
    issues.push({
      code: 'DIAGNOSTIC_LANGUAGE',
      severity: 'error',
      message: `Tanı koyucu dil kullanılmış: ${matches.map((match) => `"${match.pattern}"`).join(', ')}.`,
    });
    matches.forEach((match) => {
      recommendations.push(`"${match.pattern}" yerine "${match.suggestion}" ifadesini kullanın.`);
    });
  }

  const unmeasured = goals.filter((goal) => !isMeaningful(goal.successCriteria, 10));
  if (unmeasured.length > 0) {
    issues.push({
      code: 'MISSING_SUCCESS_CRITERIA',
      severity: 'warning',
      message: `${unmeasured.length} hedefte ölçülebilir başarı kriteri yok.`,
      field: 'goals.successCriteria',
    });
    recommendations.push('Her hedef için gözlenebilir ve ölçülebilir bir başarı kriteri yazın.');
  }

  const smartScore = scorePlanSmartness(plan);
  if (smartScore < 60 && goals.length > 0) {
    issues.push({
      code: 'LOW_SMART_SCORE',
      severity: 'warning',
      message: `Planın SMART olgunluk puanı düşük (${smartScore}/100).`,
    });
    recommendations.push('Eksik SMART alanlarını "Hedefi Tamamla" işlemiyle tamamlayın.');
  }

  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  return {
    compliant: errorCount === 0,
    score: Math.max(0, 100 - errorCount * 25 - warningCount * 8),
    issues,
    recommendations,
  };
};
