import React, { useState } from 'react';
import { IMessage } from '../../../types/messaging';
import { useAuthStore } from '../../../store/useAuthStore';
import { useMessageStore } from '../../../store/useMessageStore';
import { MoreHorizontal, Reply, Pencil, Trash2, CornerUpRight, Paperclip } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface MessageBubbleProps {
    message: IMessage;
    isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
    const { setQuotingMessage, setEditingMessage, setActiveThreadId } = useMessageStore();
    const [isHovered, setIsHovered] = useState(false);

    // Format time helpers (mock implementation)
    const formatTime = (ts: Timestamp) => {
        // Mock fallback if TS doesn't have format logic here.
        return new Date(ts.toMillis ? ts.toMillis() : ts.seconds * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div 
            className={`flex flex-col mb-4 w-full ${isOwn ? 'items-end' : 'items-start'} group max-w-full`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Orijinal Gönderici Avatar vs (Mock) */}
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                    {isOwn ? 'Ben' : 'V'}
                </div>
                <span className="text-xs text-white/40">{formatTime(message.createdAt)}</span>
            </div>

            <div className={`flex items-center gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Mesaj İçeriği Balooon */}
                <div className={`relative px-4 py-3 rounded-2xl ${
                    isOwn 
                        ? 'bg-accent-primary text-white rounded-tr-sm' 
                        : 'backdrop-blur-md bg-white/10 border border-white/5 text-white/90 rounded-tl-sm'
                } font-lexend text-sm leading-relaxed`}
                >
                    {/* Alıntı Bloğu (Eğer varsa) */}
                    {message.quoteData && (
                        <div 
                            className={`mb-2 pl-3 py-1 border-l-2 rounded-r-md text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                                isOwn ? 'border-white/50 bg-white/20' : 'border-accent-primary/50 bg-black/20'
                            }`}
                            onClick={() => {
                                // Burada orijinal mesaja scrollIntoView(behavior: 'smooth') yapılacak
                            }}
                        >
                            <div className="font-inter font-semibold mb-1 opacity-80">
                                {message.quoteData.originalSenderName}
                            </div>
                            <div className="opacity-70 truncate line-clamp-2">
                                {message.quoteData.originalText}
                            </div>
                        </div>
                    )}

                    {/* Ana Metin */}
                    {message.isDeleted ? (
                        <div className="italic opacity-60 flex items-center gap-2">
                            <Trash2 className="w-3 h-3" />
                            Bu mesaj silinmiştir.
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap word-break">
                            {message.text}
                        </p>
                    )}

                    {/* Dosya Ekleri (Previewler başka komponentlere ayrılabilir, şimdilik mock) */}
                    {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
                        <div className="mt-2 space-y-2">
                            {message.attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/5">
                                    <Paperclip className="w-4 h-4" />
                                    <span className="truncate text-xs">{att.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Düzenlendi Etiketi */}
                    {message.editHistory && message.editHistory.length > 0 && !message.isDeleted && (
                        <div className="mt-1 flex justify-end">
                            <span className="text-[10px] opacity-50 italic hover:underline cursor-pointer">
                                (düzenlendi)
                            </span>
                        </div>
                    )}
                </div>

                {/* Aksiyon Menüsü (Hover Durumunda Görünür) */}
                <div className={`flex items-center gap-1 opacity-0 transition-opacity duration-200 ${isHovered && !message.isDeleted ? 'opacity-100' : ''}`}>
                    <button 
                        onClick={() => setQuotingMessage(message)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        title="Alıntıla"
                    >
                        <Reply className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveThreadId(message.id)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        title="Yanıtla (Thread)"
                    >
                        <CornerUpRight className="w-4 h-4" />
                    </button>
                    {isOwn && (
                        <>
                            <button 
                                onClick={() => setEditingMessage(message)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                title="Düzenle"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                className="p-1.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Alt Bilgi: Thread sayısı vs. */}
            {message.replyCount ? (
                <div 
                    onClick={() => setActiveThreadId(message.id)}
                    className={`mt-1 text-xs text-accent-primary hover:underline cursor-pointer ${isOwn ? 'mr-10' : 'ml-10'}`}
                >
                    {message.replyCount} yanıt
                </div>
            ) : null}
            
        </div>
    );
};
