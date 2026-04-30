import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { Student, SavedWorksheet, SavedAssessment, Curriculum } from '../../types';
import { ActivityAssignment } from '../../types/assignment';
import { worksheetService } from '../../services/worksheetService';
import { assessmentService } from '../../services/assessmentService';
import { curriculumService } from '../../services/curriculumService';
import { assignmentService } from '../../services/assignmentService';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { LineChart } from '../LineChart';
import { RadarChart } from '../RadarChart';
import { ACTIVITIES } from '../../constants';
import { ProgressDashboard } from '../ProgressDashboard/ProgressDashboard';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
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

type TabType = 'overview' | 'materials' | 'assignments' | 'analytics' | 'plans' | 'notes' | 'settings';
type GroupingMode = 'all' | 'grade' | 'age';
type FormTab = 'identity' | 'academic' | 'parent';

export function StudentDashboard({ onBack, onLoadMaterial }: StudentDashboardProps) {
  const { user } = useAuthStore();
  const { students, activeStudent, setActiveStudent, addStudent, deleteStudent, updateStudent, isLoading: _contextLoading } = useStudentStore();
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
  
  // Assignment Store
  const { assignments, fetchStudentAssignments, updateAssignment } = useAssignmentStore();

  // Assignment Unsubscribe Tracking
  const assignmentListenerUnsub = React.useRef<(() => void) | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStudent = useMemo(
    () => students.find((s: Student) => s.id === selectedStudentId),
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
      
      // Cleanup previous listener
      if (assignmentListenerUnsub.current) {
        assignmentListenerUnsub.current();
      }
      // Start new listener
      assignmentListenerUnsub.current = fetchStudentAssignments(selectedStudentId);
    }
    
    return () => {
      if (assignmentListenerUnsub.current) {
        assignmentListenerUnsub.current();
        assignmentListenerUnsub.current = null;
      }
    }
  }, [selectedStudentId]);

  const loadStudentData = async (id: string) => {
    setLoadingDetails(true);
    try {
      const currentStudent = students.find((s: Student) => s.id === id);
      if (!currentStudent) return;

      const [ws, as, cr] = await Promise.all([
        worksheetService.getWorksheetsByStudent(id),
        assessmentService.getAssessmentsByStudent(id),
        curriculumService.getCurriculumsByStudent(id),
      ]);

      setStudentWorksheets(ws);
      setStudentAssessments(as);
      setStudentCurriculums(cr);
    } catch (e: any) {
      logError('Student data load error', e);
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
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    setter('');
  };

  const handleRemoveTag = (field: 'interests' | 'strengths' | 'weaknesses', index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  // --- Grouping Logic ---
  const groupedStudents = useMemo(() => {
    const filtered = students.filter((s: Student) =>
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (groupingMode === 'all') return { 'Tüm Öğrenciler': filtered };

    return filtered.reduce(
      (acc: Record<string, Student[]>, student: Student) => {
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
    setOpenGroups((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
  };

  // Initialize groups as open
  useEffect(() => {
    const initialGroups: Record<string, boolean> = {};
    sortedGroupKeys.forEach((k: string) => (initialGroups[k] = true));
    setOpenGroups(initialGroups);
  }, [sortedGroupKeys.length]); // Re-run when grouping changes

  // Render Components
  const renderSidebar = () => (
    <div className="w-64 bg-[var(--bg-paper)] border-r border-[var(--border-color)] flex flex-col h-full shrink-0 shadow-2xl z-30 overflow-hidden">
      <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-lg text-[var(--text-primary)] flex items-center gap-2.5 tracking-tighter uppercase">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-color)]/20">
              <i className="fa-solid fa-users text-sm"></i>
            </div>
            Öğrencilerim
          </h2>
          <button
            onClick={() => {
              setFormData({});
              setFormTab('identity');
              setShowAddForm(true);
            }}
            className="w-8 h-8 rounded-lg text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            style={{ backgroundColor: 'var(--accent-color)' }}
            title="Yeni Öğrenci Ekle"
          >
            <i className="fa-solid fa-plus text-xs"></i>
          </button>
        </div>
        <div className="relative mb-3">
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"></i>
          <input
            type="text"
            placeholder="İsim veya sınıf ile ara..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-paper)]/50 border border-[var(--border-color)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all shadow-sm text-[var(--text-primary)]"
          />
        </div>

        {/* Grouping Toggles - Ultra Compact */}
        <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
          {['all', 'grade', 'age'].map((mode) => (
            <button
              key={mode}
              onClick={() => setGroupingMode(mode as any)}
              className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${groupingMode === mode ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              {mode === 'all' ? 'Tümü' : mode === 'grade' ? 'Sınıf' : 'Yaş'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {sortedGroupKeys.map((groupKey: string) => (
          <div key={groupKey} className="space-y-1.5">
            {groupingMode !== 'all' && (
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between px-2 py-1 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] hover:text-[var(--text-secondary)] transition-colors"
              >
                <span>
                  {groupKey} ({groupedStudents[groupKey].length})
                </span>
                <i
                  className={`fa-solid fa-chevron-down text-[8px] transition-transform ${openGroups[groupKey] ? 'rotate-180' : ''}`}
                ></i>
              </button>
            )}

            {(groupingMode === 'all' || openGroups[groupKey]) && (
              <div className="space-y-1.5">
                {groupedStudents[groupKey].map((s: Student) => {
                  if (!s || !s.id) return null;
                  const isActive = selectedStudentId === s.id;
                  const isCurrentActive = activeStudent?.id === s.id;

                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left group relative overflow-hidden ${isActive ? 'bg-[var(--bg-paper)] shadow-lg border border-[var(--border-color)] ring-1 ring-[var(--accent-color)]/20 shadow-indigo-500/5' : 'hover:bg-[var(--bg-secondary)] border border-transparent'}`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={s.avatar}
                          className={`w-10 h-10 rounded-xl bg-[var(--bg-secondary)] object-cover transition-transform group-hover:scale-105 ${isActive ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-paper)]' : ''}`}
                          alt={s.name}
                        />
                        {isCurrentActive && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-paper)] animate-pulse shadow-lg"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-black text-xs truncate tracking-tight uppercase ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                        >
                          {s.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 opacity-80">
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.25 rounded-md ${isActive ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
                          >
                            {s.grade}
                          </span>
                          <span className="text-[8px] font-black uppercase text-[var(--text-muted)]">{s.age} Yaş</span>
                        </div>
                      </div>
                      {isActive && (
                        <i className="fa-solid fa-chevron-right text-[var(--accent-color)] text-[10px]"></i>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-3 border border-[var(--border-color)]">
              <i className="fa-solid fa-user-plus text-[var(--text-muted)] text-xl"></i>
            </div>
            <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-wider">Henüz Kayıt Yok</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 text-[var(--accent-color)] font-black text-[9px] uppercase tracking-widest hover:underline"
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
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30 backdrop-blur-sm text-[var(--text-muted)]">
          <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--border-color)]">
            <i className="fa-solid fa-user-graduate text-2xl opacity-30"></i>
          </div>
          <h3 className="text-lg font-black text-[var(--text-secondary)] uppercase tracking-tight">Öğrenci Seçiniz</h3>
          <p className="text-[10px] mt-2 font-bold uppercase tracking-widest opacity-60">Detaylar için sol menüyü kullanın</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden relative">
        {/* Student Header - Ultra Compact Premium */}
        <div className="bg-[var(--bg-paper)]/40 backdrop-blur-2xl border-b border-[var(--border-color)]/30 px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>

          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto text-left">
            <div className="relative shrink-0">
              <img
                src={selectedStudent.avatar}
                className="w-12 h-12 rounded-xl border border-[var(--border-color)] shadow-lg bg-[var(--bg-secondary)]"
                alt={selectedStudent.name}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--accent-color)] rounded-lg flex items-center justify-center text-white border border-[var(--bg-paper)] shadow-lg">
                <i className="fa-solid fa-graduation-cap text-[8px]"></i>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tighter uppercase truncate leading-none mb-1">
                {selectedStudent.name}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 opacity-80">
                <span className="text-[7px] font-black uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)]/80 px-2 py-0.5 rounded border border-[var(--border-color)]">
                   {selectedStudent.grade}
                </span>
                {selectedStudent.diagnosis[0] && (
                  <span className="text-[7px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                    {selectedStudent.diagnosis[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 relative z-10 w-full md:w-auto">
            <button
              onClick={() => setActiveStudent?.(selectedStudent)}
              className="flex-1 md:flex-none px-4 py-2 bg-[var(--accent-color)] text-white rounded-xl font-black text-[9px] tracking-widest transition-all hover:shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase"
            >
              <i className="fa-solid fa-play text-[8px]"></i> AKTİFLEŞTİR
            </button>
            <button
              onClick={() => {
                setFormData(selectedStudent);
                setShowAddForm(true);
              }}
              className="w-8 h-8 bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] rounded-lg transition-all flex items-center justify-center"
            >
              <i className="fa-solid fa-pen text-[10px]"></i>
            </button>
            <button
              onClick={() => handleDelete(selectedStudent.id)}
              className="w-8 h-8 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center justify-center transition-all border border-rose-500/10"
            >
              <i className="fa-solid fa-trash-can text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* Tabs - Glassmorphic Compact */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-paper)]/50 backdrop-blur-md px-6 gap-6 overflow-x-auto shrink-0 sticky top-0 z-20 no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2' },
            { id: 'assignments', label: 'Atamalar', icon: 'fa-tasks' },
            { id: 'materials', label: 'Materyaller', icon: 'fa-scroll' },
            { id: 'analytics', label: 'Analiz', icon: 'fa-brain-circuit' },
            { id: 'plans', label: 'Akademik Plan', icon: 'fa-calendar-lines-pen' },
            { id: 'notes', label: 'Klinik Notlar', icon: 'fa-notes-medical' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 text-[9px] font-black uppercase tracking-[0.1em] border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <i className={`fa-solid ${tab.icon} text-[10px]`}></i> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loadingDetails ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <i className="fa-solid fa-loader fa-spin text-4xl mb-4 text-[var(--accent-color)]"></i>
              <p className="font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)]"> Veriler Senkronize Ediliyor... </p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
              {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ProgressDashboard studentId={selectedStudent.id} />
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="font-black text-sm tracking-tighter text-[var(--text-primary)] uppercase">Bireysel Atamalar</h3>
                  </div>
                  {assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 backdrop-blur-sm rounded-2xl border border-dashed border-[var(--border-color)]">
                      <i className="fa-solid fa-clipboard-list text-3xl text-[var(--text-muted)] opacity-20 mb-3"></i>
                      <p className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-widest uppercase">Görev Atanmadı</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {assignments.map((assignment: ActivityAssignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-[var(--bg-paper)] border border-[var(--border-color)]/60 rounded-xl transition-all group hover:bg-[var(--surface-elevated)]">
                          <div className="flex items-center gap-3 text-left min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${assignment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              <i className={`fa-solid ${assignment.status === 'completed' ? 'fa-check-double' : 'fa-list-check'}`}></i>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase truncate">#{assignment.worksheetId.slice(0, 5)} Kayıt</h4>
                              <p className="text-[7px] font-bold text-[var(--text-muted)] opacity-60 uppercase">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('tr-TR') : 'SÜRESİZ'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {assignment.status !== 'completed' && (
                               <button 
                                 onClick={() => updateAssignment(assignment.id, { status: 'completed' })}
                                 className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-emerald-500 hover:text-white transition-all"
                               >
                                 <i className="fa-solid fa-check text-[8px]"></i>
                               </button>
                             )}
                             <div className={`w-1.5 h-1.5 rounded-full ${assignment.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="font-black text-sm tracking-tighter text-[var(--text-primary)] uppercase">Dijital Arşiv</h3>
                  </div>
                  {studentWorksheets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 backdrop-blur-sm rounded-2xl border border-dashed border-[var(--border-color)]">
                      <i className="fa-solid fa-folder-open text-3xl text-[var(--text-muted)] opacity-20 mb-3"></i>
                      <p className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-widest uppercase text-center">Materyal Bulunmuyor</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {studentWorksheets.map((ws: SavedWorksheet) => (
                        <div key={ws.id} className="flex items-center justify-between p-3 bg-[var(--bg-paper)] border border-[var(--border-color)]/60 rounded-xl transition-all group hover:bg-[var(--surface-elevated)]">
                          <div className="flex items-center gap-3 text-left min-w-0">
                            <div className="w-9 h-9 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center text-xs text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all shrink-0">
                              <i className={ws.icon}></i>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase truncate">{ws.name}</h4>
                              <p className="text-[7px] font-bold text-[var(--text-muted)] opacity-60 uppercase">{new Date(ws.createdAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onLoadMaterial?.(ws)}
                            className="w-7 h-7 bg-[var(--bg-secondary)] hover:bg-[var(--accent-color)] hover:text-white rounded-lg flex items-center justify-center transition-all text-[var(--text-secondary)]"
                          >
                            <i className="fa-solid fa-chevron-right text-[8px]"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="bg-[var(--bg-secondary)] p-10 rounded-[4rem] text-[var(--text-primary)] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-color)]/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                        <i className="fa-solid fa-brain-circuit text-[var(--accent-color)]"></i>
                        Bilişsel Gelişim Panoraması
                      </h3>

                      {studentAssessments.length < 2 ? (
                        <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-[3rem]">
                          <p className="text-[var(--text-muted)] font-bold">
                            Derinlemesine analiz için geçmiş raporlar bekleniyor.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="h-80 bg-[var(--surface-glass)] p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-inner">
                            <LineChart
                              data={studentAssessments.map((a: SavedAssessment) => ({
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
                          <div className="flex flex-col justify-center items-center bg-[var(--bg-paper)] rounded-[2.5rem] p-6 shadow-2xl">
                            <h4 className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-6">
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
                    <h3 className="font-black text-2xl tracking-tighter text-[var(--text-primary)] uppercase">
                      Eğitim Yol Haritası
                    </h3>
                    <button className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[var(--accent-color)]/20 hover:scale-105 transition-transform">
                      YENİ PLAN OLUŞTUR
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {studentCurriculums.map((plan: Curriculum) => (
                      <div
                        key={plan.id}
                        className="bg-[var(--bg-paper)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm group hover:border-[var(--accent-color)]/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h4 className="font-black text-xl text-[var(--text-primary)] flex items-center gap-3">
                              <div className="w-10 h-10 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-xl flex items-center justify-center">
                                <i className="fa-solid fa-map-location-dot"></i>
                              </div>
                              {new Date(plan.startDate).toLocaleDateString('tr-TR')} Dönemi
                            </h4>
                            <p className="text-xs font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">
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

                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 mb-8 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-lg"
                            style={{
                              width: `${(plan.schedule.filter((d) => d.isCompleted).length / plan.schedule.length) * 100}%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 py-3.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-colors shadow-lg">
                            Planı Yönet
                          </button>
                          <button className="w-14 h-14 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center hover:bg-[var(--bg-inset)] transition-colors border border-[var(--border-color)] text-[var(--text-secondary)]">
                            <i className="fa-solid fa-print"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {studentCurriculums.length === 0 && (
                      <div className="lg:col-span-2 py-20 text-center bg-[var(--bg-secondary)] rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
                        <i className="fa-solid fa-calendar-xmark text-5xl text-[var(--text-muted)] opacity-40 mb-4"></i>
                        <p className="text-[var(--text-muted)] font-bold uppercase text-xs tracking-widest">
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
                    <h3 className="font-black text-2xl tracking-tighter text-[var(--text-primary)] uppercase">
                      Vaka Notları
                    </h3>
                    <button className="text-xs font-black text-[var(--accent-color)] uppercase tracking-widest px-4 py-2 bg-[var(--accent-muted)] rounded-xl">
                      Yeni Not Ekle
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full scale-90 group-hover:scale-100 transition-transform"></div>
                    <textarea
                      className="relative w-full h-[500px] p-10 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-[3rem] resize-none outline-none focus:border-amber-400 text-amber-900 dark:text-amber-100 leading-relaxed shadow-2xl font-medium text-lg placeholder:text-amber-200"
                      placeholder="Öğrenci hakkında detaylı klinik gözlemlerinizi, davranışsal tepkilerini ve seans notlarını buraya kaydedebilirsiniz..."
                      value={formData.notes || selectedStudent.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
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
      <div className="bg-[var(--bg-paper)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]">
          <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
            {formData.id ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Kaydı'}
          </h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="w-8 h-8 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-paper)]">
          <button
            onClick={() => setFormTab('identity')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'identity' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            <i className="fa-solid fa-id-card"></i> Temel Bilgiler
          </button>
          <button
            onClick={() => setFormTab('academic')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'academic' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            <i className="fa-solid fa-brain"></i> Akademik Profil
          </button>
          <button
            onClick={() => setFormTab('parent')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'parent' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
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
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] outline-none font-bold text-[var(--text-primary)]"
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      Yaş
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      Sınıf
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none cursor-pointer text-[var(--text-primary)]"
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
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Öğrenme Stili
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['Görsel', 'İşitsel', 'Kinestetik', 'Karma'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData({ ...formData, learningStyle: style as any })}
                        className={`p-3 rounded-xl border-2 text-[10px] font-bold transition-all ${formData.learningStyle === style ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-color)]'}`}
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
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Tanı / Özel Durum
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.diagnosis?.map((d: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-full text-xs font-bold flex items-center gap-2"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              diagnosis: formData.diagnosis?.filter((_: string, idx: number) => idx !== i),
                            })
                          }
                          className="hover:opacity-70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      if (e.target.value && !formData.diagnosis?.includes(e.target.value)) {
                        setFormData({
                          ...formData,
                          diagnosis: [...(formData.diagnosis || []), e.target.value],
                        });
                      }
                    }}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
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
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      İlgi Alanları
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInterest}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempInterest(e.target.value)}
                        className="flex-1 p-2 border border-[var(--border-color)] rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                        placeholder="Örn: Uzay"
                        onKeyDown={(e: React.KeyboardEvent) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(),
                            handleAddTag('interests', tempInterest, setTempInterest))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag('interests', tempInterest, setTempInterest)}
                        className="px-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.interests?.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs flex items-center gap-1"
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
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      Güçlü Yönler
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempStrength}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempStrength(e.target.value)}
                        className="flex-1 p-2 border border-[var(--border-color)] rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                        placeholder="Örn: Görsel hafıza"
                        onKeyDown={(e: React.KeyboardEvent) =>
                          e.key === 'Enter' &&
                          (e.preventDefault(),
                            handleAddTag('strengths', tempStrength, setTempStrength))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag('strengths', tempStrength, setTempStrength)}
                        className="px-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.strengths?.map((tag: string, i: number) => (
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
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Destek İhtiyaçları (Zayıf Yönler)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempWeakness}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempWeakness(e.target.value)}
                      className="flex-1 p-2 border border-[var(--border-color)] rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      placeholder="Örn: b/d harfleri"
                      onKeyDown={(e: React.KeyboardEvent) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(),
                          handleAddTag('weaknesses', tempWeakness, setTempWeakness))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag('weaknesses', tempWeakness, setTempWeakness)}
                      className="px-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.weaknesses?.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded text-xs flex items-center gap-1"
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
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Veli Adı Soyadı
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full pl-9 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                      placeholder="Veli Adı"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    İletişim Telefonu
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full pl-9 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full pl-9 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                      placeholder="veli@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Özel Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none h-24 resize-none text-[var(--text-primary)]"
                    placeholder="Eklemek istedikleriniz..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center">
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {formTab === 'identity' ? '1/3' : formTab === 'academic' ? '2/3' : '3/3'} Adım
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 text-[var(--text-muted)] font-bold hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              form="student-form"
              className="px-8 py-2.5 bg-[var(--accent-color)] hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-save"></i> Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] flex flex-col md:flex-row font-['Lexend'] overflow-hidden">
      {renderSidebar()}
      {renderDetailContent()}

      {/* Modal for Add Student */}
      {showAddForm && renderAddEditModal()}
    </div>
  );
};
