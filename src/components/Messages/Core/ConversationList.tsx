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
    <div className="flex flex-col h-full w-full bg-[var(--bg-paper)] font-lexend">
      <div className="p-3 md:p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">{mode === 'conversations' ? 'Sohbetler' : 'Yeni İletişim'}</h2>
            {unreadTotalCount > 0 && mode === 'conversations' && <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 text-[9px] font-bold rounded-md">{unreadTotalCount}</span>}
          </div>
          <button onClick={() => setMode(mode === 'conversations' ? 'contacts' : 'conversations')} className="p-1.5 bg-[var(--bg-default)] hover:bg-[var(--accent-muted)] rounded-md text-[var(--accent-color)] transition-colors border border-[var(--border-color)]">
            {mode === 'conversations' ? <UserPlus className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <input type="text" placeholder={mode === 'conversations' ? "Sohbet ara..." : "Kullanıcı bul..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-default)] border border-[var(--border-color)] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1 px-1.5 space-y-0.5">
        {isLoading ? (
          <div className="flex justify-center py-8 opacity-50"><div className="w-4 h-4 border-2 border-[var(--text-secondary)] border-t-transparent rounded-full animate-spin" /></div>
        ) : mode === 'conversations' ? (
          filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-8 h-8 bg-[var(--bg-default)] border border-[var(--border-color)] rounded-lg flex items-center justify-center mx-auto mb-2 text-[var(--text-secondary)]"><MessageSquare className="w-4 h-4" /></div>
              <p className="text-[10px] text-[var(--text-secondary)]">Henüz mesaj yok</p>
            </div>
          ) : filteredConversations.map(conv => {
            const active = activeConversationId === conv.id;
            const group = conv.type !== "direct";
            const otherId = conv.participants.find(p => p.userId !== user?.id)?.userId;
            const name = group ? conv.title : (otherId ? profileCache[otherId]?.name : '...');
            const unread = user ? (conv.unreadCount?.[user.id] || 0) : 0;
            return (
              <button key={conv.id} onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-2.5 border relative ${active ? 'bg-[var(--accent-muted)] border-[var(--accent-color)]/30' : 'border-transparent hover:bg-[var(--bg-default)]'}`}>
                {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[var(--accent-color)] rounded-r-full" />}
                <div className="relative flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${active ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30 text-[var(--accent-color)]' : 'bg-[var(--bg-default)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                    {group ? <Users className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  </div>
                  {unread > 0 && <div className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-rose-500 rounded-full flex items-center justify-center border border-[var(--bg-paper)]"><span className="text-[6px] font-bold text-white px-1">{unread > 9 ? '9+' : unread}</span></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-semibold text-[11px] truncate ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]/80'}`}>{name}</h3>
                    <span className="text-[7px] text-[var(--text-secondary)]">{conv.updatedAt ? new Date(tsMs(conv.updatedAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className={`text-[9px] truncate ${active ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>{conv.lastMessage?.text || 'Yeni sohbet'}</p>
                </div>
              </button>
            );
          })
        ) : (
          <>
            <div className="px-2 py-1.5 text-[7px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Kullanıcılar</div>
            {filteredContacts.length === 0 ? <div className="text-center py-6 text-[10px] text-[var(--text-secondary)]">Kullanıcı bulunamadı</div> : filteredContacts.map(c => (
              <button key={c.id} onClick={() => handleContactClick(c)} className="w-full text-left p-2 rounded-lg hover:bg-[var(--bg-default)] border border-transparent transition-all flex items-center gap-2.5">
                <img src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt={c.name} className="w-8 h-8 rounded-lg bg-[var(--bg-default)] border border-[var(--border-color)] flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[11px] text-[var(--text-primary)] truncate">{c.name}</h3>
                  <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider truncate">{c.role || 'Kullanıcı'}</p>
                </div>
                <Mail className="w-3 h-3 text-[var(--text-secondary)]" />
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
