
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
const grades = ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', 'Lise Hazırlık', '9. Sınıf'];
const diagnosisOptions = [
    'Disleksi (Okuma Güçlüğü)',
    'Diskalkuli (Matematik Güçlüğü)',
    'DEHB (Dikkat Eksikliği)',
    'Disgrafi (Yazma Güçlüğü)',
    'Genel Öğrenme Güçlüğü',
    'Otizm Spektrum Bozukluğu',
    'Üstün Yetenekli',
    'Dil ve Konuşma Güçlüğü'
];

interface StudentDashboardProps {
    onBack: () => void;
}

type TabType = 'overview' | 'materials' | 'analytics' | 'plans' | 'notes' | 'settings';
type GroupingMode = 'all' | 'grade' | 'age';
type FormTab = 'identity' | 'academic' | 'parent';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack }) => {
    const { students, activeStudent, setActiveStudent, addStudent, deleteStudent, updateStudent, isLoading: contextLoading } = useStudent();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    
    // UI State
    const [groupingMode, setGroupingMode] = useState<GroupingMode>('all');
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Add Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [formTab, setFormTab] = useState<FormTab>('identity');
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], notes: '', 
        learningStyle: 'Görsel', parentName: '', contactPhone: '', contactEmail: '',
        strengths: [], weaknesses: []
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
        if (!formData.name) {
            alert("Lütfen öğrenci adını giriniz.");
            return;
        }
        
        try {
            if (formData.id) {
                // Update
                await updateStudent(formData.id, formData);
            } else {
                // Create
                await addStudent({
                    ...formData as any,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}-${Math.random()}`
                });
            }
            setShowAddForm(false);
            setFormData({ name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], notes: '', learningStyle: 'Görsel', strengths:[], weaknesses:[] });
        } catch (e: any) {
            alert(`Kayıt hatası: ${e.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz?")) {
            await deleteStudent(id);
            if(selectedStudentId === id) setSelectedStudentId(null);
        }
    };

    const handleAddTag = (field: 'interests' | 'strengths' | 'weaknesses', value: string, setter: (s:string)=>void) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), value.trim()]
        }));
        setter('');
    };

    const handleRemoveTag = (field: 'interests' | 'strengths' | 'weaknesses', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
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
                    <button onClick={() => { setFormData({}); setFormTab('identity'); setShowAddForm(true); }} className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors" title="Yeni Öğrenci Ekle">
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
                                {groupedStudents[groupKey].map(s => {
                                    // SAFETY CHECK: Ensure s exists and has an ID
                                    if (!s || !s.id) return null;
                                    
                                    return (
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
                                )})}
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
                {/* Student Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-6">
                        <img src={selectedStudent.avatar} className="w-20 h-20 rounded-full border-4 border-zinc-100 dark:border-zinc-800 shadow-lg" alt={selectedStudent.name} />
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{selectedStudent.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1"><i className="fa-solid fa-graduation-cap"></i> {selectedStudent.grade}</span>
                                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                <span className="flex items-center gap-1"><i className="fa-solid fa-cake-candles"></i> {selectedStudent.age} Yaş</span>
                                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                    {selectedStudent.diagnosis[0] || 'Genel Takip'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={() => { setFormData(selectedStudent); setShowAddForm(true); }} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                            <i className="fa-solid fa-pen"></i> Düzenle
                        </button>
                        <button onClick={() => handleDelete(selectedStudent.id)} className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl flex items-center justify-center transition-colors">
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 gap-6 overflow-x-auto shrink-0">
                    {[
                        { id: 'overview', label: 'Genel Bakış', icon: 'fa-chart-pie' },
                        { id: 'materials', label: 'Materyaller', icon: 'fa-folder-open' },
                        { id: 'analytics', label: 'Gelişim Analizi', icon: 'fa-chart-line' },
                        { id: 'plans', label: 'Eğitim Planları', icon: 'fa-calendar-check' },
                        { id: 'notes', label: 'Notlar', icon: 'fa-sticky-note' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {loadingDetails ? (
                        <div className="flex items-center justify-center h-64"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500"></i></div>
                    ) : (
                        <div className="max-w-6xl mx-auto space-y-8 pb-20">
                            
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Stats Cards */}
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><i className="fa-solid fa-file-contract"></i></div>
                                            <h4 className="font-bold text-zinc-500 uppercase text-xs tracking-widest">Materyaller</h4>
                                        </div>
                                        <div className="text-3xl font-black text-zinc-900 dark:text-white">{studentWorksheets.length}</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg"><i className="fa-solid fa-clipboard-user"></i></div>
                                            <h4 className="font-bold text-zinc-500 uppercase text-xs tracking-widest">Raporlar</h4>
                                        </div>
                                        <div className="text-3xl font-black text-zinc-900 dark:text-white">{studentAssessments.length}</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg"><i className="fa-solid fa-calendar-check"></i></div>
                                            <h4 className="font-bold text-zinc-500 uppercase text-xs tracking-widest">Tamamlanan Plan</h4>
                                        </div>
                                        <div className="text-3xl font-black text-zinc-900 dark:text-white">
                                            {studentCurriculums.filter(c => c.schedule.every(d => d.isCompleted)).length} / {studentCurriculums.length}
                                        </div>
                                    </div>

                                    {/* Profile Details */}
                                    <div className="md:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Öğrenci Profili</h3>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                            <div>
                                                <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Tanı</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedStudent.diagnosis.map((d, i) => (
                                                        <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">{d}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Öğrenme Stili</label>
                                                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{selectedStudent.learningStyle || 'Belirtilmemiş'}</span>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">İlgi Alanları</label>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{selectedStudent.interests.length > 0 ? selectedStudent.interests.join(', ') : '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Veli İletişim</label>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-bold">{selectedStudent.parentName}</p>
                                                <p className="text-xs text-zinc-500">{selectedStudent.contactPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Notes Preview */}
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-500 mb-4">Önemli Notlar</h3>
                                        <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed italic">
                                            {selectedStudent.notes || "Henüz not eklenmemiş."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'materials' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {studentWorksheets.length === 0 ? (
                                        <div className="text-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-400">Henüz materyal oluşturulmamış.</div>
                                    ) : (
                                        studentWorksheets.map(ws => (
                                            <div key={ws.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-md transition-shadow group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-xl text-zinc-500"><i className={ws.icon}></i></div>
                                                    <div>
                                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{ws.name}</h4>
                                                        <p className="text-xs text-zinc-500">{new Date(ws.createdAt).toLocaleDateString('tr-TR')} • {ws.category.title}</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg text-xs font-bold transition-colors">Görüntüle</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'analytics' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {studentAssessments.length < 2 ? (
                                        <div className="text-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-400">
                                            Analiz grafiği için en az 2 değerlendirme raporu gereklidir.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                                <h3 className="font-bold text-lg mb-6">Gelişim Grafiği (Son 6 Ay)</h3>
                                                <div className="h-64">
                                                    <LineChart 
                                                        data={studentAssessments.map(a => ({
                                                            date: a.createdAt,
                                                            attention: a.report.scores.attention,
                                                            spatial: a.report.scores.spatial
                                                        }))} 
                                                        lines={[
                                                            { key: 'attention', color: '#ef4444', label: 'Dikkat' },
                                                            { key: 'spatial', color: '#3b82f6', label: 'Görsel Algı' }
                                                        ]} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center">
                                                    <h3 className="font-bold text-lg mb-4">Son Durum Analizi</h3>
                                                    {studentAssessments[0] && studentAssessments[0].report.chartData && (
                                                        <RadarChart data={studentAssessments[0].report.chartData} />
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'plans' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {studentCurriculums.map(plan => (
                                        <div key={plan.id} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                        <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
                                                        {new Date(plan.startDate).toLocaleDateString('tr-TR')} Programı
                                                    </h4>
                                                    <p className="text-sm text-zinc-500">{plan.durationDays} Günlük • {plan.goals.length} Hedef</p>
                                                </div>
                                                <div className="bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                    % {Math.round((plan.schedule.filter(d => d.isCompleted).length / plan.schedule.length) * 100)} Tamamlandı
                                                </div>
                                            </div>
                                            
                                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
                                                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${(plan.schedule.filter(d => d.isCompleted).length / plan.schedule.length) * 100}%` }}></div>
                                            </div>

                                            <div className="flex gap-2 justify-end">
                                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">Planı Aç</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                     <textarea 
                                        className="w-full h-96 p-6 bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl resize-none outline-none focus:border-yellow-400 text-yellow-900 dark:text-yellow-100 leading-relaxed shadow-inner"
                                        placeholder="Öğrenci hakkında gözlem notları, hatırlatmalar..."
                                        value={formData.notes || selectedStudent.notes}
                                        onChange={e => setFormData({...formData, notes: e.target.value})}
                                        onBlur={() => updateStudent(selectedStudent.id, { notes: formData.notes })}
                                    ></textarea>
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
                    <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <button 
                        onClick={() => setFormTab('identity')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'identity' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                    >
                        <i className="fa-solid fa-id-card"></i> Temel Bilgiler
                    </button>
                    <button 
                        onClick={() => setFormTab('academic')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'academic' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                    >
                        <i className="fa-solid fa-brain"></i> Akademik Profil
                    </button>
                    <button 
                        onClick={() => setFormTab('parent')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${formTab === 'parent' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
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
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Ad Soyad <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="Örn: Ayşe Yılmaz" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Yaş</label>
                                        <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sınıf</label>
                                        <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer">
                                            {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Öğrenme Stili</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Görsel', 'İşitsel', 'Kinestetik'].map(style => (
                                            <button
                                                key={style}
                                                type="button"
                                                onClick={() => setFormData({...formData, learningStyle: style as any})}
                                                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.learningStyle === style ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'}`}
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
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Tanı / Özel Durum</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.diagnosis?.map((d, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-2">
                                                {d} 
                                                <button type="button" onClick={() => setFormData({...formData, diagnosis: formData.diagnosis?.filter((_, idx) => idx !== i)})} className="hover:text-indigo-900">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <select 
                                        onChange={(e) => {
                                            if (e.target.value && !formData.diagnosis?.includes(e.target.value)) {
                                                setFormData({...formData, diagnosis: [...(formData.diagnosis || []), e.target.value]});
                                            }
                                        }}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                                        value=""
                                    >
                                        <option value="">Tanı Seçin...</option>
                                        {diagnosisOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">İlgi Alanları</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={tempInterest} onChange={e => setTempInterest(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Örn: Uzay" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('interests', tempInterest, setTempInterest))} />
                                            <button type="button" onClick={() => handleAddTag('interests', tempInterest, setTempInterest)} className="px-3 bg-zinc-200 rounded-lg">+</button>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {formData.interests?.map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center gap-1">{tag} <button type="button" onClick={() => handleRemoveTag('interests', i)}>×</button></span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Güçlü Yönler</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={tempStrength} onChange={e => setTempStrength(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Örn: Görsel hafıza" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('strengths', tempStrength, setTempStrength))} />
                                            <button type="button" onClick={() => handleAddTag('strengths', tempStrength, setTempStrength)} className="px-3 bg-zinc-200 rounded-lg">+</button>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {formData.strengths?.map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">{tag} <button type="button" onClick={() => handleRemoveTag('strengths', i)}>×</button></span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Destek İhtiyaçları (Zayıf Yönler)</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={tempWeakness} onChange={e => setTempWeakness(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Örn: b/d harfleri" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('weaknesses', tempWeakness, setTempWeakness))} />
                                        <button type="button" onClick={() => handleAddTag('weaknesses', tempWeakness, setTempWeakness)} className="px-3 bg-zinc-200 rounded-lg">+</button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {formData.weaknesses?.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs flex items-center gap-1">{tag} <button type="button" onClick={() => handleRemoveTag('weaknesses', i)}>×</button></span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PARENT */}
                        {formTab === 'parent' && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Veli Adı Soyadı</label>
                                    <div className="relative">
                                        <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                        <input type="text" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full pl-9 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="Veli Adı" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">İletişim Telefonu</label>
                                    <div className="relative">
                                        <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                        <input type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full pl-9 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="05XX XXX XX XX" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">E-posta Adresi</label>
                                    <div className="relative">
                                        <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                        <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full pl-9 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="veli@email.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Özel Notlar</label>
                                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none h-24 resize-none" placeholder="Eklemek istedikleriniz..." />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                    <div className="text-xs text-zinc-500 font-medium">
                        {formTab === 'identity' ? '1/3' : formTab === 'academic' ? '2/3' : '3/3'} Adım
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowAddForm(false)} className="px-6 py-2.5 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">Vazgeç</button>
                        <button 
                            type="submit" 
                            form="student-form" 
                            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
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
            {showAddForm && renderAddEditModal()}
        </div>
    );
};
