import React, { useCallback } from 'react';
import type { WorksheetAnalyticEntry } from '../../types/admin';
import { useAdminStats } from '../../hooks/useAdminStats';

interface WorksheetAnalyticsProps {
  /** Test/önizleme için veri geçersiz kılma */
  worksheetData?: WorksheetAnalyticEntry[];
}

function SimpleBarChart({ data, labels, label }: { data: number[]; labels: string[]; label: string }) {
  const max = Math.max(...data, 1);
  return (
    <div aria-label={label} style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
      {data.map((value, index) => (
        <div
          key={labels[index] ?? index}
          style={{
            flex: 1,
            height: `${(value / max) * 100}%`,
            background: '#3b82f6',
            borderRadius: '2px 2px 0 0',
            opacity: 0.7 + (index / Math.max(data.length, 1)) * 0.3,
            minHeight: value > 0 ? 4 : 2,
          }}
          title={`${labels[index] ?? ''}: ${value}`}
        />
      ))}
    </div>
  );
}

function formatDate(value: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('tr-TR');
}

export const WorksheetAnalytics: React.FC<WorksheetAnalyticsProps> = ({ worksheetData }) => {
  const {
    stats,
    productionTrend,
    worksheetAnalytics,
    categoryBreakdown,
    loading,
    error,
    refresh,
    lastUpdatedAt,
  } = useAdminStats();

  const rows = worksheetData ?? worksheetAnalytics;

  const handleExportCsv = useCallback(() => {
    const header = 'Kategori,Üretim,Son Üretim';
    const body = rows.map((row) =>
      `"${(row.templateName ?? 'Adsız').replace(/"/g, '""')}",${row.count},"${row.date}"`,
    );
    const csv = [header, ...body].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `uretim-analitigi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [rows]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>⏳ Yükleniyor...</div>;
  }

  const trendValues = productionTrend.map((entry) => entry.value);
  const trendLabels = productionTrend.map((entry) => entry.label ?? entry.date);
  const totalProduced = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section aria-label="Çalışma Kağıdı Analitikleri" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>📊 Üretim Analitiği</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Kaynak: <code>saved_worksheets</code> arşiv koleksiyonu (gerçek kayıtlar)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={refresh} style={btnStyle} title="Yenile">🔄</button>
          <button onClick={handleExportCsv} style={btnStyle} disabled={rows.length === 0}>📥 CSV</button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.8rem' }}>
          Veriler yüklenemedi: {error}
        </div>
      )}

      {lastUpdatedAt && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>
          Son güncelleme: {new Date(lastUpdatedAt).toLocaleTimeString('tr-TR')}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Toplam Kullanıcı', value: stats?.totalUsers ?? 0, icon: '👥', color: '#8b5cf6' },
          { label: 'Aktif Kullanıcı', value: stats?.activeUsers ?? 0, icon: '🟢', color: '#10b981' },
          { label: 'Toplam Çalışma', value: stats?.totalWorksheets ?? 0, icon: '📄', color: '#3b82f6' },
          { label: 'Bugün Üretilen', value: stats?.exportsToday ?? 0, icon: '📅', color: '#f59e0b' },
          { label: 'Son 7 Gün', value: stats?.exportsThisWeek ?? 0, icon: '📈', color: '#0d9488' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${color}22`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color }}>{value.toLocaleString('tr-TR')}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>📈 Günlük Üretim (14 gün)</h3>
        <SimpleBarChart
          data={trendValues.length > 0 ? trendValues : [0]}
          labels={trendLabels.length > 0 ? trendLabels : ['—']}
          label="14 günlük üretim trendi"
        />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>📋 Kategori Dağılımı</h3>
        {categoryBreakdown.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Henüz kayıtlı çalışma yok.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categoryBreakdown.map((slice) => {
              const percent = totalProduced > 0 ? Math.round((slice.count / totalProduced) * 100) : 0;
              return (
                <div key={slice.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                    <span style={{ color: '#374151' }}>{slice.title}</span>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{slice.count} · %{percent}</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: '#3b82f6', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <h3 style={{ margin: '12px 14px 8px', fontSize: '0.9rem', color: '#374151' }}>🏆 En Çok Üretilen Kategoriler</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} role="grid" aria-label="Kategori üretim tablosu">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Kategori / Etkinlik</th>
                <th style={thStyle}>Üretim</th>
                <th style={thStyle}>Son Üretim</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{row.popularityRank ?? index + 1}</td>
                  <td style={tdStyle}>{row.templateName ?? 'Adsız'}</td>
                  <td style={tdStyle}>{row.count}</td>
                  <td style={tdStyle}>{formatDate(row.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p style={{ margin: 0, padding: '16px 14px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
            Arşivde çalışma bulunmuyor.
          </p>
        )}
      </div>
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

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.78rem',
  color: '#64748b',
};

const tdStyle: React.CSSProperties = {
  padding: '7px 10px',
};

WorksheetAnalytics.displayName = 'WorksheetAnalytics';
