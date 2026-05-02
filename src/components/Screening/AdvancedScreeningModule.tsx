import React, { useState, useEffect } from 'react';
import { X, Save, Share2, Download, Printer, Archive, Users, Brain, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, Target, BookOpen, Calendar, Filter, Search, Plus, Eye, Edit, Trash2, ChevronRight, Star, Award, BarChart3, PieChart, Activity, Phone } from 'lucide-react';
import { ScreeningProfile, ScreeningResult } from '../../types/screening';

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
  const [activeView, setActiveView] = useState<'dashboard' | 'new-screening' | 'history' | 'analytics'>('dashboard');
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
        overallScore: 75,
        riskLevel: 'medium',
        recommendations: ['Dikkat egzersizleri', 'Okuma pratiği'],
        strengths: ['Görsel algı', 'Mantıksal düşünme'],
        weaknesses: ['Phonological awareness', 'Hızlı okuma'],
        detailedResults: {
          reading: 65,
          writing: 70,
          attention: 80,
          memory: 75,
          visual: 85,
          auditory: 70
        }
      },
      {
        id: '2',
        studentId: 'student-2',
        studentName: 'Ayşe Demir',
        age: 8,
        grade: '2',
        date: new Date('2024-01-20'),
        overallScore: 45,
        riskLevel: 'high',
        recommendations: ['Yoğun destek', 'Bireysel eğitim planı'],
        strengths: ['Sosyal beceriler'],
        weaknesses: ['Okuma hızı', 'Yazım becerileri', 'Dikkat süresi'],
        detailedResults: {
          reading: 40,
          writing: 35,
          attention: 45,
          memory: 50,
          visual: 55,
          auditory: 45
        }
      }
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
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-zinc-200">
        {/* Header - Ultra Compact */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Tarama & Analiz Modülü</h2>
              <p className="text-xs text-zinc-500">Bilişsel değerlendirme ve analiz merkezi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentScreening && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSaveScreening()}
                  className="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                >
                  <Save className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleDownloadReport(currentScreening)}
                  className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handlePrintReport(currentScreening)}
                  className="w-8 h-8 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
                >
                  <Printer className="w-4 h-4 text-purple-600" />
                </button>
                <button
                  onClick={() => handleShareResults(currentScreening.id)}
                  className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-4 h-4 text-orange-600" />
                </button>
                <button
                  onClick={() => handleAddToWorkbook(currentScreening)}
                  className="w-8 h-8 rounded-lg bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-zinc-50 border-b border-zinc-200">
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
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-zinc-50">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'new-screening' && <NewScreeningView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'analytics' && <AnalyticsView />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-zinc-600">Sistem Aktif</span>
              </div>
              <span className="text-xs text-zinc-500">Son senkronizasyon: 2 dakika önce</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Rol: {userRole === 'admin' ? 'Yönetici' : userRole === 'teacher' ? 'Öğretmen' : 'Veli'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
