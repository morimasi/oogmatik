import React from 'react';
import type { AuditAction } from '../../types/admin';
import { useAuditLog } from '../../hooks/useAuditLog';

const ACTION_LABELS: Partial<Record<AuditAction, string>> = {
  'user.created': 'Kullanıcı Oluşturuldu',
  'user.updated': 'Kullanıcı Güncellendi',
  'user.deleted': 'Kullanıcı Silindi',
  'user.login': 'Giriş Yapıldı',
  'user.logout': 'Çıkış Yapıldı',
  'user.role_changed': 'Rol Değiştirildi',
  'worksheet.created': 'Çalışma Oluşturuldu',
  'worksheet.updated': 'Çalışma Güncellendi',
  'worksheet.deleted': 'Çalışma Silindi',
  'worksheet.exported': 'Çalışma Dışa Aktarıldı',
  'permission.granted': 'İzin Verildi',
  'permission.revoked': 'İzin Kaldırıldı',
  'system.settings_changed': 'Sistem Ayarları Değiştirildi',
  'system.backup': 'Yedekleme Yapıldı',
  'cloud.sync': 'Bulut Senkronizasyon',
  'batch.export': 'Toplu Dışa Aktarma',
};

const SEVERITY_STYLES = {
  info: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  warning: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  error: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

export const AuditLog: React.FC = () => {
  const {
    filteredEntries,
    loading,
    filter,
    setFilter,
    resetFilter,
    clearLog,
    exportAsCsv,
    exportAsJson,
    page,
    setPage,
    totalPages,
  } = useAuditLog();

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>⏳ Yükleniyor...</div>;
  }

  return (
    <section aria-label="Denetim Günlüğü" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>📋 Denetim Günlüğü</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={exportAsCsv} style={btnStyle}>📥 CSV</button>
          <button onClick={exportAsJson} style={btnStyle}>📥 JSON</button>
          <button onClick={clearLog} style={{ ...btnStyle, background: '#ef4444' }}>🗑️ Temizle</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          placeholder="Ara..."
          value={filter.search ?? ''}
          onChange={(e) => setFilter({ search: e.target.value })}
          style={inputStyle}
          aria-label="Günlük ara"
        />
        <select
          value={filter.severity ?? ''}
          onChange={(e) => setFilter({ severity: (e.target.value as 'info' | 'warning' | 'error' | '') || '' })}
          style={selectStyle}
          aria-label="Önem filtresi"
        >
          <option value="">Tüm Önemler</option>
          <option value="info">ℹ️ Bilgi</option>
          <option value="warning">⚠️ Uyarı</option>
          <option value="error">❌ Hata</option>
        </select>
        <input
          type="date"
          value={filter.dateFrom ?? ''}
          onChange={(e) => setFilter({ dateFrom: e.target.value })}
          style={selectStyle}
          aria-label="Başlangıç tarihi"
        />
        <input
          type="date"
          value={filter.dateTo ?? ''}
          onChange={(e) => setFilter({ dateTo: e.target.value })}
          style={selectStyle}
          aria-label="Bitiş tarihi"
        />
        <button onClick={resetFilter} style={{ ...btnStyle, background: '#64748b' }}>Sıfırla</button>
      </div>

      {/* Log entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredEntries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Kayıt bulunamadı</p>
        ) : (
          filteredEntries.map((entry) => {
            const sev = SEVERITY_STYLES[entry.severity];
            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  background: entry.severity !== 'info' ? sev.bg : '#fff',
                  fontSize: '0.82rem',
                }}
                role="listitem"
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sev.dot, marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                    {ACTION_LABELS[entry.action] ?? entry.action}
                    {entry.targetLabel && <span style={{ fontWeight: 400, color: '#64748b' }}> — {entry.targetLabel}</span>}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {entry.actorName} ({entry.actorRole}) •{' '}
                    {new Date(entry.timestamp).toLocaleString('tr-TR')}
                    {entry.ipAddress && <> • {entry.ipAddress}</>}
                  </div>
                </div>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: sev.bg,
                    color: sev.color,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    border: `1px solid ${sev.dot}44`,
                    flexShrink: 0,
                  }}
                >
                  {entry.severity.toUpperCase()}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{ ...btnStyle, background: '#e2e8f0', color: '#374151' }}
          >
            ‹ Önceki
          </button>
          <span style={{ fontSize: '0.85rem', padding: '5px 10px', color: '#64748b' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            style={{ ...btnStyle, background: '#e2e8f0', color: '#374151' }}
          >
            Sonraki ›
          </button>
        </div>
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
  minWidth: 160,
};

const selectStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: '0.85rem',
};

AuditLog.displayName = 'AuditLog';
