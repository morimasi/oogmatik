import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useToastStore } from '../../store/useToastStore';
import { Student, SavedWorksheet, AdvancedStudent, Difficulty } from '../../types';

// Custom Hooks & Sub-components
import { useStudentRealtimeData } from './hooks/useStudentRealtimeData';
import {
  StudentDashboardSidebar,
  GroupingMode,
} from './dashboard/StudentDashboardSidebar';
import { StudentDetailHeader } from './dashboard/StudentDetailHeader';
import {
  StudentTabNavigation,
  StudentDashboardTab,
} from './dashboard/StudentTabNavigation';
import { StudentAddEditModal } from './dashboard/StudentAddEditModal';

// Module views
import { DashboardModule } from './modules/DashboardModule';
import { AssignmentsModule } from './modules/AssignmentsModule';
import { MaterialsModule } from './modules/MaterialsModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { AcademicPlanModule } from './modules/AcademicPlanModule';
import { IEPModule } from './modules/IEPModule';
import { ClinicalNotesModule } from './modules/ClinicalNotesModule';

export interface StudentDashboardProps {
  onBack: () => void;
  onLoadMaterial?: (ws: SavedWorksheet) => void;
  onStartCurriculumActivity?: (
    planId: string,
    day: number,
    activityId: string,
    activityType: string,
    studentName: string,
    title: string,
    difficulty: Difficulty,
    goal: string,
    studentId?: string,
    originTab?: string,
    originPlanTab?: string
  ) => void;
}

export function StudentDashboard({
  onBack: _onBack,
  onLoadMaterial,
  onStartCurriculumActivity,
}: StudentDashboardProps) {
  const { user } = useAuthStore();
  const {
    students,
    activeStudent,
    setActiveStudent,
    addStudent,
    deleteStudent,
    updateStudent,
  } = useStudentStore();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Active Tab with LocalStorage & legacy window bridge
  const [activeTab, setActiveTab] = useState<StudentDashboardTab>(() => {
    const defaultTab = (window as unknown as { studentDashboardDefaultTab?: StudentDashboardTab })
      .studentDashboardDefaultTab;
    if (defaultTab) {
      delete (window as unknown as { studentDashboardDefaultTab?: StudentDashboardTab })
        .studentDashboardDefaultTab;
      return defaultTab;
    }
    const saved = localStorage.getItem('student_dashboard_active_tab');
    const validTabs: StudentDashboardTab[] = [
      'overview',
      'assignments',
      'materials',
      'analytics',
      'plans',
      'iep',
      'notes',
      'settings',
    ];
    return saved && validTabs.includes(saved as StudentDashboardTab)
      ? (saved as StudentDashboardTab)
      : 'overview';
  });

  useEffect(() => {
    localStorage.setItem('student_dashboard_active_tab', activeTab);
  }, [activeTab]);

  // Sidebar Grouping & Search
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('all');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | undefined>(undefined);

  // Assignment Store
  const { assignments, fetchStudentAssignments, updateAssignment } = useAssignmentStore();

  // Real-time Firestore Listeners via Custom Hook
  const {
    studentWorksheets,
    studentAssessments,
    studentCurriculums,
    loadingDetails,
  } = useStudentRealtimeData(selectedStudentId, fetchStudentAssignments);

  const selectedStudent = useMemo(
    () => students.find((s: Student) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  // Bidirectional sync: activeStudent <-> selectedStudentId
  useEffect(() => {
    if (activeStudent?.id && !selectedStudentId) {
      setSelectedStudentId(activeStudent.id);
    }
  }, [activeStudent?.id, selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId && selectedStudentId !== activeStudent?.id) {
      const found = students.find((x: Student) => x.id === selectedStudentId);
      if (found) setActiveStudent(found);
    }
  }, [selectedStudentId, activeStudent?.id, students, setActiveStudent]);

  // Grouping logic for Sidebar
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
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const initialGroups: Record<string, boolean> = {};
    sortedGroupKeys.forEach((k) => (initialGroups[k] = true));
    setOpenGroups(initialGroups);
  }, [sortedGroupKeys]);

  // Student Actions
  const handleSaveStudent = async (data: Partial<Student>) => {
    if (!data.name?.trim()) {
      alert('Lütfen öğrenci adını giriniz.');
      return;
    }

    if (data.id) {
      await updateStudent(data.id, data);
      useToastStore.getState().success('Öğrenci başarıyla güncellendi.');
    } else {
      if (!user?.id) throw new Error('Kullanıcı oturumu bulunamadı.');
      await addStudent(user.id, {
        ...data,
        avatar:
          data.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}-${Math.random()}`,
      } as unknown as Omit<Student, 'id'>);
      useToastStore.getState().success('Yeni öğrenci başarıyla eklendi.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (confirm('Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz?')) {
      await deleteStudent(id);
      if (selectedStudentId === id) setSelectedStudentId(null);
      useToastStore.getState().success('Öğrenci silindi.');
    }
  };

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] flex flex-col md:flex-row font-['Lexend'] overflow-hidden">
      {/* 1. Modüler Sol Kenar Çubuğu */}
      <StudentDashboardSidebar
        students={students}
        selectedStudentId={selectedStudentId}
        onSelectStudent={setSelectedStudentId}
        onOpenAddModal={() => {
          setEditingStudent(undefined);
          setShowAddForm(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupingMode={groupingMode}
        onGroupingModeChange={setGroupingMode}
        openGroups={openGroups}
        onToggleGroup={toggleGroup}
        groupedStudents={groupedStudents}
        sortedGroupKeys={sortedGroupKeys}
      />

      {/* 2. Ana Detay Alanı */}
      {!selectedStudent ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-secondary)]/30 backdrop-blur-sm text-[var(--text-muted)]">
          <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--border-color)]">
            <i className="fa-solid fa-user-graduate text-2xl opacity-30"></i>
          </div>
          <h3 className="text-lg font-black text-[var(--text-secondary)] uppercase tracking-tight">
            Öğrenci Seçiniz
          </h3>
          <p className="text-[10px] mt-2 font-bold uppercase tracking-widest opacity-60">
            Detaylar için sol menüyü kullanın
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden relative">
          {/* Öğrenci Başlık Bilgi & Aksiyon Bandı */}
          <StudentDetailHeader
            student={selectedStudent}
            isActive={activeStudent?.id === selectedStudent.id}
            onActivate={() => setActiveStudent(selectedStudent)}
            onEdit={() => {
              setEditingStudent(selectedStudent);
              setShowAddForm(true);
            }}
            onDelete={() => handleDelete(selectedStudent.id)}
          />

          {/* Sekme Navigasyonu */}
          <StudentTabNavigation
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {/* Sekme İçerik Alanı */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <i className="fa-solid fa-loader fa-spin text-4xl mb-4 text-[var(--accent-color)]"></i>
                <p className="font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  Veriler Senkronize Ediliyor...
                </p>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto space-y-6 pb-20">
                {activeTab === 'overview' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DashboardModule
                      student={selectedStudent as AdvancedStudent}
                      assignments={assignments}
                      worksheets={studentWorksheets}
                      assessments={studentAssessments}
                      curriculums={studentCurriculums}
                      onNavigateToTab={setActiveTab}
                    />
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AssignmentsModule
                      studentId={selectedStudent.id}
                      studentName={selectedStudent.name}
                      assignments={assignments}
                      onUpdateAssignment={updateAssignment}
                      onLoadMaterial={onLoadMaterial}
                    />
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MaterialsModule
                      studentId={selectedStudent.id}
                      worksheets={studentWorksheets}
                      assessments={studentAssessments}
                      onLoadMaterial={onLoadMaterial}
                    />
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AnalyticsModule
                      studentId={selectedStudent.id}
                      assessments={studentAssessments}
                    />
                  </div>
                )}

                {activeTab === 'plans' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AcademicPlanModule
                      studentId={selectedStudent.id}
                      curriculums={studentCurriculums}
                      onRefresh={() => {}}
                      onStartCurriculumActivity={onStartCurriculumActivity}
                    />
                  </div>
                )}

                {activeTab === 'iep' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <IEPModule
                      student={
                        {
                          ...selectedStudent,
                          iep:
                            (selectedStudent as unknown as { iep?: unknown }).iep || {
                              goals: [],
                              status: 'draft',
                            },
                        } as AdvancedStudent
                      }
                      onUpdate={(updatedIEP) => {
                        updateStudent(selectedStudent.id, {
                          iep: updatedIEP,
                        } as unknown as Partial<Student>);
                        useToastStore.getState().success('BEP planı başarıyla güncellendi.');
                      }}
                    />
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ClinicalNotesModule
                      studentId={selectedStudent.id}
                      studentName={selectedStudent.name}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Modüler Öğrenci Ekle / Düzenle Modalı */}
      {showAddForm && (
        <StudentAddEditModal
          initialData={editingStudent}
          onClose={() => {
            setShowAddForm(false);
            setEditingStudent(undefined);
          }}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  );
}

export default StudentDashboard;
