import React, { useState, useCallback } from 'react';
import { Mail, AlertTriangle, Send as SendIcon, Search, RefreshCcw as RefreshCw, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { messageService } from '../../services/messaging/messageService';
import { useToastStore } from '../../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportItem {
  id: string;
  senderName: string;
  reason: string;
  messageId: string;
  conversationId: string;
  date: string;
}

export const AdminCommunication: React.FC = () => {
  const { user } = useAuthStore();
  const [broadcastText, setBroadcastText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [reports] = useState<ReportItem[]>([
    { id: '1', senderName: 'Veli (Ahmet)', reason: 'Spam / Rahatsız Edici', messageId: 'msg-99', conversationId: 'conv-1', date: new Date().toLocaleDateString('tr-TR') },
    { id: '2', senderName: 'Öğrenci (Ali)', reason: 'Uygunsuz Dil', messageId: 'msg-101', conversationId: 'conv-2', date: new Date(Date.now() - 86400000).toLocaleDateString('tr-TR') },
  ]);

  const handleBroadcast = useCallback(async () => {
    if (!broadcastText || !user) return;
    setIsSending(true);

    try {
      const now = new Date();
      const convId = await messageService.createConversation({
        type: 'announcement',
        title: 'Sistem Duyurusu',
        participants: [{ userId: user.id, role: user.role, joinedAt: { seconds: Math.floor(now.getTime() / 1000), nanoseconds: 0 } as never }],
        participantIds: [user.id],
        adminIds: [user.id],
      });

      await messageService.sendMessage({
        conversationId: convId,
        senderId: user.id,
        type: 'system',
        text: broadcastText,
      });

      useToastStore.getState().success('Sistem duyurusu tüm kullanıcılara iletildi.', 4000, 'Duyuru Gönderildi');
      setBroadcastText('');
    } catch {
      useToastStore.getState().error('Duyuru gönderilirken hata oluştu.');
    } finally {
      setIsSending(false);
    }
  }, [broadcastText, user]);

  const handleDeleteReported = useCallback(async (report: ReportItem) => {
    try {
      await messageService.softDeleteMessage(report.conversationId, report.messageId);
      useToastStore.getState().success('Raporlanan mesaj silindi.', 3000);
    } catch {
      useToastStore.getState().error('Mesaj silinemedi.');
    }
  }, []);

  const filteredReports = reports.filter(r =>
    !searchTerm || r.senderName.toLowerCase().includes(searchTerm.toLowerCase()) || r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 h-full flex flex-col font-inter">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 flex items-center gap-2">
        <Mail className="w-5 h-5 md:w-6 md:h-6 text-accent-primary" />
        İletişim ve Denetim Merkezi
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
        {/* Broadcast Panel */}
        <div className="bg-[#0f1115]/80 backdrop-blur-md rounded-2xl border border-white/5 p-4 md:p-6 flex flex-col shadow-2xl">
          <h3 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2">
            <SendIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            Genel Duyuru (Broadcast)
          </h3>
          <p className="text-xs md:text-sm text-white/50 mb-3 md:mb-4">
            Sistemdeki tüm öğretmen, veli ve uygun yaştaki öğrencilere sistem mesajı olarak iletilecektir.
          </p>
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 md:mb-4 h-28 md:h-32 resize-none custom-scrollbar font-lexend text-sm"
            placeholder="Örn: Sistem saat 22:00'de bakıma alınacaktır..."
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
          />
          <div className="flex justify-between items-center mt-auto">
            <span className="text-[10px] md:text-xs text-white/30">~450 kullanıcıya iletilecek</span>
            <button
              disabled={!broadcastText || isSending}
              onClick={handleBroadcast}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 md:px-6 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm"
            >
              {isSending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gönderiliyor...</>
              ) : (
                <><SendIcon className="w-4 h-4" /> Duyuruyu Yayınla</>
              )}
            </button>
          </div>
        </div>

        {/* Moderation Panel */}
        <div className="bg-[#0f1115]/80 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 md:p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                Raporlanan Mesajlar
              </h3>
              <RefreshCw className="w-4 h-4 text-white/20 hover:text-white/40 cursor-pointer transition-colors" />
            </div>
            <p className="text-xs md:text-sm text-white/50">Kullanıcılar tarafından işaretlenen mesajlar.</p>
            <div className="relative max-w-xs mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Raporlarda ara..."
                className="w-full bg-black/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">Rapor bulunamadı</div>
            ) : (
              <AnimatePresence>
                {filteredReports.map(report => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 md:p-4 m-1 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] md:text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                        {report.reason}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-white/40">{report.date}</span>
                    </div>
                    <div className="text-[11px] md:text-sm text-white/70 mb-2 md:mb-3 ml-1">
                      <span className="text-white font-medium">{report.senderName}</span> tarafından gönderildi.
                    </div>
                    <div className="flex gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteReported(report)}
                        className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" /> Mesajı Sil
                      </button>
                      <button className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 bg-white/5 text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1">
                        Yoksay
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
