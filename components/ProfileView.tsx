
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext'; 
import { SavedAssessment, SavedWorksheet, ActivityType, User, Curriculum, Student } from '../types';
import { assessmentService } from '../services/assessmentService';
import { worksheetService } from '../services/worksheetService';
import { curriculumService } from '../services/curriculumService'; 
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { LineChart } from './LineChart';
import { RadarChart } from './RadarChart';
import { printService } from '../utils/printService'; 
import { ACTIVITIES } from '../constants';
import { StudentDashboard } from './Student/StudentDashboard';

// --- BENTO COMPONENTS ---

const BentoCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    title?: string; 
    icon?: string; 
    iconColor?: string;
    action?: React.ReactNode;
}> = ({ children, className = "", title, icon, iconColor = "bg-zinc-100 text-zinc-500", action }) => (
    <div className={`bg-white dark:bg-zinc-800 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group ${className}`}>
        {(title || icon || action) && (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110 duration-300 ${iconColor}`}>
                            <i className={icon}></i>
                        </div>
                    )}
                    {title && <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{title}</h3>}
                </div>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

const StatValue: React.FC<{ value: string | number; label?: string; subValue?: string; trend?: 'up' | 'down' }> = ({ value, label, subValue, trend }) => (
    <div className="flex flex-col">
        <div className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
            {value}
        </div>
        {label && <div className="text-sm text-zinc-500 font-bold uppercase tracking-wide">{label}</div>}
        {subValue && (
            <div className={`text-[10px] font-black px-2 py-1 rounded-full inline-flex items-center gap-1 mt-3 w-fit ${
                trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700'
            }`}>
                {trend === 'up' && <i className="fa-solid fa-arrow-trend-up"></i>}
                {subValue}
            </div>
        )}
    </div>
);

const TabPill: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all duration-300 uppercase tracking-widest border-2 ${
            active 
            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-2xl scale-105 z-10' 
            : 'bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border-transparent hover:border-zinc-100 dark:hover:border-zinc-700'
        }`}
    >
        <i className={`${icon} ${active ? 'animate-bounce' : ''}`}></i>
        <span>{label}</span>
    </button>
);

const ActionButton: React.FC<{ label: string; icon: string; onClick: () => void; color?: string }> = ({ label, icon, onClick, color = "bg-indigo-600 text-white" }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20 ${color}`}
    >
        <i className={icon}></i>
        {label}
    </button>
);

type ProfileTab = 'overview' | 'students' | 'evaluations' | 'plans' | 'reports' | 'settings';

export const ProfileView: React.FC<{ onBack: () => void; onSelectActivity: (id: ActivityType | null) => void; targetUser?: User }> = ({ onBack, onSelectActivity, targetUser }) => {
    const { user: authUser, updateUser, logout } = useAuth();
    const { students, activeStudent } = useStudent(); 
    
    const user = targetUser || authUser;
    const isReadOnly = !!targetUser && targetUser.id !== authUser?.id;

    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
    
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
    
    // Settings States
    const [editName, setEditName] = useState(user?.name || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            loadData();
        }
    }, [user?.id]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [asData, wsResult, plData] = await Promise.all([
                assessmentService.getUserAssessments(user.id),
                worksheetService.getUserWorksheets(user.id, 0, 1000),
                curriculumService.getUserCurriculums(user.id)
            ]);
            setAssessments(asData);
            setWorksheets(wsResult.items);
            setCurriculums(plData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user || isReadOnly) return;
        setIsSavingProfile(true);
        try {
            await updateUser({ name: editName });
            setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (e) {
            setMessage({ type: 'error', text: 'Güncelleme hatası oluştu.' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- ANALYTICS COMPUTATIONS ---
    const performanceTrends = useMemo(() => {
        if (assessments.length < 2) return null;
        return assessments.slice(0, 5).reverse().map(a => ({
            date: a.createdAt,
            puan: a.report.scores.attention || 0
        }));
    }, [assessments]);

    if (!user) return null;

    return (
        <div className="bg-[#f8fafc] dark:bg-[#09090b] min-h-screen flex flex-col font-['Lexend']">
            {/* 1. PROFESSIONAL HEADER */}
            <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-10 relative z-10">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[3rem] p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl overflow-hidden transform group-hover:rotate-6 transition-transform duration-500">
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-[2.8rem] object-cover bg-white dark:bg-zinc-800" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-900">
                            <i className="fa-solid fa-shield-halved text-lg"></i>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">{user.name}</h1>
                            <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 w-fit mx-auto md:mx-0">
                                {user.role === 'admin' ? 'SİSTEM YÖNETİCİSİ' : 'UZMAN EĞİTMEN'}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                                <i className="fa-solid fa-envelope opacity-40"></i> {user.email}
                            </div>
                            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block"></div>
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                                <i className="fa-solid fa-calendar-check opacity-40"></i> {new Date(user.createdAt).toLocaleDateString('tr-TR')} tarihinde katıldı
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                        <button onClick={onBack} className="w-full md:w-auto px-8 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all">Geri Dön</button>
                        {!isReadOnly && <button onClick={logout} className="w-full md:w-auto px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all border border-red-100 dark:border-red-900/30">Oturumu Kapat</button>}
                    </div>
                </div>
            </div>

            {/* 2. TAB NAVIGATION */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-8">
                <div className="max-w-7xl mx-auto flex gap-2 py-4 overflow-x-auto custom-scrollbar no-scrollbar">
                    <TabPill active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Özet" icon="fa-solid fa-chart-pie" />
                    <TabPill active={activeTab === 'students'} onClick={() => setActiveTab('students')} label="Öğrenciler" icon="fa-solid fa-user-graduate" />
                    <TabPill active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} label="Değerlendirme" icon="fa-solid fa-clipboard-check" />
                    <TabPill active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} label="Eğitim Planları" icon="fa-solid fa-graduation-cap" />
                    <TabPill active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Raporlar" icon="fa-solid fa-file-medical" />
                    <TabPill active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ayarlar" icon="fa-solid fa-gear" />
                </div>
            </div>

            {/* 3. MODULE CONTENT AREA */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-7xl mx-auto pb-20">
                    
                    {message && (
                        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                            <span className="font-bold text-sm">{message.text}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
                            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] md:col-span-2"></div>
                            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem]"></div>
                            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem]"></div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    {/* Stats Hero */}
                                    <BentoCard className="md:col-span-8" title="Platform Etkileşimi" icon="fa-solid fa-chart-line" iconColor="bg-indigo-100 text-indigo-600">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                            <StatValue value={students.length} label="Öğrenci" subValue="+2 Bu Ay" trend="up" />
                                            <StatValue value={worksheets.length} label="Materyal" subValue="Aktif Kullanım" />
                                            <StatValue value={assessments.length} label="Rapor" subValue="%94 Başarı" trend="up" />
                                            <StatValue value={curriculums.length} label="Program" subValue="Bireysel Plan" />
                                        </div>
                                        {performanceTrends && (
                                            <div className="mt-12 h-64 w-full">
                                                <LineChart 
                                                    data={performanceTrends} 
                                                    lines={[{ key: 'puan', color: '#6366f1', label: 'Ortalama Dikkat Skoru' }]} 
                                                    height={250} 
                                                />
                                            </div>
                                        )}
                                    </BentoCard>

                                    {/* Active Student Shortcut */}
                                    <BentoCard className="md:col-span-4" title="Son Odak" icon="fa-solid fa-star" iconColor="bg-amber-100 text-amber-600">
                                        {activeStudent ? (
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center gap-5 mb-8">
                                                    <img src={activeStudent.avatar} className="w-20 h-20 rounded-[2rem] border-4 border-white dark:border-zinc-700 shadow-xl" alt="" />
                                                    <div>
                                                        <h4 className="text-xl font-black text-zinc-900 dark:text-white leading-none mb-2">{activeStudent.name}</h4>
                                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{activeStudent.grade}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 mb-8">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-zinc-400">GELİŞİM</span>
                                                        <span className="text-emerald-500">%78</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-lg shadow-emerald-500/20" style={{ width: '78%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="mt-auto">
                                                    <ActionButton label="PROFİLİ AÇ" icon="fa-solid fa-arrow-right" onClick={() => setActiveTab('students')} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 italic text-sm">
                                                <i className="fa-solid fa-user-plus text-4xl mb-4 opacity-20"></i>
                                                Aktif öğrenci seçilmedi
                                            </div>
                                        )}
                                    </BentoCard>

                                    {/* Activities Quick List */}
                                    <BentoCard className="md:col-span-12" title="Son Üretilen Materyaller" icon="fa-solid fa-history" iconColor="bg-zinc-100 text-zinc-900">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {worksheets.slice(0, 4).map(ws => (
                                                <div key={ws.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group">
                                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center text-xl text-zinc-400 group-hover:text-indigo-600 transition-colors">
                                                        <i className={ws.icon}></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 truncate">{ws.name}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{new Date(ws.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {worksheets.length === 0 && <div className="col-span-4 text-center py-8 text-zinc-400">Henüz materyal üretilmedi.</div>}
                                        </div>
                                    </BentoCard>
                                </div>
                            )}

                            {activeTab === 'students' && (
                                <div className="h-[70vh] rounded-[3rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                    <StudentDashboard onBack={() => setActiveTab('overview')} />
                                </div>
                            )}

                            {activeTab === 'evaluations' && (
                                <BentoCard title="Tanısal Analiz Geçmişi" icon="fa-solid fa-clipboard-user" iconColor="bg-purple-100 text-purple-600">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-zinc-100 dark:border-zinc-700">
                                                    <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Öğrenci</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Dikkat</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Bellek</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tarih</th>
                                                    <th className="p-6"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                                {assessments.map(a => (
                                                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all group">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 group-hover:text-purple-600 transition-colors">{a.studentName[0]}</div>
                                                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{a.studentName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-center">
                                                            <span className="px-3 py-1 rounded-lg bg-red-50 text-red-600 font-mono font-black text-xs">%{a.report.scores.attention}</span>
                                                        </td>
                                                        <td className="p-6 text-center">
                                                            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-mono font-black text-xs">%{a.report.scores.spatial}</span>
                                                        </td>
                                                        <td className="p-6 text-sm text-zinc-500 font-bold">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                                                        <td className="p-6 text-right">
                                                            <button onClick={() => setSelectedAssessment(a)} className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform hover:scale-110 active:scale-95">Raporu Aç</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {assessments.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-zinc-400 font-bold italic">Kayıtlı değerlendirme bulunamadı.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </BentoCard>
                            )}

                            {activeTab === 'plans' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {curriculums.map(plan => (
                                        <BentoCard key={plan.id} title={`${plan.durationDays} GÜNLÜK PROGRAM`} icon="fa-solid fa-graduation-cap" iconColor="bg-emerald-100 text-emerald-600">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-none mb-1">{plan.studentName}</h4>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{plan.grade}</p>
                                                </div>
                                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black text-[10px]">AKTİF</div>
                                            </div>
                                            <div className="space-y-4 mb-8">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-zinc-400">Genel İlerleme</span>
                                                    <span className="text-zinc-900 dark:text-white">% {Math.round((plan.schedule.filter(d => d.isCompleted).length / plan.schedule.length) * 100)}</span>
                                                </div>
                                                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20" style={{ width: `${(plan.schedule.filter(d => d.isCompleted).length / plan.schedule.length) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]">PLANA GİT</button>
                                                <button onClick={() => {}} className="w-14 h-14 bg-zinc-100 dark:bg-zinc-700 rounded-2xl flex items-center justify-center text-zinc-500"><i className="fa-solid fa-print"></i></button>
                                            </div>
                                        </BentoCard>
                                    ))}
                                    {curriculums.length === 0 && <div className="lg:col-span-2 p-20 text-center text-zinc-400 border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] font-bold">Henüz eğitim planı oluşturulmamış.</div>}
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <BentoCard title="Kurumsal Raporlama" icon="fa-solid fa-file-invoice" iconColor="bg-blue-100 text-blue-600">
                                        <p className="text-sm text-zinc-500 leading-relaxed mb-6">Tüm öğrencilerin gelişim verilerini tek bir PDF dosyasında birleştirin. Karşılaştırmalı analitikler ve aylık gelişim özetleri içerir.</p>
                                        <button onClick={() => alert("Bu modül toplu veri analizi için hazırlanmaktadır.")} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">RAPOR SİHİRBAZINI AÇ</button>
                                    </BentoCard>
                                    <BentoCard title="Kullanım İstatistikleri" icon="fa-solid fa-database" iconColor="bg-zinc-900 text-white">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-3">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">TOPLAM ÜRETİM</span>
                                                <span className="font-black text-lg">{worksheets.length} Sayfa</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-3">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">AKTİF ÖĞRENCİ</span>
                                                <span className="font-black text-lg">{students.length} Kişi</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">ORT. ANALİZ SKORU</span>
                                                <span className="font-black text-lg text-indigo-600">%82</span>
                                            </div>
                                        </div>
                                    </BentoCard>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <BentoCard title="Hesap ve Sistem Ayarları" icon="fa-solid fa-sliders" iconColor="bg-zinc-100 text-zinc-900">
                                    <div className="max-w-xl space-y-10">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-2">KİŞİSEL BİLGİLER</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">Görünen Ad</label>
                                                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">E-posta (Değiştirilemez)</label>
                                                    <input type="text" value={user.email} disabled className="w-full p-4 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-400 cursor-not-allowed outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-2">SİSTEM TERCİHLERİ</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><i className="fa-solid fa-moon"></i></div>
                                                        <div><p className="text-sm font-black text-zinc-800 dark:text-zinc-200">Koyu Tema</p><p className="text-[10px] text-zinc-500">Göz yorgunluğunu azaltın.</p></div>
                                                    </div>
                                                    <div className="w-12 h-6 bg-zinc-300 dark:bg-indigo-600 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 dark:left-7 transition-all"></div></div>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 opacity-50 cursor-not-allowed">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><i className="fa-solid fa-bell"></i></div>
                                                        <div><p className="text-sm font-black text-zinc-800 dark:text-zinc-200">E-posta Bildirimleri</p><p className="text-[10px] text-zinc-500">Raporlar tamamlandığında haberdar olun.</p></div>
                                                    </div>
                                                    <div className="w-12 h-6 bg-zinc-300 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-all"></div></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button 
                                                onClick={handleUpdateProfile}
                                                disabled={isSavingProfile}
                                                className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isSavingProfile ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-save mr-2"></i>}
                                                Ayarları Kaydet
                                            </button>
                                        </div>
                                    </div>
                                </BentoCard>
                            )}

                        </div>
                    )}
                </div>
            </div>

            <AssessmentReportViewer assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} user={user} />
        </div>
    );
};
