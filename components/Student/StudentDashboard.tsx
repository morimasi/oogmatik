
import React, { useState, useEffect, useMemo } from 'react';
import { useStudent } from '../../context/StudentContext';
import { Student, SavedWorksheet, ActivityType } from '../../types';
import { worksheetService } from '../../services/worksheetService';
import { assessmentService } from '../../services/assessmentService';
import { LineChart } from '../LineChart';

interface StudentDashboardProps {
    onBack: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack }) => {
    const { students, activeStudent, setActiveStudent, addStudent, deleteStudent, isLoading: contextLoading } = useStudent();
    const [view, setView] = useState<'grid' | 'details'>('grid');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Detailed data for the selected student
    const [studentWorksheets, setStudentWorksheets] = useState<SavedWorksheet[]>([]);
    const [studentAssessments, setStudentAssessments] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Filters
    const [gradeFilter, setGradeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const diagnosisOptions = ["Disleksi", "Diskalkuli", "Disgrafi", "DEHB", "Öğrenme Güçlüğü (Genel)"];
    const interestOptions = ["Uzay", "Hayvanlar", "Dinozorlar", "Spor", "Sanat", "Teknoloji", "Doğa"];
    const grades = ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'];

    const [formData, setFormData] = useState({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: [] as string[], interests: [] as string[], notes: ''
    });

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesGrade && matchesSearch;
        });
    }, [students, gradeFilter, searchQuery]);

    const handleViewDetails = async (student: Student) => {
        setSelectedStudent(student);
        setLoadingDetails(true);
        setView('details');
        try {
            const [ws, assessments] = await Promise.all([
                worksheetService.getWorksheetsByStudent(student.id),
                assessmentService.getUserAssessments(student.teacherId) // Filtering client side for now as assessments don't have studentId yet
            ]);
            setStudentWorksheets(ws);
            setStudentAssessments(assessments.filter(a => a.studentName === student.name));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetails(false);
        }
    };

    const toggleTag = (type: 'diagnosis' | 'interests', value: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].includes(value) 
                ? prev[type].filter(v => v !== value) 
                : [...prev[type], value]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addStudent({
            ...formData,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
        });
        setShowAddForm(false);
        setFormData({ name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], notes: '' });
    };

    if (view === 'details' && selectedStudent) {
        return (
            <div className="h-full bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => setView('grid')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors">
                        <i className="fa-solid fa-arrow-left"></i> Öğrenci Listesine Dön
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                                <img src={selectedStudent.avatar} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-indigo-50 dark:border-zinc-800 shadow-lg" alt="" />
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{selectedStudent.name}</h2>
                                <p className="text-indigo-500 font-bold uppercase text-xs tracking-widest mt-1">{selectedStudent.grade} • {selectedStudent.age} Yaş</p>
                                
                                <div className="mt-8 flex flex-wrap justify-center gap-2">
                                    {selectedStudent.diagnosis.map(d => (
                                        <span key={d} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold border border-red-100 dark:border-red-900/50">{d}</span>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <button 
                                        onClick={() => setActiveStudent(selectedStudent)}
                                        className={`w-full py-3 rounded-2xl font-black text-sm transition-all ${activeStudent?.id === selectedStudent.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}
                                    >
                                        {activeStudent?.id === selectedStudent.id ? 'BU ÖĞRENCİ AKTİF' : 'ÖĞRENCİYİ SEÇ (ÜRETİM İÇİN)'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
                                <h4 className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest mb-4">Eğitmen Notları</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                                    {selectedStudent.notes || "Not bulunmuyor."}
                                </p>
                            </div>
                        </div>

                        {/* Analysis & History */}
                        <div className="lg:col-span-8 space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Üretilen</span>
                                    <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{studentWorksheets.length}</div>
                                    <p className="text-[10px] text-zinc-500 mt-1">Çalışma Sayfası</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Değerlendirme</span>
                                    <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">{studentAssessments.length}</div>
                                    <p className="text-[10px] text-zinc-500 mt-1">Tanısal Rapor</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Sistem Kaydı</span>
                                    <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                                        {new Date(selectedStudent.createdAt).toLocaleDateString('tr-TR')}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">Kayıt Tarihi</p>
                                </div>
                             </div>

                             {/* Chart Section */}
                             <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                    <i className="fa-solid fa-chart-line text-indigo-500"></i> Bilişsel Gelişim Seyri
                                </h3>
                                <div className="h-64">
                                    {studentAssessments.length > 1 ? (
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
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-400 text-sm italic bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-700">
                                            Gelişim grafiği için en az 2 değerlendirme raporu gereklidir.
                                        </div>
                                    )}
                                </div>
                             </div>

                             {/* Recent Activities */}
                             <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 mb-6">Son Çalışmalar</h3>
                                {studentWorksheets.length === 0 ? (
                                    <p className="text-zinc-400 text-sm italic">Henüz bu öğrenci için içerik üretilmedi.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {studentWorksheets.slice(0, 5).map(ws => (
                                            <div key={ws.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-400 shadow-sm">
                                                        <i className={ws.icon}></i>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{ws.name}</p>
                                                        <p className="text-[10px] text-zinc-500 uppercase">{ws.category.title}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-zinc-400">{new Date(ws.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Öğrencilerim</h1>
                        <p className="text-zinc-500 text-sm mt-1">Öğrenci bazlı analiz ve kişiselleştirilmiş eğitim materyalleri.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onBack} className="px-5 py-2.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-50">
                            Geri Dön
                        </button>
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:bg-indigo-700 transition-all transform active:scale-95"
                        >
                            <i className="fa-solid fa-plus"></i> Yeni Öğrenci
                        </button>
                    </div>
                </div>

                {/* Filters Area */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" 
                            placeholder="Öğrenci ismi ile ara..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button 
                            onClick={() => setGradeFilter('all')}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${gradeFilter === 'all' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                        >
                            Tümü
                        </button>
                        {grades.map(g => (
                            <button 
                                key={g}
                                onClick={() => setGradeFilter(g)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${gradeFilter === g ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Student Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(s => (
                        <div 
                            key={s.id} 
                            onClick={() => handleViewDetails(s)}
                            className={`group bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${activeStudent?.id === s.id ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm'}`}
                        >
                            {activeStudent?.id === s.id && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                                    Aktif Seçim
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <img src={s.avatar} className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-50 dark:border-zinc-700 p-1" alt="" />
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{s.name}</h3>
                                    <p className="text-xs font-bold text-zinc-400 uppercase">{s.grade} • {s.age} Yaş</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {s.diagnosis.slice(0, 2).map(d => (
                                            <span key={d} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-[9px] font-bold border border-red-100 dark:border-red-800">{d}</span>
                                        ))}
                                        {s.diagnosis.length > 2 && <span className="text-[9px] text-zinc-400 font-bold">+{s.diagnosis.length - 2}</span>}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gelişim Analizi</span>
                                    <div className="flex gap-1">
                                        <div className="w-4 h-1 bg-emerald-500 rounded-full"></div>
                                        <div className="w-4 h-1 bg-emerald-500 rounded-full"></div>
                                        <div className="w-4 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); deleteStudent(s.id); }} className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"><i className="fa-solid fa-trash-can mr-1"></i> Sil</button>
                                <button className="text-indigo-500 font-black text-xs uppercase tracking-widest flex items-center gap-1">Kayıtları Gör <i className="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>
                    ))}
                </div>

                {(contextLoading) ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i></div>
                ) : students.length === 0 && !showAddForm ? (
                    <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 shadow-inner">
                        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fa-solid fa-user-plus text-3xl text-zinc-200"></i>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-400">Öğrenci Portföyü Boş</h3>
                        <p className="text-zinc-500 mt-2">Kişiselleştirilmiş içerikler için hemen ilk öğrencinizi ekleyin.</p>
                        <button onClick={() => setShowAddForm(true)} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">ÖĞRENCİ EKLE</button>
                    </div>
                ) : filteredStudents.length === 0 && searchQuery && (
                     <div className="py-12 text-center text-zinc-500 italic">"{searchQuery}" aramasına uygun öğrenci bulunamadı.</div>
                )}
            </div>

            {/* ADD FORM MODAL */}
            {showAddForm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-white dark:border-zinc-800">
                        <div className="bg-zinc-900 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><i className="fa-solid fa-user-plus"></i></div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Yeni Öğrenci Profili</h3>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 transition-colors"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Ad Soyad</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl focus:border-indigo-500 outline-none transition-all" placeholder="Örn: Mehmet Ali" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Yaş</label>
                                        <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Sınıf</label>
                                        <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl focus:border-indigo-500 outline-none transition-all">
                                            {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-zinc-500 uppercase mb-3">Tanı Bilgisi (Yapay Zekayı Yönlendirir)</label>
                                <div className="flex flex-wrap gap-2">
                                    {diagnosisOptions.map(opt => (
                                        <button 
                                            key={opt} type="button"
                                            onClick={() => toggleTag('diagnosis', opt)}
                                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border-2 ${formData.diagnosis.includes(opt) ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-zinc-500 uppercase mb-3">İlgi Alanları (İçerikleri Sevdirelim)</label>
                                <div className="flex flex-wrap gap-2">
                                    {interestOptions.map(opt => (
                                        <button 
                                            key={opt} type="button"
                                            onClick={() => toggleTag('interests', opt)}
                                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border-2 ${formData.interests.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Özel Notlar (Eğitmen Notu)</label>
                                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full h-24 p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl focus:border-indigo-500 outline-none resize-none transition-all" placeholder="Gözlemlerinizi buraya ekleyebilirsiniz..." />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 font-bold rounded-2xl transition-colors">Vazgeç</button>
                                <button type="submit" className="px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl transform active:scale-95 transition-all">PROFİLİ OLUŞTUR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
