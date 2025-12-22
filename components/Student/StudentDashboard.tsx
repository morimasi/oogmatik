import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '../../context/StudentContext';
import { Student, SavedWorksheet, SavedAssessment } from '../../types';
import { worksheetService } from '../../services/worksheetService';
import { assessmentService } from '../../services/assessmentService';
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

type TabType = 'overview' | 'materials' | 'analytics' | 'notes' | 'settings';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack }) => {
    const { students, activeStudent, setActiveStudent, addStudent, deleteStudent, updateStudent, isLoading: contextLoading } = useStudent();
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    
    // Add Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], notes: '', 
        learningStyle: 'Görsel', parentName: '', contactPhone: '', contactEmail: ''
    });

    // Student Data State
    const [studentWorksheets, setStudentWorksheets] = useState<SavedWorksheet[]>([]);
    const [studentAssessments, setStudentAssessments] = useState<SavedAssessment[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGrade, setFilterGrade] = useState('all');

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
            const [ws, as] = await Promise.all([
                worksheetService.getWorksheetsByStudent(id),
                // Note: Assessment service might not have getByStudentId yet, filtering by name/metadata fallback usually happens in service
                // For now assuming we can fetch by user and filter, or future update adds getAssessmentsByStudent
                assessmentService.getUserAssessments(students.find(s=>s.id===id)?.teacherId || '') 
            ]);
            
            setStudentWorksheets(ws);
            // Fallback filtering for assessments until backend supports studentId directly on assessments
            const currentName = students.find(s=>s.id===id)?.name;
            setStudentAssessments(as.filter(a => a.studentName === currentName));
            
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

    // Render Components
    const renderSidebar = () => (
        <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full shrink-0">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-black text-lg text-zinc-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-users text-indigo-500"></i> Öğrenci Listesi
                    </h2>
                    <button onClick={() => { setFormData({}); setShowAddForm(true); }} className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="relative">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input 
                        type="text" 
                        placeholder="Öğrenci ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedStudentId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 shadow-sm' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-l-4 border-transparent'}`}
                    >
                        <img src={s.avatar} className="w-10 h-10 rounded-full bg-white border" alt={s.name} />
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm truncate ${selectedStudentId === s.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{s.name}</h4>
                            <p className="text-xs text-zinc-500 truncate">{s.grade} • {s.diagnosis?.[0] || 'Genel'}</p>
                        </div>
                        {activeStudent?.id === s.id && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedStudent) return <div className="flex-1 flex items-center justify-center text-zinc-400">Öğrenci seçiniz.</div>;

        return (
            <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-black overflow-hidden">
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 p-6 flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={selectedStudent.avatar} className="w-20 h-20 rounded-2xl shadow-md border-2 border-white dark:border-zinc-700" alt="" />
                            <span className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-800 p-1.5 rounded-lg shadow-sm border border-zinc-100 text-lg">
                                {selectedStudent.learningStyle === 'Görsel' ? '👁️' : selectedStudent.learningStyle === 'İşitsel' ? '👂' : '👋'}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                {selectedStudent.name}
                                {activeStudent?.id === selectedStudent.id && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full uppercase tracking-widest border border-green-200">Aktif</span>}
                            </h1>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{selectedStudent.grade}</span>
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{selectedStudent.age} Yaş</span>
                                {selectedStudent.diagnosis.map(d => (
                                    <span key={d} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/50">{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveStudent(selectedStudent)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeStudent?.id === selectedStudent.id ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white border-zinc-200 text-zinc-600 hover:border-green-500 hover:text-green-600'}`}>
                            {activeStudent?.id === selectedStudent.id ? 'Seçili Öğrenci' : 'Öğrenciyi Seç'}
                        </button>
                        <button onClick={() => { setFormData(selectedStudent); setShowAddForm(true); }} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-colors"><i className="fa-solid fa-pen"></i></button>
                        <button onClick={() => handleDelete(selectedStudent.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-6 flex gap-6 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Genel Bakış', icon: 'fa-chart-pie' },
                        { id: 'materials', label: 'Materyal Arşivi', icon: 'fa-folder-open' },
                        { id: 'analytics', label: 'Gelişim Analizi', icon: 'fa-chart-line' },
                        { id: 'notes', label: 'Pedagojik Günlük', icon: 'fa-book-medical' },
                        { id: 'settings', label: 'Profil Ayarları', icon: 'fa-user-gear' }
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                    {loadingDetails ? <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i></div> : null}

                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-file-lines"></i></div>
                                    <div>
                                        <h4 className="text-2xl font-black text-zinc-800 dark:text-white">{studentWorksheets.length}</h4>
                                        <p className="text-xs font-bold text-zinc-400 uppercase">Toplam Materyal</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-clipboard-check"></i></div>
                                    <div>
                                        <h4 className="text-2xl font-black text-zinc-800 dark:text-white">{studentAssessments.length}</h4>
                                        <p className="text-xs font-bold text-zinc-400 uppercase">Değerlendirme</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-star"></i></div>
                                    <div>
                                        <h4 className="text-2xl font-black text-zinc-800 dark:text-white">{studentWorksheets.length * 10}XP</h4>
                                        <p className="text-xs font-bold text-zinc-400 uppercase">Toplam Puan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cognitive Map & Recent Work */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="font-bold text-zinc-800 dark:text-white mb-6">Bilişsel Yetenek Haritası</h3>
                                    {studentAssessments.length > 0 ? (
                                        <div className="flex justify-center">
                                            <RadarChart data={studentAssessments[studentAssessments.length-1].report.chartData} />
                                        </div>
                                    ) : (
                                        <div className="h-64 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200">
                                            <i className="fa-solid fa-chart-pie text-4xl mb-3 opacity-50"></i>
                                            <p>Henüz değerlendirme verisi yok.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col">
                                    <h3 className="font-bold text-zinc-800 dark:text-white mb-6">Son Çalışmalar</h3>
                                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                        {studentWorksheets.slice(0, 6).map(ws => (
                                            <div key={ws.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors border border-transparent hover:border-zinc-200">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                                    <i className={ws.icon}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-zinc-800 dark:text-zinc-100 truncate">{ws.name}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(ws.createdAt).toLocaleDateString()} • {ws.activityType}</p>
                                                </div>
                                                <button className="text-zinc-400 hover:text-indigo-600"><i className="fa-solid fa-eye"></i></button>
                                            </div>
                                        ))}
                                        {studentWorksheets.length === 0 && <p className="text-zinc-400 text-sm text-center py-10">Kayıtlı çalışma yok.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
                            {studentWorksheets.map(ws => (
                                <div key={ws.id} className="group bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <i className={`${ws.icon} text-6xl`}></i>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm">
                                            <i className={ws.icon}></i>
                                        </div>
                                        <h4 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1 mb-1">{ws.name}</h4>
                                        <p className="text-xs text-zinc-500 mb-4">{ws.category.title}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                            <span className="text-[10px] font-mono text-zinc-400">{new Date(ws.createdAt).toLocaleDateString()}</span>
                                            <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors">Aç</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {studentWorksheets.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center h-96 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl">
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
                            <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <h3 className="font-bold text-xl text-zinc-800 dark:text-white mb-8 flex items-center gap-2">
                                    <i className="fa-solid fa-chart-line text-indigo-500"></i> Performans Gelişim Grafiği
                                </h3>
                                <div className="h-80 w-full">
                                    <LineChart 
                                        data={studentAssessments.map(a => ({
                                            date: a.createdAt,
                                            reading: a.report.scores.linguistic || 0,
                                            math: a.report.scores.logical || 0,
                                            attention: a.report.scores.attention || 0
                                        }))}
                                        lines={[
                                            { key: 'reading', color: '#3B82F6', label: 'Sözel Beceriler' },
                                            { key: 'math', color: '#EF4444', label: 'Mantıksal Beceriler' },
                                            { key: 'attention', color: '#10B981', label: 'Dikkat & Odak' }
                                        ]}
                                        height={320}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-bold text-zinc-700 dark:text-zinc-300 ml-2">Değerlendirme Geçmişi</h3>
                                {studentAssessments.map(assessment => (
                                    <div key={assessment.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-file-medical"></i></div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white">{assessment.studentName} Raporu</h4>
                                                <p className="text-xs text-zinc-500">{new Date(assessment.createdAt).toLocaleDateString()} • {assessment.grade}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-sm font-bold text-zinc-600">
                                            <span className="flex flex-col items-center"><span className="text-xs text-zinc-400 font-normal">Dikkat</span> %{assessment.report.scores.attention}</span>
                                            <span className="flex flex-col items-center"><span className="text-xs text-zinc-400 font-normal">Sözel</span> %{assessment.report.scores.linguistic}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                    {activeTab === 'settings' && (
                        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm animate-in fade-in">
                            <form onSubmit={handleSaveStudent} className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="font-black text-sm text-zinc-400 uppercase tracking-widest border-b pb-2">Öğrenci Kimliği</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Ad Soyad</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-white focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Yaş</label>
                                                <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-white focus:border-indigo-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Sınıf</label>
                                                <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-white focus:border-indigo-500 outline-none">
                                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-black text-sm text-zinc-400 uppercase tracking-widest border-b pb-2">Pedagojik Profil</h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Öğrenme Stili</label>
                                        <div className="flex gap-4">
                                            {['Görsel', 'İşitsel', 'Kinestetik'].map(style => (
                                                <label key={style} className={`flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 ${formData.learningStyle === style ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-zinc-200 hover:border-zinc-300'}`}>
                                                    <input type="radio" name="style" value={style} checked={formData.learningStyle === style} onChange={() => setFormData({...formData, learningStyle: style as any})} className="hidden" />
                                                    <i className={`fa-solid ${style === 'Görsel' ? 'fa-eye' : style === 'İşitsel' ? 'fa-ear-listen' : 'fa-hand-sparkles'}`}></i>
                                                    {style}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Tanı / İhtiyaç</label>
                                        <div className="flex flex-wrap gap-2">
                                            {diagnosisOptions.map(opt => {
                                                const isActive = formData.diagnosis?.includes(opt);
                                                return (
                                                    <button 
                                                        key={opt} type="button"
                                                        onClick={() => setFormData(prev => ({...prev, diagnosis: isActive ? prev.diagnosis?.filter(d => d !== opt) : [...(prev.diagnosis || []), opt]}))}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isActive ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-zinc-200 text-zinc-600'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="font-black text-sm text-zinc-400 uppercase tracking-widest border-b pb-2">Veli İletişim</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Veli Adı</label>
                                            <input type="text" value={formData.parentName || ''} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Anne/Baba Adı" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Telefon</label>
                                            <input type="tel" value={formData.contactPhone || ''} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="05XX..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                                    <button type="submit" className="px-8 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">Değişiklikleri Kaydet</button>
                                </div>
                            </form>
                        </div>
                    )}
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
            <div className="hidden md:flex w-16 bg-zinc-900 flex-col items-center py-6 gap-6 shrink-0">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors mb-4" title="Ana Menü"><i className="fa-solid fa-house"></i></button>
                <div className="w-8 h-px bg-white/10"></div>
                {/* Could add quick student switch icons here */}
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