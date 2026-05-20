import { SavedWorksheet, SavedAssessment, Curriculum } from '../../../types';
import { ActivityAssignment } from '../../../types/assignment';
import { IEPGoal, GradeEntry, BehaviorIncident, PortfolioItem } from '../../../types/student-advanced';

export interface ClinicalNote {
  id: string;
  category: 'baseline' | 'progress' | 'goal';
  date: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface PlanRevision {
  id: string;
  date: string;
  author: string;
  changeDescription: string;
  previousValue: string;
  newValue: string;
}

export interface EnrichedCurriculum extends Curriculum {
  revisions: PlanRevision[];
  lastReviewed: string;
  nextReview: string;
}

export interface MaterialCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  count: number;
}

export const generateMockAssignments = (studentId: string): ActivityAssignment[] => [
  {
    id: 'asn-001',
    worksheetId: 'ws-1024',
    studentId,
    assignedBy: 'teacher-01',
    assignedAt: '2026-05-10T09:00:00Z',
    dueDate: '2026-05-20T23:59:59Z',
    status: 'completed',
    statusUpdatedAt: '2026-05-18T14:30:00Z',
    score: 85,
    teacherNotes: 'Hece parkuru aktivitesinde başarılı. b/d harf karışıklığı azalmış.',
  },
  {
    id: 'asn-002',
    worksheetId: 'ws-1025',
    studentId,
    assignedBy: 'teacher-01',
    assignedAt: '2026-05-12T10:00:00Z',
    dueDate: '2026-05-22T23:59:59Z',
    status: 'in_progress',
    statusUpdatedAt: '2026-05-16T11:00:00Z',
    score: undefined,
    teacherNotes: 'Matematik temel toplama alıştırmaları. Görsel destek kullanıldı.',
  },
  {
    id: 'asn-003',
    worksheetId: 'ws-1026',
    studentId,
    assignedBy: 'teacher-01',
    assignedAt: '2026-05-14T08:30:00Z',
    dueDate: '2026-05-25T23:59:59Z',
    status: 'pending',
    statusUpdatedAt: '2026-05-14T08:30:00Z',
    teacherNotes: 'Okuma anlama: 5N1K soruları. Kısa metin ile başlanacak.',
  },
  {
    id: 'asn-004',
    worksheetId: 'ws-1027',
    studentId,
    assignedBy: 'teacher-01',
    assignedAt: '2026-05-15T13:00:00Z',
    dueDate: '2026-05-28T23:59:59Z',
    status: 'pending',
    statusUpdatedAt: '2026-05-15T13:00:00Z',
    teacherNotes: 'Görsel algı: Şekil tamamlama. 3x3 matris seviyesi.',
  },
  {
    id: 'asn-005',
    worksheetId: 'ws-1028',
    studentId,
    assignedBy: 'teacher-01',
    assignedAt: '2026-05-08T09:00:00Z',
    dueDate: '2026-05-15T23:59:59Z',
    status: 'completed',
    statusUpdatedAt: '2026-05-14T16:45:00Z',
    score: 92,
    teacherNotes: 'Fonolojik farkındalık: Hece sayma. Mükemmel performans!',
  },
  {
    id: 'asn-006',
    worksheetId: 'ws-1029',
    studentId,
    assignedBy: 'teacher-01',
    assignedAt: '2026-05-05T10:00:00Z',
    dueDate: '2026-05-12T23:59:59Z',
    status: 'completed',
    statusUpdatedAt: '2026-05-11T09:20:00Z',
    score: 78,
    teacherNotes: 'Dikkat egzersizi: Stroop testi. Süre içinde tamamlandı.',
  },
];

export const generateMockWorksheets = (studentId: string): SavedWorksheet[] => [
  {
    id: 'ws-1024',
    userId: 'teacher-01',
    studentId,
    name: 'Hece Parkuru — Seviye 3',
    activityType: 'SYLLABLE_TRAIN' as any,
    worksheetData: [
      {
        title: 'Hece Parkuru',
        instruction: 'Kelimeleri hecelerine ayırın ve renklendirin.',
        pedagogicalNote: 'Hece farkındalığını geliştirmek için renk kodlama kullanın.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Bu aktivitede kelimeleri hecelerine ayıracağız!', weight: 10 },
          { id: 'b2', type: 'question', content: 'Elma kelimesini hecelerine ayırın', weight: 20 },
        ]
      }
    ],
    createdAt: '2026-05-10T09:00:00Z',
    icon: 'fa-road',
    category: { id: 'cat-phonology', title: 'Fonolojik Farkındalık' },
  },
  {
    id: 'ws-1025',
    userId: 'teacher-01',
    studentId,
    name: 'Temel Toplama — Görsel Destekli',
    activityType: 'VISUAL_ARITHMETIC' as any,
    worksheetData: [
      {
        title: 'Görsel Toplama',
        instruction: 'Görselleri sayarak toplama işlemini yapın.',
        pedagogicalNote: 'Görsel destek matematik kaygısını azaltır.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Aşağıdaki görselleri sayıp toplamını bulalım!', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-05-12T10:00:00Z',
    icon: 'fa-plus',
    category: { id: 'cat-math', title: 'Matematik' },
  },
  {
    id: 'ws-1026',
    userId: 'teacher-01',
    studentId,
    name: '5N1K Okuma Anlama',
    activityType: 'FIVE_W_ONE_H' as any,
    worksheetData: [
      {
        title: '5N1K Metni',
        instruction: 'Metni okuyun ve 5N1K sorularını cevaplayın.',
        pedagogicalNote: 'Okuma anlama için 5N1K stratejisini kullanın.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Bir gün ormanda küçük bir kedi geziyordu...', weight: 30 },
        ]
      }
    ],
    createdAt: '2026-05-14T08:30:00Z',
    icon: 'fa-book-open',
    category: { id: 'cat-reading', title: 'Okuma Anlama' },
  },
  {
    id: 'ws-1027',
    userId: 'teacher-01',
    studentId,
    name: 'Şekil Tamamlama — 3x3 Matris',
    activityType: 'PATTERN_COMPLETION' as any,
    worksheetData: [
      {
        title: 'Şekil Tamamlama',
        instruction: 'Eksik şekli bulun ve tamamlayın.',
        pedagogicalNote: 'Görsel algı ve mantık yürütme becerilerini geliştirir.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Aşağıdaki 3x3 matriste eksik şekli bulalım!', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-05-15T13:00:00Z',
    icon: 'fa-shapes',
    category: { id: 'cat-visual', title: 'Görsel Algı' },
  },
  {
    id: 'ws-1028',
    userId: 'teacher-01',
    studentId,
    name: 'Hece Sayma — Kolay Seviye',
    activityType: 'PHONOLOGICAL_AWARENESS' as any,
    worksheetData: [
      {
        title: 'Hece Sayma',
        instruction: 'Kelimelerin kaç heceden oluştuğunu sayın.',
        pedagogicalNote: 'Hece sayma fonolojik farkındalığın temelidir.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Aşağıdaki kelimelerin kaç heceden oluştuğunu bulalım!', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-05-08T09:00:00Z',
    icon: 'fa-calculator',
    category: { id: 'cat-phonology', title: 'Fonolojik Farkındalık' },
  },
  {
    id: 'ws-1029',
    userId: 'teacher-01',
    studentId,
    name: 'Stroop Dikkat Testi',
    activityType: 'STROOP_TEST' as any,
    worksheetData: [
      {
        title: 'Stroop Testi',
        instruction: 'Renk isimlerini okuyun ancak yazı rengini söyleyin!',
        pedagogicalNote: 'Seçici dikkat ve engelleme becerilerini geliştirir.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Stroop testine hazır mısın?', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-05-05T10:00:00Z',
    icon: 'fa-eye',
    category: { id: 'cat-attention', title: 'Dikkat ve Odaklanma' },
  },
  {
    id: 'ws-1030',
    userId: 'teacher-01',
    studentId,
    name: 'b/d Harf Ayırt Etme',
    activityType: 'LETTER_DISCRIMINATION' as any,
    worksheetData: [
      {
        title: 'b/d Harf Ayırt Etme',
        instruction: 'b ve d harflerini ayırt edin ve işaretleyin.',
        pedagogicalNote: 'Görsel ipuçları (topa-vatka) kullanın.',
        blocks: [
          { id: 'b1', type: 'text', content: 'b ve d harflerini ayırt edelim!', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-05-03T11:00:00Z',
    icon: 'fa-font',
    category: { id: 'cat-phonology', title: 'Fonolojik Farkındalık' },
  },
  {
    id: 'ws-1031',
    userId: 'teacher-01',
    studentId,
    name: 'Hikaye Tamamlama — Yaratıcı Yazma',
    activityType: 'STORY_COMPREHENSION' as any,
    worksheetData: [
      {
        title: 'Hikaye Tamamlama',
        instruction: 'Hikayenin sonunu yaratıcı bir şekilde tamamlayın.',
        pedagogicalNote: 'Yaratıcı yazma özgüveni artırır.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Bir gün ormanda küçük bir kedi geziyordu...', weight: 30 },
        ]
      }
    ],
    createdAt: '2026-04-28T14:00:00Z',
    icon: 'fa-pen-fancy',
    category: { id: 'cat-creative', title: 'Yaratıcı Yazarlık' },
  },
  {
    id: 'ws-1032',
    userId: 'teacher-01',
    studentId,
    name: 'Sayı Doğrusu — 0-20 Arası',
    activityType: 'INFOGRAPHIC_NUMBER_LINE' as any,
    worksheetData: [
      {
        title: 'Sayı Doğrusu',
        instruction: 'Sayıları doğru konumlara yerleştirin.',
        pedagogicalNote: 'Sayı doğrusu sayı hissini geliştirir.',
        blocks: [
          { id: 'b1', type: 'text', content: '0-20 arası sayıları doğru yerlere koyalım!', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-04-25T09:30:00Z',
    icon: 'fa-ruler-horizontal',
    category: { id: 'cat-math', title: 'Matematik' },
  },
  {
    id: 'ws-1033',
    userId: 'teacher-01',
    studentId,
    name: 'Eş Anlamlı Kelime Eşleştirme',
    activityType: 'SYNONYM_ANTONYM_MATCH' as any,
    worksheetData: [
      {
        title: 'Eş Anlamlılar',
        instruction: 'Eş anlamlı kelimeleri eşleştirin.',
        pedagogicalNote: 'Kelime dağarcığını genişletir.',
        blocks: [
          { id: 'b1', type: 'text', content: 'Aşağıdaki eş anlamlı kelimeleri eşleştirelim!', weight: 10 },
        ]
      }
    ],
    createdAt: '2026-04-20T10:00:00Z',
    icon: 'fa-link',
    category: { id: 'cat-vocabulary', title: 'Kelime Dağarcığı' },
  },
];

export const generateMockAssessments = (studentId: string): SavedAssessment[] => [
  {
    id: 'asm-001',
    userId: 'teacher-01',
    studentId,
    studentName: 'Öğrenci',
    gender: 'Erkek',
    age: 8,
    grade: '2. Sınıf',
    createdAt: '2026-05-15T10:00:00Z',
    report: {
      overallSummary: 'Öğrencinin görsel-uzamsal becerileri yaş düzeyinin üzerinde. Fonolojik farkındalık alanında destek ihtiyacı devam ediyor.',
      scores: { attention: 72, spatial: 85, memory: 68, logic: 78, phonological: 55, visualSearch: 80 },
      chartData: [
        { label: 'Dikkat', value: 72, fullMark: 100 },
        { label: 'Görsel Algı', value: 85, fullMark: 100 },
        { label: 'Bellek', value: 68, fullMark: 100 },
        { label: 'Mantık', value: 78, fullMark: 100 },
        { label: 'Fonolojik', value: 55, fullMark: 100 },
        { label: 'Görsel Arama', value: 80, fullMark: 100 },
      ],
      analysis: {
        strengths: ['Görsel-uzamsal ilişkiler', 'Şekil tamamlama', 'Mantıksal çıkarım'],
        weaknesses: ['Fonolojik farkındalık', 'Hece ayırt etme', 'Sesbilgisel işlemleme'],
        errorAnalysis: ['b/d harf karışıklığı devam ediyor', 'Çok heceli kelimelerde hece bölme zorluğu'],
      },
      roadmap: [
        { activityId: 'syllable_path', reason: 'Fonolojik farkındalık geliştirme', frequency: 'Haftada 3' },
        { activityId: 'letter_discrimination', reason: 'Harf ayırt etme becerisi', frequency: 'Haftada 2' },
      ],
    },
  },
  {
    id: 'asm-002',
    userId: 'teacher-01',
    studentId,
    studentName: 'Öğrenci',
    gender: 'Erkek',
    age: 8,
    grade: '2. Sınıf',
    createdAt: '2026-04-10T10:00:00Z',
    report: {
      overallSummary: 'İlk değerlendirme. Görsel algı güçlü, fonolojik işlemleme desteğe ihtiyaç duyuyor.',
      scores: { attention: 65, spatial: 78, memory: 60, logic: 70, phonological: 45, visualSearch: 72 },
      chartData: [
        { label: 'Dikkat', value: 65, fullMark: 100 },
        { label: 'Görsel Algı', value: 78, fullMark: 100 },
        { label: 'Bellek', value: 60, fullMark: 100 },
        { label: 'Mantık', value: 70, fullMark: 100 },
        { label: 'Fonolojik', value: 45, fullMark: 100 },
        { label: 'Görsel Arama', value: 72, fullMark: 100 },
      ],
      analysis: {
        strengths: ['Görsel algı', 'Mantık yürütme'],
        weaknesses: ['Fonolojik farkındalık', 'Dikkat süresi', 'İşlem hızı'],
        errorAnalysis: ['Tek heceli kelimelerde bile hece bölme hatası', 'Renk-isim çakışmasında yavaş tepki'],
      },
      roadmap: [
        { activityId: 'syllable_counting', reason: 'Temel fonolojik farkındalık', frequency: 'Haftada 4' },
        { activityId: 'attention_exercise', reason: 'Dikkat süresi uzatma', frequency: 'Haftada 3' },
      ],
    },
  },
  {
    id: 'asm-003',
    userId: 'teacher-01',
    studentId,
    studentName: 'Öğrenci',
    gender: 'Erkek',
    age: 8,
    grade: '2. Sınıf',
    createdAt: '2026-03-05T10:00:00Z',
    report: {
      overallSummary: 'Başlangıç değerlendirmesi. Tüm alanlarda destek planı oluşturuldu.',
      scores: { attention: 58, spatial: 70, memory: 55, logic: 62, phonological: 40, visualSearch: 65 },
      chartData: [
        { label: 'Dikkat', value: 58, fullMark: 100 },
        { label: 'Görsel Algı', value: 70, fullMark: 100 },
        { label: 'Bellek', value: 55, fullMark: 100 },
        { label: 'Mantık', value: 62, fullMark: 100 },
        { label: 'Fonolojik', value: 40, fullMark: 100 },
        { label: 'Görsel Arama', value: 65, fullMark: 100 },
      ],
      analysis: {
        strengths: ['Görsel algı potansiyeli'],
        weaknesses: ['Fonolojik farkındalık', 'Dikkat', 'Bellek', 'İşlem hızı'],
        errorAnalysis: ['Harf seslerini eşleştirmede zorluk', 'Yönergeleri takip etmede tekrar gerekiyor'],
      },
      roadmap: [
        { activityId: 'phonological_awareness', reason: 'Temel ses farkındalığı', frequency: 'Günlük' },
        { activityId: 'memory_exercise', reason: 'Çalışan bellek güçlendirme', frequency: 'Haftada 3' },
      ],
    },
  },
];

export const generateMockCurriculums = (studentId: string): EnrichedCurriculum[] => [
  {
    id: 'cur-001',
    studentId,
    studentName: 'Öğrenci',
    grade: '2. Sınıf',
    startDate: '2026-05-01',
    durationDays: 60,
    goals: [
      'Fonolojik farkındalık seviyesini %40\'tan %65\'e çıkarmak',
      'b/d harf ayırt etme doğruluğunu %90\'a ulaştırmak',
      'Okuma akıcılığını dakikada 45 kelimeye çıkarmak',
      'Dikkat süresini 15 dakikaya uzatmak',
    ],
    schedule: [
      { day: 1, focus: 'Fonolojik Farkındalık', activities: [{ id: 'a1', activityId: 'syllable_counting', title: 'Hece Sayma', duration: 15, goal: 'Tek hece tanıma', difficultyLevel: 'Kolay', status: 'completed' }], isCompleted: true },
      { day: 2, focus: 'Harf Ayırt Etme', activities: [{ id: 'a2', activityId: 'letter_discrimination', title: 'b/d Ayırt Etme', duration: 15, goal: 'Harf tanıma', difficultyLevel: 'Kolay', status: 'completed' }], isCompleted: true },
      { day: 3, focus: 'Dikkat', activities: [{ id: 'a3', activityId: 'attention_exercise', title: 'Stroop Testi', duration: 10, goal: 'Odaklanma', difficultyLevel: 'Orta', status: 'completed' }], isCompleted: true },
      { day: 4, focus: 'Okuma Anlama', activities: [{ id: 'a4', activityId: 'reading_comprehension', title: '5N1K', duration: 20, goal: 'Metin anlama', difficultyLevel: 'Orta', status: 'completed' }], isCompleted: true },
      { day: 5, focus: 'Matematik', activities: [{ id: 'a5', activityId: 'basic_addition', title: 'Toplama', duration: 15, goal: 'İşlem becerisi', difficultyLevel: 'Kolay', status: 'completed' }], isCompleted: true },
      { day: 6, focus: 'Fonolojik Farkındalık', activities: [{ id: 'a6', activityId: 'syllable_path', title: 'Hece Parkuru', duration: 15, goal: 'Hece bölme', difficultyLevel: 'Orta', status: 'completed' }], isCompleted: true },
      { day: 7, focus: 'Görsel Algı', activities: [{ id: 'a7', activityId: 'pattern_completion', title: 'Şekil Tamamlama', duration: 15, goal: 'Görsel tamamlama', difficultyLevel: 'Orta', status: 'completed' }], isCompleted: true },
      { day: 8, focus: 'Dikkat', activities: [{ id: 'a8', activityId: 'attention_exercise', title: 'Seçici Dikkat', duration: 10, goal: 'Dikkat seçiciliği', difficultyLevel: 'Orta', status: 'in_progress' }], isCompleted: false },
      { day: 9, focus: 'Okuma', activities: [{ id: 'a9', activityId: 'reading_comprehension', title: 'Metin Analizi', duration: 20, goal: 'Çıkarım yapma', difficultyLevel: 'Orta', status: 'pending' }], isCompleted: false },
      { day: 10, focus: 'Matematik', activities: [{ id: 'a10', activityId: 'number_line', title: 'Sayı Doğrusu', duration: 15, goal: 'Sayı sıralama', difficultyLevel: 'Kolay', status: 'pending' }], isCompleted: false },
    ],
    note: 'Sarmal öğrenme yaklaşımı ile fonolojik farkındalık öncelikli. Görsel destek her aktivitede kullanılmalı.',
    interests: ['Uzay', 'Dinozorlar', 'Lego'],
    weaknesses: ['Fonolojik farkındalık', 'Harf ayırt etme', 'Dikkat süresi'],
    revisions: [
      { id: 'rev-001', date: '2026-05-10', author: 'Öğretmen A.', changeDescription: 'Dikkat aktivite süresi 10 dakikaya düşürüldü', previousValue: '20 dakika', newValue: '10 dakika' },
      { id: 'rev-002', date: '2026-05-05', author: 'Öğretmen A.', changeDescription: 'Matematik hedefi eklendi', previousValue: '3 hedef', newValue: '4 hedef' },
    ],
    lastReviewed: '2026-05-10',
    nextReview: '2026-05-24',
  } as unknown as EnrichedCurriculum,
  {
    id: 'cur-002',
    studentId,
    studentName: 'Öğrenci',
    grade: '2. Sınıf',
    startDate: '2026-03-01',
    durationDays: 60,
    goals: [
      'Fonolojik farkındalık temel seviyeye getirmek',
      'Harf seslerini tanıma becerisi kazandırmak',
    ],
    schedule: [
      { day: 1, focus: 'Fonolojik', activities: [{ id: 'b1', activityId: 'phonological_awareness', title: 'Ses Farkındalığı', duration: 10, goal: 'Ses tanıma', difficultyLevel: 'Kolay', status: 'completed' }], isCompleted: true },
      { day: 2, focus: 'Harfler', activities: [{ id: 'b2', activityId: 'letter_discrimination', title: 'Harf Tanıma', duration: 10, goal: 'Harf sesleri', difficultyLevel: 'Kolay', status: 'completed' }], isCompleted: true },
    ],
    note: 'Başlangıç planı. Temel becerilere odaklanıldı.',
    interests: ['Oyun', 'Resim'],
    weaknesses: ['Fonolojik farkındalık'],
    revisions: [],
    lastReviewed: '2026-04-30',
    nextReview: '2026-05-01',
  } as unknown as EnrichedCurriculum,
];

export const generateMockIEPGoals = (studentId: string): IEPGoal[] => [
  {
    id: 'iep-001',
    category: 'academic',
    title: 'Fonolojik Farkındalık Geliştirme',
    description: 'Öğrencinin hece bölme ve ses farkındalığı becerilerini geliştirmek.',
    baseline: { description: 'Tek heceli kelimelerde %40 doğruluk', measurementDate: '2026-03-01', measurementMethod: 'test' },
    shortTermObjective: 'Çok heceli kelimelerde hece bölme doğruluğunu %60\'a çıkarmak',
    successCriteria: '10 kelimeden 6\'sını doğru hecelere ayırabilmek',
    targetDate: '2026-06-30',
    status: 'in_progress',
    progress: 62,
    priority: 'high',
    strategies: ['Renkli hece vurgulama', 'El ile hece sayma', 'Görsel destekli kartlar'],
    resources: ['Hece Parkuru aktivitesi', 'Hece Sayma çalışma kağıdı'],
    evaluationMethod: 'test',
    notes: 'İlerleme kaydediliyor. Görsel destek çok etkili.',
    reviews: [
      { id: 'r1', date: '2026-04-15', reviewer: 'Öğretmen A.', comment: '%50\'ye ulaştı', progressSnapshot: 50 },
      { id: 'r2', date: '2026-05-15', reviewer: 'Öğretmen A.', comment: '%62\'ye yükseldi', progressSnapshot: 62 },
    ],
  },
  {
    id: 'iep-002',
    category: 'academic',
    title: 'Harf Ayırt Etme (b/d)',
    description: 'b ve d harflerini karıştırmadan tanıyabilme.',
    baseline: { description: 'b/d harflerini %30 doğrulukla ayırt edebiliyor', measurementDate: '2026-03-01', measurementMethod: 'observation' },
    shortTermObjective: 'b/d harflerini %75 doğrulukla ayırt edebilmek',
    successCriteria: '20 harf kartından 15\'ini doğru sınıflandırmak',
    targetDate: '2026-06-15',
    status: 'in_progress',
    progress: 70,
    priority: 'high',
    strategies: ['Görsel ipuçları (topa-vatka)', 'Dokunsal harf kartları', 'Çok duyulu öğrenme'],
    resources: ['b/d Harf Ayırt Etme çalışma kağıdı'],
    evaluationMethod: 'checklist',
    notes: 'Görsel ipuçları çok faydalı oldu.',
    reviews: [
      { id: 'r3', date: '2026-04-20', reviewer: 'Öğretmen A.', comment: '%55 doğruluk', progressSnapshot: 55 },
      { id: 'r4', date: '2026-05-12', reviewer: 'Öğretmen A.', comment: '%70 doğruluk', progressSnapshot: 70 },
    ],
  },
  {
    id: 'iep-003',
    category: 'behavioral',
    title: 'Dikkat Süresi Uzatma',
    description: 'Tek bir aktivitede odaklanma süresini kademeli olarak artırmak.',
    baseline: { description: 'Maksimum 8 dakika odaklanabiliyor', measurementDate: '2026-03-01', measurementMethod: 'observation' },
    shortTermObjective: '15 dakika kesintisiz odaklanma',
    successCriteria: '15 dakika boyunca aktiviteden çıkmadan tamamlamak',
    targetDate: '2026-07-01',
    status: 'in_progress',
    progress: 55,
    priority: 'medium',
    strategies: ['Pomodoro tekniği (5+2)', 'Görsel zamanlayıcı', 'Hareket molaları'],
    resources: ['Stroop Testi', 'Seçici Dikkat aktiviteleri'],
    evaluationMethod: 'observation',
    notes: '5+2 pomodoro yöntemi işe yarıyor.',
    reviews: [
      { id: 'r5', date: '2026-05-01', reviewer: 'Öğretmen A.', comment: '12 dakikaya ulaştı', progressSnapshot: 55 },
    ],
  },
  {
    id: 'iep-004',
    category: 'academic',
    title: 'Okuma Akıcılığı',
    description: 'Yaş seviyesine uygun metinleri akıcı okuma.',
    baseline: { description: 'Dakikada 25 kelime okuma hızı', measurementDate: '2026-03-01', measurementMethod: 'observation' },
    shortTermObjective: 'Dakikada 45 kelime okuma hızına ulaşmak',
    successCriteria: 'Seviye 2 metni dakikada 45+ kelime ile okumak',
    targetDate: '2026-07-15',
    status: 'in_progress',
    progress: 48,
    priority: 'high',
    strategies: ['Tekrarlı okuma', 'Eşli okuma', 'Sesli geri bildirim'],
    resources: ['5N1K Okuma Anlama metinleri'],
    evaluationMethod: 'observation',
    notes: 'Dakikada 37 kelimeye ulaştı.',
    reviews: [
      { id: 'r6', date: '2026-05-10', reviewer: 'Öğretmen A.', comment: '37 kelime/dk', progressSnapshot: 48 },
    ],
  },
];

export const generateMockGrades = (studentId: string): GradeEntry[] => [
  { id: 'g1', subject: 'Türkçe', topic: 'Hece Bilgisi', type: 'exam', score: 72, maxScore: 100, date: '2026-05-12', weight: 1, teacherFeedback: 'Gelişim var, hece bölmede ilerleme kaydediyor.', classAverage: 78 },
  { id: 'g2', subject: 'Matematik', topic: 'Toplama', type: 'exam', score: 88, maxScore: 100, date: '2026-05-10', weight: 1, teacherFeedback: 'Görsel destekle çok başarılı.', classAverage: 82 },
  { id: 'g3', subject: 'Türkçe', topic: 'Okuma Akıcılığı', type: 'quiz', score: 65, maxScore: 100, date: '2026-05-05', weight: 0.5, teacherFeedback: 'Hız artışı gözlemlendi.', classAverage: 75 },
  { id: 'g4', subject: 'Hayat Bilgisi', topic: 'Doğa Gözlemi', type: 'project', score: 90, maxScore: 100, date: '2026-04-28', weight: 1, teacherFeedback: 'Görsel sunumu mükemmeldi.', classAverage: 80 },
  { id: 'g5', subject: 'Matematik', topic: 'Çıkarma', type: 'exam', score: 82, maxScore: 100, date: '2026-04-20', weight: 1, teacherFeedback: 'İşlem sırası doğru.', classAverage: 76 },
  { id: 'g6', subject: 'Türkçe', topic: 'Harf Tanıma', type: 'quiz', score: 78, maxScore: 100, date: '2026-04-15', weight: 0.5, teacherFeedback: 'b/d karışıklığı azalmış.', classAverage: 85 },
  { id: 'g7', subject: 'Türkçe', topic: 'Hece Bilgisi', type: 'exam', score: 58, maxScore: 100, date: '2026-03-10', weight: 1, teacherFeedback: 'Destek gerekiyor.', classAverage: 78 },
  { id: 'g8', subject: 'Matematik', topic: 'Sayı Tanıma', type: 'exam', score: 75, maxScore: 100, date: '2026-03-05', weight: 1, teacherFeedback: 'Temel düzeyde.', classAverage: 80 },
];

export const generateMockBehaviorIncidents = (studentId: string): BehaviorIncident[] => [
  { id: 'bi1', date: '2026-05-15', type: 'positive', category: 'participation', points: 5, title: 'Aktif Katılım', description: 'Derste gönüllü olarak soru cevapladı.', actionTaken: 'Sözel takdir.', reportedBy: 'Öğretmen A.', location: 'Sınıf' },
  { id: 'bi2', date: '2026-05-12', type: 'positive', category: 'responsibility', points: 3, title: 'Ödev Tamamlama', description: 'Tüm ödevleri zamanında teslim etti.', actionTaken: 'Yıldız etiketi verildi.', reportedBy: 'Öğretmen A.', location: 'Sınıf' },
  { id: 'bi3', date: '2026-05-08', type: 'negative', category: 'focus', points: -2, title: 'Dikkat Dağılması', description: 'Aktivite sırasında 3 kez dikkati dağıldı.', actionTaken: 'Kısa mola verildi.', reportedBy: 'Öğretmen A.', location: 'Sınıf' },
  { id: 'bi4', date: '2026-05-05', type: 'positive', category: 'teamwork', points: 4, title: 'Grup Çalışması', description: 'Grup arkadaşlarına yardım etti.', actionTaken: 'Takdir belgesi.', reportedBy: 'Öğretmen A.', location: 'Sınıf' },
  { id: 'bi5', date: '2026-04-28', type: 'positive', category: 'participation', points: 5, title: 'Sunum Başarısı', description: 'Hayat bilgisi sunumunu başarıyla yaptı.', actionTaken: 'Sınıf önünde takdir.', reportedBy: 'Öğretmen A.', location: 'Sınıf' },
  { id: 'bi6', date: '2026-04-20', type: 'negative', category: 'focus', points: -3, title: 'Aktivite Tamamlamama', description: 'Aktiviteyi yarım bıraktı.', actionTaken: 'Bireysel destek verildi.', reportedBy: 'Öğretmen A.', location: 'Sınıf' },
];

export const generateMockPortfolioItems = (studentId: string): PortfolioItem[] => [
  { id: 'pf1', title: 'Hece Parkuru Çalışması', description: 'Seviye 3 hece parkuru aktivitesi tamamlandı.', date: '2026-05-10', type: 'document', url: '#', tags: ['fonolojik', 'hece'], skillsDemonstrated: ['Hece Bölme', 'Ses Farkındalığı'], teacherComments: 'Başarılı ilerleme.', isPublic: true },
  { id: 'pf2', title: 'Matematik Toplama Alıştırması', description: 'Görsel destekli toplama aktivitesi.', date: '2026-05-12', type: 'document', url: '#', tags: ['matematik', 'toplama'], skillsDemonstrated: ['İşlem Becerisi', 'Görsel Düşünme'], teacherComments: 'Görsel destekle mükemmel.', isPublic: true },
  { id: 'pf3', title: 'Doğa Gözlemi Projesi', description: 'Bahar mevsimi gözlem raporu.', date: '2026-04-28', type: 'image', url: '#', tags: ['hayat bilgisi', 'gözlem'], skillsDemonstrated: ['Gözlem', 'Sunum'], teacherComments: 'Görsel sunumu çok yaratıcı.', isPublic: true },
  { id: 'pf4', title: 'Hikaye Tamamlama', description: 'Yaratıcı yazma aktivitesi.', date: '2026-04-20', type: 'document', url: '#', tags: ['yaratıcı', 'yazma'], skillsDemonstrated: ['Yaratıcılık', 'Yazma Becerisi'], teacherComments: 'Hayal gücü çok geniş.', isPublic: false },
];

export const generateMockClinicalNotes = (studentId: string): ClinicalNote[] => [
  // Baseline notes
  { id: 'cn-b1', category: 'baseline', date: '2026-03-01', title: 'İlk Değerlendirme Sonuçları', content: 'Öğrenci ilk değerlendirmeye alındı. Fonolojik farkındalık alanında %40 doğruluk oranı tespit edildi. b/d harf karışıklığı belirgin. Dikkat süresi maksimum 8 dakika. Görsel-uzamsal beceriler yaş düzeyinin üzerinde (%70). Okuma hızı dakikada 25 kelime.', author: 'Öğretmen A.', tags: ['değerlendirme', 'başlangıç', 'fonolojik'], priority: 'high' },
  { id: 'cn-b2', category: 'baseline', date: '2026-03-01', title: 'Güçlü Yönler Analizi', content: 'Görsel-uzamsal ilişkilerde güçlü. Şekil tamamlama ve mantıksal çıkarım becerileri yaş düzeyinde veya üzerinde. Görsel hafızası iyi. Lego ve uzay temalı aktivitelere ilgisi yüksek. Bu güçlü alanlar öğrenme sürecinde destek olarak kullanılmalı.', author: 'Öğretmen A.', tags: ['güçlü yönler', 'görsel', 'mantık'], priority: 'medium' },
  { id: 'cn-b3', category: 'baseline', date: '2026-03-01', title: 'Destek İhtiyacı Alanları', content: 'Fonolojik farkındalık (hece bölme, ses ayırt etme), harf ayırt etme (özellikle b/d), dikkat süresi ve okuma akıcılığı destek gerektiriyor. Çok duyulu öğrenme yaklaşımı öneriliyor.', author: 'Öğretmen A.', tags: ['destek ihtiyacı', 'fonolojik', 'dikkat'], priority: 'high' },

  // Progress notes
  { id: 'cn-p1', category: 'progress', date: '2026-04-15', title: 'İlk Ara Değerlendirme', content: 'Fonolojik farkındalık %40\'tan %50\'ye yükseldi. Hece parkuru aktivitesi çok etkili. b/d harf ayırt etme %30\'dan %55\'e çıktı. Görsel ipuçları (topa-vatka yöntemi) başarılı. Dikkat süresi 10 dakikaya ulaştı.', author: 'Öğretmen A.', tags: ['ilerleme', 'fonolojik', 'harf'], priority: 'high' },
  { id: 'cn-p2', category: 'progress', date: '2026-05-01', title: 'Pomodoro Tekniği Sonuçları', content: '5+2 pomodoro yöntemi ile dikkat süresi 12 dakikaya çıktı. Hareket molaları çok faydalı. Görsel zamanlayıcı kullanımı öğrenci tarafından benimsendi. Matematik alanında görsel destekle %88 başarı.', author: 'Öğretmen A.', tags: ['dikkat', 'pomodoro', 'matematik'], priority: 'medium' },
  { id: 'cn-p3', category: 'progress', date: '2026-05-15', title: 'Son İlerleme Durumu', content: 'Fonolojik farkındalık %62\'ye ulaştı. b/d ayırt etme %70. Okuma hızı dakikada 37 kelime. Dikkat süresi 13 dakika. Tüm alanlarda olumlu gelişme var. Görsel destek stratejisi her aktivitede kullanılmalı.', author: 'Öğretmen A.', tags: ['ilerleme', 'genel', 'okuma'], priority: 'high' },
  { id: 'cn-p4', category: 'progress', date: '2026-05-10', title: 'Matematik Başarısı', content: 'Görsel destekli toplama aktivitesinde %88 başarı. Sayı doğrusu kullanımı etkili. Çıkarma işleminde %82. Matematik alanında görsel-uzamsal güçlü yönü çok iyi kullanılıyor.', author: 'Öğretmen A.', tags: ['matematik', 'başarı', 'görsel'], priority: 'medium' },

  // Goal notes
  { id: 'cn-g1', category: 'goal', date: '2026-05-15', title: 'Kısa Vadeli Hedefler (Haziran 2026)', content: '1. Fonolojik farkındalığı %65\'e çıkarmak (hece bölme)\n2. b/d harf ayırt etmeyi %75\'e ulaştırmak\n3. Okuma hızını dakikada 45 kelimeye çıkarmak\n4. Dikkat süresini 15 dakikaya uzatmak\n5. Çok heceli kelimelerde hece bölme pratiği', author: 'Öğretmen A.', tags: ['kısa vadeli', 'hedef', 'haziran'], priority: 'high' },
  { id: 'cn-g2', category: 'goal', date: '2026-05-15', title: 'Orta Vadeli Hedefler (Eylül 2026)', content: '1. Okuma akıcılığını yaş düzeyine getirmek (dakikada 60 kelime)\n2. Tüm harfleri hatasız ayırt edebilmek\n3. Bağımsız okuma alışkanlığı kazandırmak\n4. Matematik işlemlerinde görsel desteği kademeli azaltmak\n5. Yazılı anlatım becerilerini geliştirmek', author: 'Öğretmen A.', tags: ['orta vadeli', 'hedef', 'eylül'], priority: 'high' },
  { id: 'cn-g3', category: 'goal', date: '2026-05-15', title: 'Uzun Vadeli Hedefler (2026-2027)', content: '1. Sınıf düzeyinde bağımsız okuma ve yazma\n2. Akademik özgüven geliştirme\n3. Öğrenme stratejilerini bağımsız kullanabilme\n4. Sosyal becerileri güçlendirme\n5. Aile katılımını artırma', author: 'Öğretmen A.', tags: ['uzun vadeli', 'hedef', 'yıllık'], priority: 'medium' },
];

export const getMaterialCategories = (worksheets: SavedWorksheet[]): MaterialCategory[] => {
  const categoryMap = new Map<string, { count: number }>();
  worksheets.forEach(ws => {
    const key = ws.category?.title || 'Genel';
    const existing = categoryMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(key, { count: 1 });
    }
  });

  const iconMap: Record<string, { icon: string; color: string }> = {
    'Fonolojik Farkındalık': { icon: 'fa-waveform-lines', color: 'text-emerald-500' },
    'Matematik': { icon: 'fa-calculator', color: 'text-blue-500' },
    'Okuma Anlama': { icon: 'fa-book-open', color: 'text-purple-500' },
    'Görsel Algı': { icon: 'fa-eye', color: 'text-amber-500' },
    'Dikkat ve Odaklanma': { icon: 'fa-bullseye', color: 'text-rose-500' },
    'Yaratıcı Yazarlık': { icon: 'fa-pen-fancy', color: 'text-indigo-500' },
    'Kelime Dağarcığı': { icon: 'fa-spell-check', color: 'text-teal-500' },
  };

  return Array.from(categoryMap.entries()).map(([label, data]) => {
    const meta = iconMap[label] || { icon: 'fa-folder', color: 'text-zinc-500' };
    return { id: label.toLowerCase().replace(/\s+/g, '-'), label, icon: meta.icon, color: meta.color, count: data.count };
  });
};
