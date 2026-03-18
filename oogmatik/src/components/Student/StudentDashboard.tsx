import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { Student, SavedWorksheet, SavedAssessment, Curriculum } from '../../types';
import { worksheetService } from '../../services/worksheetService';
import { assessmentService } from '../../services/assessmentService';
import { curriculumService } from '../../services/curriculumService';
import { LineChart } from '../LineChart';
import { RadarChart } from '../RadarChart';
import { ACTIVITIES } from '../../constants';

// Define constants used in the component
const grades = [
  'Okul Öncesi',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
  'Lise Hazırlık',
  '9. Sınıf',
];
const diagnosisOptions = [
  'Disleksi (Okuma Güçlüğü)',
  'Diskalkuli (Matematik Güçlüğü)',
  'DEHB (Dikkat Eksikliği)',
  'Disgrafi (Yazma Güçlüğü)',
  'Genel Öğrenme Güçlüğü',
  'Otizm Spektrum Bozukluğu',
  'Üstün Yetenekli',
  'Dil ve Konuşma Güçlüğü',
];

interface StudentDashboardProps {
  onBack: () => void;
  onLoadMaterial?: (ws: SavedWorksheet) => void;
}

type TabType = 'overview' | 'materials' | 'analytics' | 'plans' | 'notes' | 'settings';
type GroupingMode = 'all' | 'grade' | 'age';
type FormTab = 'identity' | 'academic' | 'parent';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack, onLoadMaterial }) => {
  const { user } = useAuthStore();
  const { students, activeStudent, setActiveStudent, addStudent, deleteStudent, updateStudent, isLoading: contextLoading } = useStudentStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // UI State
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('all');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTab, setFormTab] = useState<FormTab>('identity');
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    age: 8,
    grade: '2. Sınıf',
    diagnosis: [],
    interests: [],
    notes: '',
    learningStyle: 'Görsel',
    parentName: '',
    contactPhone: '',
    contactEmail: '',
    strengths: [],
    weaknesses: [],
  });

  // Helper inputs for tags
  const [tempInterest, setTempInterest] = useState('');
  const [tempStrength, setTempStrength] = useState('');
  const [tempWeakness, setTempWeakness] = useState('');

  // Student Data State
  const [studentWorksheets, setStudentWorksheets] = useState<SavedWorksheet[]>([]);
  const [studentAssessments, setStudentAssessments] = useState<SavedAssessment[]>([]);
  const [studentCurriculums, setStudentCurriculums] = useState<Curriculum[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  // Initial Load Logic
  useEffect(() => {
    if (activeStudent?.id && !selectedStudentId) {
      setSelectedStudentId(activeStudent.id);
    }
  }, [activeStudent?.id]);

  // Load Student Specific Data when selected
  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadStudentData = async (id: string) => {
    setLoadingDetails(true);
    try {
      const currentStudent = students.find((s) => s.id === id);
      if (!currentStudent) return;

      const [ws, as, cr] = await Promise.all([
        worksheetService.getWorksheetsByStudent(id),
        assessmentService.getAssessmentsByStudent(id),
        curriculumService.getCurriculumsByStudent(id),
      ]);

      setStudentWorksheets(ws);
      setStudentAssessments(as);
      setStudentCurriculums(cr);
    } catch (e) {
      console.error('Student data load error', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Lütfen öğrenci adını giriniz.');
      return;
    }

    try {
      if (formData.id) {
        // Update
        await updateStudent(formData.id, formData);
      } else {
        // Create
        await addStudent({
          ...(formData as any),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}-${Math.random()}`,
        });
      }
      setShowAddForm(false);
      setFormData({
        name: '',
        age: 8,
        grade: '2. Sınıf',
        diagnosis: [],
        interests: [],
        notes: '',
        learningStyle: 'Görsel',
        strengths: [],
        weaknesses: [],
      });
    } catch (e: any) {
      alert(`Kayıt hatası: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (confirm('Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz?')) {
      await deleteStudent(id);
      if (selectedStudentId === id) setSelectedStudentId(null);
    }
  };

  const handleAddTag = (
    field: 'interests' | 'strengths' | 'weaknesses',
    value: string,
    setter: (s: string) => void
  ) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    setter('');
  };

  const handleRemoveTag = (field: 'interests' | 'strengths' | 'weaknesses', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  // --- Grouping Logic ---
  const groupedStudents = useMemo(() => {
    const filtered = students.filter((s) =>
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (groupingMode === 'all') return { 'Tüm Öğrenciler': filtered };

    return filtered.reduce(
      (acc, student) => {
        const key = groupingMode === 'grade' ? student.grade : `${student.age} Yaş`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
        return acc;
      },
      {} as Record<string, Student[]>
    );
  }, [students, searchQuery, groupingMode]);

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedStudents).sort();
  }, [groupedStudents]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Initialize groups as open
  useEffect(() => {
    const initialGroups: Record<string, boolean> = {};
    sortedGroupKeys.forEach((k) => (initialGroups[k] = true));
    setOpenGroups(initialGroups);
  }, [sortedGroupKeys.length]); // Re-run when grouping changes

  // Render Components
  const renderSidebar = () => (
    <div className="w-80 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full shrink-0 shadow-2xl z-30">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-xl text-zinc-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <i className="fa-solid fa-users text-lg"></i>
            </div>
            Öğrencilerim
          </h2>
          <button
            onClick={() => {
              setFormData({});
              setFormTab('identity');
              setShowAddForm(true);
            }}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20"
            title="Yeni Öğrenci Ekle"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
        <div className="relative mb-4">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
          <input
            type="text"
            placeholder="İsim veya sınıf ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-sm"
          />
        </div>

        {/* Grouping Toggles - Premium */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
          {['all', 'grade', 'age'].map((mode) => (
            <button
              key={mode}
              onClick={() => setGroupingMode(mode as any)}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${groupingMode === mode ? 'bg-white dark:bg-zinc-700 shadow-md text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {mode === 'all' ? 'Tümü' : mode === 'grade' ? 'Sınıf' : 'Yaş'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="space-y-2">
            {groupingMode !== 'all' && (
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-zinc-600 transition-colors"
              >
                <span>
                  {groupKey} ({groupedStudents[groupKey].length})
                </span>
                <i
                  className={`fa-solid fa-chevron-down transition-transform ${openGroups[groupKey] ? 'rotate-180' : ''}`}
                ></i>
              </button>
            )}

            {(groupingMode === 'all' || openGroups[groupKey]) && (
              <div className="space-y-2">
                {groupedStudents[groupKey].map((s) => {
                  if (!s || !s.id) return null;
                  const isActive = selectedStudentId === s.id;
                  const isCurrentActive = activeStudent?.id === s.id;

                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`w-full flex items-center gap-4 p-3 rounded-[1.5rem] transition-all text-left group relative overflow-hidden ${isActive ? 'bg-white dark:bg-zinc-800 shadow-xl border border-zinc-100 dark:border-zinc-700 scale-[1.02] ring-2 ring-indigo-500/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent'}`}
                    >
                      <div className="relative">
                        <img
                          src={s.avatar}
                          className={`w-12 h-12 rounded-2xl bg-zinc-100 object-cover transition-transform group-hover:scale-110 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-800' : ''}`}
                          alt={s.name}
                        />
                        {isCurrentActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-800 animate-pulse shadow-lg"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-black text-sm truncate tracking-tight ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-400'}`}
                        >
                          {s.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}
                          >
                            {s.grade}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400">{s.age} Yaş</span>
                        </div>
                      </div>
                      {isActive && (
                        <i className="fa-solid fa-chevron-right text-indigo-500 text-xs"></i>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800">
              <i className="fa-solid fa-user-plus text-zinc-300 text-2xl"></i>
            </div>
            <p className="text-zinc-500 font-bold text-sm">Henüz öğrenci kaydı bulunmuyor.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Hemen Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailContent = () => {
    if (!selectedStudent) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-400">
          <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-user-graduate text-4xl opacity-50"></i>
          </div>
          <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-500">Öğrenci Seçiniz</h3>
          <p className="text-sm mt-2">Detayları görüntülemek için sol menüden bir öğrenci seçin.</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-black overflow-hidden relative">
        {/* Student Header - Ultra Premium */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shrink-0 shadow-sm z-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <div className="flex items-center gap-8 relative z-10">
            <div className="relative group">
              <img
                src={selectedStudent.avatar}
                className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-zinc-800 shadow-2xl transition-transform group-hover:scale-105"
                alt={selectedStudent.name}
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-4 border-white dark:border-zinc-900 shadow-lg">
                <i className="fa-solid fa-graduation-cap text-sm"></i>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase mb-2">
                {selectedStudent.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                <span className="flex items-center gap-2 text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
                  <i className="fa-solid fa-school text-indigo-500"></i> {selectedStudent.grade}
                </span>
                <span className="flex items-center gap-2 text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
                  <i className="fa-solid fa-cake-candles text-amber-500"></i> {selectedStudent.age}{' '}
                  Yaş
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                  <i className="fa-solid fa-shield-check"></i>{' '}
                  {selectedStudent.diagnosis[0] || 'Genel Takip'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <button
              onClick={() => setActiveStudent(selectedStudent)}
              className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-3"
            >
              <i className="fa-solid fa-bolt"></i> AKTİF ÖĞRENCİ YAP
            </button>
            <button
              onClick={() => {
                setFormData(selectedStudent);
                setShowAddForm(true);
              }}
              className="w-14 h-14 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl font-bold transition-all flex items-center justify-center shadow-sm"
            >
              <i className="fa-solid fa-pen-nib"></i>
            </button>
            <button
              onClick={() => handleDelete(selectedStudent.id)}
              className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-2xl flex items-center justify-center transition-all border border-rose-100 dark:border-rose-900/30"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        {/* Tabs - Glassmorphic */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md px-8 gap-8 overflow-x-auto shrink-0 sticky top-0 z-20">
          {[
            { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2' },
            { id: 'materials', label: 'Materyaller', icon: 'fa-scroll' },
            { id: 'analytics', label: 'Bilişsel Analiz', icon: 'fa-brain-circuit' },
            { id: 'plans', label: 'Akademik Plan', icon: 'fa-calendar-lines-pen' },
            { id: 'notes', label: 'Klinik Notlar', icon: 'fa-notes-medical' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-5 text-xs font-black uppercase tracking-[0.1em] border-b-4 transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 translate-y-1' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
            >
              <i className={`fa-solid ${tab.icon} text-lg`}></i> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <i className="fa-solid fa-loader fa-spin text-5xl text-indigo-600 mb-4"></i>
              <p className="font-black text-xs uppercase tracking-widest">
                {' '}
                Veriler Senkronize Ediliyor...{' '}
              </p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
              {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {/* AI Insight Highlight */}
                  <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4 text-indigo-400">
                        <i className="fa-solid fa-sparkles"></i>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                          AI Öngörüsü (Beta)
                        </span>
                      </div>
                      <p className="text-xl font-medium text-indigo-50 leading-relaxed mb-6">
                        "{selectedStudent.name}, son matematik aktivitelerinde{' '}
                        <strong> %18'lik bir gelişim </strong> sergiledi. Görsel tarama becerileri
                        şu an <strong> akran ortalamasının üzerinde. </strong> Bugün için önerilen
                        odak noktası:{' '}
                        <span className="text-amber-400 underline decoration-2 underline-offset-4 cursor-pointer">
                          Sözel Mantık Egzersizleri.
                        </span>
                        "
                      </p>
                      <div className="flex gap-4">
                        <button className="px-5 py-2 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                          Eğitim Planına Git
                        </button>
                        <button className="px-5 py-2 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
                          Detayları Gör
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bento Grid Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                          <i className="fa-solid fa-file-invoice text-xl"></i>
                        </div>
                        <div className="text-4xl font-black text-zinc-900 dark:text-white mb-1">
                          {studentWorksheets.length}
                        </div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Çalışma Kağıdı
                        </div>
                      </div>
                      <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                          <i className="fa-solid fa-chart-user text-xl"></i>
                        </div>
                        <div className="text-4xl font-black text-zinc-900 dark:text-white mb-1">
                          {studentAssessments.length}
                        </div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Klinik Rapor
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden group">
                      <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400">
                            Genel İlerleme
                          </h4>
                          <span className="text-2xl font-black text-emerald-500">%82</span>
                        </div>
                        <div className="flex-1 flex items-end gap-2 h-20">
                          {[40, 60, 45, 70, 85, 82].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-indigo-500/20 rounded-t-lg relative group/bar"
                            >
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-lg transition-all duration-1000 group-hover/bar:bg-indigo-400"
                                style={{ height: `${h}%` }}
                              ></div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-xs font-bold text-zinc-500">
                          Son 6 haftalık performans trendi yukarı yönlü.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <h3 className="font-black text-lg text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-fingerprint text-indigo-500"></i> Kimlik & Tanı
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                            Tanı Grubu
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.diagnosis.map((d, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                              Stil
                            </label>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              {selectedStudent.learningStyle || 'Görsel'}
                            </span>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                              Yaş
                            </label>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              {selectedStudent.age} Yaş
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <h3 className="font-black text-lg text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-heart text-rose-500"></i> İlgi Alanları
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.interests.length > 0 ? (
                          selectedStudent.interests.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold"
                            >
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-400 italic text-sm"> Tanımlanmamış </span>
                        )}
                      </div>
                      <div className="mt-8">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                          Güçlü Yönler
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.strengths?.map((s, i) => (
                            <span
                              key={i}
                              className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border border-amber-100 dark:border-amber-800/30 shadow-inner">
                      <h3 className="font-black text-lg text-amber-800 dark:text-amber-50 mb-6 flex items-center gap-3">
                        <i className="fa-solid fa-comment-medical text-amber-600"></i> Klinik Notlar
                      </h3>
                      <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed italic line-clamp-6">
                        {selectedStudent.notes || 'Henüz özel bir gözlem notu eklenmemiş.'}
                      </p>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className="mt-6 text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest hover:underline"
                      >
                        Tüm Notları Gör
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="flex justify-between items-center mb-4 px-4">
                    <h3 className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white uppercase">
                      Dijital Arşiv
                    </h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-bold">
                        Tümü
                      </button>
                      <button className="px-4 py-2 text-zinc-400 text-xs font-bold">Okuma</button>
                      <button className="px-4 py-2 text-zinc-400 text-xs font-bold">
                        Matematik
                      </button>
                    </div>
                  </div>
                  {studentWorksheets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                      <i className="fa-solid fa-folder-open text-6xl text-zinc-200 mb-4"></i>
                      <p className="text-zinc-400 font-bold">
                        Bu öğrenci için henüz materyal üretilmedi.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {studentWorksheets.map((ws) => (
                        <div
                          key={ws.id}
                          className="flex items-center justify-between p-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 transition-all group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-[1.5rem] flex items-center justify-center text-3xl text-indigo-500 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <i className={ws.icon}></i>
                            </div>
                            <div>
                              <h4 className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                {ws.name}
                              </h4>
                              <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
                                {new Date(ws.createdAt).toLocaleDateString('tr-TR')} •{' '}
                                {ws.category.title}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onLoadMaterial?.(ws)}
                            className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 hover:bg-indigo-600 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                          >
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="bg-zinc-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                        <i className="fa-solid fa-brain-circuit text-indigo-400"></i>
                        Bilişsel Gelişim Panoraması
                      </h3>

                      {studentAssessments.length < 2 ? (
                        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[3rem]">
                          <p className="text-zinc-500 font-bold">
                            Derinlemesine analiz için geçmiş raporlar bekleniyor.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="h-80 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-inner">
                            <LineChart
                              data={studentAssessments.map((a) => ({
                                date: a.createdAt,
                                attention: a.report.scores.attention,
                                spatial: a.report.scores.spatial,
                              }))}
                              lines={[
                                { key: 'attention', color: '#818cf8', label: 'Dikkat' },
                                { key: 'spatial', color: '#fbbf24', label: 'Görsel Algı' },
                              ]}
                            />
                          </div>
                          <div className="flex flex-col justify-center items-center bg-white rounded-[2.5rem] p-6 shadow-2xl">
                            <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6">
                              Mevcut Beceri Matrisi
                            </h4>
                            {studentAssessments[0] && studentAssessments[0].report.chartData && (
                              <div className="w-full h-64">
                                <RadarChart data={studentAssessments[0].report.chartData} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="flex justify-between items-center px-4">
                    <h3 className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white uppercase">
                      Eğitim Yol Haritası
                    </h3>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                      YENİ PLAN OLUŞTUR
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {studentCurriculums.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white dark:bg-zinc-800 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-700 shadow-sm group hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h4 className="font-black text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
                                <i className="fa-solid fa-map-location-dot"></i>
                              </div>
                              {new Date(plan.startDate).toLocaleDateString('tr-TR')} Dönemi
                            </h4>
                            <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest">
                              {plan.durationDays} Günlük Eylem Planı • {plan.goals.length} Temel
                              Hedef
                            </p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            %{' '}
                            {Math.round(
                              (plan.schedule.filter((d) => d.isCompleted).length /
                                plan.schedule.length) *
                              100
                            )}{' '}
                            Tamamlandı
                          </div>
                        </div>

                        <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3 mb-8 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-lg"
                            style={{
                              width: `${(plan.schedule.filter((d) => d.isCompleted).length / plan.schedule.length) * 100}%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 py-3.5 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg">
                            Planı Yönet
                          </button>
                          <button className="w-14 h-14 bg-zinc-50 dark:bg-zinc-700 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-100 dark:border-zinc-600">
                            <i className="fa-solid fa-print"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {studentCurriculums.length === 0 && (
                      <div className="lg:col-span-2 py-20 text-center bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <i className="fa-solid fa-calendar-xmark text-5xl text-zinc-300 mb-4"></i>
                        <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
                          Henüz bir eğitim planı atanmamış.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white uppercase">
                      Vaka Notları
                    </h3>
                    <button className="text-xs font-black text-indigo-600 uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl">
                      Yeni Not Ekle
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full scale-90 group-hover:scale-100 transition-transform"></div>
                    <textarea
                      className="relative w-full h-[500px] p-10 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-[3rem] resize-none outline-none focus:border-amber-400 text-amber-900 dark:text-amber-100 leading-relaxed shadow-2xl font-medium text-lg placeholder:text-amber-200"
                      placeholder="Öğrenci hakkında detaylı klinik gözlemlerinizi, davranışsal tepkilerini ve seans notlarını buraya kaydedebilirsiniz..."
                      value={formData.notes || selectedStudent.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      onBlur={() => updateStudent(selectedStudent.id, { notes: formData.notes })}
                    ></textarea>
                    <div className="absolute bottom-8 right-8 flex items-center gap-2 text-amber-400">
                      <i className="fa-solid fa-floppy-disk"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Otomatik Kaydedildi
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // NEW: Render the Professional Add/Edit Modal
  const renderAddEditModal = () => (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            {formData.id ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Kaydı'}
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setFormTab('identity')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'identity' ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/10' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
          >
            <i className="fa-solid fa-id-card"></i> Temel Bilgiler
          </button>
          <button
            onClick={() => setFormTab('academic')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'academic' ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/10' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
          >
            <i className="fa-solid fa-brain"></i> Akademik Profil
          </button>
          <button
            onClick={() => setFormTab('parent')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'parent' ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/10' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
          >
            <i className="fa-solid fa-users"></i> Veli & İletişim
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="student-form" onSubmit={handleSaveStudent} className="space-y-6">
            {/* TAB 1: IDENTITY */}
            {formTab === 'identity' && (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                      Yaş
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                      Sınıf
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                    >
                      {grades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Öğrenme Stili
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['Görsel', 'İşitsel', 'Kinestetik', 'Karma'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData({ ...formData, learningStyle: style as any })}
                        className={`p-3 rounded-xl border-2 text-[10px] font-bold transition-all ${formData.learningStyle === style ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC */}
            {formTab === 'academic' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Tanı / Özel Durum
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.diagnosis?.map((d, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-2"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              diagnosis: formData.diagnosis?.filter((_, idx) => idx !== i),
                            })
                          }
                          className="hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value && !formData.diagnosis?.includes(e.target.value)) {
                        setFormData({
                          ...formData,
                          diagnosis: [...(formData.diagnosis || []), e.target.value],
                        });
                      }
                    }}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                    value=""
                  >
                    <option value="">Tanı Seçin...</option>
                    {diagnosisOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                      İlgi Alanları
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInterest}
                        onChange={(e) => setTempInterest(e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="Örn: Uzay"
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(),
                            handleAddTag('interests', tempInterest, setTempInterest))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag('interests', tempInterest, setTempInterest)}
                        className="px-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.interests?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center gap-1"
                        >
                          {tag}{' '}
                          <button type="button" onClick={() => handleRemoveTag('interests', i)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                      Güçlü Yönler
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempStrength}
                        onChange={(e) => setTempStrength(e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="Örn: Görsel hafıza"
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(),
                            handleAddTag('strengths', tempStrength, setTempStrength))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag('strengths', tempStrength, setTempStrength)}
                        className="px-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.strengths?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1"
                        >
                          {tag}{' '}
                          <button type="button" onClick={() => handleRemoveTag('strengths', i)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Destek İhtiyaçları (Zayıf Yönler)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempWeakness}
                      onChange={(e) => setTempWeakness(e.target.value)}
                      className="flex-1 p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
                      placeholder="Örn: b/d harfleri"
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(),
                          handleAddTag('weaknesses', tempWeakness, setTempWeakness))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag('weaknesses', tempWeakness, setTempWeakness)}
                      className="px-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.weaknesses?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs flex items-center gap-1"
                      >
                        {tag}{' '}
                        <button type="button" onClick={() => handleRemoveTag('weaknesses', i)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PARENT */}
            {formTab === 'parent' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Veli Adı Soyadı
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full pl-9 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                      placeholder="Veli Adı"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    İletişim Telefonu
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full pl-9 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full pl-9 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                      placeholder="veli@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                    Özel Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none h-24 resize-none"
                    placeholder="Eklemek istedikleriniz..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
          <div className="text-xs text-zinc-500 font-medium">
            {formTab === 'identity' ? '1/3' : formTab === 'academic' ? '2/3' : '3/3'} Adım
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              form="student-form"
              className="px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-save"></i> Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Mobile Back Button */}
      <div className="md:hidden p-4 border-b flex items-center justify-between bg-white dark:bg-zinc-900">
        <h1 className="font-bold text-lg">Öğrenci Yönetimi</h1>
        <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full">
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      {/* Layout */}
      <div className="hidden md:flex w-16 bg-zinc-900 flex-col items-center py-6 gap-6 shrink-0 z-20">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors mb-4"
          title="Ana Menü"
        >
          <i className="fa-solid fa-house"></i>
        </button>
        <div className="w-8 h-px bg-white/10"></div>
      </div>

      {renderSidebar()}
      {renderDetailContent()}

      {/* Modal for Add Student */}
      {showAddForm && renderAddEditModal()}
    </div>
  );
};
