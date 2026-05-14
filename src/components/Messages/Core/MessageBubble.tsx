import React, { useState, useCallback } from 'react';
import { IMessage } from '../../../types/messaging';
import { useMessageStore } from '../../../store/useMessageStore';
import { MoreHorizontal, Reply, Trash2, Paperclip, Download, ZoomIn, X, Edit3, CornerUpRight, History, MessageSquare } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { messageService } from '../../../services/messaging/messageService';
import { motion, AnimatePresence } from 'framer-motion';
import { QuoteBlock } from '../Features/QuoteBlock';
import { SafeDocViewer } from '../Attachments/SafeDocViewer';
import { EditHistory } from '../Features/EditHistory';
import { useAuthStore } from '../../../store/useAuthStore';
import { fileSharingService } from '../../../services/messaging/fileSharingService';

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const { setQuotingMessage, setEditingMessage, setActiveThreadId } = useMessageStore();
  const { user } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ attachment: IMessage['attachments'][0]; userId: string } | null>(null);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTime = (ts: Timestamp) => {
    if (!ts) return '';
    const date = ts.toMillis ? new Date(ts.toMillis()) : new Date((ts as unknown as Record<string, number>).seconds * 1000);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz? 30 gün boyunca arşivde tutulacaktır.")) return;
    setIsDeleting(true);
    try {
      await messageService.softDeleteMessage(message.conversationId, message.id);
    } catch {
      setIsDeleting(false);
    }
  }, [message.conversationId, message.id]);

  const handleEdit = useCallback(() => {
    setEditingMessage(message);
  }, [message, setEditingMessage]);

  const handleQuoteReply = useCallback(() => {
    setQuotingMessage(message);
  }, [message, setQuotingMessage]);

  const handleThreadReply = useCallback(() => {
    setActiveThreadId(message.id);
  }, [message.id, setActiveThreadId]);

  const handleQuoteScroll = useCallback(() => {
    if (message.quoteData) {
      const el = document.querySelector(`[data-message-id="${message.quoteData.messageId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-accent-primary/50', 'rounded-2xl');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-accent-primary/50', 'rounded-2xl');
        }, 2000);
      }
    }
  }, [message.quoteData]);

  if (isDeleting) return null;

  return (
    <div
      className={`flex flex-col mb-1 w-full ${isOwn ? 'items-end' : 'items-start'} group px-1 md:px-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-message-id={message.id}
    >
      <div className={`flex items-end gap-1 md:gap-2 max-w-[92%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Bubble */}
        <div className={`relative flex flex-col shadow-sm transition-transform duration-200 ${
          isOwn
            ? 'bg-accent-primary text-white rounded-[16px] md:rounded-[18px] rounded-br-[4px]'
            : 'bg-[#181c22] border border-white/5 text-white/90 rounded-[16px] md:rounded-[18px] rounded-bl-[4px]'
        } p-0.5 overflow-hidden group/bubble`}
        >
          {/* Quote Block */}
          {message.quoteData && !message.isDeleted && (
            <QuoteBlock
              quoteData={message.quoteData}
              isOwn={isOwn}
              onScrollToOriginal={handleQuoteScroll}
            />
          )}

          {/* Image Attachments */}
          {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
            <div className="flex flex-wrap gap-0.5 p-1">
              {message.attachments.map(att => att.type === 'image' && (
                <div
                  key={att.id}
                  onClick={() => setSelectedImage(att.url)}
                  className="relative cursor-pointer overflow-hidden rounded-xl bg-white/5 group/img max-w-[200px] md:max-w-[280px]"
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-auto max-h-[200px] md:max-h-[300px] object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 md:w-8 md:h-8 text-white/80" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text */}
          <div className="px-3 py-1.5 md:px-3.5 md:py-2 relative min-w-[50px] md:min-w-[60px]">
            {message.isDeleted ? (
              <div className="italic opacity-50 flex items-center gap-2 text-[11px] py-1">
                <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>Mesaj silindi (30 gün arşivde)</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="whitespace-pre-wrap break-words leading-[1.4] text-[13px] md:text-[14px] font-lexend">
                  {message.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-60 flex-wrap">
                  {message.editHistory && message.editHistory.length > 0 && (
                    <button
                      onClick={() => setShowEditHistory(true)}
                      className="text-[9px] italic hover:text-accent-primary transition-colors flex items-center gap-1"
                    >
                      <History className="w-2.5 h-2.5" />
                      düzenlendi
                    </button>
                  )}
                  {message.replyCount && message.replyCount > 0 ? (
                    <button
                      onClick={handleThreadReply}
                      className="text-[9px] font-medium flex items-center gap-1 hover:text-accent-primary transition-colors"
                    >
                      <CornerUpRight className="w-2.5 h-2.5" />
                      {message.replyCount} yanıt
                    </button>
                  ) : null}
                  <span className="text-[9px] md:text-[10px] font-medium leading-none">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Non-Image Attachments */}
          {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
            <div className="px-1.5 md:px-2 pb-1.5 md:pb-2 space-y-1">
              {message.attachments.map(att => att.type !== 'image' && (
                <button
                  key={att.id}
                  onClick={() => user && setViewingAttachment({ attachment: att, userId: user.id })}
                  className={`w-full flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-xl border transition-all ${
                    isOwn ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-black/20 border-white/5 hover:bg-black/40'
                  }`}
                >
                  <div className={`p-1.5 md:p-2 rounded-lg ${isOwn ? 'bg-white/10' : 'bg-accent-primary/20 text-accent-primary'}`}>
                    <Paperclip className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[10px] md:text-[11px] font-bold truncate">{att.name}</div>
                    <div className="text-[8px] md:text-[9px] opacity-60">{fileSharingService.formatFileSize(att.size)}</div>
                  </div>
                  <Download className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-40 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex flex-col gap-0.5 self-center transition-all duration-300 ${isHovered && !message.isDeleted ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
          <button onClick={handleQuoteReply} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all" title="Alıntı yap">
            <Reply className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          <button onClick={handleThreadReply} className="p-1.5 md:p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all" title="Yanıtla">
            <CornerUpRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          {isOwn && (
            <>
              <button onClick={handleEdit} className="p-1.5 md:p-2 hover:bg-accent-primary/10 rounded-full text-white/40 hover:text-accent-primary transition-all" title="Düzenle">
                <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button onClick={handleDelete} className="p-1.5 md:p-2 hover:bg-red-500/10 rounded-full text-white/40 hover:text-red-400 transition-all" title="Sil">
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 text-white/50 hover:text-white transition-colors z-[110] bg-white/5 rounded-full" onClick={() => setSelectedImage(null)}>
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Doc Viewer */}
      <AnimatePresence>
        {viewingAttachment && (
          <SafeDocViewer
            attachment={viewingAttachment.attachment}
            userId={viewingAttachment.userId}
            onClose={() => setViewingAttachment(null)}
          />
        )}
      </AnimatePresence>

      {/* Edit History Modal */}
      <AnimatePresence>
        {showEditHistory && message.editHistory && (
          <EditHistory
            editHistory={message.editHistory}
            onClose={() => setShowEditHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
