
import React, { useState } from 'react';
import { ActivityType, FeedbackCategory } from '../types';
import { messagingService } from '../services/messagingService';
import { useAuth } from '../context/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: ActivityType | null;
  activityTitle?: string;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: string; desc: string }[] = [
    { id: 'general', label: 'Genel Görüş', icon: 'fa-comment', desc: 'Deneyimleriniz ve önerileriniz.' },
    { id: 'bug', label: 'Hata Bildirimi', icon: 'fa-bug', desc: 'Çalışmayan bir özellik veya hata.' },
    { id: 'feature', label: 'Özellik İsteği', icon: 'fa-lightbulb', desc: 'Uygulamada görmek istediğiniz yenilikler.' },
    { id: 'content', label: 'İçerik Hatası', icon: 'fa-circle-exclamation', desc: 'Sorularda veya metinlerde yanlışlık.' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, activityType, activityTitle }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Wait for user to read success msg or close manually
      setTimeout(() => {
          handleClose();
      }, 2500);

    } catch (err) {
      console.error("Feedback send error:", err);
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

  if (showSuccess) {
      return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-300 max-w-sm w-full border border-zinc-200 dark:border-zinc-700">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50 dark:ring-green-900/10">
                    <i className="fa-solid fa-check text-4xl text-green-600 dark:text-green-400"></i>
                </div>
                <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mb-2">Teşekkürler!</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                    Geri bildiriminiz başarıyla alındı. Gelişimimize katkıda bulunduğunuz için minnettarız.
                </p>
                <button onClick={handleClose} className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold transition-colors">
                    Kapat
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-zinc-900 dark:bg-black p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                  <i className="fa-solid fa-comment-dots text-xl"></i>
              </div>
              <div>
                  <h3 className="text-white font-bold text-lg">Geri Bildirim</h3>
                  <p className="text-zinc-400 text-xs">Fikirleriniz bizim için değerli</p>
              </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Selection */}
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Bildirim Türü</label>
                <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${category === cat.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-1 relative z-10">
                                <i className={`fa-solid ${cat.icon} ${category === cat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`}></i>
                                <span className={`font-bold text-sm ${category === cat.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{cat.label}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-tight relative z-10 pl-7">{cat.desc}</p>
                            {category === cat.id && <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 transform translate-x-4 -translate-y-4 rotate-45"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Context Info */}
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-200 dark:border-zinc-600">
                <i className="fa-solid fa-layer-group text-zinc-400"></i>
                <div className="flex-1">
                    <p className="text-xs text-zinc-500 font-bold uppercase">İlgili Bağlam</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{activityTitle || 'Genel Uygulama'}</p>
                </div>
            </div>

            {/* Rating */}
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Memnuniyet Düzeyiniz</label>
                <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`flex-1 py-2 rounded-lg text-xl transition-all border-2 ${rating >= star ? 'border-yellow-400 bg-yellow-50 text-yellow-500' : 'border-zinc-200 text-zinc-300 hover:border-zinc-300'}`}
                    >
                    <i className="fa-solid fa-star"></i>
                    </button>
                ))}
                </div>
            </div>

            {/* Message */}
            <div>
                <label htmlFor="message" className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                Mesajınız <span className="text-red-500">*</span>
                </label>
                <textarea
                id="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                placeholder={category === 'bug' ? 'Hata nerede oluştu? Adımları tarif edebilir misiniz?' : 'Düşüncelerinizi paylaşın...'}
                ></textarea>
            </div>

            {/* Email (If not logged in) */}
            {!user && (
                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase mb-2">E-posta (İsteğe Bağlı)</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 focus:border-indigo-500 outline-none text-zinc-800 dark:text-zinc-100"
                        placeholder="Size geri dönmemizi isterseniz..."
                    />
                </div>
            )}

            </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 shrink-0">
            <button
              onClick={handleSubmit}
              disabled={isSending || !message.trim()}
              className="w-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isSending ? (
                <>
                   <i className="fa-solid fa-circle-notch fa-spin"></i>
                   <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <span>Gönder</span>
                  <i className="fa-solid fa-paper-plane"></i>
                </>
              )}
            </button>
        </div>

      </div>
    </div>
  );
};
