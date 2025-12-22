
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext'; 
import { SavedAssessment, SavedWorksheet, ActivityType, User, Curriculum } from '../types';
import { assessmentService } from '../services/assessmentService';
import { worksheetService } from '../services/worksheetService';
import { curriculumService } from '../services/curriculumService'; 
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { LineChart } from './LineChart';
import { printService } from '../utils/printService'; 
import { ACTIVITIES } from '../constants';

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
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
                            {plan.studentName} - Eğitim Planı
                        </h3>
                        <p className="text-xs text-zinc-500">{plan.grade} • {plan.durationDays} Günlük Program</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={() => handlePrint('download')} disabled={isPrinting} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-2">
                            {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>} PDF İndir
                        </button>
                        <button onClick={() => handlePrint('print')} disabled={isPrinting} className="p-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors text-xs font-bold flex items-center gap-2">
                            <i className="fa-solid fa-print"></i> Yazdır
                        </button>
                        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>
                <div id="plan-content-area" className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    <div className="worksheet-item space-y-8">
                        <div className="text-center border-b-2 border-zinc-100 pb-6">
                            <h1 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">Kişisel Gelişim Planı</h1>
                            <p className="text-zinc-500">{new Date(plan.startDate).toLocaleDateString('tr-TR')} Tarihinde Oluşturuldu</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {plan.schedule.map((day) => (
                                <div key={day.day} className="border-2 border-zinc-100 rounded-2xl overflow-hidden break-inside-avoid">
                                    <div className="bg-zinc-50 p-3 border-b border-zinc-100 flex justify-between items-center">
                                        <span className="font-black text-lg text-black">{day.day}. Gün</span>
                                        <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded border border-zinc-200">{day.focus}</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {day.activities.map((act, idx) => (
                                            <div key={idx} className="flex items-start gap-4 text-black">
                                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                                                <div>
                                                    <h4 className="font-bold">{act.title}</h4>
                                                    <p className="text-xs text-zinc-500 mt-1 italic">{act.goal}</p>
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
    onSelectActivity: (id: ActivityType | null) => void;
    targetUser?: User; 
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onSelectActivity, targetUser }) => {
    const { user: authUser, updateUser, logout } = useAuth();
    const { students, activeStudent } = useStudent(); 
    
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
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
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
            showMessage('error', 'Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
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
                
                {message && (
                    <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-xl`}></i>
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white dark:bg-zinc-800 rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center md:items-end gap-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-zinc-800 ring-4 ring-zinc-100 dark:ring-zinc-700 shadow-xl overflow-hidden shrink-0 relative">
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex-1 text-center md:text-left z-10">
                            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">{user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-600 flex items-center gap-2">
                                    <i className="fa-solid fa-envelope text-zinc-400"></i> {user.email}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 bg-blue-100 text-blue-700 border-blue-200">
                                    <i className="fa-solid fa-user"></i> Eğitmen
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 shrink-0 z-10 w-full md:w-auto">
                            <button onClick={onBack} className="w-full md:w-auto px-6 py-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-sm transition-colors">Geri Dön</button>
                            {!isReadOnly && <button onClick={() => { logout(); onBack(); }} className="w-full md:w-auto px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl font-bold text-sm transition-colors border border-rose-200 dark:border-rose-800">Çıkış Yap</button>}
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 flex flex-col justify-center gap-2">
                        <TabPill active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Genel Bakış" icon="fa-solid fa-chart-pie" />
                        <TabPill active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} label="Değerlendirmeler" icon="fa-solid fa-clipboard-check" />
                        <TabPill active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} label="Eğitim Planları" icon="fa-solid fa-graduation-cap" />
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? <LoadingSkeleton /> : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <BentoCard className="md:col-span-2" title="Öğrenci Yönetimi" icon="fa-solid fa-user-graduate" iconColor="bg-indigo-100 text-indigo-600">
                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                <div className="text-4xl font-black text-zinc-800 dark:text-white">{students.length}</div>
                                                <div className="text-sm text-zinc-500 font-medium">Kayıtlı Öğrenci</div>
                                            </div>
                                            <button onClick={() => onSelectActivity('students' as any)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all text-xs">YÖNET</button>
                                        </div>
                                    </BentoCard>

                                    <BentoCard title="Materyal Üretimi" icon="fa-solid fa-wand-magic-sparkles" iconColor="bg-blue-100 text-blue-600">
                                        <div className="mt-auto">
                                            <StatValue value={worksheets.length} label="Toplam Sayfa" />
                                        </div>
                                    </BentoCard>

                                    <BentoCard title="Aktif Öğrenci" icon="fa-solid fa-star" iconColor="bg-amber-100 text-amber-600">
                                        <div className="mt-auto">
                                            {activeStudent ? (
                                                <div className="flex items-center gap-3">
                                                    <img src={activeStudent.avatar} className="w-10 h-10 rounded-full border" alt="" />
                                                    <div className="truncate"><p className="font-bold text-sm truncate">{activeStudent.name}</p><p className="text-[10px] text-zinc-400">{activeStudent.grade}</p></div>
                                                </div>
                                            ) : (
                                                <p className="text-zinc-400 text-xs italic">Seçim yok</p>
                                            )}
                                        </div>
                                    </BentoCard>

                                    <BentoCard className="md:col-span-4" title="Son Aktiviteler">
                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {worksheets.slice(0, 6).map(ws => (
                                                <div key={ws.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400"><i className={ws.icon}></i></div>
                                                    <div className="truncate"><p className="font-bold text-xs truncate dark:text-white">{ws.name}</p><p className="text-[9px] text-zinc-400 uppercase">{ws.category.title}</p></div>
                                                </div>
                                            ))}
                                         </div>
                                    </BentoCard>
                                </div>
                            )}

                            {activeTab === 'evaluations' && (
                                <BentoCard title="Tanısal Raporlar" icon="fa-solid fa-clipboard-user">
                                    <div className="overflow-x-auto mt-4">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b">
                                                <tr><th className="p-4 font-bold text-zinc-500">Öğrenci</th><th className="p-4 font-bold text-zinc-500">Tarih</th><th className="p-4"></th></tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {assessments.map(a => (
                                                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                                        <td className="p-4 font-bold dark:text-white">{a.studentName}</td>
                                                        <td className="p-4 text-zinc-500">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                                                        <td className="p-4 text-right"><button onClick={() => setSelectedAssessment(a)} className="px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg">Aç</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </BentoCard>
                            )}

                            {activeTab === 'plans' && (
                                <BentoCard title="Eğitim Programları" icon="fa-solid fa-graduation-cap">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {curriculums.map(plan => (
                                            <div key={plan.id} className="bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl p-5 hover:shadow-lg transition-all group flex flex-col">
                                                <h4 className="font-bold text-lg dark:text-white">{plan.studentName}</h4>
                                                <p className="text-xs text-zinc-500 mt-1">{plan.grade} • {plan.durationDays} Günlük Plan</p>
                                                <button onClick={() => setSelectedPlan(plan)} className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors">GÖRÜNTÜLE</button>
                                            </div>
                                        ))}
                                    </div>
                                </BentoCard>
                            )}
                        </>
                    )}
                </div>
            </div>

            <AssessmentReportViewer assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} user={user} />
            {selectedPlan && <PlanViewerModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
        </div>
    );
};
