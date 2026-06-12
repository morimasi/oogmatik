import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../../../services/messagingService';
import { Message, Attachment } from '../../../types/messaging';
import { AdvancedStudent } from '../../../types/student-advanced';
import { logError } from '../../../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentStore } from '../../../store/useStudentStore';

interface ConnectPanelProps {
    student: AdvancedStudent | null;
    currentUser: { id: string; name: string; role: 'teacher' | 'parent' | 'admin' };
    onClose?: () => void;
}

export const ConnectPanel: React.FC<ConnectPanelProps> = ({ student, currentUser, onClose }) => {
    const { students } = useStudentStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    // UI State
    const [activeView, setActiveView] = useState<'chat' | 'contacts' | 'direct'>('chat');
    const [activeChat, setActiveChat] = useState<{ id: string; name: string; type: 'student' | 'user' } | null>(
        student ? { id: student.id, name: student.name, type: 'student' } : null
    );
    const [selectedContextStudent, setSelectedContextStudent] = useState<AdvancedStudent | null>(student);
    
    const [contacts, setContacts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mesajları Dinle
    useEffect(() => {
        if (!activeChat) return;
        
        const params = activeChat.type === 'student' 
            ? { studentId: activeChat.id }
            : { participantIds: [currentUser.id, activeChat.id] };

        const unsubscribe = messagingService.listenToMessages(params, (msgs) => {
            setMessages(msgs);
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        });
        return () => unsubscribe();
    }, [activeChat?.id, activeChat?.type, currentUser.id]);

    // Kullanıcıları Çek
    useEffect(() => {
        if (activeView === 'contacts') {
            messagingService.fetchInternalUsers(currentUser.id).then(setContacts);
        }
    }, [activeView, currentUser.id]);

    const handleSend = async (attachment?: Attachment) => {
        if ((!inputText.trim() && !attachment) || isSending || !activeChat) return;
        setIsSending(true);
        try {
            const params: any = {
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderRole: currentUser.role as any,
                text: inputText.trim(),
                attachment
            };

            if (activeChat.type === 'student') {
                params.studentId = activeChat.id;
            } else {
                params.participantIds = [currentUser.id, activeChat.id];
            }

            // Öğrenci bağlamı ekle
            if (selectedContextStudent) {
                params.contextStudentId = selectedContextStudent.id;
                params.contextStudentName = selectedContextStudent.name;
            }

            await messagingService.sendMessage(params);
            setInputText('');
        } catch (error) {
            logError("Message send failed:", { error });
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosyayı oku (Base64 simülasyonu - üretimde Cloud Storage kullanılmalı)
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            const attachment: Attachment = {
                id: Math.random().toString(36).substr(2, 9),
                type: file.type.startsWith('image/') ? 'image' : 'pdf',
                name: file.name,
                url: base64
            };
            await handleSend(attachment);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteMessage = async (id: string) => {
        if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        try {
            await messagingService.deleteMessage(id);
        } catch (error) {
            logError("Delete failed:", { error });
        }
    };

    const formatMessageDate = (date: any) => {
        if (!date) return '';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[var(--bg-paper)]/95 backdrop-blur-3xl border-l border-[var(--border-color)] font-['Lexend'] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 backdrop-blur-md relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        {(activeView === 'direct' || (activeView === 'chat' && !student)) && (
                            <button 
                                onClick={() => setActiveView('contacts')}
                                className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                            >
                                <i className="fa-solid fa-chevron-left text-xs"></i>
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-color)]/20 to-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center border border-[var(--accent-color)]/20 shadow-inner">
                            <i className={`fa-solid ${activeChat ? 'fa-user-circle' : 'fa-comments-alt'} text-lg`}></i>
                        </div>
                        <div>
                            <h3 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">
                                {activeChat ? activeChat.name : 'Oogmatik Connect'}
                            </h3>
                            <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">
                                {activeChat ? (activeChat.type === 'student' ? 'Öğrenci Kanalı' : 'Özel Mesajlaşma') : 'Güvenli İletişim Ağı'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all flex items-center justify-center border border-[var(--border-color)] hover:border-rose-500/20 group">
                        <i className="fa-solid fa-times text-sm group-hover:rotate-90 transition-transform duration-300"></i>
                    </button>
                </div>

                {/* Tabs / Context Picker */}
                {!activeChat || activeView === 'contacts' ? (
                     <div className="flex gap-2 p-1.5 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)]">
                        <button 
                            onClick={() => setActiveView('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'chat' ? 'bg-[var(--accent-color)] text-white shadow-xl scale-[1.02]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-paper)]'}`}
                        >
                            <i className="fa-solid fa-comment-dots text-xs"></i> Mesajlar
                        </button>
                        <button 
                            onClick={() => setActiveView('contacts')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'contacts' ? 'bg-[var(--accent-color)] text-white shadow-xl scale-[1.02]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-paper)]'}`}
                        >
                            <i className="fa-solid fa-address-book text-xs"></i> Kişiler
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-2.5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-2">BAĞLAM:</span>
                            <select 
                                value={selectedContextStudent?.id || ''}
                                onChange={(e) => {
                                    const s = students.find(x => x.id === e.target.value);
                                    setSelectedContextStudent(s as any || null);
                                }}
                                className="bg-transparent border-none text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight focus:ring-0 p-0 cursor-pointer hover:text-indigo-400 transition-colors"
                            >
                                <option value="" className="bg-[var(--bg-paper)] text-[var(--text-muted)]">Öğrenci Seçin...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[var(--bg-paper)] text-[var(--text-primary)]">{s.name}</option>
                                ))}
                            </select>
                        </div>
                        {selectedContextStudent && (
                             <button 
                                onClick={() => setSelectedContextStudent(null)}
                                className="w-5 h-5 rounded-md hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-500 transition-all flex items-center justify-center"
                             >
                                <i className="fa-solid fa-times text-[10px]"></i>
                             </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeView === 'contacts' ? (
                    <ViewContacts 
                        contacts={filteredContacts} 
                        searchQuery={searchQuery} 
                        setSearchQuery={setSearchQuery}
                        onSelect={(u: any) => {
                            setActiveChat({ id: u.id, name: u.name, type: 'user' });
                            setActiveView('direct');
                        }}
                    />
                ) : (
                    <ViewChat 
                        messages={messages} 
                        activeChat={activeChat}
                        currentUser={currentUser} 
                        scrollRef={scrollRef} 
                        formatMessageDate={formatMessageDate}
                        onDelete={handleDeleteMessage}
                        onPreview={setPreviewFile}
                    />
                )}
            </div>

            {/* Input Area */}
            {activeChat && activeView !== 'contacts' && (
                <div className="p-6 pt-2 bg-gradient-to-t from-[var(--bg-paper)] to-transparent relative z-10">
                    <div className="p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] flex items-center gap-2 focus-within:border-[var(--accent-color)]/30 focus-within:ring-8 focus-within:ring-[var(--accent-color)]/5 transition-all shadow-inner hover:shadow-lg group/input">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,application/pdf"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-11 h-11 shrink-0 rounded-full bg-[var(--bg-paper)] hover:bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all border border-[var(--border-color)] shadow-sm active:scale-95"
                            title="Dosya Ekle"
                        >
                            <i className="fa-solid fa-plus text-sm"></i>
                        </button>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`${activeChat.name.split(' ')[0]}'ye yazın...`}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 tracking-tight"
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={(!inputText.trim()) || isSending}
                            className="w-11 h-11 shrink-0 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center disabled:opacity-30 disabled:scale-95 disabled:grayscale hover:scale-105 active:scale-90 transition-all shadow-lg shadow-[var(--accent-color)]/30"
                        >
                            <i className={`fa-solid ${isSending ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-sm`}></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Zoom / Preview Modal */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-10 cursor-zoom-out"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.button 
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
                            onClick={() => setPreviewFile(null)}
                        >
                            <i className="fa-solid fa-times text-xl"></i>
                        </motion.button>
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={previewFile} 
                            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-white/5" 
                            alt="Önizleme"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* --- Alt Bileşenler --- */

const ViewChat = ({ messages, activeChat, currentUser, scrollRef, formatMessageDate, onDelete, onPreview }: any) => (
    <div 
        ref={scrollRef}
        className="h-full overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar"
    >
        {!activeChat ? (
             <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 rounded-full bg-indigo-500/5 flex items-center justify-center mb-6 border border-indigo-500/10">
                     <i className="fa-solid fa-comments text-3xl text-indigo-500/50"></i>
                </div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-2">Konuşma Seçilmedi</h4>
                <p className="text-[9px] font-medium text-[var(--text-muted)] leading-relaxed max-w-[200px] uppercase tracking-tighter opacity-50">Sohbet başlatmak için kişiler listesine göz atın.</p>
            </div>
        ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-6 opacity-40 border border-[var(--border-color)] rotate-3">
                     <i className="fa-solid fa-leaf text-3xl text-[var(--text-muted)]"></i>
                </div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-2 opacity-50">Sayfa Tertemiz</h4>
                <p className="text-[9px] font-medium text-[var(--text-muted)] leading-relaxed max-w-[200px]">Bu konuşmada henüz bir kayıt bulunmuyor.</p>
            </div>
        ) : (
            messages.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'} group/msg`}>
                    <div className={`flex items-center gap-2 mb-1.5 px-1 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${msg.senderId === currentUser.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}>
                            {msg.senderName}
                        </span>
                        <span className="text-[7.5px] text-[var(--text-muted)] font-bold opacity-30">{formatMessageDate(msg.createdAt)}</span>
                        {msg.senderId === currentUser.id && (
                             <button 
                                onClick={() => onDelete(msg.id)}
                                className="opacity-0 group-hover/msg:opacity-100 w-5 h-5 rounded-md hover:bg-rose-500/10 text-rose-500/50 transition-all flex items-center justify-center"
                             >
                                <i className="fa-solid fa-trash-alt text-[8px]"></i>
                             </button>
                        )}
                    </div>
                    
                    <div className={`max-w-[85%] rounded-[1.4rem] relative shadow-sm transition-all duration-300
                        ${msg.senderId === currentUser.id 
                            ? 'bg-[var(--accent-color)] text-white rounded-tr-none' 
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'}`}
                    >
                        {msg.contextStudentName && (
                             <div className="px-3 py-1 bg-black/10 rounded-t-[1.4rem] border-b border-white/5 text-[7px] font-black uppercase tracking-widest opacity-70 flex items-center gap-1">
                                <i className="fa-solid fa-tags text-[8px] opacity-40"></i>
                                {msg.contextStudentName}
                             </div>
                        )}
                        
                        <div className="p-4 pt-4">
                            {msg.attachment ? (
                                <div className="space-y-3">
                                    {msg.attachment.type === 'image' ? (
                                        <div 
                                            className="cursor-zoom-in overflow-hidden rounded-xl border border-white/10 group/preview"
                                            onClick={() => onPreview(msg.attachment.url)}
                                        >
                                            <img src={msg.attachment.url} className="w-full h-auto max-h-48 object-cover group-hover:scale-105 transition-transform duration-700" alt="Görsel" />
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-black/20 rounded-xl flex items-center gap-3 border border-white/5">
                                            <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white">
                                                <i className="fa-solid fa-file-pdf"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase truncate">{msg.attachment.name}</p>
                                                <p className="text-[8px] opacity-50 font-bold">PDF BELGESİ</p>
                                            </div>
                                        </div>
                                    )}
                                    {msg.text && <p className="text-[12px] font-bold leading-tight tracking-tight mt-2">{msg.text}</p>}
                                </div>
                            ) : (
                                <p className="text-[12px] font-bold leading-[1.5] tracking-tight">{msg.text}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
);

const ViewContacts = ({ contacts, searchQuery, setSearchQuery, onSelect }: any) => (
    <div className="h-full flex flex-col min-h-0">
        <div className="px-6 py-4">
            <div className="relative group">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] group-focus-within:text-[var(--accent-color)] transition-colors"></i>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Eğitimci veya veli ara..."
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.2rem] py-3.5 pl-11 pr-4 text-[10px] font-black text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)]/30 transition-all shadow-sm"
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
            {contacts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <i className="fa-solid fa-user-astronaut text-3xl mb-4"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest">Arama sonucu yok</p>
                </div>
            ) : (
                contacts.map((contact: any) => (
                    <div 
                        key={contact.id} 
                        onClick={() => onSelect(contact)}
                        className="flex items-center gap-3.5 p-3.5 rounded-[1.4rem] hover:bg-white hover:border-[var(--border-color)] border border-transparent transition-all group cursor-pointer active:scale-95 shadow-sm hover:shadow-md"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-color)] overflow-hidden shadow-inner group-hover:rotate-3 transition-transform">
                                {contact.avatar ? (
                                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-black text-sm uppercase opacity-40">{contact.name.charAt(0)}</span>
                                )}
                            </div>
                            {contact.isOnline && (
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-black text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition-colors">{contact.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[8px] font-black text-white px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm
                                    ${contact.role === 'admin' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                    {contact.role === 'admin' ? 'Admin' : 'Uzman'}
                                </span>
                                <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-tighter opacity-60">
                                    {contact.role === 'admin' ? 'Sistem Yöneticisi' : 'Özel Eğitimci'}
                                </span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all translate-x-4 group-hover:translate-x-0">
                             <i className="fa-solid fa-chevron-right text-[10px] text-[var(--accent-color)]"></i>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
