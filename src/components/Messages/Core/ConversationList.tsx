import React, { useState, useEffect, useCallback } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IConversation } from '../../../types/messaging';
import { Search, MessageSquare, Users, UserPlus, ArrowLeft, Mail } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../../../services/authService';
import { messageService } from '../../../services/messaging/messageService';
import { User } from '../../../types';

type ListMode = 'conversations' | 'contacts';

function tsMs(ts: unknown): number {
  if (!ts) return 0;
  if (typeof (ts as { toMillis?: () => number }).toMillis === 'function') return (ts as { toMillis: () => number }).toMillis();
  if ((ts as Record<string, unknown>).seconds) return ((ts as Record<string, number>).seconds) * 1000;
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
    const unsub = messageService.subscribeToConversations(user.id, (convs) => {
      setConversations(convs);
      setIsLoading(false);
      const ids = [...new Set(convs.flatMap(c => c.participants.map(p => p.userId).filter(id => id !== user.id)))];
      const toFetch = ids.filter(id => !profileCache[id]);
      if (toFetch.length) authService.getMultipleUsers(toFetch).then(users => setProfileCache(prev => { const n = { ...prev }; users.forEach(u => { n[u.id] = u; }); return n; })).catch(() => {});
    }, () => setIsLoading(false));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (mode === 'contacts' && user) {
      setIsLoading(true);
      authService.getContacts(user.id).then(u => { setContacts(u); setIsLoading(false); }).catch(() => setIsLoading(false));
    }
  }, [mode, user]);

  const handleContactClick = useCallback(async (contact: User) => {
    if (!user) return;
    const existing = conversations.find(c => c.type === 'direct' && c.participantIds?.includes(contact.id) && c.participantIds?.includes(user.id));
    if (existing) { setActiveConversationId(existing.id); setMode('conversations'); return; }
    try {
      setIsLoading(true);
      const now = Math.floor(Date.now() / 1000);
      const id = await messageService.createConversation({
        type: 'direct',
        participants: [{ userId: user.id, role: user.role, joinedAt: { seconds: now, nanoseconds: 0 } as never }, { userId: contact.id, role: contact.role, joinedAt: { seconds: now, nanoseconds: 0 } as never }],
        participantIds: [user.id, contact.id],
      });
      setActiveConversationId(id);
      setMode('conversations');
    } catch { } finally { setIsLoading(false); }
  }, [user, conversations, setActiveConversationId]);

  const filteredConversations = conversations.filter(c => {
    if (!user) return false;
    const otherId = c.participants.find(p => p.userId !== user.id)?.userId;
    const n = otherId ? profileCache[otherId]?.name : '';
    const t = (c.title || n || '').toLowerCase().includes(searchTerm.toLowerCase());
    const l = c.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase());
    return t || l;
  });

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0a] font-lexend">
      <div className="p-3 md:p-4 border-b border-white/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">{mode === 'conversations' ? 'Sohbetler' : 'Yeni İletişim'}</h2>
            {unreadTotalCount > 0 && mode === 'conversations' && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded-full">{unreadTotalCount}</span>}
          </div>
          <button onClick={() => setMode(mode === 'conversations' ? 'contacts' : 'conversations')} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-accent-primary transition-all border border-white/5">
            {mode === 'conversations' ? <UserPlus className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4 text-white/40" />}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input type="text" placeholder={mode === 'conversations' ? "Sohbet ara..." : "Kullanıcı bul..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-accent-primary/20 transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1 px-2 space-y-0.5">
        {isLoading ? (
          <div className="flex justify-center py-12 opacity-30"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>
        ) : mode === 'conversations' ? (
          filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 opacity-30"><MessageSquare className="w-5 h-5" /></div>
              <p className="text-xs text-white/30">Henüz mesaj yok</p>
            </div>
          ) : filteredConversations.map(conv => {
            const active = activeConversationId === conv.id;
            const group = conv.type !== "direct";
            const otherId = conv.participants.find(p => p.userId !== user?.id)?.userId;
            const name = group ? conv.title : (otherId ? profileCache[otherId]?.name : '...');
            const unread = user ? (conv.unreadCount?.[user.id] || 0) : 0;
            return (
              <button key={conv.id} onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 border relative ${active ? 'bg-accent-primary/10 border-accent-primary/20' : 'border-transparent hover:bg-white/[0.03]'}`}>
                {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent-primary rounded-full" />}
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${active ? 'bg-accent-primary/20 border-accent-primary/30' : 'bg-white/5 border-white/10'}`}>
                    {group ? <Users className="w-4 h-4 text-white/40" /> : <MessageSquare className="w-4 h-4 text-white/40" />}
                  </div>
                  {unread > 0 && <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center"><span className="text-[7px] font-bold text-white px-1">{unread > 9 ? '9+' : unread}</span></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-semibold text-xs truncate ${active ? 'text-white' : 'text-white/60'}`}>{name}</h3>
                    <span className="text-[8px] text-white/20">{conv.updatedAt ? new Date(tsMs(conv.updatedAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className={`text-[10px] truncate ${active ? 'text-accent-primary/70' : 'text-white/20'}`}>{conv.lastMessage?.text || 'Yeni sohbet'}</p>
                </div>
              </button>
            );
          })
        ) : (
          <>
            <div className="px-3 py-2 text-[8px] font-semibold text-white/10 uppercase tracking-widest">Kullanıcılar</div>
            {filteredContacts.length === 0 ? <div className="text-center py-8 text-xs text-white/20">Kullanıcı bulunamadı</div> : filteredContacts.map(c => (
              <button key={c.id} onClick={() => handleContactClick(c)} className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all flex items-center gap-3">
                <img src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt={c.name} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs text-white/80 truncate">{c.name}</h3>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest truncate">{c.role || 'Kullanıcı'}</p>
                </div>
                <Mail className="w-3.5 h-3.5 text-white/10" />
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
