import React from 'react';
import { Copy, LogOut, Users, Wifi, WifiOff } from 'lucide-react';
import type { CollaborationStatus, RemotePeer } from '../collaboration/collabModel';

interface CollaborationBarProps {
  roomCode: string;
  status: CollaborationStatus;
  peers: RemotePeer[];
  message: string | null;
  selfColor: string;
  onLeave: () => void;
  onCopyLink: () => void;
}

const STATUS_LABELS: Record<CollaborationStatus, string> = {
  idle: 'Kapalı',
  connecting: 'Bağlanıyor…',
  connected: 'Canlı',
  error: 'Bağlantı yok',
};

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/** Editör üstünde ince durum şeridi: oda kodu, canlı bağlantı ve katılımcılar. */
export const CollaborationBar = ({
  roomCode,
  status,
  peers,
  message,
  selfColor,
  onLeave,
  onCopyLink,
}: CollaborationBarProps) => {
  const isLive = status === 'connected';
  const tone =
    status === 'error'
      ? 'border-rose-400/40 bg-rose-500/10 text-rose-600'
      : isLive
        ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-600'
        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]';

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-paper)]/80 px-3 py-1.5">
      <span
        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${tone}`}
        role="status"
        aria-live="polite"
      >
        {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
        {STATUS_LABELS[status]}
      </span>

      <span className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
        Oda: {roomCode}
      </span>

      <button
        type="button"
        onClick={onCopyLink}
        title="Ortak çalışma bağlantısını kopyala"
        className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
      >
        <Copy size={11} /> Bağlantı
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
          <Users size={11} /> {peers.length + 1}
        </span>
        <span
          title="Siz"
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--bg-paper)] text-[7px] font-black text-white"
          style={{ backgroundColor: selfColor }}
        >
          S
        </span>
        {peers.map((peer) => (
          <span
            key={peer.clientId}
            title={peer.name}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--bg-paper)] text-[7px] font-black text-white"
            style={{ backgroundColor: peer.color }}
          >
            {initialsOf(peer.name)}
          </span>
        ))}
        <button
          type="button"
          onClick={onLeave}
          title="Ortak çalışmadan ayrıl"
          className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:border-rose-400 hover:text-rose-500"
        >
          <LogOut size={11} /> Ayrıl
        </button>
      </div>

      {message && (
        <p className="w-full text-[9px] font-bold text-amber-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
};

export default CollaborationBar;
