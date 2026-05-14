import React, { useState } from 'react';
import { IMessage } from '../../../types/messaging';
import { useMessageStore } from '../../../store/useMessageStore';
import { MoreHorizontal, Reply, Trash2, Paperclip, Download, Maximize2, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { messageService } from '../../../services/messaging/messageService';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageBubbleProps {
    message: IMessage;
    isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
    const { setQuotingMessage, setActiveThreadId } = useMessageStore();
    const [isHovered, setIsHovered] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const formatTime = (ts: Timestamp) => {
        if (!ts) return '';
        const date = ts.toMillis ? new Date(ts.toMillis()) : new Date((ts as any).seconds * 1000);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleDelete = async () => {
        if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz? Arşiv kayıtlarında görünmeye devam edebilir.")) return;
        try {
            await messageService.softDeleteMessage(message.conversationId, message.id);
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    return (
        <div 
            className={`flex flex-col mb-1 w-full ${isOwn ? 'items-end' : 'items-start'} group px-2`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Bubble Container */}
                <div className={`relative flex flex-col shadow-sm transition-transform duration-200 ${
                    isOwn 
                        ? 'bg-accent-primary text-white rounded-[18px] rounded-br-[4px]' 
                        : 'bg-[#181c22] border border-white/5 text-white/90 rounded-[18px] rounded-bl-[4px]'
                } p-0.5 overflow-hidden group/bubble`}
                >
                    {/* Alıntı Bloğu - Telegram Style */}
                    {message.quoteData && !message.isDeleted && (
                        <div 
                            className={`m-1.5 pl-3 py-1.5 border-l-[3px] rounded-r-xl text-xs cursor-pointer hover:bg-white/5 transition-all bg-black/10 flex flex-col ${
                                isOwn ? 'border-white/40' : 'border-accent-primary/60'
                            }`}
                        >
                            <span className="font-bold text-accent-primary text-[11px] mb-0.5">
                                {message.quoteData.originalSenderName}
                            </span>
                            <span className="opacity-70 truncate line-clamp-1 italic text-[10px]">
                                {message.quoteData.originalText}
                            </span>
                        </div>
                    )}

                    {/* Image Attachments Preview */}
                    {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
                        <div className="flex flex-wrap gap-0.5 p-1">
                            {message.attachments.map(att => att.type === 'image' && (
                                <div 
                                    key={att.id} 
                                    onClick={() => setSelectedImage(att.url)}
                                    className="relative cursor-pointer overflow-hidden rounded-xl bg-white/5 group/img max-w-[280px]"
                                >
                                    <img 
                                        src={att.url} 
                                        alt={att.name} 
                                        className="w-full h-auto max-h-[300px] object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <Maximize2 className="w-8 h-8 text-white/80" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Text Area */}
                    <div className="px-3.5 py-2 relative min-w-[60px]">
                        {message.isDeleted ? (
                            <div className="italic opacity-50 flex items-center gap-2 text-[11px] py-1">
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Mesaj silindi (Arşivlendi)</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <p className="whitespace-pre-wrap break-words leading-[1.4] text-[14px] font-lexend">
                                    {message.text}
                                </p>
                                
                                {/* Info Footer inside bubble like Telegram */}
                                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                    {message.editHistory && message.editHistory.length > 0 && (
                                        <span className="text-[9px] italic">düzenlendi</span>
                                    )}
                                    <span className="text-[10px] font-medium leading-none">
                                        {formatTime(message.createdAt)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Non-Image Attachments */}
                    {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
                        <div className="px-2 pb-2 space-y-1">
                            {message.attachments.map(att => att.type !== 'image' && (
                                <a 
                                    key={att.id} 
                                    href={att.url} 
                                    download={att.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                                        isOwn ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-black/20 border-white/5 hover:bg-black/40'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/10' : 'bg-accent-primary/20 text-accent-primary'}`}>
                                        <Paperclip className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="text-[11px] font-bold truncate">{att.name}</div>
                                        <div className="text-[9px] opacity-60">{(att.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                    <Download className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions - Modern Float */}
                <div className={`flex flex-col gap-0.5 self-center transition-all duration-300 ${isHovered && !message.isDeleted ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    <button onClick={() => setQuotingMessage(message)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"><Reply className="w-4 h-4" /></button>
                    {isOwn && (
                        <button onClick={handleDelete} className="p-2 hover:bg-red-500/10 rounded-full text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Image Modal Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-colors z-[110] bg-white/5 rounded-full"><X className="w-8 h-8" /></button>
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                            onClick={e => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
