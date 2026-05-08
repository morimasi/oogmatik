import React from 'react';
import { User } from '../../../types';

interface ProfileHeaderProps {
  user: User | null;
  isReadOnly: boolean;
  onBack: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isReadOnly,
  onBack,
}) => {
  return (
    <div className="relative overflow-hidden bg-[var(--bg-paper)] border-b border-[var(--border-color)]">
      {/* Premium Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[60px] -ml-24 -mb-24 rounded-full"></div>

      <div className="relative flex items-center justify-between p-8 lg:px-12">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-primary)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          </button>

          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-[2rem] p-1 bg-gradient-to-tr from-[var(--accent-color)] to-purple-500 shadow-2xl">
                <div className="w-full h-full rounded-[1.8rem] bg-[var(--bg-paper)] overflow-hidden flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-[var(--accent-color)]">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[var(--bg-paper)] rounded-full shadow-lg"></div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {user?.name || 'Oogmatik Kullanıcısı'}
                </h1>
                <span className="px-3 py-1 bg-[var(--accent-muted)] text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[var(--accent-color)]/20">
                  {user?.role === 'admin' ? 'Yönetici' : 'Eğitmen'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-[var(--accent-color)]/40"></i>
                  <span>{user?.email}</span>
                </div>
                {user?.createdAt && (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check text-[var(--accent-color)]/40"></i>
                    <span>Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="text-right mr-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hesap Durumu</p>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Aktif & Güvenli</p>
          </div>
          {isReadOnly && (
            <div className="px-5 py-2 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-500/20">
              <i className="fa-solid fa-eye mr-2"></i>
              Görüntüleme Modu
            </div>
          )}
        </div>
      </div>
    </div>
  );
};