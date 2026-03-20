import React, { useState, useCallback } from 'react';
import type { ManagedUser, UserRoleType } from '../../types/admin';

interface UserManagementProps {
  users?: ManagedUser[];
  onRoleChange?: (userId: string, role: UserRoleType) => void;
  onStatusChange?: (userId: string, status: ManagedUser['status']) => void;
  onDeleteUser?: (userId: string) => void;
}

const ROLE_LABELS: Record<UserRoleType, string> = {
  admin: '👑 Yönetici',
  teacher: '👩‍🏫 Öğretmen',
  student: '🎒 Öğrenci',
  parent: '👨‍👩‍👦 Veli',
  guest: '👤 Misafir',
};

const STATUS_LABELS: Record<ManagedUser['status'], string> = {
  active: '🟢 Aktif',
  inactive: '🟡 Pasif',
  suspended: '🔴 Askıya Alındı',
};

// Seed data
function generateMockUsers(): ManagedUser[] {
  return [
    { id: 'u1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'admin', status: 'active', createdAt: '2024-01-10T10:00:00Z', lastLoginAt: new Date().toISOString(), worksheetCount: 42, exportCount: 128 },
    { id: 'u2', name: 'Ayşe Demir', email: 'ayse@example.com', role: 'teacher', status: 'active', createdAt: '2024-02-15T08:30:00Z', lastLoginAt: new Date(Date.now() - 3600000).toISOString(), worksheetCount: 87, exportCount: 243 },
    { id: 'u3', name: 'Mehmet Kaya', email: 'mehmet@example.com', role: 'student', status: 'active', createdAt: '2024-03-01T09:00:00Z', lastLoginAt: new Date(Date.now() - 86400000).toISOString(), worksheetCount: 12, exportCount: 34 },
    { id: 'u4', name: 'Fatma Şahin', email: 'fatma@example.com', role: 'teacher', status: 'inactive', createdAt: '2024-01-20T11:00:00Z', worksheetCount: 31, exportCount: 89 },
    { id: 'u5', name: 'Ali Çelik', email: 'ali@example.com', role: 'student', status: 'suspended', createdAt: '2024-04-05T14:00:00Z', worksheetCount: 5, exportCount: 8 },
  ];
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users: externalUsers,
  onRoleChange,
  onStatusChange,
  onDeleteUser,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>(externalUsers ?? generateMockUsers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ManagedUser['status'] | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRoleChange = useCallback(
    (userId: string, role: UserRoleType) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      onRoleChange?.(userId, role);
    },
    [onRoleChange],
  );

  const handleStatusChange = useCallback(
    (userId: string, status: ManagedUser['status']) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
      onStatusChange?.(userId, status);
    },
    [onStatusChange],
  );

  const handleDeleteUser = useCallback(
    (userId: string) => {
      if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      onDeleteUser?.(userId);
    },
    [onDeleteUser],
  );

  const filteredUsers = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  const handleBulkDeactivate = useCallback(() => {
    setUsers((prev) =>
      prev.map((u) => (selectedIds.has(u.id) ? { ...u, status: 'inactive' as const } : u)),
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const exportUsers = useCallback(() => {
    const csv = ['ID,Ad,Email,Rol,Durum,Oluşturulma', ...filteredUsers.map((u) =>
      `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.createdAt}"`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredUsers]);

  return (
    <section aria-label="Kullanıcı Yönetimi" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>👥 Kullanıcı Yönetimi</h2>
        <button onClick={exportUsers} style={btnStyle}>📥 CSV İndir</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          placeholder="Ad veya email ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
          aria-label="Kullanıcı ara"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRoleType | 'all')} style={selectStyle} aria-label="Rol filtresi">
          <option value="all">Tüm Roller</option>
          {(Object.keys(ROLE_LABELS) as UserRoleType[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ManagedUser['status'] | 'all')} style={selectStyle} aria-label="Durum filtresi">
          <option value="all">Tüm Durumlar</option>
          {(['active', 'inactive', 'suspended'] as const).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem' }}>{selectedIds.size} kullanıcı seçildi</span>
          <button onClick={handleBulkDeactivate} style={{ ...btnStyle, background: '#f59e0b' }}>Pasife Al</button>
          <button onClick={() => setSelectedIds(new Set())} style={btnStyle}>Seçimi Kaldır</button>
        </div>
      )}

      {/* User table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} role="grid" aria-label="Kullanıcı listesi">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={thStyle}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(filteredUsers.map((u) => u.id)) : new Set())} aria-label="Tümünü seç" /></th>
              <th style={thStyle}>Ad</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Durum</th>
              <th style={thStyle}>Çalışmalar</th>
              <th style={thStyle}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                <tr
                  style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                  aria-expanded={expandedId === user.id}
                >
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        e.target.checked ? next.add(user.id) : next.delete(user.id);
                        setSelectedIds(next);
                      }}
                      aria-label={`${user.name} seç`}
                    />
                  </td>
                  <td style={tdStyle}>{user.name}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRoleType)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 4px' }}
                      aria-label={`${user.name} rolünü değiştir`}
                    >
                      {(Object.keys(ROLE_LABELS) as UserRoleType[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}>{STATUS_LABELS[user.status]}</td>
                  <td style={tdStyle}>{user.worksheetCount}</td>
                  <td style={{ ...tdStyle, display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')} style={{ ...btnStyle, fontSize: '0.7rem', padding: '2px 6px' }}>
                      {user.status === 'active' ? 'Pasife Al' : 'Aktifleştir'}
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} style={{ ...btnStyle, background: '#ef4444', fontSize: '0.7rem', padding: '2px 6px' }} aria-label={`${user.name} sil`}>
                      Sil
                    </button>
                  </td>
                </tr>
                {expandedId === user.id && (
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={7} style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                        <div><strong>Son Giriş:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('tr-TR') : '—'}</div>
                        <div><strong>Oluşturulma:</strong> {new Date(user.createdAt).toLocaleDateString('tr-TR')}</div>
                        <div><strong>Dışa Aktarma:</strong> {user.exportCount}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Kullanıcı bulunamadı</p>
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
