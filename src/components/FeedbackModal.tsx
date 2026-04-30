// @ts-nocheck
import React, { useState } from 'react';
import { ActivityType, FeedbackCategory } from '../types';
import { messagingService } from '../services/messagingService';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

import { logInfo, logError, logWarn } from '../utils/logger.js';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: ActivityType | null;
  activityTitle?: string;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'general', label: 'Genel Görüş', icon: 'fa-comment', desc: 'Deneyimleriniz ve önerileriniz.', color: 'text-blue-500' },
  { id: 'bug', label: 'Hata Bildirimi', icon: 'fa-bug', desc: 'Çalışmayan bir özellik veya hata.', color: 'text-rose-500' },
  { id: 'feature', label: 'Özellik İsteği', icon: 'fa-lightbulb', desc: 'Uygulamada görmek istediğiniz yenilikler.', color: 'text-amber-500' },
  { id: 'content', label: 'İçerik Hatası', icon: 'fa-circle-exclamation', desc: 'Sorularda veya metinlerde yanlışlık.', color: 'text-purple-500' },
];

export const FeedbackModal = ({ isOpen, onClose, activityType, activityTitle }: FeedbackModalProps) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await messagingService.submitFeedback({
        userId: user?.id,
        userName: user?.name || 'Misafir',
        userEmail: email,
        activityType: activityType || 'Genel',
        activityTitle: activityTitle || 'Genel Uygulama',
        rating,
        category,
        message
      });

      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (err) {
      logError("Feedback send error:", err);
      alert("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setMessage('');
    setRating(0);
    setCategory('general');
    setIsSending(false);
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[var(--bg-paper)] w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col font-['Lexend'] max-h-[90vh]"
        >
          {showSuccess ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, 0] }}
                className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8 ring-8 ring-emerald-500/5 shadow-xl"
              >
                <i className="fa-solid fa-check text-4xl"></i>
              </motion.div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4 tracking-tight uppercase">GERİ BİLDİRİM ALINDI</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm max-w-sm">
                Fikirleriniz Oogmatik'in geleceğini şekillendiriyor. Gelişimimize katkıda bulunduğunuz için minnettarız.
              </p>
              <div className="mt-10 w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-[var(--accent-color)]"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-8 py-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-glass)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-premium-sm border border-[var(--accent-color)]/10">
                    <i className="fa-solid fa-headset text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-black text-xl tracking-tighter uppercase leading-none mb-1">YARDIM MASASI</h3>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest opacity-70">GELİŞMEMİZE YARDIMCI OLUN</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose} 
                  className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Category Selection - Bento Style */}
                  <div>
                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 ml-1">KATEGORİ</label>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden group border-2 ${category === cat.id ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-[var(--border-color)] bg-[var(--surface-elevated)]/50 hover:bg-[var(--surface-elevated)]'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center mb-3 shadow-sm border border-[var(--border-color)] transition-all group-hover:scale-110 ${category === cat.id ? cat.color : 'text-[var(--text-muted)]'}`}>
                            <i className={`fa-solid ${cat.icon} text-base`}></i>
                          </div>
                          <span className={`block font-black text-xs tracking-tight uppercase mb-1 ${category === cat.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{cat.label}</span>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] leading-tight opacity-70">{cat.desc}</p>
                          {category === cat.id && (
                            <motion.div 
                              layoutId="activeCategory"
                              className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Context Info */}
                    <div className="p-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-color)]">
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">BAĞLAM</p>
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-hashtag text-[var(--accent-color)] opacity-70"></i>
                        <p className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tight">{activityTitle || 'Genel Arabirim'}</p>
                      </div>
                    </div>

                    {/* Rating Selection */}
                    <div className="p-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-color)]">
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">PUANINIZ</p>
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`flex-1 h-8 rounded-lg text-xs transition-all flex items-center justify-center ${rating >= star ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'}`}
                          >
                            <i className={`fa-${rating >= star ? 'solid' : 'regular'} fa-star`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">
                      MESAJINIZ <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full p-5 bg-[var(--surface-elevated)] border-2 border-[var(--border-color)] rounded-[1.5rem] focus:border-[var(--accent-color)] outline-none transition-all resize-none text-sm text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] placeholder:opacity-50"
                      placeholder={category === 'bug' ? 'Hatanın adımlarını yazar mısınız?' : 'Önerilerinizi bekliyoruz...'}
                    ></textarea>
                  </div>

                  {/* Email (If not logged in) */}
                  {!user && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label htmlFor="email" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">İLETİŞİM E-POSTASI</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-5 bg-[var(--surface-elevated)] border-2 border-[var(--border-color)] rounded-[1.5rem] focus:border-[var(--accent-color)] outline-none text-sm text-[var(--text-primary)] font-bold transition-all"
                        placeholder="Size geri dönebilmemiz için..."
                      />
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-6 border-t border-[var(--border-color)] bg-[var(--surface-glass)] shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={isSending || !message.trim()}
                  className="w-full h-14 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-[1.02] transition-all rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSending ? (
                    <>
                      <motion.i 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="fa-solid fa-spinner"
                      />
                      <span>İLETİLİYOR...</span>
                    </>
                  ) : (
                    <>
                      <span>GÖNDERİMİ TAMAMLA</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
