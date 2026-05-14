import React, { useState, useEffect, useCallback } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IConversation } from '../../../types/messaging';
import { Search, MessageSquare, Users, BellOff, UserPlus, ArrowLeft, Mail } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../../../services/authService';
import { messageService } from '../../../services/messaging/messageService';
import { User } from '../../../types';

type ListMode = 'conversations' | 'contacts';

function timestampToMs(ts: unknown): number {
  if (!ts) return 0;
  if (typeof (ts as { toMillis?: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if ((ts as Record<string, unknown>).seconds) {
    return ((ts as Record<string, number>).seconds) * 1000;
  }
  return 0;
}

export const ConversationList: React.FC = () => {
  const { activeConversationId, setActiveConversationId, unreadTotalCount } = useMessageStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<ListMode>('conversations');
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = messageService.subscribeToConversations(
      user.id,
      (convs) => {
        setConversations(convs);
        setIsLoading(false);

        const otherParticipantIds = [...new Set(convs.flatMap(c =>
          c.participants.map(p => p.userId).filter(id => id !== user.id)
        ))];

        if (otherParticipantIds.length > 0) {
          const idsToFetch = otherParticipantIds.filter(id => !profileCache[id]);
          if (idsToFetch.length > 0) {
            authService.getMultipleUsers(idsToFetch).then(users => {
              setProfileCache(prev => {
                const newCache = { ...prev };
                users.forEach(u => { newCache[u.id] = u; });
                return newCache;
              });
            }).catch(() => {});
          }
        }
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (mode === 'contacts' && user) {
      setIsLoading(true);
      authService.getContacts(user.id).then(u => {
        setContacts(u);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [mode, user]);

  const handleContactClick = useCallback(async (contact: User) => {
    if (!user) return;

    const existingConv = conversations.find(c =>
      c.type === 'direct' &&
      c.participantIds?.includes(contact.id) &&
      c.participantIds?.includes(user.id)
    );

    if (existingConv) {
      setActiveConversationId(existingConv.id);
      setMode('conversations');
    } else {
      try {
        setIsLoading(true);
        const now = new Date();
        const newConvId = await messageService.createConversation({
          type: 'direct',
          participants: [
            { userId: user.id, role: user.role, joinedAt: { seconds: Math.floor(now.getTime() / 1000), nanoseconds: 0 } as never },
            { userId: contact.id, role: contact.role, joinedAt: { seconds: Math.floor(now.getTime() / 1000), nanoseconds: 0 } as never }
          ],
          participantIds: [user.id, contact.id]
        });
        setActiveConversationId(newConvId);
        setMode('conversations');
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, conversations, setActiveConversationId]);

  const filteredConversations = conversations.filter(c => {
    if (!user) return false;
    const otherId = c.participants.find(p => p.userId !== user.id)?.userId;
    const otherName = otherId ? profileCache[otherId]?.name : '';
    const titleMatch = (c.title || otherName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const lastMsgMatch = c.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || lastMsgMatch;
  });

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0a] font-lexend">
      <style>{`
        .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="p-4 md:p-8 border-b border-white/[0.03]">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-accent-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tighter">
              {mode === 'conversations' ? 'Sohbetler' : 'Yeni İletişim'}
            </h2>
            {unreadTotalCount > 0 && mode === 'conversations' && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full border border-red-500/30">
                {unreadTotalCount}
              </span>
            )}
          </div>
          {mode === 'conversations' ? (
            <button
              onClick={() => setMode('contacts')}
              className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-accent-primary transition-all active:scale-90 border border-white/5"
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          ) : (
            <button
              onClick={() => setMode('conversations')}
              className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all flex items-center gap-2 border border-white/5"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent-primary transition-colors" />
          <input
            type="text"
            placeholder={mode === 'conversations' ? "Sohbet ara..." : "Kullanıcı bul..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 md:py-4 pl-12 pr-4 text-sm text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:bg-white/[0.04] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar-hidden py-2 md:py-4 px-2 md:px-4 space-y-1 md:space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 gap-4 opacity-20">
            <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Yükleniyor...</span>
          </div>
        ) : mode === 'conversations' ? (
          <>
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 md:py-20 px-6 md:px-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-[20px] md:rounded-[24px] flex items-center justify-center mx-auto mb-4 md:mb-6 opacity-20">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-white/40 font-bold text-xs md:text-sm mb-1 md:mb-2">Henüz mesaj yok</h3>
                <p className="text-white/10 text-[10px] md:text-[11px] leading-relaxed">İletişime geçmek için üstteki (+) butonuna tıklayın.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                const isGroup = conv.type !== "direct";
                const otherId = conv.participants.find(p => p.userId !== user?.id)?.userId;
                const displayName = isGroup ? conv.title : (otherId ? profileCache[otherId]?.name : 'Yükleniyor...');
                const convUnread = user ? (conv.unreadCount?.[user.id] || 0) : 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3 md:p-4 rounded-[24px] md:rounded-[28px] transition-all duration-500 flex items-center gap-3 md:gap-5 group border relative overflow-hidden ${isActive ? 'bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border-accent-primary/30 shadow-[0_15px_30px_rgba(59,130,246,0.1)]' : 'hover:bg-white/[0.03] border-transparent'}`}
                  >
                    {isActive && <div className="absolute left-0 top-3 md:top-4 bottom-3 md:bottom-4 w-0.5 md:w-1 bg-accent-primary rounded-full" />}

                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 scale-95 group-hover:scale-100 ${isActive ? 'bg-accent-primary/20 border-accent-primary/40 shadow-inner' : 'bg-white/5 border-white/10'}`}>
                        {isGroup ? <Users className="w-5 h-5 md:w-6 md:h-6 text-white/40" /> : <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white/40" />}
                      </div>
                      {convUnread > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[18px] md:min-w-[22px] h-[18px] md:h-[22px] bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-[8px] md:text-[10px] font-black text-white px-1">{convUnread > 9 ? '9+' : convUnread}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2 md:pr-4">
                      <div className="flex justify-between items-center mb-0.5 md:mb-1">
                        <h3 className={`font-black text-sm md:text-base truncate transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{displayName}</h3>
                        <span className="text-[9px] md:text-[10px] font-black text-white/20 tabular-nums">
                          {conv.updatedAt ? new Date(timestampToMs(conv.updatedAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className={`text-[11px] md:text-[13px] truncate font-medium transition-colors ${isActive ? 'text-accent-primary/80' : 'text-white/20 group-hover:text-white/40'}`}>
                        {conv.lastMessage?.text || 'Yeni bir diyalog bekliyor...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </>
        ) : (
          <>
            <div className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-white/10 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">
              Ağdaki Kullanıcılar
            </div>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12 text-white/20">
                <p className="text-xs">Kullanıcı bulunamadı</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  className="w-full text-left p-3 md:p-4 rounded-[24px] md:rounded-[28px] hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all duration-500 flex items-center gap-3 md:gap-5 group"
                >
                  <img
                    src={contact.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`}
                    alt={contact.name}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 transition-transform group-hover:scale-110 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm md:text-base text-white/80 group-hover:text-white truncate">{contact.name}</h3>
                    <p className="text-[10px] md:text-[11px] font-black text-white/20 uppercase tracking-widest truncate">{contact.role || 'Kullanıcı'}</p>
                  </div>
                  <Mail className="w-4 h-4 text-white/10 group-hover:text-accent-primary/60 transition-colors flex-shrink-0" />
                </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
