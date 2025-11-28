
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedAssessment, SavedWorksheet, ActivityType, User } from '../types';
import { assessmentService } from '../services/assessmentService';
import { RadarChart } from './RadarChart';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { worksheetService } from '../services/worksheetService';
import { ShareModal } from './ShareModal';

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string; trend?: string }> = ({ icon, label, value, color, trend }) => (
    <div className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-all transform hover:-translate-y-1">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white text-2xl shadow-lg`}>
            <i className={icon}></i>
        </div>
        <div className="flex-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">{label}</p>
            <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{value}</p>
                {trend && <span className="text-[10px] font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded mb-1">{trend}</span>}
            </div>
        </div>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`relative pb-4 px-6 text-sm font-bold flex items-center gap-2 transition-all ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
    >
        <i className={icon}></i> {label}
        {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full animate-in fade-in zoom-in duration-200"></div>}
    </button>
);

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-zinc-100 dark:bg-zinc-700 rounded-xl"></div>
            <div className="h-24 bg-zinc-100 dark:bg-zinc-700 rounded-xl"></div>
            <div className="h-24 bg-zinc-100 dark:bg-zinc-700 rounded-xl"></div>
        </div>
        <div className="h-64 bg-zinc-100 dark:bg-zinc-700 rounded-xl"></div>
    </div>
);

interface ProfileViewProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    targetUser?: User; // Optional: If provided, displays this user's profile
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onSelectActivity, targetUser }) => {
    const { user: authUser, updateUser, updatePassword, logout } = useAuth();
    
    // Determine the effective user to display
    const user = targetUser || authUser;
    const isReadOnly = !!targetUser && targetUser.id !== authUser?.id;

    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'evaluations' | 'settings'>('overview');
    
    // Data states
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
    
    // Settings State
    const [editName, setEditName] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isChangingAvatar, setIsChangingAvatar] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    // Sharing State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false); // Sadece PDF Kaydet butonunu tetikleyen modal
    
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
            const [assessData, sheetsDataResult] = await Promise.all([
                assessmentService.getUserAssessments(user.id),
                worksheetService.getUserWorksheets(user.id, 0, 1000)
            ]);
            setAssessments(assessData);
            setWorksheets(sheetsDataResult.items);
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

        const mostUsedCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Yok';

        return {
            totalActivities,
            level,
            xp,
            categoryCounts: sortedCategories,
            mostUsedCategory
        };
    }, [user, worksheets]);


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

            if (file.size > 5 * 1024 * 1024) { // 5MB Limit
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

    const handleShareReport = async (receiverId: string) => {
        if (!selectedAssessment || !user) return;
        try {
            await assessmentService.shareAssessment(
                selectedAssessment, 
                user.id, 
                user.name, 
                receiverId
            );
            showMessage('success', 'Rapor başarıyla paylaşıldı.');
            setIsShareModalOpen(false);
        } catch (e) {
            console.error(e);
            showMessage('error', 'Paylaşım sırasında hata oluştu.');
        }
    };

    const handlePrintReport = () => {
        const originalTitle = document.title;
        document.title = `${selectedAssessment?.studentName || 'Ogrenci'}_Degerlendirme_Raporu`;
        window.print();
        document.title = originalTitle;
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    if (!user) return null;

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 min-h-full p-4 md:p-8 overflow-y-auto">
            
            <div className="max-w-5xl mx-auto">
                {message && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-xl`}></i>
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
                            {isReadOnly ? `${user.name} Profili` : 'Profilim'}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Hesap ayarları ve istatistikler</p>
                    </div>
                    <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all text-sm font-bold shadow-sm text-zinc-600 dark:text-zinc-300">
                        <i className="fa-solid fa-arrow-left"></i> Geri
                    </button>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-8 relative">
                    <div className="h-48 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            {user.subscriptionPlan === 'pro' && <span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-black rounded-full uppercase tracking-widest shadow-lg">PRO Üye</span>}
                        </div>
                    </div>
                    
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 gap-6 mb-8">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full p-1.5 bg-white dark:bg-zinc-800 ring-4 ring-white dark:ring-zinc-800 shadow-2xl overflow-hidden">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full bg-zinc-100 object-cover" />
                                </div>
                                {!isReadOnly && (
                                    <button 
                                        onClick={handleAvatarClick}
                                        disabled={isChangingAvatar}
                                        className="absolute bottom-2 right-2 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all hover:scale-110 cursor-pointer z-10 border-2 border-white dark:border-zinc-700"
                                        title="Profil Resmini Değiştir"
                                    >
                                        <i className={`fa-solid ${isChangingAvatar ? 'fa-circle-notch fa-spin' : 'fa-camera'}`}></i>
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*"
                                />
                            </div>
                            
                            <div className="flex-1 w-full pt-2 md:pt-0">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                    <div>
                                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-1">{user.name}</h1>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                                            <i className="fa-solid fa-envelope"></i> {user.email}
                                        </p>
                                    </div>
                                    {!isReadOnly && (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => { logout(); onBack(); }} 
                                                className="px-5 py-2.5 text-rose-600 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2"
                                            >
                                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto border-b border-zinc-100 dark:border-zinc-700">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Genel Bakış" icon="fa-solid fa-chart-pie" />
                            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="İstatistikler" icon="fa-solid fa-chart-simple" />
                            <TabButton active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} label="Değerlendirmeler" icon="fa-solid fa-clipboard-check" />
                            {!isReadOnly && <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ayarlar" icon="fa-solid fa-sliders" />}
                        </div>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? <LoadingSkeleton /> : (
                        <>
                            {activeTab === 'overview' && statsData && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard icon="fa-solid fa-layer-group" label="Toplam Etkinlik" value={statsData.totalActivities} color="bg-gradient-to-br from-blue-400 to-blue-600" />
                                        <StatCard icon="fa-solid fa-crown" label="Seviye" value={statsData.level} color="bg-gradient-to-br from-amber-400 to-orange-500" />
                                        <StatCard icon="fa-solid fa-star" label="En Sevilen Kategori" value={statsData.mostUsedCategory} color="bg-gradient-to-br from-emerald-400 to-green-600" />
                                    </div>
                                    
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                      <h3 className="text-lg font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><i className="fa-solid fa-bolt text-yellow-500"></i> Seviye İlerlemesi</h3>
                                      <div className="relative pt-2 px-2">
                                          <div className="flex mb-2 items-center justify-between">
                                              <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">Sonraki Seviye: {statsData.level + 1}</span></div>
                                              <div className="text-right"><span className="text-xs font-semibold inline-block text-indigo-600">{statsData.xp}% / 100 XP</span></div>
                                          </div>
                                          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-indigo-100 dark:bg-zinc-700"><div style={{ width: `${statsData.xp}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000 ease-out"></div></div>
                                      </div>
                                    </div>

                                    {/* Recent Activity Card */}
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1">Son Etkinlik</h3>
                                            {user.lastActiveActivity ? (
                                                <>
                                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{user.lastActiveActivity.title}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(user.lastActiveActivity.date).toLocaleString('tr-TR')}</p>
                                                </>
                                            ) : (
                                                <p className="text-zinc-500">Henüz etkinlik kaydı yok.</p>
                                            )}
                                        </div>
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'stats' && statsData && (
                                <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">Kategori Dağılımı</h3>
                                    {statsData.categoryCounts.length > 0 ? (
                                        <div className="space-y-4">
                                            {statsData.categoryCounts.map(([category, count]) => {
                                                const percentage = (count / statsData.totalActivities) * 100;
                                                return (
                                                    <div key={category}>
                                                        <div className="flex justify-between text-sm font-bold mb-1">
                                                            <span className="text-zinc-700 dark:text-zinc-300">{category}</span>
                                                            <span className="text-zinc-500">{count} adet</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3"><div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center text-zinc-400 py-8">İstatistik için henüz yeterli veri yok.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'evaluations' && (
                                 <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                                     {assessments.length === 0 ? (
                                         <div className="p-16 text-center flex flex-col items-center justify-center">
                                             <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4"><i className="fa-solid fa-clipboard-list text-4xl text-zinc-300 dark:text-zinc-500"></i></div>
                                             <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-300">Değerlendirme Yok</h3>
                                             <p className="text-zinc-400 max-w-xs mx-auto mt-2">Henüz öğrenci değerlendirmesi yapılmamış.</p>
                                         </div>
                                     ) : (
                                         <div className="overflow-x-auto">
                                             <table className="w-full text-left text-sm">
                                                 <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                                    <tr>
                                                        <th className="p-4 font-semibold text-zinc-500">Öğrenci</th>
                                                        <th className="p-4 font-semibold text-zinc-500">Sınıf</th>
                                                        <th className="p-4 font-semibold text-zinc-500">Tarih</th>
                                                        <th className="p-4"></th>
                                                    </tr>
                                                 </thead>
                                                 <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                                    {assessments.map(a => (
                                                        <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                                            <td className="p-4 font-medium text-zinc-800 dark:text-zinc-100">{a.studentName}</td>
                                                            <td className="p-4 text-zinc-500">{a.grade}</td>
                                                            <td className="p-4 text-zinc-500">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                                                            <td className="p-4 text-right">
                                                                <button onClick={() => setSelectedAssessment(a)} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full hover:bg-indigo-100">Raporu Görüntüle</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                 </tbody>
                                             </table>
                                         </div>
                                     )}
                                 </div>
                            )}

                            {activeTab === 'settings' && !isReadOnly && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                        <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><i className="fa-solid fa-user-pen text-indigo-500"></i> Kişisel Bilgiler</h3>
                                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                                            <div>
                                                <label className="block font-medium text-sm mb-1 text-zinc-600 dark:text-zinc-300">Ad Soyad</label>
                                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-3 border border-zinc-200 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                            </div>
                                             <div>
                                                <label className="block font-medium text-sm mb-1 text-zinc-600 dark:text-zinc-300">E-posta</label>
                                                <input type="email" value={user.email} disabled className="w-full p-3 border border-zinc-200 dark:border-zinc-600 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 opacity-70" />
                                            </div>
                                            <button type="submit" disabled={isSavingProfile} className="w-full py-3 bg-zinc-800 hover:bg-zinc-900 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                                {isSavingProfile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                                                Değişiklikleri Kaydet
                                            </button>
                                        </form>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                        <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><i className="fa-solid fa-lock text-indigo-500"></i> Şifre Değiştir</h3>
                                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                                            <div>
                                                <label className="block font-medium text-sm mb-1 text-zinc-600 dark:text-zinc-300">Yeni Şifre</label>
                                                <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({...p, new: e.target.value}))} className="w-full p-3 border border-zinc-200 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="En az 6 karakter" />
                                            </div>
                                             <div>
                                                <label className="block font-medium text-sm mb-1 text-zinc-600 dark:text-zinc-300">Yeni Şifre (Tekrar)</label>
                                                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} className="w-full p-3 border border-zinc-200 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Şifreyi onayla" />
                                            </div>
                                            <button type="submit" disabled={isSavingPassword} className="w-full py-3 bg-zinc-800 hover:bg-zinc-900 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                                 {isSavingPassword ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-key"></i>}
                                                Şifreyi Güncelle
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedAssessment && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:block" onClick={() => setSelectedAssessment(null)}>
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 relative print:max-h-none print:w-full print:shadow-none print:rounded-none" onClick={e => e.stopPropagation()}>
                        <header className="p-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center no-print">
                            <div>
                                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">{selectedAssessment.studentName} Raporu</h3>
                                <p className="text-xs text-zinc-500">{new Date(selectedAssessment.createdAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <button onClick={() => setSelectedAssessment(null)} className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center"><i className="fa-solid fa-times"></i></button>
                        </header>
                        
                        {/* TOOLBAR FOR REPORT ACTIONS */}
                        <div className="flex justify-end items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 no-print">
                            <button 
                                onClick={() => setIsShareModalOpen(true)} 
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all shadow-sm"
                            >
                                <i className="fa-solid fa-share-nodes text-blue-500"></i> Paylaş
                            </button>
                            <button 
                                onClick={handlePrintReport} 
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                <i className="fa-solid fa-file-pdf"></i> PDF Kaydet
                            </button>
                            <button 
                                onClick={handlePrintReport} 
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                <i className="fa-solid fa-print"></i> Yazdır
                            </button>
                        </div>

                        {/* REPORT CONTENT - Added explicit classes for print safety */}
                        <div id="printable-report-content" className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar assessment-report-container print:overflow-visible print:block print:w-full print:h-auto">
                            <div className="hidden print:block mb-8 border-b-2 border-zinc-800 pb-4">
                                <h1 className="text-3xl font-black">Bursa Disleksi AI - Öğrenci Değerlendirme Raporu</h1>
                                <div className="flex justify-between mt-4"><p><strong>Öğrenci:</strong> {selectedAssessment.studentName}</p><p><strong>Tarih:</strong> {new Date(selectedAssessment.createdAt).toLocaleDateString('tr-TR')}</p></div>
                            </div>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-indigo-900 dark:text-indigo-100 text-sm leading-relaxed break-inside-avoid">
                                <h4 className="font-bold mb-2">Genel Özet</h4>
                                {selectedAssessment.report.overallSummary}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                                <div className="p-4 border rounded-xl flex flex-col items-center justify-center min-h-[250px] bg-white dark:bg-zinc-800 break-inside-avoid">
                                    <h4 className="font-bold text-zinc-500 text-xs uppercase mb-2">Risk Analizi</h4>
                                    {selectedAssessment.report.chartData && <RadarChart data={selectedAssessment.report.chartData} />}
                                </div>
                                <div className="space-y-3 break-inside-avoid">
                                    {Object.entries(selectedAssessment.report.scores).map(([key, value]) => {
                                        const score = value as number;
                                        return (
                                            <div key={key} className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-700 flex items-center justify-between bg-white dark:bg-zinc-800">
                                                <span className="capitalize font-bold text-sm text-zinc-700 dark:text-zinc-300">
                                                    {key === 'reading' ? 'Okuma' : key === 'math' ? 'Matematik' : key === 'attention' ? 'Dikkat' : key === 'cognitive' ? 'Bellek' : 'Yazma'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${score > 70 ? 'bg-red-500' : score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                                            style={{ width: `${score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-bold text-xs w-8 text-right ${score > 70 ? 'text-red-500' : score > 40 ? 'text-yellow-500' : 'text-green-500'}`}>{score}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 break-inside-avoid">
                                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2"><i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-green-900 dark:text-green-100 print:text-black">
                                        {selectedAssessment.report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800 break-inside-avoid">
                                    <h4 className="font-bold text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> Gelişim Alanları</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-rose-900 dark:text-rose-100 print:text-black">
                                        {selectedAssessment.report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                            
                             <div className="bg-zinc-800 text-white p-6 rounded-xl shadow-lg break-inside-avoid no-print-bg-force">
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-road"></i> Önerilen Yol Haritası</h4>
                                <div className="space-y-4">
                                    {selectedAssessment.report.roadmap.map((item, idx) => (
                                        <div key={idx} onClick={() => onSelectActivity(item.activityId as ActivityType)} className="bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all cursor-pointer group break-inside-avoid">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-zinc-100">{idx + 1}</div>
                                                <div>
                                                    <h5 className="font-bold text-indigo-300">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5>
                                                    <p className="text-xs text-zinc-400">{item.reason}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold bg-zinc-900 px-3 py-1 rounded-full text-zinc-400 border border-zinc-600 whitespace-nowrap">{item.frequency}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
            
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleShareReport} />
        </div>
    );
};
