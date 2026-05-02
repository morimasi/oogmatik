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

  // Premium tema yardımcı fonksiyonları
  const getThemeClasses = () => {
    const isDark = theme === 'dark' || theme.includes('anthracite') || theme === 'oled-black';
    const isDyslexia = theme.includes('dyslexia');
    const isNature = theme === 'nature';
    const isOcean = theme === 'ocean';
    const isSpace = theme === 'space';
    
    return {
      // Modal ve Container
      modal: isDark 
        ? 'bg-zinc-900 border-zinc-700 shadow-2xl shadow-black/50' 
        : isDyslexia 
          ? 'bg-amber-50 border-amber-200 shadow-2xl shadow-amber-200/30' 
          : isNature
            ? 'bg-green-50 border-green-200 shadow-2xl shadow-green-200/30'
            : isOcean
              ? 'bg-blue-50 border-blue-200 shadow-2xl shadow-blue-200/30'
              : isSpace
                ? 'bg-slate-900 border-slate-700 shadow-2xl shadow-slate-900/50'
                : 'bg-white border-zinc-200 shadow-2xl shadow-zinc-200/20',
      
      // Header
      header: isDark 
        ? 'bg-zinc-800/95 border-zinc-700 backdrop-blur-sm' 
        : isDyslexia 
          ? 'bg-amber-100/95 border-amber-200 backdrop-blur-sm' 
          : isNature
            ? 'bg-green-100/95 border-green-200 backdrop-blur-sm'
            : isOcean
              ? 'bg-blue-100/95 border-blue-200 backdrop-blur-sm'
              : isSpace
                ? 'bg-slate-800/95 border-slate-700 backdrop-blur-sm'
                : 'bg-zinc-50/95 border-zinc-200 backdrop-blur-sm',
      
      // Cards
      card: isDark 
        ? 'bg-zinc-800/90 border-zinc-700' 
        : isDyslexia 
          ? 'bg-amber-50/90 border-amber-300' 
          : isNature
            ? 'bg-green-50/90 border-green-300'
            : isOcean
              ? 'bg-blue-50/90 border-blue-300'
              : isSpace
                ? 'bg-slate-800/90 border-slate-700'
                : 'bg-white/90 border-zinc-200',
      
      // Text
      text: isDark 
        ? 'text-zinc-100 font-lexend' 
        : isDyslexia 
          ? 'text-amber-900 font-lexend' 
          : isNature
            ? 'text-green-900 font-lexend'
            : isOcean
              ? 'text-blue-900 font-lexend'
              : isSpace
                ? 'text-slate-100 font-lexend'
                : 'text-zinc-900 font-lexend',
      
      subtext: isDark 
        ? 'text-zinc-400 font-lexend' 
        : isDyslexia 
          ? 'text-amber-700 font-lexend' 
          : isNature
            ? 'text-green-700 font-lexend'
            : isOcean
              ? 'text-blue-700 font-lexend'
              : isSpace
                ? 'text-slate-400 font-lexend'
                : 'text-zinc-600 font-lexend',
      
      // Buttons
      button: isDark 
        ? 'bg-zinc-700/80 hover:bg-zinc-600/80 text-zinc-100 border-zinc-600 font-lexend' 
        : isDyslexia 
          ? 'bg-amber-200/80 hover:bg-amber-300/80 text-amber-900 border-amber-300 font-lexend' 
          : isNature
            ? 'bg-green-200/80 hover:bg-green-300/80 text-green-900 border-green-300 font-lexend'
            : isOcean
              ? 'bg-blue-200/80 hover:bg-blue-300/80 text-blue-900 border-blue-300 font-lexend'
              : isSpace
                ? 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-100 border-slate-600 font-lexend'
                : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-900 border-zinc-300 font-lexend',
      
      buttonPrimary: isDark 
        ? 'bg-blue-600 hover:bg-blue-700 text-white font-lexend shadow-lg shadow-blue-600/30' 
        : isDyslexia 
          ? 'bg-green-600 hover:bg-green-700 text-white font-lexend shadow-lg shadow-green-600/30' 
          : isNature
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-lexend shadow-lg shadow-emerald-600/30'
            : isOcean
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white font-lexend shadow-lg shadow-cyan-600/30'
              : isSpace
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-lexend shadow-lg shadow-indigo-600/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white font-lexend shadow-lg shadow-blue-600/30',
      
      // Input
      input: isDark 
        ? 'bg-zinc-800/80 border-zinc-600 text-zinc-100 placeholder-zinc-500 font-lexend' 
        : isDyslexia 
          ? 'bg-amber-100/80 border-amber-300 text-amber-900 placeholder-amber-600 font-lexend' 
          : isNature
            ? 'bg-green-100/80 border-green-300 text-green-900 placeholder-green-600 font-lexend'
            : isOcean
              ? 'bg-blue-100/80 border-blue-300 text-blue-900 placeholder-blue-600 font-lexend'
              : isSpace
                ? 'bg-slate-800/80 border-slate-600 text-slate-100 placeholder-slate-500 font-lexend'
                : 'bg-white/80 border-zinc-300 text-zinc-900 placeholder-zinc-500 font-lexend',
      
      // Tabs
      tabActive: isDark 
        ? 'bg-zinc-700 text-zinc-100 border-zinc-600 font-lexend shadow-sm' 
        : isDyslexia 
          ? 'bg-amber-200 text-amber-900 border-amber-400 font-lexend shadow-sm' 
          : isNature
            ? 'bg-green-200 text-green-900 border-green-400 font-lexend shadow-sm'
            : isOcean
              ? 'bg-blue-200 text-blue-900 border-blue-400 font-lexend shadow-sm'
              : isSpace
                ? 'bg-slate-700 text-slate-100 border-slate-600 font-lexend shadow-sm'
                : 'bg-white text-zinc-900 border-zinc-300 font-lexend shadow-sm',
      
      tabInactive: isDark 
        ? 'text-zinc-400 hover:text-zinc-200 font-lexend' 
        : isDyslexia 
          ? 'text-amber-600 hover:text-amber-800 font-lexend' 
          : isNature
            ? 'text-green-600 hover:text-green-800 font-lexend'
            : isOcean
              ? 'text-blue-600 hover:text-blue-800 font-lexend'
              : isSpace
                ? 'text-slate-400 hover:text-slate-200 font-lexend'
                : 'text-zinc-600 hover:text-zinc-900 font-lexend',
      
      // Gradient
      gradient: isDark 
        ? 'from-zinc-800 to-zinc-900' 
        : isDyslexia 
          ? 'from-amber-100 to-amber-50' 
          : isNature
            ? 'from-green-100 to-green-50'
            : isOcean
              ? 'from-blue-100 to-blue-50'
              : isSpace
                ? 'from-slate-800 to-slate-900'
                : 'from-zinc-50 to-white',
      
      // Risk Colors
      riskLow: isDark ? 'text-green-400 bg-green-900/30 border-green-700' : 
               isDyslexia ? 'text-green-700 bg-green-100/70 border-green-400' :
               isNature ? 'text-green-700 bg-green-100/70 border-green-400' :
               isOcean ? 'text-cyan-700 bg-cyan-100/70 border-cyan-400' :
               'text-green-600 bg-green-50 border-green-200',
      
      riskMedium: isDark ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700' : 
                  isDyslexia ? 'text-yellow-700 bg-yellow-100/70 border-yellow-400' :
                  isNature ? 'text-yellow-700 bg-yellow-100/70 border-yellow-400' :
                  isOcean ? 'text-orange-700 bg-orange-100/70 border-orange-400' :
                  'text-yellow-600 bg-yellow-50 border-yellow-200',
      
      riskHigh: isDark ? 'text-red-400 bg-red-900/30 border-red-700' : 
                isDyslexia ? 'text-red-700 bg-red-100/70 border-red-400' :
                isNature ? 'text-red-700 bg-red-100/70 border-red-400' :
                isOcean ? 'text-pink-700 bg-pink-100/70 border-pink-400' :
                'text-red-600 bg-red-50 border-red-200'
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
        <div className="bg-white p-4 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-zinc-500">Bu ay</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">24</p>
          <p className="text-xs text-zinc-600">Toplam Tarama</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs text-zinc-500">Riskli</span>
          </div>
          <p className="text-2xl font-bold text-red-600">8</p>
          <p className="text-xs text-zinc-600">Yüksek Risk</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-xs text-zinc-500">İyileşme</span>
          </div>
          <p className="text-2xl font-bold text-green-600">+15%</p>
          <p className="text-xs text-zinc-600">Ortalama Skor</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-zinc-500">Bekleyen</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">3</p>
          <p className="text-xs text-zinc-600">Değerlendirme</p>
        </div>
      </div>

      {/* Recent Screenings */}
      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="p-4 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">Son Taramalar</h3>
            <button
              onClick={() => setActiveView('new-screening')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Tarama
            </button>
          </div>
        </div>
        <div className="divide-y divide-zinc-200">
          {filteredData.slice(0, 5).map((item) => (
            <div key={item.id} className="p-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{item.studentName}</p>
                    <p className="text-xs text-zinc-500">{item.age} yaş • {item.grade}. sınıf</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}%
                    </p>
                    <p className="text-xs text-zinc-500">{item.date.toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(item.riskLevel)}`}>
                    {item.riskLevel === 'high' ? 'Yüksek' : item.riskLevel === 'medium' ? 'Orta' : 'Düşük'} Risk
                  </span>
                  <button
                    onClick={() => setCurrentScreening(item)}
                    className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                  >
                    <Eye className="w-4 h-4 text-zinc-600" />
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
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Yeni Tarama Başlat</h3>
        
        {/* Student Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 mb-2">Öğrenci Seç</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Öğrenci ara..."
              className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Ara
            </button>
          </div>
        </div>

        {/* Screening Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 mb-2">Tarama Türü</label>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 border-2 border-blue-500 bg-blue-50 rounded-lg text-left">
              <Brain className="w-5 h-5 text-blue-600 mb-2" />
              <p className="font-medium text-zinc-900">Bilişsel Tarama</p>
              <p className="text-xs text-zinc-600">Disleksi, DEHB, öğrenme güçlüğü</p>
            </button>
            <button className="p-3 border border-zinc-200 rounded-lg text-left hover:border-zinc-300">
              <Activity className="w-5 h-5 text-zinc-600 mb-2" />
              <p className="font-medium text-zinc-900">Gelişimsel Tarama</p>
              <p className="text-xs text-zinc-600">Motor, sosyal, duygusal beceriler</p>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            İptal
          </button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Taramayı Başlat
          </button>
        </div>
      </div>
    </div>
  );

  // History View
  const HistoryView = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Öğrenci ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tümü</option>
            <option value="completed">Tamamlandı</option>
            <option value="pending">Bekleyen</option>
            <option value="archived">Arşivlenmiş</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Öğrenci</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Skor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{item.studentName}</p>
                        <p className="text-xs text-zinc-500">{item.age} yaş</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {item.date.toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${getScoreColor(item.overallScore)}`}>
                      {item.overallScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(item.riskLevel)}`}>
                      {item.riskLevel === 'high' ? 'Yüksek' : item.riskLevel === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status === 'completed' ? 'Tamamlandı' : 
                       item.status === 'pending' ? 'Bekleyen' : 'Arşivlenmiş'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setCurrentScreening(item)}
                        className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                      >
                        <Eye className="w-3 h-3 text-zinc-600" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(item)}
                        className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                      >
                        <Download className="w-3 h-3 text-zinc-600" />
                      </button>
                      <button
                        onClick={() => handleShareResults(item.id)}
                        className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                      >
                        <Share2 className="w-3 h-3 text-zinc-600" />
                      </button>
                      <button
                        onClick={() => handleArchiveScreening(item.id)}
                        className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                      >
                        <Archive className="w-3 h-3 text-zinc-600" />
                      </button>
                      {onGeneratePlan && (
                        <button
                          onClick={() => onGeneratePlan(item)}
                          className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        >
                          <Target className="w-3 h-3 text-blue-600" />
                        </button>
                      )}
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-zinc-200">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Risk Dağılımı</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Düşük Risk</span>
              <span className="text-sm font-medium text-green-600">45%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Orta Risk</span>
              <span className="text-sm font-medium text-yellow-600">35%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Yüksek Risk</span>
              <span className="text-sm font-medium text-red-600">20%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Beceri Alanları</h3>
          <div className="space-y-3">
            {[
              { name: 'Okuma', score: 72, color: 'blue' },
              { name: 'Yazma', score: 68, color: 'green' },
              { name: 'Dikkat', score: 65, color: 'purple' },
              { name: 'Hafıza', score: 70, color: 'orange' }
            ].map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-600">{skill.name}</span>
                  <span className="text-sm font-medium text-zinc-900">{skill.score}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div className={`bg-${skill.color}-500 h-2 rounded-full`} style={{ width: `${skill.score}%` }} />
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
