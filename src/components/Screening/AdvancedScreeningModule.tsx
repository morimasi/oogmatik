import React, { useState, useEffect } from 'react';
import { X, Save, Share2, Download, Printer, Archive, Users, Brain, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, Target, BookOpen, Calendar, Filter, Search, Plus, Eye, Edit, Trash2, ChevronRight, Star, Award, BarChart3, PieChart, Activity, Phone } from 'lucide-react';
import { ScreeningProfile, ScreeningResult } from '../../types/screening';
import { useUIStore } from '../../store/useUIStore';

interface AdvancedScreeningModuleProps {
  onClose: () => void;
  userRole: 'teacher' | 'admin' | 'parent';
  studentId?: string;
  onGeneratePlan?: (data: any) => void;
}

export const AdvancedScreeningModule: React.FC<AdvancedScreeningModuleProps> = ({
  onClose,
  userRole,
  studentId,
  onGeneratePlan
}) => {
  const { theme, isSidebarOpen, setIsSidebarOpen } = useUIStore();
  const [activeView, setActiveView] = useState<'dashboard' | 'new-screening' | 'history' | 'analytics'>('dashboard');

  // Modal açıldığında sidebar'ı kapat
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Premium tema yardımcı fonksiyonları - Merkezi tema tokenlarına (theme-tokens.css) bağlı
  const getThemeClasses = () => {
    return {
      // Modal ve Container - Glassmorphism desteğiyle
      modal: 'bg-[var(--bg-paper)] border-[var(--border-color)] shadow-2xl backdrop-blur-md',
      
      // Header
      header: 'bg-[var(--surface-glass)] border-[var(--border-color)] backdrop-blur-xl',
      
      // Cards
      card: 'bg-[var(--bg-paper)] border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow duration-300',
      
      // Text
      text: 'text-[var(--text-primary)] font-lexend',
      subtext: 'text-[var(--text-secondary)] font-lexend',
      
      // Buttons
      button: 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] text-[var(--text-primary)] border-[var(--border-color)] font-lexend transition-all active:scale-95',
      buttonPrimary: 'bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-lexend shadow-lg shadow-[var(--accent-muted)] transition-all active:scale-95',
      
      // Input
      input: 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend focus:ring-2 focus:ring-[var(--accent-color)] outline-none',
      
      // Tabs
      tabActive: 'bg-[var(--bg-paper)] text-[var(--text-primary)] border-[var(--accent-color)] font-lexend shadow-sm border-b-2',
      tabInactive: 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-lexend hover:bg-[var(--surface-glass)]',
      
      // Risk Colors - Temaya göre otomatik ayarlanır, ancak kontrast için hafif opacity eklenir
      riskLow: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      riskMedium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      riskHigh: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    };
  };

  const themeClasses = getThemeClasses();
  const [screeningData, setScreeningData] = useState<ScreeningResult[]>([]);
  const [currentScreening, setCurrentScreening] = useState<ScreeningResult | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'archived'>('all');

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    const mockData: ScreeningResult[] = [
      {
        id: '1',
        studentId: 'student-1',
        studentName: 'Ali Yılmaz',
        age: 9,
        grade: '3',
        date: new Date('2024-01-15'),
        totalScore: 75,
        overallScore: 75,
        riskLevel: 'medium',
        status: 'completed',
        recommendations: ['Dikkat egzersizleri', 'Okuma pratiği'],
        strengths: ['Görsel algı', 'Mantıksal düşünme'],
        weaknesses: ['Phonological awareness', 'Hızlı okuma'],
        categoryScores: {
          reading: { score: 65, rawScore: 13, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta', findings: ['Okuma hızı düşük'], color: 'yellow' },
          writing: { score: 70, rawScore: 14, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük', findings: ['Yazım ok'], color: 'green' },
          language: { score: 80, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük', findings: [], color: 'green' },
          motor_spatial: { score: 75, rawScore: 15, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük', findings: [], color: 'green' },
          attention: { score: 80, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük', findings: [], color: 'green' },
          math: { score: 78, rawScore: 16, maxScore: 20, riskLevel: 'low', riskLabel: 'Düşük', findings: [], color: 'green' }
        },
        detailedResults: {
          reading: 65,
          writing: 70,
          attention: 80,
          memory: 75,
          visual: 85,
          auditory: 70
        },
        aiAnalysis: 'Öğrenci genel olarak ortalama performans gösteriyor.',
        generatedAt: '2024-01-15T10:00:00Z',
        respondentRole: 'teacher'
      },
      {
        id: '2',
        studentId: 'student-2',
        studentName: 'Ayşe Demir',
        age: 8,
        grade: '2',
        date: new Date('2024-01-20'),
        totalScore: 45,
        overallScore: 45,
        riskLevel: 'high',
        status: 'completed',
        recommendations: ['Yoğun destek', 'Bireysel eğitim planı'],
        strengths: ['Sosyal beceriler'],
        weaknesses: ['Okuma hızı', 'Yazım becerileri', 'Dikkat süresi'],
        categoryScores: {
          reading: { score: 40, rawScore: 8, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Okuma çok yavaş'], color: 'red' },
          writing: { score: 35, rawScore: 7, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Yazım zorluğu'], color: 'red' },
          language: { score: 45, rawScore: 9, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta', findings: ['Anlama sorunları'], color: 'yellow' },
          motor_spatial: { score: 50, rawScore: 10, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta', findings: ['Motor beceri zayıf'], color: 'yellow' },
          attention: { score: 45, rawScore: 9, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Dikkat süresi kısa'], color: 'red' },
          math: { score: 42, rawScore: 8, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Matematik zayıf'], color: 'red' }
        },
        detailedResults: {
          reading: 40,
          writing: 35,
          attention: 45,
          memory: 50,
          visual: 55,
          auditory: 45
        },
        aiAnalysis: 'Öğrenci yoğun destek ihtiyacı duymaktadır. Özel eğitim planı önerilir.',
        generatedAt: '2024-01-20T14:30:00Z',
        respondentRole: 'teacher'
      },
    ];
    setScreeningData(mockData);
  }, []);

  const handleSaveScreening = async () => {
    // Veritabanına kaydetme işlemi
    console.log('Tarama kaydediliyor...');
    // API call: POST /api/screening/save
  };

  const handleArchiveScreening = (id: string) => {
    setScreeningData(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'archived' } : item
    ));
  };

  const handleShareResults = (id: string) => {
    // Paylaşma işlevi
    console.log('Sonuçlar paylaşılıyor:', id);
  };

  const handleDownloadReport = (data: ScreeningResult) => {
    // PDF indirme işlevi
    console.log('Rapor indiriliyor:', data.studentName);
  };

  const handlePrintReport = (data: ScreeningResult) => {
    // Yazdırma işlevi
    window.print();
  };

  const handleAddToWorkbook = (data: ScreeningResult) => {
    // Çalışma kitabına ekleme
    console.log('Çalışma kitabına eklendi:', data.studentName);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return themeClasses.riskLow;
      case 'medium': return themeClasses.riskMedium;
      case 'high': return themeClasses.riskHigh;
      default: return themeClasses.riskMedium;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return themeClasses.riskLow.includes('green') || themeClasses.riskLow.includes('emerald') ? themeClasses.riskLow : themeClasses.riskLow;
    if (score >= 60) return themeClasses.riskMedium;
    return themeClasses.riskHigh;
  };

  const filteredData = screeningData.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className={`${themeClasses.card} p-4 rounded-xl border`}>
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>Bu ay</span>
          </div>
          <p className={`text-2xl font-black ${themeClasses.text}`}>24</p>
          <p className={`text-xs font-bold ${themeClasses.subtext}`}>Toplam Tarama</p>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border`}>
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>Riskli</span>
          </div>
          <p className="text-2xl font-black text-rose-500">8</p>
          <p className={`text-xs font-bold ${themeClasses.subtext}`}>Yüksek Risk</p>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>İyileşme</span>
          </div>
          <p className="text-2xl font-black text-emerald-500">+15%</p>
          <p className={`text-xs font-bold ${themeClasses.subtext}`}>Ortalama Skor</p>
        </div>
        <div className={`${themeClasses.card} p-4 rounded-xl border`}>
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>Bekleyen</span>
          </div>
          <p className="text-2xl font-black text-purple-500">3</p>
          <p className={`text-xs font-bold ${themeClasses.subtext}`}>Değerlendirme</p>
        </div>
      </div>

      {/* Recent Screenings */}
      <div className={`${themeClasses.card} rounded-xl border overflow-hidden`}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-black italic uppercase tracking-tighter ${themeClasses.text}`}>Son Taramalar</h3>
            <button
              onClick={() => setActiveView('new-screening')}
              className={`px-4 py-2 ${themeClasses.buttonPrimary} text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Yeni Tarama
            </button>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {filteredData.slice(0, 5).map((item) => (
            <div key={item.id} className={`p-4 hover:bg-[var(--surface-glass)] transition-colors ${currentScreening?.id === item.id ? 'bg-[var(--accent-muted)]' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
                    <Users className={`w-5 h-5 ${themeClasses.subtext}`} />
                  </div>
                  <div>
                    <p className={`font-black tracking-tight ${themeClasses.text}`}>{item.studentName}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${themeClasses.subtext}`}>{item.age} yaş • {item.grade}. sınıf</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-black ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}%
                    </p>
                    <p className={`text-[10px] font-bold ${themeClasses.subtext}`}>{item.date.toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getRiskLevelColor(item.riskLevel)}`}>
                    {item.riskLevel === 'high' ? 'Yüksek' : item.riskLevel === 'medium' ? 'Orta' : 'Düşük'} Risk
                  </span>
                  <button
                    onClick={() => setCurrentScreening(item)}
                    className={`w-10 h-10 rounded-xl ${themeClasses.button} flex items-center justify-center transition-all`}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // New Screening View
  const NewScreeningView = () => (
    <div className="space-y-4">
      <div className={`${themeClasses.card} rounded-[2.5rem] border p-8`}>
        <h3 className={`text-xl font-black italic uppercase tracking-tighter mb-6 ${themeClasses.text}`}>Yeni Tarama Başlat</h3>
        
        {/* Student Selection */}
        <div className="mb-8">
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${themeClasses.subtext}`}>Öğrenci Seç</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Öğrenci adı veya ID ile ara..."
              className={`flex-1 px-4 py-3 rounded-xl border ${themeClasses.input}`}
            />
            <button className={`px-8 py-3 ${themeClasses.buttonPrimary} text-xs font-black uppercase tracking-widest rounded-xl transition-all`}>
              Ara
            </button>
          </div>
        </div>

        {/* Screening Type */}
        <div className="mb-8">
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${themeClasses.subtext}`}>Tarama Türü</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-6 border-2 border-[var(--accent-color)] bg-[var(--accent-muted)] rounded-3xl text-left group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Brain className="w-20 h-20 text-[var(--accent-color)]" />
              </div>
              <Brain className="w-8 h-8 text-[var(--accent-color)] mb-4" />
              <p className={`text-lg font-black uppercase tracking-tighter italic ${themeClasses.text}`}>Bilişsel Tarama</p>
              <p className={`text-xs font-medium opacity-70 ${themeClasses.text}`}>Disleksi, DEHB, öğrenme güçlüğü risk analizi.</p>
            </button>
            <button className={`p-6 border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-3xl text-left hover:border-[var(--accent-color)]/30 transition-all group relative overflow-hidden`}>
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Activity className="w-20 h-20 text-[var(--text-primary)]" />
              </div>
              <Activity className={`w-8 h-8 ${themeClasses.subtext} mb-4`} />
              <p className={`text-lg font-black uppercase tracking-tighter italic ${themeClasses.text}`}>Gelişimsel Tarama</p>
              <p className={`text-xs font-medium opacity-70 ${themeClasses.text}`}>Motor, sosyal ve duygusal beceri takibi.</p>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest ${themeClasses.subtext} hover:text-[var(--text-primary)] transition-colors`}
          >
            Vazgeç
          </button>
          <button className={`px-10 py-4 ${themeClasses.buttonPrimary} text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all`}>
            Değerlendirmeyi Başlat
          </button>
        </div>
      </div>
    </div>
  );

  // History View
  const HistoryView = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className={`${themeClasses.card} rounded-2xl border p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.subtext}`} />
            <input
              type="text"
              placeholder="Öğrenci geçmişinde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${themeClasses.input} text-sm`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={`px-4 py-3 rounded-xl border ${themeClasses.input} text-xs font-black uppercase tracking-widest cursor-pointer`}
          >
            <option value="all">Tüm Kayıtlar</option>
            <option value="completed">Tamamlananlar</option>
            <option value="pending">Bekleyenler</option>
            <option value="archived">Arşivlenenler</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className={`${themeClasses.card} rounded-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.subtext}`}>Öğrenci</th>
                <th className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.subtext}`}>Tarih</th>
                <th className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.subtext}`}>Skor</th>
                <th className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.subtext}`}>Risk</th>
                <th className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.subtext}`}>Durum</th>
                <th className={`px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.subtext}`}>İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-glass)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-color)]">
                        <Users className={`w-5 h-5 ${themeClasses.subtext}`} />
                      </div>
                      <div>
                        <p className={`font-black tracking-tight ${themeClasses.text}`}>{item.studentName}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${themeClasses.subtext}`}>{item.age} yaş</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-xs font-bold ${themeClasses.subtext}`}>
                    {item.date.toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-base font-black ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getRiskLevelColor(item.riskLevel)}`}>
                      {item.riskLevel === 'high' ? 'Yüksek' : item.riskLevel === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                      item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {item.status === 'completed' ? 'Tamamlandı' : 
                       item.status === 'pending' ? 'Bekleyen' : 'Arşivli'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setCurrentScreening(item)}
                        className={`w-9 h-9 rounded-xl ${themeClasses.button} flex items-center justify-center transition-all`}
                        title="İncele"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(item)}
                        className={`w-9 h-9 rounded-xl ${themeClasses.button} flex items-center justify-center transition-all`}
                        title="İndir"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShareResults(item.id)}
                        className={`w-9 h-9 rounded-xl ${themeClasses.button} flex items-center justify-center transition-all`}
                        title="Paylaş"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveScreening(item.id)}
                        className={`w-9 h-9 rounded-xl ${themeClasses.button} flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-500`}
                        title="Arşivle"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Analytics View
  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${themeClasses.card} p-8 rounded-[2.5rem] border`}>
          <h3 className={`text-lg font-black italic uppercase tracking-tighter mb-6 ${themeClasses.text}`}>Risk Dağılımı (Global)</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>Düşük Risk</span>
                <span className="text-xs font-black text-emerald-500">45%</span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="bg-emerald-500 h-full rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>Orta Risk</span>
                <span className="text-xs font-black text-amber-500">35%</span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} className="bg-amber-500 h-full rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>Yüksek Risk</span>
                <span className="text-xs font-black text-rose-500">20%</span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="bg-rose-500 h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className={`${themeClasses.card} p-8 rounded-[2.5rem] border`}>
          <h3 className={`text-lg font-black italic uppercase tracking-tighter mb-6 ${themeClasses.text}`}>Beceri Alanları (Ortalama)</h3>
          <div className="space-y-6">
            {[
              { name: 'Okuma', score: 72, color: 'blue' },
              { name: 'Yazma', score: 68, color: 'emerald' },
              { name: 'Dikkat', score: 65, color: 'purple' },
              { name: 'Hafıza', score: 70, color: 'amber' }
            ].map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.subtext}`}>{skill.name}</span>
                  <span className={`text-xs font-black text-${skill.color}-500`}>{skill.score}%</span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${skill.score}%` }} className={`bg-${skill.color}-500 h-full rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.modal} rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border`}>
        {/* Header - Ultra Compact */}
        <div className={`${themeClasses.header} flex items-center justify-between p-4 border-b`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${themeClasses.text}`}>Tarama & Analiz Modülü</h2>
              <p className={`text-xs ${themeClasses.subtext}`}>Bilişsel değerlendirme ve analiz merkezi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentScreening && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSaveScreening()}
                  className={`w-8 h-8 rounded-lg ${themeClasses.button} flex items-center justify-center transition-all duration-200 hover:scale-105`}
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadReport(currentScreening)}
                  className={`w-8 h-8 rounded-lg ${themeClasses.button} flex items-center justify-center transition-all duration-200 hover:scale-105`}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePrintReport(currentScreening)}
                  className={`w-8 h-8 rounded-lg ${themeClasses.button} flex items-center justify-center transition-all duration-200 hover:scale-105`}
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShareResults(currentScreening.id)}
                  className={`w-8 h-8 rounded-lg ${themeClasses.button} flex items-center justify-center transition-all duration-200 hover:scale-105`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAddToWorkbook(currentScreening)}
                  className={`w-8 h-8 rounded-lg ${themeClasses.button} flex items-center justify-center transition-all duration-200 hover:scale-105`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg ${themeClasses.button} flex items-center justify-center transition-all duration-200 hover:scale-105`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex ${themeClasses.card} border-b`}>
          {[
            { id: 'dashboard', label: 'Panel', icon: BarChart3 },
            { id: 'new-screening', label: 'Yeni Tarama', icon: Plus },
            { id: 'history', label: 'Geçmiş', icon: Clock },
            { id: 'analytics', label: 'Analiz', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeView === tab.id
                    ? themeClasses.tabActive
                    : themeClasses.tabInactive
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className={`flex-1 p-6 overflow-y-auto ${themeClasses.card}`}>
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'new-screening' && <NewScreeningView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'analytics' && <AnalyticsView />}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${themeClasses.card}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className={`text-xs ${themeClasses.subtext}`}>Sistem Aktif</span>
              </div>
              <span className={`text-xs ${themeClasses.subtext}`}>Son senkronizasyon: 2 dakika önce</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${themeClasses.subtext}`}>Rol: {userRole === 'admin' ? 'Yönetici' : userRole === 'teacher' ? 'Öğretmen' : 'Veli'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
