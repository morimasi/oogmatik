
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedAssessment, ActivityType } from '../types';
import { assessmentService } from '../services/assessmentService';
import { RadarChart } from './RadarChart';
import { ACTIVITIES } from '../constants';
import { worksheetService } from '../services/worksheetService';

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

export const ProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user, updateUser, updatePassword, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'evaluations' | 'settings'>('overview');
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    
    // Settings State
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
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        try {
            const [assessData, sheetsData] = await Promise.all([
                assessmentService.getUserAssessments(user.id),
                worksheetService.getUserWorksheets(user.id)
            ]);
            setAssessments(assessData);
            // Simulate recent activity from worksheets
            setRecentActivities(sheetsData.slice(0, 5));
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
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
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Lütfen geçerli bir resim dosyası seçin.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB Limit
            showMessage('error', 'Resim boyutu çok büyük (Max: 2MB).');
            return;
        }

        setIsChangingAvatar(true);

        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            await updateUser({ avatar: base64 });
            showMessage('success', 'Profil resmi güncellendi.');
        } catch (e) {
            console.error(e);
            showMessage('error', 'Profil resmi yüklenirken hata oluştu.');
        } finally {
            setIsChangingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    if (!user) return null;

    // XP Logic
    const level = Math.floor(user.worksheetCount / 10) + 1;
    const xp = (user.worksheetCount % 10) * 10;
    const nextLevelXp = 100;

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 min-h-full p-4 md:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                {/* Toast Message */}
                {message && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-xl`}></i>
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">Profilim</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Hesap ayarları ve istatistikler</p>
                    </div>
                    <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all text-sm font-bold shadow-sm text-zinc-600 dark:text-zinc-300">
                        <i className="fa-solid fa-arrow-left"></i> Geri
                    </button>
                </div>

                {/* Profile Hero */}
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
                                <div className="w-40 h-40 rounded-full p-1.5 bg-white dark:bg-zinc-800 ring-4 ring-white dark:ring-zinc-800 shadow-2xl">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full bg-zinc-100 object-cover" />
                                </div>
                                <button 
                                    onClick={handleAvatarClick}
                                    disabled={isChangingAvatar}
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all hover:scale-110 cursor-pointer"
                                    title="Profil Resmini Değiştir"
                                >
                                    <i className={`fa-solid ${isChangingAvatar ? 'fa-circle-notch fa-spin' : 'fa-camera'}`}></i>
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/jpg, image/gif"
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
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => { logout(); onBack(); }} 
                                            className="px-5 py-2.5 text-rose-600 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-2"
                                        >
                                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto border-b border-zinc-100 dark:border-zinc-700">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Genel Bakış" icon="fa-solid fa-chart-pie" />
                            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="İstatistikler" icon="fa-solid fa-chart-simple" />
                            <TabButton active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} label="Değerlendirmeler" icon="fa-solid fa-clipboard-check" />
                            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ayarlar" icon="fa-solid fa-sliders" />
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard icon="fa-solid fa-layer-group" label="Toplam Etkinlik" value={user.worksheetCount} color="bg-gradient-to-br from-blue-400 to-blue-600" trend="+12 bu hafta" />
                                <StatCard icon="fa-solid fa-crown" label="Seviye" value={level} color="bg-gradient-to-br from-amber-400 to-orange-500" />
                                <StatCard icon="fa-solid fa-calendar-day" label="Üyelik" value={new Date(user.createdAt).toLocaleDateString('tr-TR', {month:'long', year:'numeric'})} color="bg-gradient-to-br from-emerald-400 to-green-600" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                        <i className="fa-solid fa-bolt text-yellow-500"></i> Seviye İlerlemesi
                                    </h3>
                                    <div className="relative pt-2 px-2">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                                    Sonraki Seviye: {level + 1}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold inline-block text-indigo-600">
                                                    {xp}% / 100 XP
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-indigo-100 dark:bg-zinc-700">
                                            <div style={{ width: `${xp}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000 ease-out"></div>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Yeni etkinlikler oluşturarak ve değerlendirmeleri tamamlayarak XP kazanabilirsin.</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6 text-zinc-800 dark:text-zinc-100">Son Aktiviteler</h3>
                                    <div className="space-y-4">
                                        {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                                            <div key={i} className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-700 last:border-0">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500">
                                                    <i className={`${act.icon || 'fa-solid fa-file'} text-sm`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{act.name}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(act.createdAt).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-zinc-400 text-sm text-center py-4">Henüz aktivite yok.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Personal Info Form */}
                            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                    <i className="fa-solid fa-user-pen text-indigo-500"></i> Kişisel Bilgiler
                                </h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Ad Soyad</label>
                                        <input 
                                            type="text" 
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">E-posta (Değiştirilemez)</label>
                                        <input 
                                            type="email" 
                                            value={user.email}
                                            disabled
                                            className="w-full p-3 bg-zinc-100 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 rounded-xl text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            type="submit" 
                                            disabled={isSavingProfile}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                                        >
                                            {isSavingProfile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                                            Değişiklikleri Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Password Change Form */}
                            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                    <i className="fa-solid fa-lock text-indigo-500"></i> Şifre Değiştir
                                </h3>
                                <form onSubmit={handleUpdatePassword} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Yeni Şifre</label>
                                        <input 
                                            type="password" 
                                            value={passwords.new}
                                            onChange={e => setPasswords({...passwords, new: e.target.value})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Yeni Şifre (Tekrar)</label>
                                        <input 
                                            type="password" 
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="••••••"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            type="submit" 
                                            disabled={isSavingPassword || !passwords.new}
                                            className="w-full bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                                        >
                                            {isSavingPassword ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-key"></i>}
                                            Şifreyi Güncelle
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Other Settings */}
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                    <i className="fa-solid fa-gear text-indigo-500"></i> Uygulama Ayarları
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <div>
                                            <p className="font-bold text-zinc-800 dark:text-zinc-200">Karanlık Mod</p>
                                            <p className="text-xs text-zinc-500">Uygulama temasını değiştir.</p>
                                        </div>
                                        <span className="text-xs font-bold bg-zinc-200 dark:bg-zinc-700 px-3 py-1 rounded-full text-zinc-600 dark:text-zinc-300">Otomatik</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <div>
                                            <p className="font-bold text-zinc-800 dark:text-zinc-200">E-posta Bildirimleri</p>
                                            <p className="text-xs text-zinc-500">Yeniliklerden haberdar ol.</p>
                                        </div>
                                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"/>
                                            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-zinc-300 cursor-pointer"></label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-700">
                                    <button className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2 transition-colors">
                                        <i className="fa-solid fa-trash-can"></i> Hesabımı Sil
                                    </button>
                                    <p className="text-xs text-zinc-400 mt-2">Bu işlem geri alınamaz. Tüm verileriniz ve kayıtlı etkinlikleriniz kalıcı olarak silinir.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EVALUATIONS TAB */}
                    {activeTab === 'evaluations' && (
                        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                            {assessments.length === 0 ? (
                                <div className="p-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4">
                                        <i className="fa-solid fa-clipboard-list text-4xl text-zinc-300 dark:text-zinc-500"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-300">Değerlendirme Yok</h3>
                                    <p className="text-zinc-400 max-w-xs mx-auto mt-2">Henüz öğrenci değerlendirmesi yapmadınız. "Değerlendirme" modülünü kullanarak başlayın.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700">
                                            <tr>
                                                <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider">Öğrenci</th>
                                                <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider">Sınıf/Yaş</th>
                                                <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider">Tarih</th>
                                                <th className="p-5 font-bold text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wider text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                            {assessments.map(assess => (
                                                <tr key={assess.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors group">
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${assess.gender === 'Kız' ? 'bg-pink-400' : 'bg-blue-400'}`}>
                                                                {assess.studentName.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-zinc-800 dark:text-zinc-100">{assess.studentName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-zinc-600 dark:text-zinc-400">
                                                        <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded text-xs font-bold">{assess.grade}</span>
                                                        <span className="ml-2 text-xs">({assess.age} Yaş)</span>
                                                    </td>
                                                    <td className="p-5 text-zinc-500">
                                                        <div className="flex items-center gap-2">
                                                            <i className="fa-regular fa-calendar"></i>
                                                            {new Date(assess.createdAt).toLocaleDateString('tr-TR')}
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button 
                                                            onClick={() => setSelectedAssessment(assess)}
                                                            className="text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 dark:border-indigo-800 font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-sm"
                                                        >
                                                            Raporu Gör
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

                    {/* STATS TAB (Detailed) */}
                    {activeTab === 'stats' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <h3 className="text-xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                        <i className="fa-solid fa-chart-simple text-indigo-500"></i> Kategori Dağılımı
                                    </h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Kelime Oyunları', val: 65, color: 'bg-emerald-500' },
                                            { label: 'Matematik & Mantık', val: 20, color: 'bg-blue-500' },
                                            { label: 'Dikkat & Hafıza', val: 10, color: 'bg-purple-500' },
                                            { label: 'Okuma & Anlama', val: 5, color: 'bg-amber-500' }
                                        ].map((cat, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">
                                                    <span>{cat.label}</span>
                                                    <span>{cat.val}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.val}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center items-center text-center">
                                    <div className="w-40 h-40 rounded-full border-[12px] border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center relative mb-6">
                                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                                            {level}
                                        </div>
                                        <div className="absolute bottom-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">SEVİYE</div>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Üretken Eğitimci</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
                                        Toplam {user.worksheetCount} etkinlik ürettiniz. Bir sonraki seviye için {10 - (user.worksheetCount % 10)} etkinlik daha oluşturun.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assessment Modal (Reused) */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedAssessment(null)}>
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <div>
                                <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100">{selectedAssessment.studentName}</h3>
                                <p className="text-sm text-zinc-500">Rapor Tarihi: {new Date(selectedAssessment.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedAssessment(null)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                <i className="fa-solid fa-times text-zinc-500"></i>
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3 text-lg flex items-center gap-2"><i className="fa-solid fa-file-medical"></i> Genel Özet</h4>
                                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedAssessment.report.overallSummary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-700/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-600 shadow-sm">
                                    <RadarChart data={selectedAssessment.report.chartData || []} />
                                </div>
                                <div className="space-y-6">
                                    <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                                        <h5 className="text-green-800 dark:text-green-300 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-plus-circle"></i> Güçlü Yönler</h5>
                                        <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-1 text-sm">
                                            {selectedAssessment.report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="p-5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800">
                                        <h5 className="text-rose-800 dark:text-rose-300 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-circle-exclamation"></i> Gelişim Alanları</h5>
                                        <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-1 text-sm">
                                            {selectedAssessment.report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 mb-4 text-lg">Önerilen Yol Haritası</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedAssessment.report.roadmap.map((item, idx) => (
                                        <div key={idx} className="bg-zinc-50 dark:bg-zinc-700/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold mb-3">{idx + 1}</div>
                                            <h5 className="font-bold text-zinc-800 dark:text-zinc-100 mb-1">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{item.reason}</p>
                                            <span className="inline-block px-2 py-1 bg-white dark:bg-zinc-600 text-xs font-bold rounded border border-zinc-200 dark:border-zinc-500 text-zinc-600 dark:text-zinc-300">{item.frequency}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
