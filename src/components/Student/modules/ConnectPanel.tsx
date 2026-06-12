import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../../../services/messagingService';
import { Message, Attachment } from '../../../types/messaging';
import { AdvancedStudent } from '../../../types/student-advanced';
import { logError } from '../../../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentStore } from '../../../store/useStudentStore';
import { useUIStore } from '../../../store/useUIStore';

interface ConnectPanelProps {
    student: AdvancedStudent | null;
    currentUser: { id: string; name: string; role: 'teacher' | 'parent' | 'admin' };
    onClose?: () => void;
}

export const ConnectPanel: React.FC<ConnectPanelProps> = ({ student, currentUser, onClose }) => {
    const { students } = useStudentStore();
    const { setUnreadMessageCount } = useUIStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    // UI State
    const [activeChat, setActiveChat] = useState<{ id: string; name: string; type: 'global' | 'student' | 'user' }>(
        student 
            ? { id: student.id, name: student.name, type: student.id === 'global' ? 'global' : 'student' }
            : { id: 'global', name: 'Genel Kanallar', type: 'global' }
    );
    const [selectedContextStudent, setSelectedContextStudent] = useState<AdvancedStudent | null>(
        student?.id !== 'global' ? student : null
    );
    
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Kişileri Çek
    useEffect(() => {
        setIsLoadingContacts(true);
        messagingService.fetchInternalUsers(currentUser.id)
            .then(data => setContacts(data || []))
            .catch(err => logError("Kişiler yüklenirken hata oluştu:", err))
            .finally(() => setIsLoadingContacts(false));
    }, [currentUser.id]);

    // Mesajları Dinle ve Okundu Olarak İşaretle
    useEffect(() => {
        const params: any = {};
        if (activeChat.type === 'student') params.studentId = activeChat.id;
        else if (activeChat.type === 'user') params.participantIds = [currentUser.id, activeChat.id];
        // global tipinde param boş gönderilir ki genel kanalı dinlesin

        const unsubscribe = messagingService.listenToMessages(params, (msgs) => {
            setMessages(msgs);
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);

            // Panel açıkken gelen okunmamış mesajları anında okundu işaretle
            msgs.forEach((msg: Message) => {
                if (msg.senderId !== currentUser.id) {
                    const readBy: string[] = (msg as any).readBy || [];
                    if (!readBy.includes(currentUser.id)) {
                        messagingService.markAsRead(msg.id!, currentUser.id).catch(() => {});
                    }
                }
            });
            // Sayacı global store'da da hemen sıfırla
            setUnreadMessageCount(0);
        });
        return () => unsubscribe();
    }, [activeChat.id, activeChat.type, currentUser.id]);

    const handleSend = async (attachmentParam?: Attachment) => {
        if ((!inputText.trim() && !attachmentParam) || isSending) return;
        setIsSending(true);
        try {
            const params: any = {
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderRole: currentUser.role as any,
                text: inputText.trim()
            };

            if (attachmentParam) {
                params.attachment = attachmentParam;
            }

            if (activeChat.type === 'student') params.studentId = activeChat.id;
            else if (activeChat.type === 'user') params.participantIds = [currentUser.id, activeChat.id];
            else params.isGlobal = true;

            if (activeChat.type !== 'student' && selectedContextStudent) {
                params.contextStudentId = selectedContextStudent.id;
                params.contextStudentName = selectedContextStudent.name;
            }

            // --- OPTIMISTIC UI UPDATE ---
            // Firestore milisaniyelik gecikmesini ve yerel cache kısıtlamalarını (limit drop) bypass edip
            // mesajı anında ekranda gösteriyoruz (0ms latency). Gerçek veritabanı yansıması daha sonra snapshot'ı ezecektir.
            const tempMessage: Message = {
                id: 'temp-' + Date.now(),
                ...params,
                createdAt: new Date().toISOString(),
                isRead: true,
                readBy: [currentUser.id]
            };
            
            setMessages(prev => {
                // Eğer daha önce eklendiyse (çakışma önleyici) mükerrer gösterimi engelle
                if (prev.find(m => m.id === tempMessage.id)) return prev;
                return [...prev, tempMessage];
            });

            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 50);

            setInputText(''); // Yazı alanını UI'da anında temizle

            await messagingService.sendMessage(params);
        } catch (error) {
            logError("Message send failed:", { error });
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
            // --- OPTIMISTIC UI DELETE ---
            // Sunucu yanıtını beklemeden mesajı ekrandan anında (%100 hız ile) yok et
            setMessages(prev => prev.filter(m => m.id !== id));
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

    return (
        <div className="flex h-full bg-[var(--bg-paper)]/95 backdrop-blur-3xl font-['Lexend'] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-[var(--border-color)] overflow-hidden rounded-l-[1.5rem]">
            
            {/* SOL SABİT AVATAR LİSTESİ */}
            <div className="w-[85px] shrink-0 border-r border-[#ffffff0a] bg-black/20 flex flex-col items-center py-5 z-20">
                {/* Global Chat İkonu */}
                <div className="group relative w-full flex flex-col items-center justify-center mb-1">
                    <button 
                        onClick={() => setActiveChat({ id: 'global', name: 'Genel Kanallar', type: 'global' })}
                        className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all ${
                            activeChat.type === 'global'
                                ? 'bg-indigo-500 text-white shadow-[#4f46e5]/30 shadow-lg scale-105' 
                                : 'bg-[#ffffff08] text-[var(--accent-color)] hover:bg-[#ffffff15] hover:scale-105 border border-white/5'
                        }`}
                    >
                        <i className={`fa-solid fa-earth-europe text-xl ${activeChat.type === 'global' ? '' : 'opacity-80'}`}></i>
                    </button>
                    <span className={`text-[8.5px] mt-2 font-black uppercase tracking-tight text-center leading-tight truncate w-14 ${activeChat.type === 'global' ? 'text-indigo-400' : 'text-zinc-500'}`}>Genel</span>
                    {/* Tooltip */}
                    <div className="absolute left-16 top-6 -translate-y-1/2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                        Genel Sohbet Alanı
                    </div>
                </div>

                <div className="w-8 h-px bg-white/10 my-3 rounded-full" />

                {/* Kullanıcı Listesi */}
                <div className="flex-1 w-full overflow-y-auto px-1 pb-4 space-y-4 custom-scrollbar flex flex-col items-center hide-scrollbar-on-idle">
                    {isLoadingContacts ? (
                        <div className="w-full flex justify-center mt-4 opacity-50">
                            <i className="fa-solid fa-spinner fa-spin text-lg text-[var(--accent-color)]"></i>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div key={contact.id} className="group relative w-full flex flex-col items-center justify-center">
                                <button 
                                    onClick={() => setActiveChat({ id: contact.id, name: contact.name, type: 'user' })}
                                    className={`relative w-12 h-12 rounded-full overflow-hidden transition-all flex items-center justify-center font-bold text-lg shadow-md border-[2.5px] shrink-0
                                        ${activeChat.id === contact.id 
                                            ? 'border-emerald-500 scale-110 z-10 shadow-emerald-500/30' 
                                            : 'border-transparent hover:border-white/20 hover:scale-105 bg-[#ffffff05]'}`}
                                >
                                    {contact.avatar && contact.avatar.includes('http') ? (
                                        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-white/50 border border-white/5 rounded-full">
                                            {contact.name.charAt(0)}
                                        </div>
                                    )}
                                    {contact.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full"></span>
                                    )}
                                </button>
                                <span className={`text-[8.5px] mt-1.5 font-bold uppercase tracking-tight text-center leading-tight truncate w-14 ${activeChat.id === contact.id ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'}`}>
                                    {contact.name.split(' ')[0]}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute left-16 top-6 -translate-y-1/2 px-2.5 py-1.5 bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex flex-col z-50 shadow-xl border border-white/10 min-w-max">
                                    <span className="text-[11px] font-black">{contact.name}</span>
                                    <span className="text-[8px] text-emerald-400 uppercase tracking-wider">{contact.role === 'admin' ? 'Yönetici' : 'Uzman'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SAĞ ÇALIŞMA ALANI - AKTİF SOHBET */}
            <div className="flex-1 flex flex-col relative h-full">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 relative z-10 shrink-0 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {activeChat.type !== 'global' && (
                            <button 
                                onClick={() => setActiveChat({ id: 'global', name: 'Genel Kanallar', type: 'global' })}
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all flex items-center justify-center hover:bg-white/10 mr-1"
                                title="Genel Kanala Dön"
                            >
                                <i className="fa-solid fa-arrow-left text-xs"></i>
                            </button>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none flex items-center gap-2">
                                    {activeChat.type === 'global' && <i className="fa-solid fa-users text-indigo-500"></i>}
                                    {activeChat.type === 'user' && <i className="fa-solid fa-lock text-emerald-500 text-xs"></i>}
                                    {activeChat.name}
                                </h3>
                            </div>
                            <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-2 opacity-60">
                                {activeChat.type === 'global' ? 'Herkese Açık Sohbet' : activeChat.type === 'student' ? 'Öğrenci Özel Kanalı' : 'Uçtan Uca Birebir Sohbet'}
                            </p>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-500 border border-transparent hover:border-rose-500/30 transition-all flex items-center justify-center group shrink-0">
                        <i className="fa-solid fa-times text-xs group-hover:rotate-90 transition-transform duration-300"></i>
                    </button>
                </div>

                {/* Bağlam Seçici (Özel Chat ise) */}
                {activeChat.type !== 'student' && (
                    <div className="px-6 py-2 bg-black/10 border-b border-white/5 flex items-center gap-2 shrink-0">
                        <i className="fa-solid fa-bullseye text-[9px] text-indigo-400"></i>
                        <span className="text-[9px] font-black text-indigo-400/80 uppercase tracking-widest leading-none mt-0.5">ÖĞRENCİ BAĞLAMI:</span>
                        <select 
                            value={selectedContextStudent?.id || ''}
                            onChange={(e) => {
                                const s = students.find(x => x.id === e.target.value);
                                setSelectedContextStudent(s as any || null);
                            }}
                            className="bg-transparent border-none text-[10px] font-bold text-[var(--text-primary)] focus:ring-0 p-0 flex-1 hover:text-white transition-colors cursor-pointer"
                        >
                            <option value="" className="bg-[var(--bg-paper)] text-[var(--text-muted)]">Genel Konu (Bağlam Yok)</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id} className="bg-[var(--bg-paper)]">{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Chat Alanı */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar relative bg-gradient-to-b from-transparent to-black/20"
                >
                    {messages.length === 0 ? (
                        <div className="flex-1 h-full flex flex-col items-center justify-center text-center px-6 relative">
                            <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mb-5 opacity-40 border border-[var(--border-color)] rotate-3 shadow-inner">
                                <i className="fa-solid fa-leaf text-2xl text-[var(--text-muted)]"></i>
                            </div>
                            <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-2 opacity-50">Sayfa Tertemiz</h4>
                            <p className="text-[9px] font-medium text-[var(--text-muted)] leading-relaxed max-w-[200px]">Bu konuşma alanında henüz başlayan bir sohbet yok.</p>
                        </div>
                    ) : (
                        messages.map((msg: any) => (
                            <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'} group/msg shrink-0`}>
                                <div className={`flex items-center gap-2 mb-1.5 px-0.5 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                    <span className={`text-[8.5px] font-black uppercase tracking-widest ${msg.senderId === currentUser.id ? 'text-[var(--accent-color)]' : 'text-neutral-400'}`}>
                                        {msg.senderName}
                                    </span>
                                    <span className="text-[7.5px] text-[var(--text-muted)] font-bold opacity-30">{formatMessageDate(msg.createdAt)}</span>
                                    {msg.senderId === currentUser.id && (
                                         <button 
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="opacity-0 group-hover/msg:opacity-100 w-5 h-5 rounded-md hover:bg-rose-500/10 text-rose-500/50 transition-all flex items-center justify-center"
                                         >
                                            <i className="fa-solid fa-trash-alt text-[8px]"></i>
                                         </button>
                                    )}
                                </div>
                                
                                <div className={`max-w-[88%] rounded-[1.2rem] relative shadow-lg transition-all duration-300 shrink-0 border
                                    ${msg.senderId === currentUser.id 
                                        ? 'bg-gradient-to-br from-[var(--accent-color)] to-indigo-600 border-indigo-500/30 text-white rounded-tr-none' 
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] rounded-tl-none'}`}
                                >
                                    {msg.contextStudentName && (
                                         <div className="px-3 py-1.5 bg-black/20 rounded-t-[1.2rem] border-b border-white/5 text-[7px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                                            <i className="fa-solid fa-tags text-[8px] opacity-60"></i>
                                            ÖĞRENCİ: {msg.contextStudentName}
                                         </div>
                                    )}
                                    
                                    <div className="p-3.5 pt-3.5 shrink-0 text-[11px] leading-relaxed font-medium">
                                        {msg.attachment ? (
                                            <div className="space-y-3">
                                                {msg.attachment.type === 'image' ? (
                                                    <div 
                                                        className="cursor-zoom-in overflow-hidden rounded-xl border border-white/10 group/preview bg-black/20"
                                                        onClick={() => setPreviewFile(msg.attachment.url)}
                                                    >
                                                        <img src={msg.attachment.url} className="w-full h-auto max-h-48 object-cover group-hover:scale-105 transition-transform duration-700" alt="Görsel" />
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-black/20 rounded-xl flex items-center gap-3 border border-white/5 hover:bg-black/30 transition-colors cursor-pointer">
                                                        <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white shrink-0">
                                                            <i className="fa-solid fa-file-pdf text-[10px]"></i>
                                                        </div>
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <p className="text-[10px] font-bold uppercase truncate">{msg.attachment.name}</p>
                                                            <p className="text-[7.5px] opacity-60 font-bold mt-0.5 tracking-widest">PDF BELGESİ</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.text && <p className="mt-2 tracking-tight whitespace-pre-wrap">{msg.text}</p>}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap tracking-tight">{msg.text}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Girdi Alanı */}
                <div className="p-4 pt-1 bg-gradient-to-t from-[var(--bg-paper)] via-[var(--bg-paper)] to-transparent shrink-0">
                    <div className="p-1.5 bg-[#ffffff05] backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] flex items-end gap-1.5 focus-within:border-[var(--accent-color)]/30 focus-within:bg-[#ffffff08] transition-all shadow-inner relative group/input">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,application/pdf"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 shrink-0 rounded-[1.5rem] bg-white/5 hover:bg-[var(--accent-color)]/20 flex items-center justify-center text-[var(--accent-color)] transition-all border border-transparent hover:border-[var(--accent-color)]/30 active:scale-95"
                            title="Dosya veya Resim Ekle"
                        >
                            <i className="fa-solid fa-paperclip text-xs"></i>
                        </button>
                        
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={`${activeChat.name}'ye yazın...`}
                            rows={1}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] p-3 resize-none max-h-24 custom-scrollbar"
                            style={{ minHeight: '40px' }}
                        />
                        
                        <button 
                            onClick={() => handleSend()}
                            disabled={(!inputText.trim()) || isSending}
                            className="w-10 h-10 shrink-0 rounded-[1.5rem] bg-[var(--accent-color)] text-white flex items-center justify-center disabled:opacity-30 disabled:scale-95 disabled:grayscale hover:scale-105 active:scale-90 transition-all shadow-lg shadow-[var(--accent-color)]/20 mb-0.5 mr-0.5"
                        >
                            <i className={`fa-solid ${isSending ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs ml-0.5`}></i>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[7.5px] font-bold uppercase tracking-widest text-white/20">shift + enter alt satır</span>
                    </div>
                </div>

            </div>

            {/* Önizleme Modalı */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-10 cursor-zoom-out"
                        onClick={() => setPreviewFile(null)}
                    >
                        <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10 border border-white/10">
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>
                        <motion.img 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            src={previewFile} 
                            className="max-w-full max-h-[90vh] rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1)] object-contain border border-white/10" 
                            alt="Dosya Önizleme"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
