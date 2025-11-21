
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagingService } from '../services/messagingService';
import { Message } from '../types';

export const MessagesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (user) {
            loadMessages();
            // Simple polling for demo purposes (every 5 sec)
            const interval = setInterval(loadMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadMessages = () => {
        if (user) {
            const msgs = messagingService.getMessagesForUser(user.id);
            setMessages(msgs);
            // Mark received unread messages as read
            msgs.forEach(m => {
                if (m.receiverId === user.id && !m.isRead) {
                    messagingService.markAsRead(m.id);
                }
            });
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        
        setSending(true);
        try {
            // Default to sending to Admin
            await messagingService.sendMessage({
                senderId: user.id,
                senderName: user.name,
                receiverId: 'admin-001', // Default admin ID
                content: newMessage
            });
            setNewMessage('');
            loadMessages();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (!user) return null;

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 p-4 md:p-8 overflow-hidden">
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between bg-white dark:bg-zinc-800 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="md:hidden text-zinc-500 hover:text-zinc-800">
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Yönetici ile Mesajlar</h2>
                    </div>
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <i className="fa-solid fa-comments text-4xl mb-3 opacity-20"></i>
                            <p>Henüz bir mesaj yok. Yöneticiye bir şeyler yazın.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === user.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm relative ${
                                        isMe 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-200 dark:border-zinc-600'
                                    }`}>
                                        {!isMe && <p className="text-xs font-bold mb-1 text-indigo-500 dark:text-indigo-400">Yönetici</p>}
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-indigo-200' : 'text-zinc-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Mesajınızı yazın..."
                            className="flex-1 p-3 bg-zinc-100 dark:bg-zinc-700 border-transparent rounded-xl focus:bg-white dark:focus:bg-zinc-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={sending || !newMessage.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};
