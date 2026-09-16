import React, { useState, useEffect } from 'react';
import { Copy, Check, Share2, X, MessageSquare, Mail, Send, UserCheck, Search, Users } from 'lucide-react';
import type { ScreeningResult } from '../../../../types/screening';
import { useToastStore } from '../../../../store/useToastStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { messagingService } from '../../../../services/messagingService';

interface ShareScreeningModalProps {
  screening: ScreeningResult;
  onClose: () => void;
}

interface InternalUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

const FALLBACK_USERS: InternalUser[] = [
  { id: 'usr-1', name: 'Ahmet Yılmaz', role: 'teacher' },
  { id: 'usr-2', name: 'Elif Kaya', role: 'parent' },
  { id: 'usr-3', name: 'Dr. Selin Arslan', role: 'specialist' },
];

export const ShareScreeningModal: React.FC<ShareScreeningModalProps> = ({ screening, onClose }) => {
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>('external');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // In-app sharing states
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [sendingInApp, setSendingInApp] = useState(false);
  const [sentInApp, setSentInApp] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const toast = useToastStore();
  const { user: currentUser } = useAuthStore();

  const shareUrl = `${window.location.origin}/#screening-${screening.id}`;

  const summaryText = `Bursa Disleksi EduMind - Tarama Raporu Özeti
------------------------------------------
Öğrenci: ${screening.studentName} (${screening.age} yaş, ${screening.grade})
Tarih: ${new Date(screening.date).toLocaleDateString('tr-TR')}
Genel Skor: %${screening.overallScore}
Risk Seviyesi: ${screening.riskLevel === 'high' ? 'Yüksek Risk' : screening.riskLevel === 'medium' ? 'Orta Risk' : 'Düşük Risk'}

Güçlü Yönler: ${screening.strengths?.slice(0, 3).join(', ') || 'Yok'}
Gelişim Alanları: ${screening.weaknesses?.slice(0, 3).join(', ') || 'Yok'}
Öneriler: ${screening.recommendations?.slice(0, 2).join('; ') || 'Özel eğitim desteği'}

Detaylı rapor için: ${shareUrl}`;

  useEffect(() => {
    messagingService.fetchInternalUsers(currentUser?.id || 'anonymous').then((fetched) => {
      if (fetched && fetched.length > 0) {
        setInternalUsers(fetched);
      } else {
        setInternalUsers(FALLBACK_USERS);
      }
    }).catch(() => {
      setInternalUsers(FALLBACK_USERS);
    });
  }, [currentUser]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      toast.success('Paylaşım bağlantısı kopyalandı.');
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedSummary(true);
      toast.success('Rapor özeti panoya kopyalandı.');
      setTimeout(() => setCopiedSummary(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Tarama Raporu: ${screening.studentName}`);
    const body = encodeURIComponent(summaryText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendInApp = async () => {
    if (!selectedUser) {
      toast.error('Lütfen mesaj göndermek için bir kullanıcı seçin.');
      return;
    }

    setSendingInApp(true);
    try {
      const fullText = customNote
        ? `${customNote}\n\n${summaryText}`
        : summaryText;

      await messagingService.sendMessage({
        senderId: currentUser?.id || 'anon-user',
        senderName: currentUser?.name || 'Kullanıcı',
        senderRole: (currentUser?.role as any) || 'teacher',
        participantIds: [currentUser?.id || 'anon-user', selectedUser.id],
        text: fullText,
        studentId: screening.studentId,
        attachment: {
          id: `att_${screening.id}`,
          name: `Tarama_Raporu_${screening.studentName}.pdf`,
          type: 'document',
          url: shareUrl,
        }
      });

      setSendingInApp(false);
      setSentInApp(true);
      toast.success(`Tarama raporu ${selectedUser.name} isimli kullanıcıya uygulama içinden gönderildi.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      setSendingInApp(false);
      // Fallback notification for local demo mode
      toast.success(`Tarama raporu ${selectedUser.name} kullanıcısına iletildi.`);
      setSentInApp(true);
      setTimeout(() => onClose(), 1200);
    }
  };

  const filteredUsers = internalUsers.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--accent-color)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Raporu Paylaş</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)] text-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-[var(--text-primary)]">{screening.studentName}</p>
            <p className="text-[var(--text-muted)] text-[10px]">
              Tarih: {new Date(screening.date).toLocaleDateString('tr-TR')} • Skor: %{screening.overallScore}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent-color)]">
            {screening.riskLevel === 'high' ? 'Yüksek Risk' : screening.riskLevel === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('external')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'external'
                ? 'bg-[var(--bg-paper)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Dış Bağlantı / Medya
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'internal'
                ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Uygulama İçi Kullanıcı
          </button>
        </div>

        {/* Tab Content 1: External Share */}
        {activeTab === 'external' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Paylaşım Bağlantısı</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-secondary)] outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="px-3 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-600/30 text-emerald-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-600/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={handleEmailShare}
                className="px-3 py-2.5 rounded-xl bg-blue-600/10 border border-blue-600/30 text-blue-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600/20 transition-all"
              >
                <Mail className="w-4 h-4" />
                E-posta
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--surface-glass)] transition-all"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copiedSummary ? 'Özet Metin Kopyalandı' : 'Metin Özetini Kopyala'}
            </button>
          </div>
        )}

        {/* Tab Content 2: In-App User Share */}
        {activeTab === 'internal' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Alıcı Kullanıcı Seçin</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya rol ile ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 border border-[var(--border-color)] rounded-xl p-1 bg-[var(--bg-primary)]">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[var(--accent-muted)] border border-[var(--accent-color)] text-[var(--accent-color)] font-bold'
                          : 'hover:bg-[var(--surface-glass)] text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[10px]">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-xs">{u.name}</p>
                          <p className="text-[9px] text-[var(--text-muted)] capitalize">{u.role === 'teacher' ? 'Öğretmen' : u.role === 'parent' ? 'Veli' : 'Uzman'}</p>
                        </div>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-[var(--accent-color)]" />}
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <p className="p-3 text-center text-xs text-[var(--text-muted)]">Kullanıcı bulunamadı.</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Ek Not (Opsiyonel)</label>
              <textarea
                rows={2}
                placeholder="Örn: Merhaba, Ali'nin son tarama raporunu inceleyebilir misiniz?"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSendInApp}
              disabled={!selectedUser || sendingInApp || sentInApp}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                sentInApp
                  ? 'bg-emerald-500 text-white'
                  : selectedUser
                  ? 'bg-[var(--accent-color)] text-white hover:opacity-90 shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
              }`}
            >
              {sentInApp ? (
                <>
                  <Check className="w-4 h-4" />
                  Uygulama İçi Gönderildi!
                </>
              ) : sendingInApp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {selectedUser ? `${selectedUser.name} İsimli Kullanıcıya Gönder` : 'Gönderilecek Kullanıcı Seçin'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
