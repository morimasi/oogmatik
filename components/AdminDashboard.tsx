
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { messagingService } from '../services/messagingService';
import { User, FeedbackItem, Message, UserRole, UserStatus, SubscriptionPlan } from '../types';

// --- UI COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; change: string; icon: string; color: string; trend: 'up' | 'down' }> = ({ title, value, change, icon, color, trend }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                <i className={`fa-solid fa-arrow-${trend}`}></i>
                <span>{change}</span>
                <span className="text-zinc-400 font-normal ml-1">geçen haftaya göre</span>
            </div>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center`}>
            <i className={`${icon} text-xl`}></i>
        </div>
    </div>
);

const ActivityChart = () => {
    const data = [40, 65, 45, 80, 55, 90, 70];
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Haftalık Aktivite</h3>
                <button className="text-zinc-400 hover:text-indigo-500"><i className="fa-solid fa-ellipsis"></i></button>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
                {data.map((h, i) => (
                    <div key={i} className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-t-md relative group overflow-hidden">
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-indigo-500 group-hover:bg-indigo-600 transition-all duration-500 rounded-t-md" 
                            style={{ height: `${h}%` }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {h}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-400 font-medium">
                <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
            </div>
        </div>
    );
}

// --- MODAL FOR USER EDIT/CREATE ---
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    initialData?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<User>>({
        name: '', email: '', role: 'user', status: 'active', subscriptionPlan: 'free'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', email: '', role: 'user', status: 'active', subscriptionPlan: 'free' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
                    {initialData ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ad Soyad</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-posta</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rol</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                <option value="user">Kullanıcı</option>
                                <option value="admin">Yönetici</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Durum</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as UserStatus})} className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                <option value="active">Aktif</option>
                                <option value="suspended">Askıya Alınmış</option>
                                <option value="pending">Beklemede</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Abonelik Planı</label>
                        <select value={formData.subscriptionPlan} onChange={e => setFormData({...formData, subscriptionPlan: e.target.value as SubscriptionPlan})} className="w-full p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                            <option value="free">Ücretsiz</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Kurumsal</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg">İptal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedbacks' | 'messages' | 'settings'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    
    // Modal States
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // System Settings State (Mock)
    const [systemSettings, setSystemSettings] = useState({
        maintenanceMode: false,
        allowRegistrations: true,
        aiEnabled: true
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            loadData();
        }
    }, [user, activeTab]);

    const loadData = () => {
        setUsers(authService.getAllUsers());
        setFeedbacks(messagingService.getAllFeedbacks());
        if (user && user.id) {
            setMessages(messagingService.getMessagesForUser(user.id));
        }
    };

    if (user?.role !== 'admin') return <div className="flex items-center justify-center h-screen bg-zinc-100 text-red-500 font-bold">Yetkisiz Erişim</div>;

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- USER MANAGEMENT ACTIONS ---
    const handleDeleteUser = async (userId: string) => {
        if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            await authService.deleteUser(userId);
            loadData();
        }
    };

    const handleSaveUser = async (userData: Partial<User>) => {
        try {
            if (editingUser) {
                await authService.adminUpdateUser(editingUser.id, userData);
            } else {
                await authService.adminCreateUser(userData);
            }
            setIsUserModalOpen(false);
            setEditingUser(null);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const openEditUser = (u: User) => {
        setEditingUser(u);
        setIsUserModalOpen(true);
    };

    const openCreateUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    // --- FEEDBACK ACTIONS ---
    const handleReplyFeedback = async (feedbackId: string) => {
        if (!replyText.trim()) return;
        try {
            await messagingService.replyToFeedback(feedbackId, replyText, user);
            alert("Yanıt gönderildi.");
            setReplyingTo(null);
            setReplyText('');
            loadData();
        } catch (error) {
            alert("Bir hata oluştu.");
        }
    };

    const handleSendMessage = async (receiverId: string, content: string) => {
        if (!content.trim()) return;
        try {
            await messagingService.sendMessage({
                senderId: user.id,
                senderName: user.name,
                receiverId,
                content
            });
            loadData();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col z-10 shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Admin Paneli</h2>
                </div>
                
                <nav className="flex-1 p-4 space-y-1">
                    {[
                        {id: 'overview', icon: 'fa-gauge-high', label: 'Genel Bakış'},
                        {id: 'users', icon: 'fa-users', label: 'Kullanıcılar'},
                        {id: 'feedbacks', icon: 'fa-comments', label: 'Geri Bildirimler'},
                        {id: 'messages', icon: 'fa-envelope', label: 'Mesajlar'},
                        {id: 'settings', icon: 'fa-gear', label: 'Sistem Ayarları'}
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                        >
                            <i className={`fa-solid ${tab.icon} w-5 text-center`}></i> {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                    <button onClick={onBack} className="w-full py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Çıkış
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 md:px-8 md:py-4 flex justify-between items-center sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 capitalize">
                        {activeTab === 'overview' ? 'Gösterge Paneli' : 
                         activeTab === 'users' ? 'Kullanıcı Yönetimi' :
                         activeTab === 'feedbacks' ? 'Geri Bildirimler' : 
                         activeTab === 'messages' ? 'Mesajlar' : 'Sistem Ayarları'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 fade-in">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Toplam Kullanıcı" value={users.length} change="+12%" icon="fa-solid fa-users" color="bg-indigo-500 text-indigo-500" trend="up" />
                                <StatCard title="Geri Bildirim" value={feedbacks.length} change="+5%" icon="fa-solid fa-comment-dots" color="bg-emerald-500 text-emerald-500" trend="up" />
                                <StatCard title="Üretilen İçerik" value={users.reduce((a,b)=>a+b.worksheetCount, 0)} change="+18%" icon="fa-solid fa-file-pen" color="bg-blue-500 text-blue-500" trend="up" />
                                <StatCard title="Mesaj Trafiği" value={messages.length} change="-2%" icon="fa-solid fa-envelope-open-text" color="bg-amber-500 text-amber-500" trend="down" />
                            </div>
                            <div className="h-80"><ActivityChart /></div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden fade-in">
                            <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4 items-center">
                                <input 
                                    type="text" 
                                    placeholder="Kullanıcı Ara..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-4 pr-4 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-900 w-full sm:w-64"
                                />
                                <button onClick={openCreateUser} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    <i className="fa-solid fa-plus"></i> Yeni Kullanıcı
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs uppercase text-zinc-500 font-semibold">
                                        <tr>
                                            <th className="p-4">Kullanıcı</th>
                                            <th className="p-4">Rol</th>
                                            <th className="p-4">Durum</th>
                                            <th className="p-4">Plan</th>
                                            <th className="p-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
                                                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div><p className="font-bold">{u.name}</p><p className="text-xs text-zinc-500">{u.email}</p></div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {u.status === 'active' ? 'Aktif' : 'Askıda'}
                                                    </span>
                                                </td>
                                                <td className="p-4 capitalize">{u.subscriptionPlan}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEditUser(u)} className="text-blue-600 hover:bg-blue-50 p-2 rounded" title="Düzenle">
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                        {u.id !== user.id && (
                                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Sil">
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedbacks' && (
                        <div className="space-y-4 fade-in">
                            {feedbacks.length === 0 && <p className="text-center text-zinc-500">Henüz geri bildirim yok.</p>}
                            {feedbacks.map(fb => (
                                <div key={fb.id} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">
                                                {fb.rating}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{fb.activityTitle}</h4>
                                                <p className="text-sm text-zinc-500">{fb.userName} • {new Date(fb.timestamp).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${fb.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {fb.status === 'replied' ? 'Yanıtlandı' : 'Yeni'}
                                        </span>
                                    </div>
                                    <p className="text-zinc-700 dark:text-zinc-300 mb-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg italic">"{fb.message}"</p>
                                    
                                    {fb.adminReply && (
                                        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r-lg">
                                            <p className="text-xs font-bold text-indigo-600 mb-1">Sizin Yanıtınız:</p>
                                            <p className="text-sm">{fb.adminReply}</p>
                                        </div>
                                    )}

                                    {fb.status !== 'replied' && fb.userId && (
                                        <div>
                                            {replyingTo === fb.id ? (
                                                <div className="mt-4 animate-fade-in">
                                                    <textarea 
                                                        className="w-full p-3 border rounded-lg mb-2 dark:bg-zinc-700 dark:border-zinc-600"
                                                        rows={3}
                                                        placeholder="Yanıtınızı yazın..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    ></textarea>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleReplyFeedback(fb.id)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Gönder</button>
                                                        <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded">İptal</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setReplyingTo(fb.id)} className="text-indigo-600 font-bold text-sm hover:underline">
                                                    <i className="fa-solid fa-reply mr-1"></i> Yanıtla
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 h-[600px] flex fade-in">
                            {/* Simple Message List for Admin */}
                            <div className="w-full p-4 overflow-y-auto">
                                {messages.length === 0 ? (
                                    <p className="text-center text-zinc-500 mt-10">Mesaj kutusu boş.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`p-4 rounded-lg border ${msg.senderId === user.id ? 'bg-indigo-50 ml-auto border-indigo-200 max-w-lg' : 'bg-zinc-50 border-zinc-200 max-w-lg'}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-sm">{msg.senderId === user.id ? 'Siz' : msg.senderName}</span>
                                                    <span className="text-xs text-zinc-400">{new Date(msg.timestamp).toLocaleString('tr-TR')}</span>
                                                </div>
                                                <p className="text-sm">{msg.content}</p>
                                                {msg.senderId !== user.id && (
                                                    <button 
                                                        onClick={() => {
                                                            const reply = prompt("Yanıtınız:");
                                                            if(reply) handleSendMessage(msg.senderId, reply);
                                                        }} 
                                                        className="mt-2 text-xs text-indigo-600 hover:underline"
                                                    >
                                                        Yanıtla
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 fade-in">
                            <h3 className="text-lg font-bold mb-6">Sistem Genel Ayarları</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-zinc-600">
                                    <div>
                                        <p className="font-bold">Bakım Modu</p>
                                        <p className="text-sm text-zinc-500">Kullanıcı girişlerini geçici olarak durdurur.</p>
                                    </div>
                                    <button onClick={() => setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})} className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.maintenanceMode ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                                        <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${systemSettings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-zinc-600">
                                    <div>
                                        <p className="font-bold">Yeni Kayıt Alımı</p>
                                        <p className="text-sm text-zinc-500">Yeni üye kayıtlarını aç/kapat.</p>
                                    </div>
                                    <button onClick={() => setSystemSettings({...systemSettings, allowRegistrations: !systemSettings.allowRegistrations})} className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.allowRegistrations ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                                        <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${systemSettings.allowRegistrations ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-zinc-600">
                                    <div>
                                        <p className="font-bold">AI Üretim Motoru</p>
                                        <p className="text-sm text-zinc-500">Tüm sistemde AI üretimini aktif/pasif yap.</p>
                                    </div>
                                    <button onClick={() => setSystemSettings({...systemSettings, aiEnabled: !systemSettings.aiEnabled})} className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.aiEnabled ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                                        <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${systemSettings.aiEnabled ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <UserModal 
                isOpen={isUserModalOpen} 
                onClose={() => setIsUserModalOpen(false)} 
                onSave={handleSaveUser} 
                initialData={editingUser} 
            />
        </div>
    );
};
