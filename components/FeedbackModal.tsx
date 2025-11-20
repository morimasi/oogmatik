
import React, { useState } from 'react';
import { ActivityType } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: ActivityType | null;
  activityTitle?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, activityType, activityTitle }) => {
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // 1. Backend API'ye Loglama (Opsiyonel veritabanı kaydı için)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType,
          activityTitle,
          rating,
          message,
          email,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Feedback log error:", err);
    }

    // 2. E-posta İstemcisine Yönlendirme (morimasi@gmail.com)
    const subject = `Geri Bildirim: ${activityTitle || 'Genel'} (${activityType || 'Genel'})`;
    const body = `Merhaba,\n\nUygulama üzerinden aşağıdaki geri bildirim yapılmıştır:\n\nEtkinlik: ${activityTitle || 'Genel'}\nPuan: ${rating}/5\n\nMesaj:\n${message}\n\nKullanıcı E-postası: ${email}\n\nTarih: ${new Date().toLocaleString('tr-TR')}`;
    
    const mailtoLink = `mailto:morimasi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Kısa bir gecikme ile e-posta istemcisini aç ve modali kapat
    setTimeout(() => {
      window.location.href = mailtoLink;
      setIsSending(false);
      onClose();
      alert("Geri bildiriminiz hazırlandı! Lütfen açılan e-posta penceresinden gönderimi onaylayın.");
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <i className="fa-solid fa-comment-dots"></i> Geri Bildirim
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              İlgili Etkinlik
            </label>
            <div className="p-2 bg-zinc-100 dark:bg-zinc-700/50 rounded text-zinc-600 dark:text-zinc-300 text-sm font-semibold">
              {activityTitle || 'Genel Uygulama Geri Bildirimi'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Memnuniyetiniz
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                >
                  <i className="fa-solid fa-star"></i>
                </button>
              ))}
            </div>
          </div>

          <div>
             <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              E-posta Adresiniz (İsteğe bağlı)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Mesajınız / Hata Bildirimi
            </label>
            <textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              placeholder="Fikirlerinizi veya karşılaştığınız hatayı detaylandırın..."
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Yöneticiye Gönder</span>
                </>
              )}
            </button>
            <p className="text-xs text-zinc-400 text-center mt-2">
              *Geri bildiriminiz doğrudan e-posta uygulamanız üzerinden gönderilecektir.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
