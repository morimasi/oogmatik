import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Users, MoreVertical, Circle } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import type { Contact } from '../types';

interface ContactPanelProps {
  onSelectContact: (contactId: string) => void;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({ onSelectContact }) => {
  const { contacts, activeContactId, searchQuery, setSearchQuery, loading } =
    useMessagesStore();

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Dün';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg-primary)]">
        <div className="w-5 h-5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] border-r border-[var(--border-color)]">
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--accent-color)]" />
            Mesajlar
          </h2>
          <span className="text-[9px] font-bold text-[var(--text-muted)]">
            {contacts.length} kişi
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Kişi ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend text-xs outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`w-full text-left p-3 border-b border-[var(--border-color)] hover:bg-[var(--surface-glass)] transition-colors group ${
              activeContactId === contact.id ? 'bg-[var(--accent-muted)]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                {contact.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[7px] font-black rounded-full flex items-center justify-center shadow-lg">
                    {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {contact.name}
                  </p>
                  {contact.lastMessage && (
                    <span className="text-[8px] text-[var(--text-muted)] shrink-0">
                      {formatTime(contact.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {contact.lastMessage && (
                    <p className="text-[10px] text-[var(--text-secondary)] truncate flex-1">
                      {contact.lastMessage.isDeleted
                        ? '[Bu mesaj silindi]'
                        : contact.lastMessage.content.substring(0, 60)}
                    </p>
                  )}
                  {contact.unreadCount > 0 && (
                    <Circle className="w-2 h-2 fill-[var(--accent-color)] text-[var(--accent-color)] shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="p-6 text-center">
            <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {searchQuery ? 'Eşleşen kişi bulunamadı.' : 'Henüz mesajlaşma yok.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
