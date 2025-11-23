
import React, { useState, useEffect } from 'react';
import { User, FeedbackItem, Message, ActivityStats } from '../types';
import { authService } from '../services/authService';
import { messagingService } from '../services/messagingService';
import { statsService } from '../services/statsService';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
    onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'feedbacks' | 'messages' | 'stats'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState<ActivityStats[]>([]);
    
    // Message Tab States
    const [selectedConversationUserId, setSelectedConversationUserId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    // Feedback Reply States
    const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
    const [feedbackReplyMessage, setFeedbackReplyMessage] = useState('');

    // Stats Tab States
    const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityStats; direction: 'asc' | 'desc' }>({ key: 'generationCount', direction: 'desc' });

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Auto refresh (10s to reduce DB load)
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [usersData, feedbacksData, statsData] = await Promise.all([
                authService.getAllUsers(),
                messagingService.getAllFeedbacks(),
                statsService.getAllStats()
            ]);
            
            setUsers(usersData);
            setFeedbacks(feedbacksData);
            setStats(statsData);

            if (user) {
                const messagesData = await messagingService.getMessagesForUser(user.id);
                setMessages(messagesData);
            }
        } catch (error) {
            console.error("Admin data load error:", error);
        }
    };

    // --- USER ACTIONS ---
    const handleDeleteUser = async (id: string) => {
        if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            await authService.deleteUser(id);
            loadData();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        await authService.toggleUserStatus(id, currentStatus);
        loadData();
    };

    // --- FEEDBACK ACTIONS ---
    const handleFeedbackReply = async (feedbackId: string) => {
        if (!feedbackReplyMessage.trim() || !user) return;
        try {
            await messagingService.replyToFeedback(feedbackId, feedbackReplyMessage, user);
            setReplyingFeedbackId(null);
            setFeedbackReplyMessage('');
            loadData();
            alert('Yanıt gönderildi.');
        } catch (e) {
            console.error(e);
            alert('Hata oluştu.');
        }
    };

    // --- MESSAGE ACTIONS ---
    const handleSendMessage = async (receiverId: string, content: string) => {
        if (!content.trim() || !user) return;
        try {
            await messagingService.sendMessage({
                senderId: user.id,
                senderName: user.name,
                receiverId,
                content
            });
            setReplyText('');
            loadData();
        } catch (e) { console.error(e); }
    };

    // --- STATS SORTING ---
    const handleSort = (key: keyof ActivityStats) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStats = React.useMemo(() => {
        let sortableItems = [...stats];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [stats, sortConfig]);

    // Safely calculate aggregate stats
    const totalGenerations = stats.reduce((acc, curr) => acc + (curr.generationCount || 0), 0);
    const mostPopular = stats.length > 0 ? stats.reduce((prev, current) => ((prev.generationCount || 0) > (current.generationCount || 0)) ? prev : current) : null;
    const top5 = [...stats].sort((a, b) => (b.generationCount || 0) - (a.generationCount || 0)).slice(0, 5);
    const avgTime = stats.length > 0 ? Math.round(stats.reduce((a,b) => a + (b.avgCompletionTime || 0), 0) / stats.length) : 0;

    // Group messages logic
    interface ConversationGroup {
        userId: string;
        userName: string;
        messages: Message[];
        lastDate: string;
        unreadCount: number;
        userAvatar?: string;
    }

    const groupedMessages = messages.reduce<Record<string, ConversationGroup>>((acc, msg) => {
        if (!user) return acc;
        const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        
        if (!acc[otherId]) {
            const u = users.find(usr => usr.id === otherId);
            acc[otherId] = {
                userId: otherId,
                userName: u ? u.name : (msg.senderId === user.id ? 'Kullanıcı' : msg.senderName),
                messages: [],
                lastDate: msg.timestamp,
                unreadCount: 0,
                userAvatar: u?.avatar
            };
        }
        acc[otherId].messages.push(msg);
        if (new Date(msg.timestamp) > new Date(acc[otherId].lastDate)) {
            acc[otherId].lastDate = msg.timestamp;
        }
        if (msg.receiverId === user.id && !msg.isRead) {
            acc[otherId].unreadCount++;
        }
        return acc;
    }, {});

    const sortedConversations: ConversationGroup[] = (Object.values(groupedMessages) as ConversationGroup[]).sort((a, b) => 
        new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );

    const currentConversationMessages = selectedConversationUserId 
        ? groupedMessages[selectedConversationUserId]?.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || []
        : [];

    if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-600">Yetkisiz Erişim</div>;

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
            <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Yönetici Paneli</h2>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>Kullanıcılar</button>
                    <button onClick={() => setActiveTab('feedbacks')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'feedbacks' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>Geri Bildirimler</button>
                    <button onClick={() => setActiveTab('messages')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'messages' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>Mesajlar</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'stats' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>İstatistikler</button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden p-4 md:p-8">
                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col h-full">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 sticky top-0">
                                    <tr>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Kullanıcı</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">E-posta</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Rol</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Plan</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Durum</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 overflow-y-auto">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-zinc-200" />
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                                            </td>
                                            <td className="p-4 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                                            </td>
                                            <td className="p-4 text-zinc-600 dark:text-zinc-400 capitalize">{u.subscriptionPlan}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {u.id !== user.id && (
                                                    <>
                                                        <button onClick={() => handleToggleStatus(u.id, u.status)} className="text-amber-600 hover:text-amber-800" title={u.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}>
                                                            <i className={`fa-solid ${u.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800" title="Sil">
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FEEDBACKS TAB */}
                {activeTab === 'feedbacks' && (
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto h-full pb-20">
                        {feedbacks.length === 0 && <div className="text-center p-8 text-zinc-400">Henüz geri bildirim yok.</div>}
                        {feedbacks.map(fb => (
                            <div key={fb.id} className={`bg-white dark:bg-zinc-800 p-6 rounded-xl border ${fb.status === 'new' ? 'border-indigo-500 shadow-md' : 'border-zinc-200 dark:border-zinc-700 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{fb.userName || 'Anonim'}</span>
                                            <span className="text-xs text-zinc-500">({fb.userEmail})</span>
                                            {fb.status === 'new' && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">YENİ</span>}
                                        </div>
                                        <p className="text-xs text-zinc-400">{new Date(fb.timestamp).toLocaleString('tr-TR')}</p>
                                    </div>
                                    <div className="flex text-yellow-400 text-sm">
                                        {Array.from({length: 5}).map((_, i) => (
                                            <i key={i} className={`${i < fb.rating ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs rounded mb-2">
                                        {fb.activityTitle || 'Genel'}
                                    </span>
                                    <p className="text-zinc-700 dark:text-zinc-200">{fb.message}</p>
                                </div>

                                {fb.adminReply ? (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-xs font-bold text-green-800 dark:text-green-200 mb-1"><i className="fa-solid fa-reply mr-1"></i> Yanıtınız:</p>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{fb.adminReply}</p>
                                    </div>
                                ) : (
                                    <div>
                                        {replyingFeedbackId === fb.id ? (
                                            <div className="mt-4">
                                                <textarea 
                                                    value={feedbackReplyMessage}
                                                    onChange={(e) => setFeedbackReplyMessage(e.target.value)}
                                                    className="w-full p-3 border rounded-lg mb-2 text-sm bg-white dark:bg-zinc-700 dark:border-zinc-600"
                                                    placeholder="Yanıtınızı yazın..."
                                                    rows={3}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setReplyingFeedbackId(null)} className="text-xs text-zinc-500 hover:text-zinc-700">İptal</button>
                                                    <button onClick={() => handleFeedbackReply(fb.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">Gönder</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => { setReplyingFeedbackId(fb.id); setFeedbackReplyMessage(''); }}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                            >
                                                <i className="fa-solid fa-reply"></i> Yanıtla
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* MESSAGES TAB */}
                {activeTab === 'messages' && (
                    <div className="flex h-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto">
                            {sortedConversations.map(group => (
                                <button
                                    key={group.userId}
                                    onClick={() => { setSelectedConversationUserId(group.userId); }}
                                    className={`w-full p-4 text-left border-b border-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors ${selectedConversationUserId === group.userId ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <img src={group.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.userName}`} alt="" className="w-10 h-10 rounded-full bg-zinc-200" />
                                            <div>
                                                <p className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{group.userName}</p>
                                                <p className="text-xs text-zinc-500 truncate max-w-[120px]">{group.messages[group.messages.length-1].content}</p>
                                            </div>
                                        </div>
                                        {group.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{group.unreadCount}</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                            {sortedConversations.length === 0 && <div className="p-8 text-center text-zinc-400 text-sm">Mesaj kutusu boş.</div>}
                        </div>

                        <div className="flex-1 flex flex-col">
                            {selectedConversationUserId ? (
                                <>
                                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                                        <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{groupedMessages[selectedConversationUserId]?.userName}</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-100/50 dark:bg-zinc-900/50">
                                        {currentConversationMessages.map(msg => {
                                            const isMe = msg.senderId === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] p-3 rounded-xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-bl-none shadow-sm'}`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendMessage(selectedConversationUserId, replyText)}
                                                className="flex-1 p-2 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Mesaj yaz..."
                                            />
                                            <button 
                                                onClick={() => handleSendMessage(selectedConversationUserId, replyText)}
                                                className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <i className="fa-solid fa-paper-plane"></i>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-zinc-400">
                                    <p>Bir sohbet seçin.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="flex flex-col h-full gap-6 overflow-y-auto pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl">
                                    <i className="fa-solid fa-bolt"></i>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase">Toplam Üretim</p>
                                    <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{totalGenerations}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                                    <i className="fa-solid fa-trophy"></i>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase">En Popüler</p>
                                    <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1" title={mostPopular?.title || '-'}>{mostPopular?.title || '-'}</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
                                    <i className="fa-solid fa-clock"></i>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase">Ort. Tamamlama</p>
                                    <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">
                                        {avgTime} dk
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <h3 className="text-lg font-bold mb-6 text-zinc-800 dark:text-zinc-100">En Çok Kullanılan 5 Etkinlik</h3>
                                <div className="flex flex-col justify-end h-64 gap-3">
                                    {top5.map((item, index) => {
                                        const maxVal = top5[0].generationCount || 1;
                                        const widthPercent = ((item.generationCount || 0) / maxVal) * 100;
                                        return (
                                            <div key={item.activityId} className="w-full">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-medium truncate w-3/4" title={item.title}>{item.title}</span>
                                                    <span className="font-bold">{item.generationCount}</span>
                                                </div>
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full bg-indigo-500" 
                                                        style={{ width: `${widthPercent}%`, opacity: 1 - (index * 0.15) }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Tüm Etkinlik Detayları</h3>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase font-bold text-xs sticky top-0">
                                            <tr>
                                                <th className="p-4 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('title')}>Etkinlik Adı <i className="fa-solid fa-sort ml-1"></i></th>
                                                <th className="p-4 text-center cursor-pointer hover:text-indigo-600" onClick={() => handleSort('generationCount')}>Üretim <i className="fa-solid fa-sort ml-1"></i></th>
                                                <th className="p-4 text-center cursor-pointer hover:text-indigo-600" onClick={() => handleSort('avgCompletionTime')}>Ort. Süre (dk) <i className="fa-solid fa-sort ml-1"></i></th>
                                                <th className="p-4 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSort('lastGenerated')}>Son İşlem <i className="fa-solid fa-sort ml-1"></i></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                            {sortedStats.map((item) => (
                                                <tr key={item.activityId} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="p-4 font-medium text-zinc-800 dark:text-zinc-200">{item.title}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">{item.generationCount}</span>
                                                    </td>
                                                    <td className="p-4 text-center text-zinc-600 dark:text-zinc-400">{item.avgCompletionTime}</td>
                                                    <td className="p-4 text-right text-zinc-500 text-xs">
                                                        {new Date(item.lastGenerated).toLocaleDateString('tr-TR')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
