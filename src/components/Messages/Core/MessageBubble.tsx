import React, { useState, useCallback } from 'react';
import { IMessage } from '../../../types/messaging';
import { useMessageStore } from '../../../store/useMessageStore';
import { Reply, Trash2, Paperclip, Download, ZoomIn, X, Edit3, CornerUpRight, History } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { messageService } from '../../../services/messaging/messageService';
import { motion, AnimatePresence } from 'framer-motion';
import { QuoteBlock } from '../Features/QuoteBlock';
import { SafeDocViewer } from '../Attachments/SafeDocViewer';
import { EditHistory } from '../Features/EditHistory';
import { useAuthStore } from '../../../store/useAuthStore';
import { fileSharingService } from '../../../services/messaging/fileSharingService';

interface Props { message: IMessage; isOwn: boolean; }

export const MessageBubble: React.FC<Props> = ({ message, isOwn }) => {
  const { setQuotingMessage, setEditingMessage, setActiveThreadId } = useMessageStore();
  const { user } = useAuthStore();
  const [hovered, setHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ attachment: IMessage['attachments'][0]; userId: string } | null>(null);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fmt = (ts: Timestamp) => {
    if (!ts) return '';
    const d = ts.toMillis ? new Date(ts.toMillis()) : new Date((ts as unknown as Record<string, number>).seconds * 1000);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Mesaj silinsin mi? 30 gün arşivde kalır.')) return;
    setIsDeleting(true);
    try { await messageService.softDeleteMessage(message.conversationId, message.id); } catch { setIsDeleting(false); }
  }, [message.conversationId, message.id]);

  const handleEdit = useCallback(() => setEditingMessage(message), [message, setEditingMessage]);
  const handleQuoteReply = useCallback(() => setQuotingMessage(message), [message, setQuotingMessage]);
  const handleThreadReply = useCallback(() => setActiveThreadId(message.id), [message.id, setActiveThreadId]);
  const handleQuoteScroll = useCallback(() => {
    if (!message.quoteData) return;
    const el = document.querySelector(`[data-message-id="${message.quoteData.messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-1', 'ring-accent-primary/40', 'rounded-lg');
      setTimeout(() => { el.classList.remove('ring-1', 'ring-accent-primary/40', 'rounded-lg'); }, 2000);
    }
  }, [message.quoteData]);

  if (isDeleting) return null;

  return (
    <div className={`flex flex-col w-full ${isOwn ? 'items-end' : 'items-start'} group`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} data-message-id={message.id}>
      <div className={`flex items-end gap-1 max-w-[88%] md:max-w-[65%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`relative flex flex-col shadow-sm ${isOwn ? 'bg-accent-primary text-white rounded-xl rounded-br-[3px]' : 'bg-[#181c22] border border-white/5 text-white/90 rounded-xl rounded-bl-[3px]'} overflow-hidden`}>
          {message.quoteData && !message.isDeleted && <QuoteBlock quoteData={message.quoteData} isOwn={isOwn} onScrollToOriginal={handleQuoteScroll} />}
          {message.attachments?.some(a => a.type === 'image') && !message.isDeleted && (
            <div className="flex flex-wrap gap-0.5 p-0.5">
              {message.attachments.filter(a => a.type === 'image').map(att => (
                <div key={att.id} onClick={() => setSelectedImage(att.url)} className="relative cursor-pointer overflow-hidden rounded-lg bg-white/5 max-w-[180px]">
                  <img src={att.url} alt={att.name} className="w-full h-auto max-h-[180px] object-cover hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"><ZoomIn className="w-5 h-5 text-white/80" /></div>
                </div>
              ))}
            </div>
          )}
          <div className="px-2.5 py-1.5 min-w-[40px]">
            {message.isDeleted ? (
              <div className="italic opacity-40 flex items-center gap-1.5 text-[10px] py-0.5"><Trash2 className="w-2.5 h-2.5" /><span>Silindi</span></div>
            ) : (
              <div className="flex flex-col">
                <p className="whitespace-pre-wrap break-words leading-[1.4] text-[13px] font-lexend">{message.text}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5 opacity-50 flex-wrap">
                  {message.editHistory?.length ? <button onClick={() => setShowEditHistory(true)} className="text-[8px] italic hover:text-accent-primary flex items-center gap-1"><History className="w-2 h-2" />düzenlendi</button> : null}
                  {message.replyCount ? <button onClick={handleThreadReply} className="text-[8px] font-medium flex items-center gap-1 hover:text-accent-primary"><CornerUpRight className="w-2 h-2" />{message.replyCount}</button> : null}
                  <span className="text-[9px] font-medium">{fmt(message.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
          {message.attachments?.some(a => a.type !== 'image') && !message.isDeleted && (
            <div className="px-1.5 pb-1.5 space-y-0.5">
              {message.attachments.filter(a => a.type !== 'image').map(att => (
                <button key={att.id} onClick={() => user && setViewingAttachment({ attachment: att, userId: user.id })}
                  className={`w-full flex items-center gap-2 p-1.5 rounded-lg border transition-all ${isOwn ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-black/20 border-white/5 hover:bg-black/40'}`}>
                  <div className={`p-1 rounded ${isOwn ? 'bg-white/10' : 'bg-accent-primary/20'}`}><Paperclip className="w-3 h-3" /></div>
                  <div className="flex-1 min-w-0 text-left"><div className="text-[10px] font-semibold truncate">{att.name}</div><div className="text-[7px] opacity-50">{fileSharingService.formatFileSize(att.size)}</div></div>
                  <Download className="w-3 h-3 opacity-30 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={`flex flex-col gap-0.5 self-center transition-all duration-200 ${hovered && !message.isDeleted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={handleQuoteReply} className="p-1 hover:bg-white/10 rounded-full text-white/30 hover:text-white"><Reply className="w-3 h-3" /></button>
          <button onClick={handleThreadReply} className="p-1 hover:bg-white/10 rounded-full text-white/30 hover:text-white"><CornerUpRight className="w-3 h-3" /></button>
          {isOwn && <>
            <button onClick={handleEdit} className="p-1 hover:bg-accent-primary/10 rounded-full text-white/30 hover:text-accent-primary"><Edit3 className="w-3 h-3" /></button>
            <button onClick={handleDelete} className="p-1 hover:bg-red-500/10 rounded-full text-white/30 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
          </>}
        </div>
      </div>

      <AnimatePresence>{selectedImage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
        <button className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 rounded-full z-[110]" onClick={() => setSelectedImage(null)}><X className="w-5 h-5" /></button>
        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={selectedImage} alt="" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
      </motion.div>}</AnimatePresence>
      <AnimatePresence>{viewingAttachment && <SafeDocViewer attachment={viewingAttachment.attachment} userId={viewingAttachment.userId} onClose={() => setViewingAttachment(null)} />}</AnimatePresence>
      <AnimatePresence>{showEditHistory && message.editHistory && <EditHistory editHistory={message.editHistory} onClose={() => setShowEditHistory(false)} />}</AnimatePresence>
    </div>
  );
};
