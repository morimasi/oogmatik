import { AdvancedStudent } from '../types/student-advanced';

export const DUMMY_ADVANCED_STUDENTS: AdvancedStudent[] = [
  {
    id: 'std_adv_1',
    teacherId: 'teacher_1',
    name: 'Alperen Yılmaz',
    age: 10,
    grade: '4. Sınıf',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alperen',
    diagnosis: ['Dyslexia'],
    interests: ['Uzay', 'Robotik', 'Resim'],
    strengths: ['Görsel hafıza', 'Yaratıcı düşünme'],
    weaknesses: ['Heceleme', 'Hızlı okuma'],
    learningStyle: 'Görsel',
    createdAt: new Date().toISOString(),
    
    // Advanced Modules
    iep: {
      id: 'iep_1',
      studentId: 'std_adv_1',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      diagnosis: ['Disleksi'],
      strengths: ['Görsel sanatlar'],
      needs: ['Okuma akıcılığı'],
      status: 'active',
      lastUpdated: new Date().toISOString(),
      goals: [
        {
          id: 'goal_1',
          category: 'academic',
          title: 'Ses Farkındalığı',
          description: 'Karmaşık kelimelerdeki ses birimlerini %90 doğrulukla ayırt eder.',
          targetDate: '2026-05-15',
          status: 'in_progress',
          progress: 65,
          priority: 'high',
          strategies: ['Renkli heceleme', 'El-göz koordinasyonu'],
          resources: ['Hece kartları'],
          evaluationMethod: 'test',
          reviews: []
        }
      ],
      accommodations: ['Sınav süresi %25 uzatılır', 'Büyük punto kullanımı'],
      teamMembers: [{ role: 'Psikolog', name: 'Dr. Ayşe Can' }]
    },
    financial: {
      studentId: 'std_adv_1',
      balance: 1500,
      totalPaid: 4500,
      totalDue: 6000,
      currency: 'TRY',
      billingCycle: 'monthly',
      scholarshipRate: 10,
      transactions: [
        {
          id: 'tr_1',
          date: '2026-03-01',
          type: 'payment',
          amount: 1500,
          currency: 'TRY',
          description: 'Mart Ayı Taksidi',
          category: 'tuition',
          status: 'paid'
        }
      ],
      paymentPlan: []
    },
    attendance: {
      records: [],
      stats: {
        totalDays: 120,
        present: 115,
        absent: 3,
        late: 2,
        excused: 0,
        attendanceRate: 96,
        trend: 'stable'
      }
    },
    academic: {
      grades: [
        {
          id: 'g_1',
          subject: 'Türkçe',
          type: 'exam',
          score: 85,
          maxScore: 100,
          date: '2026-03-10',
          weight: 1
        }
      ],
      metrics: {
        gpa: 88,
        subjectAverages: { 'Türkçe': 85, 'Matematik': 92 },
        attendanceRate: 96,
        participationRate: 90,
        homeworkCompletionRate: 95,
        strongestSubject: 'Matematik',
        weakestSubject: 'Türkçe',
        recentTrend: 'up'
      }
    },
    behavior: {
      incidents: [
        {
          id: 'be_1',
          date: '2026-03-20',
          type: 'positive',
          category: 'focus',
          points: 10,
          title: 'Üstün Odaklanma',
          description: 'Bugünkü okuma çalışmasında 40 dakika kesintisiz odaklandı.',
          reportedBy: 'Bora Hoca'
        }
      ],
      score: 110
    },
    portfolio: [],
    aiProfile: {
      learningStyle: 'visual',
      strengthAnalysis: 'Görsel uyaranlara tepkisi çok hızlı. Şematik anlatımları hemen kavrıyor.',
      struggleAnalysis: 'Uzun metinlerde satır atlama eğilimi var. Takip cetveli kullanımı faydalı.',
      recommendedActivities: ['Görsel Hafıza Oyunları', 'Renkli Heceleme'],
      riskFactors: ['Okuma yorgunluğu', 'Satır takibinde zorlanma'],
      lastUpdated: new Date().toISOString()
    }
  }
];
