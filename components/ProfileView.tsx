
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedAssessment, SavedWorksheet, ActivityType, User, Curriculum } from '../types';
import { assessmentService } from '../services/assessmentService';
import { worksheetService } from '../services/worksheetService';
import { curriculumService } from '../services/curriculumService'; // Added service
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { LineChart } from './LineChart';
import { printService } from '../utils/printService'; // Added print service
import { ACTIVITIES } from '../constants'; // For activity titles

// --- BENTO COMPONENTS ---

const BentoCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    title?: string; 
    icon?: string; 
    iconColor?: string;
    action?: React.ReactNode;
}> = ({ children, className = "", title, icon, iconColor = "bg-zinc-100 text-zinc-500", action }) => (
    <div className={`bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${className}`}>
        {(title || icon || action) && (
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm ${iconColor}`}>
                            <i className={icon}></i>
                        </div>
                    )}
                    {title && <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h3>}
                </div>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

const StatValue: React.FC<{ value: string | number; label?: string; subValue?: string }> = ({ value, label, subValue }) => (
    <div>
        <div className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{value}</div>
        {label && <div className="text-sm text-zinc-500 font-medium mt-1">{label}</div>}
        {subValue && <div className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full inline-block mt-2">{subValue}</div>}
    </div>
);

const TabPill: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
            active 
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg transform scale-105' 
            : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
        }`}
    >
        <i className={icon}></i> {label}
    </button>
);

const LoadingSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl md:col-span-2"></div>
        <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl md:col-span-4"></div>
    </div>
);

// --- PLAN VIEWER MODAL ---
const PlanViewerModal = ({ plan, onClose }: { plan: Curriculum, onClose: () => void }) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                await printService.generatePdf('#plan-content-area', `${plan.studentName}-Egitim-Plani`, { action });
            } catch (error) {
                console.error("Print error", error);
                alert("İşlem sırasında bir hata oluştu.");
            } finally {
                setIsPrinting(false);
            }
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
                            {plan.studentName} - Eğitim Planı
                        </h3>
                        <p className="text-xs text-zinc-500">{plan.grade} • {plan.durationDays} Günlük Program</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => handlePrint('download')}
                            disabled={isPrinting}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-2"
                        >
                            {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                            PDF İndir
                        </button>
                        <button 
                            onClick={() => handlePrint('print')}
                            disabled={isPrinting}
                            className="p-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors text-xs font-bold flex items-center gap-2"
                        >
                            <i className="fa-solid fa-print"></i> Yazdır
                        </button>
                        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div id="plan-content-area" className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    <div className="worksheet-item space-y-8">
                        {/* Title Section */}
                        <div className="text-center border-b-2 border-zinc-100 pb-6">
                            <h1 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">Kişisel Gelişim Planı</h1>
                            <p className="text-zinc-500">{new Date(plan.startDate).toLocaleDateString('tr-TR')} Tarihinde Oluşturuldu</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {plan.goals.map((g, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                                        <i className="fa-solid fa-bullseye mr-1"></i> {g}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        {plan.note && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm italic text-center">
                                "{plan.note}"
                            </div>
                        )}

                        {/* Schedule Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {plan.schedule.map((day) => (
                                <div key={day.day} className="border-2 border-zinc-100 rounded-2xl overflow-hidden break-inside-avoid">
                                    <div className="bg-zinc-50 p-3 border-b border-zinc-100 flex justify-between items-center">
                                        <span className="font-black text-lg text-black">{day.day}. Gün</span>
                                        <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded border border-zinc-200">{day.focus}</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {day.activities.map((act, idx) => (
                                            <div key={idx} className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                                                <div>
                                                    <h4 className="font-bold text-black">{act.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                                        <span className="bg-zinc-100 px-2 rounded">{act.duration} dk</span>
                                                        <span className={`font-bold ${act.difficultyLevel === 'Hard' ? 'text-red-500' : act.difficultyLevel === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>
                                                            {act.difficultyLevel === 'Hard' ? 'Zor' : act.difficultyLevel === 'Medium' ? 'Orta' : 'Kolay'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 mt-1 italic">{act.goal}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProfileViewProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    targetUser?: User; 
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onSelectActivity, targetUser }) => {
    const { user: authUser, updateUser, updatePassword, logout } = useAuth();
    
    const user = targetUser || authUser;
    const isReadOnly = !!targetUser && targetUser.id !== authUser?.id;

    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'evaluations' | 'plans' | 'settings'>('overview');
    
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Curriculum | null>(null);
    
    const [editName, setEditName] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isChangingAvatar, setIsChangingAvatar] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            loadData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [assessData, sheetsDataResult, plansData] = await Promise.all([
                assessmentService.getUserAssessments(user.id),
                worksheetService.getUserWorksheets(user.id, 0, 1000),
                curriculumService.getUserCurriculums(user.id)
            ]);
            setAssessments(assessData);
            setWorksheets(sheetsDataResult.items);
            setCurriculums(plansData);
        } catch (e) {
            console.error(e);
            showMessage('error', 'Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const statsData = useMemo(() => {
        if (!user) return null;

        const totalActivities = worksheets.length;
        const level = Math.floor(totalActivities / 10) + 1;
        const xp = (totalActivities % 10) * 10;
        
        const categoryCounts: Record<string, number> = {};
        for (const sheet of worksheets) {
            const catTitle = sheet.category?.title || 'Diğer';
            categoryCounts[catTitle] = (categoryCounts[catTitle] || 0) + 1;
        }
        
        const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        const mostUsedCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Henüz Yok';
        const mostUsedCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

        return {
            totalActivities,
            level,
            xp,
            categoryCounts: sortedCategories,
            mostUsedCategory,
            mostUsedCount
        };
    }, [user, worksheets]);

    // Prepare chart data from assessments for LineChart
    const chartData = useMemo(() => {
        if (!assessments || assessments.length === 0) return [];
        // Sort by date ascending
        const sorted = [...assessments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        return sorted.map(a => ({
            date: a.createdAt,
            // Try to extract generic scores or use fallbacks
            reading: a.report.scores.linguistic || (a.report.scores as any).reading || 0,
            math: a.report.scores.logical || (a.report.scores as any).math || 0,
            attention: a.report.scores.attention || 0
        }));
    }, [assessments]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        if (isReadOnly) return;
        e.preventDefault();
        if (!editName.trim()) return;
        setIsSavingProfile(true);
        try {
            await updateUser({ name: editName });
            showMessage('success', 'Profil bilgileri güncellendi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        if (isReadOnly) return;
        e.preventDefault();
        if (passwords.new.length < 6) {
            showMessage('error', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            showMessage('error', 'Şifreler eşleşmiyor.');
            return;
        }
        setIsSavingPassword(true);
        try {
            await updatePassword(passwords.new);
            showMessage('success', 'Şifreniz başarıyla değiştirildi.');
            setPasswords({ new: '', confirm: '' });
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setIsSavingPassword(false);
        }
    };
    
    const handleDeletePlan = async (id: string) => {
        if(isReadOnly) return;
        if(confirm("Bu eğitim planını silmek istediğinize emin misiniz?")) {
            try {
                await curriculumService.deleteCurriculum(id);
                setCurriculums(prev => prev.filter(c => c.id !== id));
                if(selectedPlan?.id === id) setSelectedPlan(null);
                showMessage('success', 'Plan silindi.');
            } catch (e) {
                showMessage('error', 'Silme işlemi başarısız.');
            }
        }
    };

    const handleAvatarClick = () => {
        if (isReadOnly) return;
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isReadOnly) return;
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Lütfen geçerli bir resim dosyası seçin.');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { 
                showMessage('error', 'Resim boyutu çok büyük (Max: 5MB).');
                return;
            }

            setIsChangingAvatar(true);

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            await updateUser({ avatar: base64 });
            showMessage('success', 'Profil resmi güncellendi.');
        } catch (e) {
            console.error("Avatar update error:", e);
            showMessage('error', 'Profil resmi yüklenirken hata oluştu.');
        } finally {
            setIsChangingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    if (!user) return null;

    return (
        <div className="bg-transparent min-h-full p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* TOAST MESSAGE */}
                {message && (
                    <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-xl`}></i>
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                {/* BENTO HEADER: PROFILE CARD & NAVIGATION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* User Profile Card (Span 8) */}
                    <div className="lg:col-span-8 bg-white dark:bg-zinc-800 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-zinc-800 ring-4 ring-zinc-100 dark:ring-zinc-700 shadow-xl overflow-hidden">
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            {!isReadOnly && (
                                <button 
                                    onClick={handleAvatarClick}
                                    disabled={isChangingAvatar}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-4 border-white dark:border-zinc-800"
                                >
                                    <i className={`fa-solid ${isChangingAvatar ? 'fa-circle-notch fa-spin' : 'fa-camera'}`}></i>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>

                        <div className="flex-1 text-center md:text-left z-10">
                            <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">{user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-600 flex items-center gap-2">
                                    <i className="fa-solid fa-envelope text-zinc-400"></i> {user.email}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                    <i className={`fa-solid ${user.role === 'admin' ? 'fa-shield-halved' : 'fa-user'}`}></i> 
                                    {user.role === 'admin' ? 'Yönetici' : 'Öğrenci / Veli'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 shrink-0 z-10 w-full md:w-auto">
                            <button onClick={onBack} className="w-full md:w-auto px-6 py-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-sm transition-colors">
                                <i className="fa-solid fa-arrow-left mr-2"></i> Geri Dön
                            </button>
                            {!isReadOnly && (
                                <button onClick={() => { logout(); onBack(); }} className="w-full md:w-auto px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl font-bold text-sm transition-colors border border-rose-200 dark:border-rose-800">
                                    <i className="fa-solid fa-power-off mr-2"></i> Çıkış Yap
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Menu (Span 4) */}
                    <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 flex flex-col justify-center gap-2">
                        <TabPill active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Genel Bakış" icon="fa-solid fa-chart-pie" />
                        <TabPill active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="İstatistikler" icon="fa-solid fa-chart-simple" />
                        <TabPill active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} label="Değerlendirmeler" icon="fa-solid fa-clipboard-check" />
                        <TabPill active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} label="Eğitim Planları" icon="fa-solid fa-graduation-cap" />
                        {!isReadOnly && <TabPill active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ayarlar" icon="fa-solid fa-sliders" />}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? <LoadingSkeleton /> : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && statsData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <BentoCard title="Toplam Etkinlik" icon="fa-solid fa-layer-group" iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <div className="mt-auto">
                                            <StatValue value={statsData.totalActivities} label="Oluşturulan Materyal" />
                                        </div>
                                    </BentoCard>

                                    <BentoCard title="Seviye" icon="fa-solid fa-crown" iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <div className="mt-auto flex items-end justify-between">
                                            <StatValue value={statsData.level} label="Eğitmen Seviyesi" />
                                            <div className="text-4xl opacity-20"><i className="fa-solid fa-medal"></i></div>
                                        </div>
                                    </BentoCard>

                                    <BentoCard className="md:col-span-2" title="En Sevilen Kategori" icon="fa-solid fa-heart" iconColor="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                <div className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{statsData.mostUsedCategory}</div>
                                                <div className="text-sm text-zinc-500 font-medium">{statsData.mostUsedCount} kez kullanıldı</div>
                                            </div>
                                            <div className="h-16 w-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-2xl text-rose-500">
                                                <i className="fa-solid fa-fire"></i>
                                            </div>
                                        </div>
                                    </BentoCard>

                                    <BentoCard className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white dark:from-zinc-800 dark:to-zinc-900 border-none" icon="fa-solid fa-bolt" iconColor="bg-white/20 text-white">
                                        <div className="flex flex-col h-full justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-white/90 mb-1">Seviye İlerlemesi</h3>
                                                <p className="text-white/60 text-sm">Bir sonraki seviyeye geçmek için daha fazla etkinlik oluştur.</p>
                                            </div>
                                            <div className="mt-6">
                                                <div className="flex justify-between text-sm font-bold mb-2">
                                                    <span>{statsData.xp} XP</span>
                                                    <span className="text-white/60">100 XP</span>
                                                </div>
                                                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out" style={{ width: `${statsData.xp}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </BentoCard>

                                    <BentoCard title="Son İşlem" icon="fa-solid fa-clock-rotate-left">
                                        <div className="mt-auto">
                                            {worksheets.length > 0 ? (
                                                <>
                                                    <div className="font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1">{worksheets[0].name}</div>
                                                    <div className="text-xs text-zinc-500 mt-1">{new Date(worksheets[0].createdAt).toLocaleDateString('tr-TR')}</div>
                                                </>
                                            ) : (
                                                <div className="text-zinc-400 italic">Henüz işlem yok</div>
                                            )}
                                        </div>
                                    </BentoCard>
                                </div>
                            )}

                            {/* STATS TAB */}
                            {activeTab === 'stats' && statsData && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <BentoCard className="lg:col-span-2" title="Kategori Dağılımı" icon="fa-solid fa-chart-pie" iconColor="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {statsData.categoryCounts.length > 0 ? (
                                            <div className="space-y-4 mt-4">
                                                {statsData.categoryCounts.map(([category, count]) => {
                                                    const percentage = (count / statsData.totalActivities) * 100;
                                                    return (
                                                        <div key={category}>
                                                            <div className="flex justify-between text-sm font-bold mb-1.5">
                                                                <span className="text-zinc-700 dark:text-zinc-300">{category}</span>
                                                                <span className="text-zinc-500">{count}</span>
                                                            </div>
                                                            <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                                                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center text-zinc-400">Veri yok</div>
                                        )}
                                    </BentoCard>

                                    <div className="space-y-6">
                                        <BentoCard title="Aylık Hedef" icon="fa-solid fa-bullseye" iconColor="bg-emerald-100 text-emerald-600">
                                            <div className="text-center py-6">
                                                <div className="relative inline-block w-32 h-32">
                                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                                        <path className="text-zinc-100 dark:text-zinc-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className="text-emerald-500" strokeDasharray={`${Math.min(100, (statsData.totalActivities % 50) * 2)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                        <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{(statsData.totalActivities % 50) * 2}%</span>
                                                        <span className="text-[10px] uppercase font-bold text-zinc-400">Tamamlandı</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </BentoCard>
                                    </div>
                                </div>
                            )}

                            {/* EVALUATIONS TAB */}
                            {activeTab === 'evaluations' && (
                                <div className="space-y-6">
                                    <BentoCard title="Gelişim Grafiği (Zaman İçinde)" icon="fa-solid fa-chart-line" iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <div className="h-64 mt-4">
                                            <LineChart 
                                                data={chartData} 
                                                lines={[
                                                    { key: 'reading', color: '#3B82F6', label: 'Sözel-Dilsel' },
                                                    { key: 'math', color: '#EF4444', label: 'Mantıksal' },
                                                    { key: 'attention', color: '#10B981', label: 'Dikkat' }
                                                ]} 
                                            />
                                        </div>
                                    </BentoCard>

                                    <BentoCard title="Değerlendirme Raporları" icon="fa-solid fa-file-medical" iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        {assessments.length === 0 ? (
                                            <div className="p-16 text-center flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4 text-zinc-300 text-3xl"><i className="fa-solid fa-clipboard-list"></i></div>
                                                <h3 className="text-lg font-bold text-zinc-500">Kayıt Bulunamadı</h3>
                                                <p className="text-zinc-400 text-sm mt-1">Henüz bir değerlendirme raporu oluşturmadınız.</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-zinc-50 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
                                                        <tr>
                                                            <th className="p-4 font-bold text-zinc-500 dark:text-zinc-400">Öğrenci</th>
                                                            <th className="p-4 font-bold text-zinc-500 dark:text-zinc-400">Sınıf</th>
                                                            <th className="p-4 font-bold text-zinc-500 dark:text-zinc-400">Tarih</th>
                                                            <th className="p-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                                        {assessments.map(a => (
                                                            <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                                <td className="p-4 font-bold text-zinc-800 dark:text-zinc-100">{a.studentName}</td>
                                                                <td className="p-4 text-zinc-600 dark:text-zinc-400">{a.grade}</td>
                                                                <td className="p-4 text-zinc-500">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                                                                <td className="p-4 text-right">
                                                                    <button onClick={() => setSelectedAssessment(a)} className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">Görüntüle</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </BentoCard>
                                </div>
                            )}

                            {/* PLANS TAB (NEW) */}
                            {activeTab === 'plans' && (
                                <BentoCard title="Kayıtlı Eğitim Planları" icon="fa-solid fa-graduation-cap" iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {curriculums.length === 0 ? (
                                        <div className="p-16 text-center flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4 text-zinc-300 text-3xl"><i className="fa-solid fa-calendar-xmark"></i></div>
                                            <h3 className="text-lg font-bold text-zinc-500">Plan Bulunamadı</h3>
                                            <p className="text-zinc-400 text-sm mt-1">Henüz bir eğitim planı oluşturmadınız.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {curriculums.map(plan => (
                                                <div key={plan.id} className="bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl p-5 hover:shadow-lg transition-all group flex flex-col">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">{plan.studentName}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                                <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">{plan.grade}</span>
                                                                <span>•</span>
                                                                <span>{plan.durationDays} Günlük Plan</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => setSelectedPlan(plan)}
                                                                className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                                                                title="Görüntüle / Yazdır"
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            {!isReadOnly && (
                                                                <button 
                                                                    onClick={() => handleDeletePlan(plan.id)} 
                                                                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Sil"
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center text-xs text-zinc-400">
                                                        <span>{new Date(plan.createdAt || '').toLocaleDateString('tr-TR')}</span>
                                                        <span className="font-bold text-indigo-500">{plan.goals.length} Hedef</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </BentoCard>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && !isReadOnly && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <BentoCard title="Kişisel Bilgiler" icon="fa-solid fa-user-pen" iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <form onSubmit={handleUpdateProfile} className="space-y-5 mt-2">
                                            <div>
                                                <label className="block font-bold text-xs uppercase text-zinc-500 mb-2">Ad Soyad</label>
                                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block font-bold text-xs uppercase text-zinc-500 mb-2">E-posta</label>
                                                <input type="email" value={user.email} disabled className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-100 dark:bg-zinc-800 opacity-60 cursor-not-allowed" />
                                            </div>
                                            <button type="submit" disabled={isSavingProfile} className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl transition-colors disabled:opacity-50 mt-4">
                                                {isSavingProfile ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Kaydet'}
                                            </button>
                                        </form>
                                    </BentoCard>

                                    <BentoCard title="Güvenlik" icon="fa-solid fa-lock" iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <form onSubmit={handleUpdatePassword} className="space-y-5 mt-2">
                                            <div>
                                                <label className="block font-bold text-xs uppercase text-zinc-500 mb-2">Yeni Şifre</label>
                                                <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({...p, new: e.target.value}))} className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="******" />
                                            </div>
                                            <div>
                                                <label className="block font-bold text-xs uppercase text-zinc-500 mb-2">Şifre Tekrar</label>
                                                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="******" />
                                            </div>
                                            <button type="submit" disabled={isSavingPassword} className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl transition-colors disabled:opacity-50 mt-4">
                                                {isSavingPassword ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Şifreyi Güncelle'}
                                            </button>
                                        </form>
                                    </BentoCard>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <AssessmentReportViewer 
                assessment={selectedAssessment} 
                onClose={() => setSelectedAssessment(null)}
                user={user}
            />

            {selectedPlan && (
                <PlanViewerModal 
                    plan={selectedPlan} 
                    onClose={() => setSelectedPlan(null)} 
                />
            )}
        </div>
    );
};
