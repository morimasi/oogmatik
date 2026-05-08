import React from 'react';
import { User } from '../../types';

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
    <div className="flex items-center justify-between p-6 bg-[var(--bg-paper)] border-b border-[var(--border-color)]">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white font-bold text-lg">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {user?.name || 'Kullanıcı'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>{user?.email}</span>
              {user?.createdAt && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isReadOnly && (
        <div className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs rounded-lg">
          Salt Okunur
        </div>
      )}
    </div>
  );
};