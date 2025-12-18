import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagingService, mapDbMessage } from '../services/messagingService';
import { authService } from '../services/authService';
import { Message, User } from '../types';
import { db } from '../services/firebaseClient';
import * as firestore from "firebase/firestore";

const { collection, query, where, onSnapshot, orderBy } = firestore;

interface MessagesViewProps {
    onBack: () => void;
    onRefreshNotifications?: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ onBack, onRefreshNotifications }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<User[]>([]);
    const [selectedContact, setSelectedContact] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadInitialData = async () => {
        if (!user) return;
        
        const [allUsers, allMsgs] = await Promise.all([
            authService.getContacts(user.id),
            messagingService.getMessagesForUser(user.id)
        ]);

        const sortedContacts = allUsers.sort((a, b) => {
            if (a.role === 'admin' && b.role !== 'admin') return -1;
            if (b.role === 'admin' && a.role !== 'admin') return 1;
            return a.name.localeCompare(b.name);
        });
        
        setContacts(sortedContacts);
        setMessages(allMsgs);
        
        const admin = sortedContacts.find(u => u.role === 'admin');
        if (!selectedContact && admin) {
            setSelectedContact(admin);
        }
    };

    useEffect(() => {
        if (user) {
            loadInitialData();

            // Firestore Realtime Listener
            // Listening for messages where I am the receiver
            const q = query(
                collection(db, "messages"),
                where("receiverId", "==", user.id)
                // Note: Firestore limits complex queries in listeners. 
                // We'll filter or sort on client if needed, or rely on simple filter.
            );

            // FIX: Explicitly type `snapshot` to resolve property access error.
            const unsubscribe = onSnapshot(q, (snapshot: firestore.QuerySnapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const newMsg = mapDbMessage(change.doc.data(), change.doc.id);
                        setMessages(prev => {
                            // Avoid duplicates just in case
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                    if (change.type === "removed") {
                        setMessages(prev => prev.filter(m => m.id !== change.doc.id));
                    }
                });
            });

            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedContact]);

    const handleContactSelect = async (contact: User) => {
        setSelectedContact(contact);
        const unreadMessages = messages.filter(m => m.senderId === contact.id && m.receiverId === user?.id && !m.isRead);
        if (unreadMessages.length > 0) {
            // 1. Optimistic Update for UI responsiveness
            setMessages(prev => prev.map(m => unreadMessages.find(um => um.id === m.id) ? { ...m, isRead: true } : m));
            
            // 2. Perform DB Updates and wait for completion
            await Promise.all(unreadMessages.map(m => messagingService.markAsRead(m.id)));
            
            // 3. Trigger global refresh to update notification badge
            if (onRefreshNotifications) {
                onRefreshNotifications();
            }
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !selectedContact) return;
        
        setSending(true);
        const contentToSend = newMessage;
        setNewMessage(''); 

        try {
            const sentMessage = await messagingService.sendMessage({
                senderId: user.id,
                senderName: user.name,
                receiverId: selectedContact.id,
                content: contentToSend
            });
            // Optimistic update
            setMessages(prev => [...prev, sentMessage]);
        } catch (err) {
            console.error("Mesaj gönderme hatası:", err);
            setNewMessage(contentToSend); 
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        
        // Optimistic UI update
        setMessages(prev => prev.filter(m => m.id !== messageId));
        
        try {
            await messagingService.deleteMessage(messageId);
        } catch (err) {
            console.error("Silme hatası:", err);
            // Revert on error would require refetching, simply alert for now
            alert("Mesaj silinemedi.");
        }
    };

    const handleClearChat = async () => {
        if (!user || !selectedContact) return;
        if (!confirm('Bu kişiyle olan TÜM sohbet geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        const contactId = selectedContact.id;
        
        // Optimistic UI Update
        setMessages(prev => prev.filter(m => 
            !((m.senderId === user.id && m.receiverId === contactId) || 
              (m.senderId === contactId && m.receiverId === user.id))
        ));

        try {
            await messagingService.clearConversation(user.id, contactId);
        } catch (err) {
            console.error("Sohbet temizleme hatası:", err);
            alert("Sohbet temizlenirken bir hata oluştu.");
            loadInitialData(); // Reload to restore state if failed
        }
    };

    const currentConversation = useMemo(() => {
        if (!selectedContact || !user) return [];
        return messages.filter(m => 
            (m.senderId === user.id && m.receiverId === selectedContact.id) || 
            (m.senderId === selectedContact.id && m.receiverId === user.id)
        ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedContact, user]);

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.role === 'admin' && 'yönetici'.includes(searchQuery.toLowerCase()))
    );

    const getUnreadCount = (contactId: string) => {
        if (!user) return 0;
        return messages.filter(m => m.senderId === contactId && m.receiverId === user.id && !m.isRead).length;
    };

    if (!user) return null;

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
            <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-3 flex items-center shadow-sm shrink-0 z-20">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95"
                >
                    <i className="fa-solid fa-arrow-left text-indigo-500"></i>
                    <span>Ana Menüye Dön</span>
                </button>
                <h1 className="ml-4 font-bold text-lg text-zinc-800 dark:text-zinc-100 hidden sm:block border-l pl-4 border-zinc-300 dark:border-zinc-600">Mesaj Merkezi</h1>
            </div>

            <div className="flex-1 overflow-hidden p-2 md:p-6">
                <div className="max-w-6xl mx-auto w-full h-full flex bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    
                    <div className={`w-full md:w-80 flex flex-col border-r border-zinc-200 dark:border-zinc-700 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Sohbetler</h2>
                            </div>
                            <div className="relative">
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Kişi ara..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredContacts.map(contact => {
                                const unread = getUnreadCount(contact.id);
                                return (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleContactSelect(contact)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors border-b border-zinc-100 dark:border-zinc-700/50 ${selectedContact?.id === contact.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="relative">
                                            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-600" />
                                            {contact.role === 'admin' && (
                                                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] px-1 rounded-full border-2 border-white dark:border-zinc-800">
                                                    <i className="fa-solid fa-shield"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">
                                                    {contact.name} {contact.id === user.id ? '(Sen)' : ''}
                                                </p>
                                                {unread > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                        {unread}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate">
                                                {contact.role === 'admin' ? 'Sistem Yöneticisi' : contact.email}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredContacts.length === 0 && (
                                <div className="p-8 text-center text-zinc-400 text-sm">
                                    Kişi bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`flex-1 flex-col ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
                        {selectedContact ? (
                            <>
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-between shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedContact(null)} className="md:hidden mr-2 text-zinc-500 hover:text-zinc-800">
                                            <i className="fa-solid fa-arrow-left"></i>
                                        </button>
                                        <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full border" />
                                        <div>
                                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{selectedContact.name}</h3>
                                            <span className="text-xs text-green-500 flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div> Çevrimiçi
                                            </span>
                                        </div>
                                    </div>
                                    {/* DELETE CHAT BUTTON */}
                                    <button 
                                        onClick={handleClearChat}
                                        className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Sohbeti Temizle"
                                    >
                                        <i className="fa-solid fa-trash-can fa-lg"></i>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-100/50 dark:bg-zinc-900/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                    {currentConversation.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-70">
                                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                                <i className="fa-solid fa-comments text-4xl text-indigo-400"></i>
                                            </div>
                                            <p>Sohbeti başlatın.</p>
                                            <p className="text-xs mt-2">İlk mesajı gönder!</p>
                                        </div>
                                    ) : (
                                        currentConversation.map((msg) => {
                                            const isMe = msg.senderId === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                                    <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-sm relative group ${
                                                        isMe 
                                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                                        : 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-none border border-zinc-200 dark:border-zinc-600'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                                        <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-zinc-400'}`}>
                                                            <span>{new Date(msg.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                                                            {isMe && (
                                                                <i className={`fa-solid fa-check-double ${msg.isRead ? 'text-blue-300' : 'opacity-50'}`}></i>
                                                            )}
                                                        </div>
                                                        {/* DELETE MESSAGE BUTTON - VISIBLE ON HOVER */}
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                                            className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center ${isMe ? 'right-auto left-1' : ''}`}
                                                            title="Mesajı Sil"
                                                        >
                                                            <i className="fa-solid fa-times"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSend} className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
                                    <div className="flex gap-3 items-end">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend(e);
                                                }
                                            }}
                                            placeholder="Bir mesaj yazın..."
                                            rows={1}
                                            className="flex-1 p-3 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none max-h-32 placeholder:text-zinc-500"
                                            style={{minHeight: '48px'}}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={sending || !newMessage.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
                                        >
                                            {sending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50">
                                <i className="fa-regular fa-paper-plane text-6xl mb-4 opacity-20"></i>
                                <p className="text-lg font-medium">Mesajlaşmak için bir kişi seçin</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};