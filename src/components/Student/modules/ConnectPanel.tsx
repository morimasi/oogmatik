import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../../../services/messagingService';
import { Message, Attachment } from '../../../types/messaging';
import { AdvancedStudent } from '../../../types/student-advanced';
import { logError } from '../../../utils/logger';

interface ConnectPanelProps {
    student: AdvancedStudent;
    currentUser: { id: string; name: string; role: 'teacher' | 'parent' };
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
                senderRole: currentUser.role,
                text: inputText.trim()
            });
            setInputText('');
        } catch (error) {
            logError("Message send failed:", { error });
        } finally {
            setIsSending(false);
        }
    };

    const AttachmentRenderer = ({ attachment }: { attachment?: Attachment }) => {
        if (!attachment) return null;
        return (
            <div className="mt-2 p-3 bg-white/10 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs">
                    <i className={`fa-solid ${attachment.type === 'activity' ? 'fa-file-lines' : 'fa-paperclip'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-white truncate">{attachment.name || 'Eklenti'}</p>
                    <p className="text-[8px] text-white/60 uppercase">Tıkla ve Görüntüle</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 font-['Lexend'] shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-sparkles text-indigo-500"></i> Oogmatik Connect
                    </h3>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-tight mt-1">Öğrenci: {student.name}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            {/* Message Flow */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
                        <i className="fa-solid fa-comments-alt text-4xl mb-4"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest">Henüz mesaj yok. İletişimi başlatın.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                <span className="text-[8px] font-black text-zinc-500 uppercase">{msg.senderName}</span>
                                <span className="text-[7px] text-zinc-700">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={`max-w-[85%] p-4 rounded-2xl relative group transition-all
                                ${msg.senderId === currentUser.id 
                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/40' 
                                    : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'}`}
                            >
                                <p className="text-[11px] font-medium leading-relaxed">{msg.text}</p>
                                <AttachmentRenderer attachment={msg.attachment} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 pt-0">
                <div className="p-4 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-3 focus-within:border-indigo-500/50 transition-all shadow-inner">
                    <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 group transition-all">
                        <i className="fa-solid fa-paperclip text-sm group-hover:text-indigo-400"></i>
                    </button>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="İletişime geçin..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-medium text-white placeholder-zinc-600"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 disabled:bg-zinc-700 hover:scale-105 transition-all shadow-lg shadow-indigo-900/40"
                    >
                        <i className={`fa-solid ${isSending ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-sm`}></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
