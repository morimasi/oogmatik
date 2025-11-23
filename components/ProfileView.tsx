
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedAssessment } from '../types';
import { assessmentService } from '../services/assessmentService';
import { RadarChart } from './RadarChart';
import { ACTIVITIES } from '../constants';

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white text-xl`}>
            <i className={icon}></i>
        </div>
        <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
            <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
        </div>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${active ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
    >
        <i className={icon}></i> {label}
    </button>
);

export const ProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user, updateUser, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingAvatar, setIsChangingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'settings' | 'evaluations'>('overview');
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);

    useEffect(() => {
        if (user && activeTab === 'evaluations') {
            loadAssessments();
        }
    }, [user, activeTab]);

    const loadAssessments = async () => {
        if (!user) return;
        const data = await assessmentService.getUserAssessments(user.id);
        setAssessments(data);
    };

    if (!user) return null;

    const handleSave = async () => {
        await updateUser({ name });
        setIsEditing(false);
    };

    const handleAvatarChange = async () => {
        setIsChangingAvatar(true);
        const randomSeed = Math.random().toString(36).substring(7);
        const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
        await new Promise(resolve => setTimeout(resolve, 500));
        await updateUser({ avatar: newAvatarUrl });
        setIsChangingAvatar(false);
    };

    // Calculate user level based on worksheet count
    const level = Math.floor(user.worksheetCount / 10) + 1;
    const progress = (user.worksheetCount % 10) * 10;

    return (
        <div className="bg-zinc-100 dark:bg-zinc-900 min-h-full p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Kullanıcı Profili</h2>
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors text-sm font-medium">
                        <i className="fa-solid fa-arrow-left"></i> Geri Dön
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6">
                    {/* Cover Image */}
                    <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    
                    <div className="px-8 pb-8 relative">
                        {/* Avatar Overlap */}
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-zinc-800 ring-4 ring-white dark:ring-zinc-800 shadow-lg">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full bg-zinc-100" />
                                </div>
                                <button 
                                    onClick={handleAvatarChange}
                                    disabled={isChangingAvatar}
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-md hover:bg-zinc-700 transition-colors"
                                    title="Avatarı Değiştir"
                                >
                                    <i className={`fa-solid fa-camera text-xs ${isChangingAvatar ? 'fa-spin' : ''}`}></i>
                                </button>
                            </div>
                            
                            <div className="flex-1 w-full">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        value={name} 
                                                        onChange={(e) => setName(e.target.value)} 
                                                        className="text-2xl font-bold bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 focus:border-indigo-500 outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={handleSave} className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"><i className="fa-solid fa-check"></i></button>
                                                </div>
                                            ) : (
                                                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3 group">
                                                    {user.name}
                                                    <button onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg"><i className="fa-solid fa-pen-to-square"></i></button>
                                                </h1>
                                            )}
                                            {user.subscriptionPlan === 'pro' && <span className="px-2 py-0.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-xs font-bold rounded uppercase tracking-wider shadow-sm">PRO</span>}
                                            {user.subscriptionPlan === 'enterprise' && <span className="px-2 py-0.5 bg-zinc-800 text-white text-xs font-bold rounded uppercase tracking-wider shadow-sm">KURUMSAL</span>}
                                        </div>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">{user.email}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => {
                                                logout();
                                                onBack();
                                            }} 
                                            className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors"
                                        >
                                            <i className="fa-solid fa-sign-out-alt mr-2"></i> Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Genel Bakış" icon="fa-solid fa-chart-pie" />
                            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="İstatistikler" icon="fa-solid fa-chart-line" />
                            <TabButton active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} label="Değerlendirmeler" icon="fa-solid fa-file-medical-alt" />
                            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ayarlar" icon="fa-solid fa-gear" />
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
                            <StatCard icon="fa-solid fa-layer-group" label="Toplam Etkinlik" value={user.worksheetCount} color="bg-blue-500" />
                            <StatCard icon="fa-solid fa-star" label="Seviye" value={level} color="bg-amber-500" />
                            <StatCard icon="fa-solid fa-calendar-check" label="Kayıt Tarihi" value={new Date(user.createdAt).toLocaleDateString('tr-TR')} color="bg-emerald-500" />
                            
                            <div className="md:col-span-3 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-100">Sonraki Seviye İlerlemesi</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-4 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{progress} / 100 XP</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">Yeni etkinlikler oluşturarak seviye atlayabilirsin!</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'evaluations' && (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden fade-in">
                            {assessments.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                                    <i className="fa-solid fa-clipboard-list text-4xl mb-3 opacity-20"></i>
                                    <p>Henüz yapılmış bir değerlendirme bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase font-bold text-xs">
                                            <tr>
                                                <th className="p-4">Öğrenci</th>
                                                <th className="p-4">Sınıf/Yaş</th>
                                                <th className="p-4">Tarih</th>
                                                <th className="p-4 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                            {assessments.map(assess => (
                                                <tr key={assess.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="p-4 font-medium text-zinc-800 dark:text-zinc-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${assess.gender === 'Kız' ? 'bg-pink-400' : 'bg-blue-400'}`}></span>
                                                            {assess.studentName}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{assess.grade} ({assess.age})</td>
                                                    <td className="p-4 text-zinc-500">{new Date(assess.createdAt).toLocaleDateString('tr-TR')}</td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => setSelectedAssessment(assess)}
                                                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-md transition-colors"
                                                        >
                                                            İncele
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-trophy text-yellow-500"></i> Başarı Rozetleri</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600">
                                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-amber-400 rounded-full flex items-center justify-center text-amber-800 text-xl mb-2 shadow-sm"><i className="fa-solid fa-rocket"></i></div>
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">İlk Adım</span>
                                    </div>
                                    <div className={`flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 ${user.worksheetCount < 10 ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-indigo-400 rounded-full flex items-center justify-center text-indigo-800 text-xl mb-2 shadow-sm"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Usta Üretici</span>
                                    </div>
                                    <div className={`flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 ${user.worksheetCount < 50 ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-pink-400 rounded-full flex items-center justify-center text-pink-800 text-xl mb-2 shadow-sm"><i className="fa-solid fa-crown"></i></div>
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Efsane</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Aktivite Dağılımı</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium">Kelime Oyunları</span>
                                            <span>60%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[60%]"></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium">Matematik</span>
                                            <span>25%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[25%]"></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium">Dikkat</span>
                                            <span>15%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[15%]"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm fade-in">
                            <h3 className="text-lg font-bold mb-6">Hesap Ayarları</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-700">
                                    <div>
                                        <p className="font-medium">E-posta Bildirimleri</p>
                                        <p className="text-xs text-zinc-500">Yeni özelliklerden haberdar ol.</p>
                                    </div>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"/>
                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-zinc-300 cursor-pointer"></label>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-700">
                                    <div>
                                        <p className="font-medium text-zinc-800 dark:text-zinc-100">Karanlık Mod</p>
                                        <p className="text-xs text-zinc-500">Uygulama temasını değiştir.</p>
                                    </div>
                                    <span className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded text-zinc-500">Otomatik</span>
                                </div>

                                <div className="pt-4">
                                    <button className="text-red-600 text-sm font-medium hover:underline">Hesabımı Sil</button>
                                    <p className="text-xs text-zinc-400 mt-1">Bu işlem geri alınamaz. Tüm verileriniz silinir.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assessment Detail Modal */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedAssessment(null)}>
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{selectedAssessment.studentName} - Değerlendirme Raporu</h3>
                                <p className="text-sm text-zinc-500">{new Date(selectedAssessment.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedAssessment(null)} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-600">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Genel Özet</h4>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm">{selectedAssessment.report.overallSummary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="md:col-span-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-700/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-600">
                                    <h4 className="font-bold text-zinc-500 text-xs uppercase mb-4">Risk Analizi</h4>
                                    {selectedAssessment.report.chartData && <RadarChart data={selectedAssessment.report.chartData} />}
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                            <h5 className="text-green-700 dark:text-green-400 font-bold text-sm mb-2">Güçlü Yönler</h5>
                                            <ul className="text-sm list-disc list-inside text-zinc-600 dark:text-zinc-400">
                                                {selectedAssessment.report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                                            <h5 className="text-rose-700 dark:text-rose-400 font-bold text-sm mb-2">Gelişim Alanları</h5>
                                            <ul className="text-sm list-disc list-inside text-zinc-600 dark:text-zinc-400">
                                                {selectedAssessment.report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-200 dark:border-zinc-600">
                                        <h5 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm mb-3">Önerilen Yol Haritası</h5>
                                        <div className="space-y-2">
                                            {selectedAssessment.report.roadmap.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-2 rounded shadow-sm text-sm">
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</span>
                                                    <span className="text-zinc-500 text-xs">{item.frequency}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
