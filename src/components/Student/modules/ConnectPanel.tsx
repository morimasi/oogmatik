import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../../../services/messagingService';
import { Message, Attachment } from '../../../types/messaging';
import { AdvancedStudent } from '../../../types/student-advanced';
import { logError } from '../../../utils/logger';

interface ConnectPanelProps {
    student: AdvancedStudent;
    currentUser: { id: string; name: string; role: 'teacher' | 'parent' | 'admin' };
    onClose?: () => void;
}

export const ConnectPanel: React.FC<ConnectPanelProps> = ({ student, currentUser, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mesajları Dinle
    useEffect(() => {
        if (!student.id) return;
        const unsubscribe = messagingService.listenToMessages(student.id, (msgs) => {
            setMessages(msgs);
            // Yeni mesaj geldiğinde sona kaydır
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });
        return () => unsubscribe();
    }, [student.id]);

    const handleSend = async () => {
        if (!inputText.trim() || isSending) return;
        setIsSending(true);
        try {
            await messagingService.sendMessage({
                studentId: student.id,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderRole: currentUser.role as any,
                text: inputText.trim()
            });
            setInputText('');
        } catch (error) {
            logError("Message send failed:", { error });
        } finally {
            setIsSending(false);
        }
    };

    const formatMessageDate = (date: any) => {
        if (!date) return '';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const AttachmentRenderer = ({ attachment }: { attachment?: Attachment }) => {
        if (!attachment) return null;
        return (
            <div className="mt-2 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center gap-3 hover:border-[var(--accent-color)]/50 transition-colors cursor-pointer group/attach">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)] flex items-center justify-center text-xs text-white">
                    <i className={`fa-solid ${attachment.type === 'activity' ? 'fa-file-lines' : 'fa-paperclip'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-[var(--text-primary)] truncate">{attachment.name || 'Eklenti'}</p>
                    <p className="text-[8px] text-[var(--text-muted)] uppercase group-hover/attach:text-[var(--accent-color)] transition-colors">Yükleniyor...</p>
                </div>
                <i className="fa-solid fa-chevron-right text-[8px] text-[var(--text-muted)]"></i>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-paper)]/95 backdrop-blur-2xl border-l border-[var(--border-color)] font-['Lexend'] shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/30">
                <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center border border-[var(--accent-color)]/20">
                        <i className="fa-solid fa-comments-alt text-lg"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                            Oogmatik <span className="text-[var(--accent-color)]">Connect</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                             <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-tight">{student.name}</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all flex items-center justify-center border border-transparent hover:border-rose-500/20">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            {/* Message Flow */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6 opacity-40">
                             <i className="fa-solid fa-cloud-moon text-3xl text-[var(--text-muted)]"></i>
                        </div>
                        <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-2 opacity-50">Henüz Mesaj Yok</h4>
                        <p className="text-[9px] font-medium text-[var(--text-muted)] leading-relaxed max-w-[200px]">İletişimi başlatmak için aşağıdaki paneli kullanabilirsiniz.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-1.5 px-2">
                                <span className={`text-[8px] font-black uppercase tracking-wider ${msg.senderId === currentUser.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}>
                                    {msg.senderName}
                                </span>
                                <span className="text-[7px] text-[var(--text-muted)] opacity-50">{formatMessageDate(msg.createdAt)}</span>
                            </div>
                            <div className={`max-w-[90%] p-4 rounded-2xl relative group transition-all duration-300
                                ${msg.senderId === currentUser.id 
                                    ? 'bg-[var(--accent-color)] text-white rounded-tr-none shadow-xl shadow-[var(--accent-color)]/20' 
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'}`}
                            >
                                <p className="text-[11px] font-medium leading-[1.6]">{msg.text}</p>
                                <AttachmentRenderer attachment={msg.attachment} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-6">
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.8rem] flex items-center gap-2 focus-within:border-[var(--accent-color)]/50 focus-within:ring-4 focus-within:ring-[var(--accent-color)]/5 transition-all shadow-inner group/input">
                    <button className="w-9 h-9 rounded-full hover:bg-[var(--bg-paper)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all border border-transparent hover:border-[var(--border-color)]">
                        <i className="fa-solid fa-paperclip text-sm"></i>
                    </button>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`${student.name.split(' ')[0]}'ye mesaj yazın...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] opacity-80 focus:opacity-100 transition-opacity"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim() || isSending}
                        className="w-10 h-10 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center disabled:opacity-30 disabled:scale-95 disabled:grayscale hover:scale-105 transition-all shadow-lg shadow-[var(--accent-color)]/30 active:scale-95"
                    >
                        <i className={`fa-solid ${isSending ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-sm`}></i>
                    </button>
                </div>
                <p className="text-[7.5px] font-bold text-[var(--text-muted)] text-center mt-4 uppercase tracking-[0.2em] opacity-40">
                     <i className="fa-solid fa-shield-halved mr-1"></i> Uçtan uca şifrelenmiş pedagojik iletişim
                </p>
            </div>
        </div>
    );
};
