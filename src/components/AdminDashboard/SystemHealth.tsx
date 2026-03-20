import React, { useState, useEffect, useCallback } from 'react';
import type { SystemHealthReport, ServiceHealth, ServiceStatus } from '../../types/admin';

const STATUS_STYLES: Record<ServiceStatus, { bg: string; color: string; label: string; dot: string }> = {
  operational: { bg: '#f0fdf4', color: '#16a34a', label: '✅ Çalışıyor', dot: '#22c55e' },
  degraded: { bg: '#fffbeb', color: '#d97706', label: '⚠️ Yavaş', dot: '#f59e0b' },
  down: { bg: '#fef2f2', color: '#dc2626', label: '❌ Çevrimdışı', dot: '#ef4444' },
};

function generateHealthReport(): SystemHealthReport {
  const makeService = (name: string, status: ServiceStatus, latencyMs?: number): ServiceHealth => ({
    name,
    status,
    latencyMs,
    lastCheckedAt: new Date().toISOString(),
    message: status === 'degraded' ? 'Yüksek gecikme tespit edildi' : undefined,
  });

  return {
    overall: 'operational',
    services: [
      makeService('API Sunucusu', 'operational', 42),
      makeService('Veritabanı', 'operational', 8),
      makeService('Dosya Depolama', 'operational', 120),
      makeService('Dışa Aktarma Kuyruğu', 'operational', 65),
      makeService('Bulut Senkronizasyon', 'operational', 230),
      makeService('AI Motoru', 'operational', 890),
    ],
    cpuUsagePercent: 23 + Math.floor(Math.random() * 15),
    memUsagePercent: 48 + Math.floor(Math.random() * 10),
    diskUsagePercent: 61 + Math.floor(Math.random() * 5),
    generatedAt: new Date().toISOString(),
  };
}

function UsageBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
        <span style={{ color: '#374151' }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{percent}%</span>
      </div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${percent}%`}
        />
      </div>
    </div>
  );
}

export const SystemHealth: React.FC = () => {
  const [report, setReport] = useState<SystemHealthReport>(() => generateHealthReport());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const refresh = useCallback(() => {
    setReport(generateHealthReport());
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const overallStyle = STATUS_STYLES[report.overall];

  return (
    <section aria-label="Sistem Durumu" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🖥️ Sistem Durumu</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Otomatik Yenile
          </label>
          <button onClick={refresh} style={btnStyle}>🔄 Yenile</button>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>
        Son güncelleme: {lastRefreshed.toLocaleTimeString('tr-TR')}
      </p>

      {/* Overall status banner */}
      <div style={{ background: overallStyle.bg, border: `1px solid ${overallStyle.dot}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: overallStyle.dot }} />
        <span style={{ fontWeight: 700, color: overallStyle.color }}>Genel Durum: {overallStyle.label}</span>
      </div>

      {/* Resource usage */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#374151' }}>📊 Kaynak Kullanımı</h3>
        <UsageBar label="CPU" percent={report.cpuUsagePercent} color={report.cpuUsagePercent > 80 ? '#ef4444' : '#3b82f6'} />
        <UsageBar label="RAM" percent={report.memUsagePercent} color={report.memUsagePercent > 85 ? '#ef4444' : '#10b981'} />
        <UsageBar label="Disk" percent={report.diskUsagePercent} color={report.diskUsagePercent > 90 ? '#ef4444' : '#f59e0b'} />
      </div>

      {/* Services */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <h3 style={{ margin: '12px 14px 8px', fontSize: '0.9rem', color: '#374151' }}>🔌 Servis Durumları</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {report.services.map((service, i) => {
            const st = STATUS_STYLES[service.status];
            return (
              <div
                key={service.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  gap: 10,
                  borderTop: i > 0 ? '1px solid #f1f5f9' : undefined,
                  background: service.status !== 'operational' ? st.bg : undefined,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500 }}>{service.name}</span>
                {service.latencyMs !== undefined && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{service.latencyMs}ms</span>
                )}
                <span style={{ fontSize: '0.78rem', color: st.color, fontWeight: 600 }}>{st.label}</span>
                {service.message && (
                  <span style={{ fontSize: '0.72rem', color: '#d97706' }}>{service.message}</span>
                )}
              </div>
            );
          })}
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

SystemHealth.displayName = 'SystemHealth';
