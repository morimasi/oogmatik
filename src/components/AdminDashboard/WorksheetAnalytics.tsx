import React, { useCallback } from 'react';
import type { WorksheetAnalyticEntry, ExportAnalyticEntry } from '../../types/admin';
import { useAdminStats } from '../../hooks/useAdminStats';

interface WorksheetAnalyticsProps {
  /** Override analytics data (for testing) */
  worksheetData?: WorksheetAnalyticEntry[];
  exportData?: ExportAnalyticEntry[];
}

function SimpleBarChart({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data, 1);
  return (
    <div aria-label={label} style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: '#3b82f6',
            borderRadius: '2px 2px 0 0',
            opacity: 0.7 + (i / data.length) * 0.3,
            minHeight: 2,
          }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

export const WorksheetAnalytics: React.FC<WorksheetAnalyticsProps> = ({
  worksheetData: externalWorksheetData,
  exportData: externalExportData,
}) => {
  const { stats, worksheetAnalytics, exportAnalytics, exportTrend, loading, refresh, lastUpdatedAt } = useAdminStats();

  const wsData = externalWorksheetData ?? worksheetAnalytics;
  const expData = externalExportData ?? exportAnalytics;

  const handleExportCsv = useCallback(() => {
    const rows = wsData.map((w) =>
      `"${w.templateId}","${w.templateName}",${w.useCount},${w.exportCount},${w.avgSessionMinutes}`,
    );
    const csv = ['ID,Şablon,Kullanım,Dışa Aktarma,Ort. Süre(dk)', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [wsData]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>⏳ Yükleniyor...</div>;
  }

  // Group export trend by week
  const trendValues = exportTrend.slice(-14).map((t) => t.value);

  // Aggregate export format totals
  const formatTotals: Record<string, number> = {};
  expData.forEach((e) => {
    formatTotals[e.format] = (formatTotals[e.format] ?? 0) + e.count;
  });

  return (
    <section aria-label="Çalışma Kağıdı Analitikleri" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>📊 Çalışma Kağıdı Analitikleri</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={refresh} style={btnStyle} title="Yenile">🔄</button>
          <button onClick={handleExportCsv} style={btnStyle}>📥 CSV</button>
        </div>
      </div>

      {lastUpdatedAt && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>
          Son güncelleme: {new Date(lastUpdatedAt).toLocaleTimeString('tr-TR')}
        </p>
      )}

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Toplam Çalışma', value: stats?.totalWorksheets ?? '—', icon: '📄', color: '#3b82f6' },
          { label: 'Bu Hafta İndir', value: stats?.exportsThisWeek ?? '—', icon: '⬇', color: '#10b981' },
          { label: 'Bugün İndir', value: stats?.exportsToday ?? '—', icon: '📅', color: '#f59e0b' },
          { label: 'Aktif Kullanıcı', value: stats?.activeUsers ?? '—', icon: '👥', color: '#8b5cf6' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${color}22`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Export trend chart */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>📈 Dışa Aktarma Trendi (14 gün)</h3>
        <SimpleBarChart data={trendValues.length > 0 ? trendValues : [0]} label="14 günlük dışa aktarma trendi" />
      </div>

      {/* Format breakdown */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151' }}>📋 Format Dağılımı</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
          {Object.entries(formatTotals).map(([fmt, count]) => (
            <div key={fmt} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: '8px 6px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{fmt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Template popularity table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <h3 style={{ margin: '12px 14px 8px', fontSize: '0.9rem', color: '#374151' }}>🏆 En Popüler Şablonlar</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} role="grid">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Şablon</th>
                <th style={thStyle}>Kullanım</th>
                <th style={thStyle}>İndir</th>
                <th style={thStyle}>Ort. Süre</th>
              </tr>
            </thead>
            <tbody>
              {wsData.map((ws) => (
                <tr key={ws.templateId} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{ws.popularityRank}</td>
                  <td style={tdStyle}>{ws.templateName}</td>
                  <td style={tdStyle}>{ws.useCount}</td>
                  <td style={tdStyle}>{ws.exportCount}</td>
                  <td style={tdStyle}>{ws.avgSessionMinutes} dk</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
