import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { User, UserRole } from '../../types/user';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { logError } from '../../utils/logger';

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: '🌟 Süper Admin',
  admin: '👑 Yönetici',
  teacher: '👩‍🏫 Öğretmen',
  editor: '📝 Editör',
  student: '🎒 Öğrenci',
  parent: '👨‍👩‍👦 Veli',
  guest: '👤 Misafir',
  user: '👤 Kullanıcı',
};

const STATUS_LABELS: Record<User['status'], string> = {
  active: '🟢 Aktif',
  pending: '🟡 Beklemede',
  suspended: '🔴 Askıya Alındı',
};

type StatusFilter = 'all' | User['status'];

/**
 * Toplu Kullanıcı İşlemleri — gerçek Firestore kullanıcı koleksiyonu üzerinde
 * rol değiştirme, askıya alma, silme ve CSV dışa aktarma.
 */
export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const toast = useToastStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const fetched = await adminService.getAllUsers();
      setUsers(fetched);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setLoadError(message);
      logError('Kullanıcı listesi yüklenemedi', { error: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr-TR');
    return users.filter((user) => {
      if (term && !`${user.name} ${user.email}`.toLocaleLowerCase('tr-TR').includes(term)) return false;
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleRoleChange = useCallback(
    async (target: User, nextRole: UserRole) => {
      if (target.id === currentUser?.id) {
        toast.error('Kendi rolünüzü bu panelden değiştiremezsiniz.');
        return;
      }
      setBusyId(target.id);
      try {
        await adminService.updateUserRole(target.id, nextRole);
        setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u)));
        toast.success(`${target.name} artık ${ROLE_LABELS[nextRole]} olarak yetkilendirildi.`);
      } catch (error: unknown) {
        logError('Kullanıcı rolü güncellenemedi', { error: error instanceof Error ? error.message : String(error) });
        toast.error('Rol güncellenemedi. Lütfen tekrar deneyin.');
      } finally {
        setBusyId(null);
      }
    },
    [currentUser?.id, toast],
  );

  const handleStatusChange = useCallback(
    async (target: User, nextStatus: User['status']) => {
      setBusyId(target.id);
      try {
        await adminService.updateUserStatus(target.id, nextStatus);
        setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, status: nextStatus } : u)));
        toast.success(`${target.name} → ${STATUS_LABELS[nextStatus]}`);
      } catch (error: unknown) {
        logError('Kullanıcı durumu güncellenemedi', { error: error instanceof Error ? error.message : String(error) });
        toast.error('Durum güncellenemedi. Lütfen tekrar deneyin.');
      } finally {
        setBusyId(null);
      }
    },
    [toast],
  );

  const handleDelete = useCallback(
    async (target: User) => {
      if (target.id === currentUser?.id) {
        toast.error('Kendi hesabınızı silemezsiniz.');
        return;
      }
      const confirmation = window.confirm(
        `${target.name} kullanıcısı ve bağlı öğrencileri kalıcı olarak silinecek. Onaylıyor musunuz?`,
      );
      if (!confirmation) return;

      setBusyId(target.id);
      try {
        await adminService.deleteUser(target.id);
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(target.id);
          return next;
        });
        toast.success(`${target.name} silindi.`);
      } catch (error: unknown) {
        logError('Kullanıcı silinemedi', { error: error instanceof Error ? error.message : String(error) });
        toast.error('Kullanıcı silinemedi. Lütfen tekrar deneyin.');
      } finally {
        setBusyId(null);
      }
    },
    [currentUser?.id, toast],
  );

  const handleBulkSuspend = useCallback(async () => {
    const targets = users.filter((u) => selectedIds.has(u.id) && u.id !== currentUser?.id && u.status !== 'suspended');
    if (targets.length === 0) {
      toast.error('Askıya alınacak uygun kullanıcı seçilmedi.');
      return;
    }

    setBulkBusy(true);
    const results = await Promise.allSettled(
      targets.map((target) => adminService.updateUserStatus(target.id, 'suspended')),
    );
    setBulkBusy(false);

    const succeeded = targets.filter((_, index) => results[index]?.status === 'fulfilled').map((t) => t.id);
    const failedCount = results.filter((result) => result.status === 'rejected').length;

    if (succeeded.length > 0) {
      const succeededSet = new Set(succeeded);
      setUsers((prev) => prev.map((u) => (succeededSet.has(u.id) ? { ...u, status: 'suspended' } : u)));
    }
    setSelectedIds(new Set());

    if (failedCount > 0) {
      logError('Toplu askıya alma kısmen başarısız', { failedCount, total: targets.length });
      toast.error(`${succeeded.length} kullanıcı askıya alındı, ${failedCount} işlem başarısız oldu.`);
    } else {
      toast.success(`${succeeded.length} kullanıcı askıya alındı.`);
    }
  }, [users, selectedIds, currentUser?.id, toast]);

  const exportCsv = useCallback(() => {
    const header = 'ID,Ad,E-posta,Rol,Durum,Çalışma Sayısı,Kayıt Tarihi';
    const rows = filteredUsers.map((user) =>
      `"${user.id}","${user.name.replace(/"/g, '""')}","${user.email}","${user.role}","${user.status}",${user.worksheetCount ?? 0},"${user.createdAt ?? ''}"`,
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kullanicilar-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [filteredUsers]);

  const allVisibleSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.has(user.id));

  return (
    <section aria-label="Toplu Kullanıcı İşlemleri" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>👥 Toplu Kullanıcı İşlemleri</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {users.length} kayıtlı kullanıcı · Firestore <code>users</code> koleksiyonu
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => void loadUsers()} style={btnStyle} disabled={loading}>🔄 Yenile</button>
          <button onClick={exportCsv} style={btnStyle} disabled={filteredUsers.length === 0}>📥 CSV İndir</button>
        </div>
      </div>

      {loadError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.8rem' }}>
          Kullanıcılar yüklenemedi: {loadError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          placeholder="Ad veya e-posta ara..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={inputStyle}
          aria-label="Kullanıcı ara"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as UserRole | 'all')}
          style={selectStyle}
          aria-label="Rol filtresi"
        >
          <option value="all">Tüm Roller</option>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          style={selectStyle}
          aria-label="Durum filtresi"
        >
          <option value="all">Tüm Durumlar</option>
          {(Object.keys(STATUS_LABELS) as User['status'][]).map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem' }}>{selectedIds.size} kullanıcı seçildi</span>
          <button onClick={() => void handleBulkSuspend()} style={{ ...btnStyle, background: '#f59e0b' }} disabled={bulkBusy}>
            {bulkBusy ? 'İşleniyor...' : 'Seçilenleri Askıya Al'}
          </button>
          <button onClick={() => setSelectedIds(new Set())} style={{ ...btnStyle, background: '#64748b' }}>Seçimi Kaldır</button>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>⏳ Kullanıcılar yükleniyor...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} role="grid" aria-label="Kullanıcı listesi">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) =>
                      setSelectedIds(event.target.checked ? new Set(filteredUsers.map((u) => u.id)) : new Set())
                    }
                    aria-label="Görünen tümünü seç"
                  />
                </th>
                <th style={thStyle}>Ad</th>
                <th style={thStyle}>E-posta</th>
                <th style={thStyle}>Rol</th>
                <th style={thStyle}>Durum</th>
                <th style={thStyle}>Çalışma</th>
                <th style={thStyle}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const isBusy = busyId === user.id;
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0', opacity: isBusy ? 0.6 : 1 }}>
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={(event) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (event.target.checked) next.add(user.id);
                            else next.delete(user.id);
                            return next;
                          });
                        }}
                        aria-label={`${user.name} seç`}
                      />
                    </td>
                    <td style={tdStyle}>
                      {user.name}
                      {isSelf && <span style={{ marginLeft: 6, fontSize: '0.65rem', color: '#3b82f6', fontWeight: 700 }}>(siz)</span>}
                    </td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <select
                        value={user.role}
                        disabled={isSelf || isBusy}
                        onChange={(event) => void handleRoleChange(user, event.target.value as UserRole)}
                        style={{ fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 4px' }}
                        aria-label={`${user.name} rolünü değiştir`}
                      >
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                          <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>{STATUS_LABELS[user.status] ?? user.status}</td>
                    <td style={tdStyle}>{user.worksheetCount ?? 0}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => void handleStatusChange(user, user.status === 'active' ? 'suspended' : 'active')}
                        disabled={isSelf || isBusy}
                        style={{ ...btnStyle, fontSize: '0.7rem', padding: '2px 6px', background: user.status === 'active' ? '#f59e0b' : '#10b981' }}
                      >
                        {user.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                      </button>
                      <button
                        onClick={() => void handleDelete(user)}
                        disabled={isSelf || isBusy}
                        style={{ ...btnStyle, background: '#ef4444', fontSize: '0.7rem', padding: '2px 6px', marginLeft: 4 }}
                        aria-label={`${user.name} sil`}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
          {users.length === 0 ? 'Firestore kullanıcı koleksiyonunda kayıt bulunamadı.' : 'Filtreye uyan kullanıcı yok.'}
        </p>
      )}
    </section>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '5px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  background: '#3b82f6',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: '0.85rem',
  flex: 1,
  minWidth: 180,
};

const selectStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: '0.85rem',
};

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.8rem',
  color: '#64748b',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  verticalAlign: 'middle',
};

UserManagement.displayName = 'UserManagement';
