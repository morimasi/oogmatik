
import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '../../context/StudentContext';
import { Student, SavedWorksheet, SavedAssessment, Curriculum } from '../../types';
import { worksheetService } from '../../services/worksheetService';
import { assessmentService } from '../../services/assessmentService';
import { curriculumService } from '../../services/curriculumService';
import { LineChart } from '../LineChart';
import { RadarChart } from '../RadarChart';
import { ACTIVITIES } from '../../constants';

// Define constants used in the component
const grades = ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'];
const diagnosisOptions = [
    'Disleksi (Okuma Güçlüğü)',
    'Diskalkuli (Matematik Güçlüğü)',
    'DEHB (Dikkat Eksikliği)',
    'Disgrafi (Yazma Güçlüğü)',
    'Genel Öğrenme Güçlüğü',
    'Otizm Spektrum Bozukluğu',
    'Üstün Yetenekli'
];

interface StudentDashboardProps {
    onBack: () => void;
}

type TabType = 'overview' | 'materials' | 'analytics' | 'plans' | 'notes' | 'settings';
type GroupingMode = 'all' | 'grade' | 'age';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack }) => {
    const { students, activeStudent, setActiveStudent, addStudent, deleteStudent, updateStudent, isLoading: contextLoading } = useStudent();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    
    // UI State
    const [groupingMode, setGroupingMode] = useState<GroupingMode>('all');
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Add Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], notes: '', 
        learningStyle: 'Görsel', parentName: '', contactPhone: '', contactEmail: ''
    });

    // Student Data State
    const [studentWorksheets, setStudentWorksheets] = useState<SavedWorksheet[]>([]);
    const [studentAssessments, setStudentAssessments] = useState<SavedAssessment[]>([]);
    const [studentCurriculums, setStudentCurriculums] = useState<Curriculum[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');

    const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

    // Initial Load Logic
    useEffect(() => {
        if (activeStudent && !selectedStudentId) {
            setSelectedStudentId(activeStudent.id);
        }
    }, [activeStudent]);

    // Load Student Specific Data when selected
    useEffect(() => {
        if (selectedStudentId) {
            loadStudentData(selectedStudentId);
        }
    }, [selectedStudentId]);

    const loadStudentData = async (id: string) => {
        setLoadingDetails(true);
        try {
            const currentStudent = students.find(s=>s.id===id);
            if (!currentStudent) return;

            const [ws, as, cr] = await Promise.all([
                worksheetService.getWorksheetsByStudent(id),
                assessmentService.getAssessmentsByStudent(id),
                curriculumService.getCurriculumsByStudent(id)
            ]);
            
            setStudentWorksheets(ws);
            setStudentAssessments(as);
            setStudentCurriculums(cr);
            
        } catch (e) {
            console.error("Student data load error", e);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSaveStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;
        
        try {
            if (formData.id) {
                // Update
                await updateStudent(formData.id, formData);
            } else {
                // Create
                await addStudent({
                    ...formData as any,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
                });
            }
            setShowAddForm(false);
            setFormData({ name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], notes: '', learningStyle: 'Görsel' });
        } catch (e) {
            alert("Kayıt sırasında bir hata oluştu.");
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz?")) {
            await deleteStudent(id);
            if(selectedStudentId === id) setSelectedStudentId(null);
        }
    };

    // --- Grouping Logic ---
    const groupedStudents = useMemo(() => {
        const filtered = students.filter(s => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (groupingMode === 'all') return { 'Tüm Öğrenciler': filtered };
        
        return filtered.reduce((acc, student) => {
            const key = groupingMode === 'grade' ? student.grade : `${student.age} Yaş`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(student);
            return acc;
        }, {} as Record<string, Student[]>);
    }, [students, searchQuery, groupingMode]);

    const sortedGroupKeys = useMemo(() => {
        return Object.keys(groupedStudents).sort();
    }, [groupedStudents]);

    const toggleGroup = (key: string) => {
        setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Initialize groups as open
    useEffect(() => {
        const initialGroups: Record<string, boolean> = {};
        sortedGroupKeys.forEach(k => initialGroups[k] = true);
        setOpenGroups(initialGroups);
    }, [sortedGroupKeys.length]); // Re-run when grouping changes

    // Render Components
    const renderSidebar = () => (
        <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full shrink-0">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-black text-lg text-zinc-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-users text-indigo-500"></i> Öğrencilerim
                    </h2>
                    <button onClick={() => { setFormData({}); setShowAddForm(true); }} className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="relative mb-3">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input 
                        type="text" 
                        placeholder="Öğrenci ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
                
                {/* Grouping Toggles */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button onClick={() => setGroupingMode('all')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${groupingMode==='all' ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-500'}`}>Tümü</button>
                    <button onClick={() => setGroupingMode('grade')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${groupingMode==='grade' ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-500'}`}>Sınıf</button>
                    <button onClick={() => setGroupingMode('age')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${groupingMode==='age' ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-500'}`}>Yaş</button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {sortedGroupKeys.map(groupKey => (
                    <div key={groupKey}>
                        {groupingMode !== 'all' && (
                            <button 
                                onClick={() => toggleGroup(groupKey)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg mb-1"
                            >
                                <span>{groupKey} ({groupedStudents[groupKey].length})</span>
                                <i className={`fa-solid fa-chevron-down transition-transform ${openGroups[groupKey] ? 'rotate-180' : ''}`}></i>
                            </button>
                        )}
                        
                        {(groupingMode === 'all' || openGroups[groupKey]) && (
                            <div className="space-y-1">
                                {groupedStudents[groupKey].map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudentId(s.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedStudentId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 shadow-sm' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-l-4 border-transparent'}`}
                                    >
                                        <img src={s.avatar} className="w-10 h-10 rounded-full bg-white border" alt={s.name} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${selectedStudentId === s.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{s.name}</h4>
                                            <p className="text-[10px] text-zinc-500 truncate flex gap-2">
                                                <span>{s.grade}</span> • <span>{s.age} Yaş</span>
                                            </p>
                                        </div>
                                        {activeStudent?.id === s.id && <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                {students.length === 0 && (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                        Henüz öğrenci eklenmedi.
                    </div>
                )}
            </div>
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedStudent) return <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-black"><i className="fa-solid fa-user-graduate text-6xl mb-4 opacity-20"></i><p>Detayları görmek için bir öğrenci seçin.</p></div>;

        return (
            <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-black overflow-hidden relative">
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 p-6 flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={selectedStudent.avatar} className="w-24 h-24 rounded-3xl shadow-lg border-4 border-white dark:border-zinc-800" alt="" />
                            <span className="absolute -bottom-2 -right-2 bg-zinc-900 text-white p-2 rounded-xl shadow-md border-2 border-white text-xl">
                                {selectedStudent.learningStyle === 'Görsel' ? '👁️' : selectedStudent.learningStyle === 'İşitsel' ? '👂' : '👋'}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                {selectedStudent.name}
                                {activeStudent?.id === selectedStudent.id && <span className="px-3 py-1 bg-green-500 text-white text-[10px] rounded-full uppercase tracking-widest font-bold shadow-lg shadow-green-500/30">Çalışılıyor</span>}
                            </h1>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{selectedStudent.grade}</span>
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{selectedStudent.age} Yaş</span>
                                {(selectedStudent.diagnosis || []).map(d => (
                                    <span key={d} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-100 dark:border-rose-900/50">{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveStudent(selectedStudent)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${activeStudent?.id === selectedStudent.id ? 'bg-green-600 text-white border-green-600' : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50'}`}>
                            {activeStudent?.id === selectedStudent.id ? 'Aktif Öğrenci' : 'Aktif Yap'}
                        </button>
                        <button onClick={() => { setFormData(selectedStudent); setShowAddForm(true); }} className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-300 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-sm"><i className="fa-solid fa-pen"></i></button>
                        <button onClick={() => handleDelete(selectedStudent.id)} className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-300 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl text-zinc-400 transition-colors shadow-sm"><i className="fa-solid fa-trash"></i></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-6 flex gap-8 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Profil Özeti', icon: 'fa-id-card' },
                        { id: 'analytics', label: 'Analiz & Gelişim', icon: 'fa-chart-pie' },
                        { id: 'materials', label: 'Etkinlikler', icon: 'fa-folder-open' },
                        { id: 'plans', label: 'Eğitim Planları', icon: 'fa-calendar-check' },
                        { id: 'notes', label: 'Öğretmen Notları', icon: 'fa-book-medical' },
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                    {loadingDetails && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 z-20 backdrop-blur-sm">
                            <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-600"></i>
                                <span className="font-bold">Veriler Yükleniyor...</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fa-solid fa-shapes"></i></div>
                                    <div>
                                        <h4 className="text-3xl font-black text-zinc-800 dark:text-white">{studentWorksheets.length}</h4>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Materyal</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fa-solid fa-clipboard-check"></i></div>
                                    <div>
                                        <h4 className="text-3xl font-black text-zinc-800 dark:text-white">{studentAssessments.length}</h4>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Test/Rapor</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl"><i className="fa-solid fa-graduation-cap"></i></div>
                                    <div>
                                        <h4 className="text-3xl font-black text-zinc-800 dark:text-white">{studentCurriculums.length}</h4>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tamamlanan Plan</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Profile Card */}
                                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="font-bold text-lg text-zinc-800 dark:text-white mb-6 flex items-center gap-2">
                                        <i className="fa-solid fa-fingerprint text-zinc-400"></i> Öğrenci Kimliği
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        <div>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Veli Adı</span>
                                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedStudent.parentName || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">İletişim</span>
                                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedStudent.contactPhone || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Kayıt Tarihi</span>
                                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Öğrenme Stili</span>
                                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedStudent.learningStyle || 'Belirtilmemiş'}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">İlgi Alanları</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudent.interests.length > 0 ? selectedStudent.interests.map(i => (
                                                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">{i}</span>
                                                )) : <span className="text-sm text-zinc-400 italic">Girilmemiş</span>}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Destek İhtiyaçları</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStudent.weaknesses && selectedStudent.weaknesses.length > 0 ? selectedStudent.weaknesses.map(i => (
                                                    <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">{i}</span>
                                                )) : <span className="text-sm text-zinc-400 italic">Girilmemiş</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-4">
                                     <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('plans')}>
                                         <div className="absolute top-0 right-0 p-4 opacity-20"><i className="fa-solid fa-calendar-days text-6xl"></i></div>
                                         <h4 className="font-black text-xl mb-2 relative z-10">Yeni Plan Oluştur</h4>
                                         <p className="text-indigo-200 text-sm relative z-10">Yapay zeka ile kişisel müfredat hazırla.</p>
                                         <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-sm group-hover:bg-white/30 transition-colors">Başla <i className="fa-solid fa-arrow-right ml-1"></i></div>
                                     </div>
                                     <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors group" onClick={() => setActiveTab('materials')}>
                                         <div className="flex justify-between items-center mb-2">
                                             <h4 className="font-bold text-zinc-800 dark:text-white">Son Materyaller</h4>
                                             <i className="fa-solid fa-arrow-right text-zinc-300 group-hover:text-indigo-500 transition-colors"></i>
                                         </div>
                                         <div className="space-y-2">
                                             {studentWorksheets.slice(0,3).map(w => (
                                                 <div key={w.id} className="text-xs text-zinc-500 truncate border-b border-zinc-100 pb-1 last:border-0">
                                                     <i className={`${w.icon} mr-2`}></i> {w.name}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
                            {studentWorksheets.map(ws => (
                                <div key={ws.id} className="group bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <i className={`${ws.icon} text-6xl`}></i>
                                    </div>
                                    <div className="relative z-10 flex-1">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm">
                                            <i className={ws.icon}></i>
                                        </div>
                                        <h4 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-2 mb-1">{ws.name}</h4>
                                        <p className="text-xs text-zinc-500 mb-4 uppercase tracking-wider font-bold">{ws.category.title}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-700 mt-auto">
                                        <span className="text-[10px] font-mono text-zinc-400">{new Date(ws.createdAt).toLocaleDateString()}</span>
                                        <button className="text-xs bg-zinc-900 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg font-bold shadow-sm hover:opacity-80 transition-opacity">Aç</button>
                                    </div>
                                </div>
                            ))}
                            {studentWorksheets.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center h-96 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
                                    <i className="fa-regular fa-folder-open text-6xl mb-4 opacity-30"></i>
                                    <p className="font-bold">Bu öğrenci için henüz materyal üretilmedi.</p>
                                    <button onClick={() => setActiveStudent(selectedStudent)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                                        Şimdi Üret
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center">
                                    <h3 className="font-bold text-lg text-zinc-800 dark:text-white mb-6 w-full text-left">Bilişsel Yetenek Haritası (Son Test)</h3>
                                    {studentAssessments.length > 0 ? (
                                        <div className="w-full max-w-md">
                                            <RadarChart data={studentAssessments[studentAssessments.length-1].report.chartData} />
                                        </div>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center text-zinc-400 italic">Veri Yok</div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="font-bold text-lg text-zinc-800 dark:text-white mb-8 flex items-center gap-2">
                                        <i className="fa-solid fa-chart-line text-indigo-500"></i> Performans Gelişimi
                                    </h3>
                                    <div className="h-64 w-full">
                                        <LineChart 
                                            data={studentAssessments.map(a => ({
                                                date: a.createdAt,
                                                reading: a.report.scores.linguistic || 0,
                                                math: a.report.scores.logical || 0,
                                                attention: a.report.scores.attention || 0
                                            }))}
                                            lines={[
                                                { key: 'reading', color: '#3B82F6', label: 'Sözel' },
                                                { key: 'math', color: '#EF4444', label: 'Mantıksal' },
                                                { key: 'attention', color: '#10B981', label: 'Dikkat' }
                                            ]}
                                            height={280}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-zinc-700 dark:text-zinc-300 ml-2 mb-4">Değerlendirme Raporları</h3>
                                <div className="space-y-3">
                                    {studentAssessments.map(assessment => (
                                        <div key={assessment.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-file-medical"></i></div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 dark:text-white">{assessment.studentName} Raporu</h4>
                                                    <p className="text-xs text-zinc-500">{new Date(assessment.createdAt).toLocaleDateString()} • {assessment.grade}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 text-sm font-bold text-zinc-600 hidden md:flex">
                                                <span className="flex flex-col items-center"><span className="text-[10px] text-zinc-400 font-normal uppercase">Dikkat</span> %{assessment.report.scores.attention}</span>
                                                <span className="flex flex-col items-center"><span className="text-[10px] text-zinc-400 font-normal uppercase">Sözel</span> %{assessment.report.scores.linguistic}</span>
                                                <span className="flex flex-col items-center"><span className="text-[10px] text-zinc-400 font-normal uppercase">Görsel</span> %{assessment.report.scores.spatial}</span>
                                            </div>
                                            <button className="px-4 py-2 bg-zinc-100 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-200">İncele</button>
                                        </div>
                                    ))}
                                    {studentAssessments.length === 0 && <div className="text-center py-8 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">Kayıtlı rapor bulunamadı.</div>}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'plans' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in">
                            {studentCurriculums.map(plan => (
                                <div key={plan.id} className="bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl p-6 hover:border-indigo-300 transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shadow-sm"><i className="fa-solid fa-calendar-check"></i></div>
                                        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-300">{plan.durationDays} Günlük</span>
                                    </div>
                                    <h4 className="font-bold text-lg dark:text-white mb-2">{plan.studentName} Programı</h4>
                                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{plan.note}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                                        <span className="text-xs font-mono text-zinc-400">{new Date(plan.startDate).toLocaleDateString()}</span>
                                        <button className="text-xs font-bold text-indigo-600 hover:underline">Görüntüle</button>
                                    </div>
                                </div>
                            ))}
                            {studentCurriculums.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center h-64 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl">
                                    <i className="fa-solid fa-calendar-xmark text-4xl mb-4 opacity-50"></i>
                                    <p>Henüz plan oluşturulmamış.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
                            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm">
                                <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2"><i className="fa-solid fa-pen"></i> Gözlem Notu Ekle</h4>
                                <textarea 
                                    className="w-full p-4 bg-white border border-amber-200 rounded-xl text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-amber-500" 
                                    placeholder="Bugünkü derste..."
                                ></textarea>
                                <div className="flex justify-end mt-3">
                                    <button className="px-6 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors">Kaydet</button>
                                </div>
                            </div>

                            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:h-full before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-700">
                                {selectedStudent.notes ? (
                                    <div className="relative pl-12">
                                        <div className="absolute left-1.5 top-1 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full z-10"></div>
                                        <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">{new Date().toLocaleDateString()}</span>
                                            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{selectedStudent.notes}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-zinc-400 pl-8">Henüz not eklenmemiş.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab (Reused existing form logic) */}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col md:flex-row">
            {/* Mobile Back Button */}
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-white dark:bg-zinc-900">
                <h1 className="font-bold text-lg">Öğrenci Yönetimi</h1>
                <button onClick={onBack} className="p-2 bg-zinc-100 rounded-full"><i className="fa-solid fa-times"></i></button>
            </div>
            
            {/* Layout */}
            <div className="hidden md:flex w-16 bg-zinc-900 flex-col items-center py-6 gap-6 shrink-0 z-20">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors mb-4" title="Ana Menü"><i className="fa-solid fa-house"></i></button>
                <div className="w-8 h-px bg-white/10"></div>
            </div>

            {renderSidebar()}
            {renderDetailContent()}

            {/* Modal for Add Student */}
            {showAddForm && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Yeni Öğrenci</h3>
                            <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSaveStudent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Ad Soyad</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Örn: Ayşe Yılmaz" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Yaş</label>
                                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sınıf</label>
                                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none">
                                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 shadow-lg">Öğrenciyi Kaydet</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
