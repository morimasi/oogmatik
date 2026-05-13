import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Users, ChevronDown, ChevronRight, Circle, Crown, Shield, GraduationCap, User, BookOpen, Pen, Monitor } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { ROLE_LABELS, ROLE_ORDER, ROLE_ICONS } from '../types';
import type { Contact } from '../types';

interface ContactPanelProps {
  onSelectContact: (contactId: string) => void;
}

const roleIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  superadmin: Crown,
  admin: Shield,
  teacher: Monitor,
  editor: Pen,
  parent: Users,
  student: GraduationCap,
  user: User,
  guest: User,
};

export const ContactPanel: React.FC<ContactPanelProps> = ({ onSelectContact }) => {
  const { contacts, activeContactId, searchQuery, setSearchQuery, loading } =
    useMessagesStore();

  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(ROLE_ORDER));

  const toggleRole = (role: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const { grouped, totalCount } = useMemo(() => {
    const filtered = contacts.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, Contact[]> = {};
    ROLE_ORDER.forEach((r) => (groups[r] = []));

    filtered.forEach((c) => {
      const role = c.role || 'user';
      if (groups[role]) groups[role].push(c);
      else groups['user'].push(c);
    });

    const sorted: Array<{ role: string; label: string; contacts: Contact[] }> = [];
    ROLE_ORDER.forEach((r) => {
      if (groups[r].length > 0) {
        sorted.push({ role: r, label: ROLE_LABELS[r] || r, contacts: groups[r] });
      }
    });

    return { grouped: sorted, totalCount: contacts.length };
  }, [contacts, searchQuery]);

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
            {totalCount} kişi
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="İsim veya rol ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend text-xs outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {grouped.map((group) => {
          const Icon = roleIconMap[group.role] || Users;
          const isExpanded = searchQuery ? true : expandedRoles.has(group.role);

          return (
            <div key={group.role} className="border-b border-[var(--border-color)] last:border-b-0">
              <button
                onClick={() => toggleRole(group.role)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--surface-glass)] transition-colors sticky top-0 z-10"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                )}
                <Icon className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex-1 text-left">
                  {group.label}
                </span>
                <span className="text-[8px] font-bold text-[var(--text-muted)]">
                  {group.contacts.length}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {group.contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className={`w-full text-left p-2.5 hover:bg-[var(--surface-glass)] transition-colors group ${
                          activeContactId === contact.id ? 'bg-[var(--accent-muted)]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                              contact.unreadCount > 0
                                ? 'bg-gradient-to-br from-[var(--accent-color)] to-purple-600'
                                : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                            }`}>
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
                              <p className="text-xs font-bold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                                {contact.name}
                                <span className="text-[7px] font-medium text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                                  {contact.role === 'superadmin' ? 'Yönetici' : contact.role === 'teacher' ? 'Öğretmen' : contact.role === 'parent' ? 'Veli' : contact.role === 'student' ? 'Öğrenci' : ''}
                                </span>
                              </p>
                              {contact.lastMessage && (
                                <span className="text-[7px] text-[var(--text-muted)] shrink-0">
                                  {formatTime(contact.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {contact.lastMessage ? (
                                <p className="text-[9px] text-[var(--text-secondary)] truncate flex-1">
                                  {contact.lastMessage.isDeleted
                                    ? '[Bu mesaj silindi]'
                                    : contact.lastMessage.content.substring(0, 50)}
                                </p>
                              ) : (
                                <p className="text-[9px] text-[var(--text-muted)] italic flex-1">
                                  Henüz mesajlaşma yok
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {totalCount === 0 && (
          <div className="p-6 text-center">
            <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {searchQuery ? 'Eşleşen kişi bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
