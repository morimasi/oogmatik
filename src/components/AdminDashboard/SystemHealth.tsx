import React, { useCallback, useEffect, useState } from 'react';
import type { SystemHealthReport, ServiceHealth, ServiceStatus } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { statsService } from '../../services/statsService';
import { logError } from '../../utils/logger';

const STATUS_STYLES: Record<ServiceStatus, { bg: string; color: string; label: string; dot: string }> = {
  up: { bg: '#f0fdf4', color: '#16a34a', label: '✅ Çalışıyor', dot: '#22c55e' },
  operational: { bg: '#f0fdf4', color: '#16a34a', label: '✅ Çalışıyor', dot: '#22c55e' },
  degraded: { bg: '#fffbeb', color: '#d97706', label: '⚠️ Yavaş', dot: '#f59e0b' },
  down: { bg: '#fef2f2', color: '#dc2626', label: '❌ Çevrimdışı', dot: '#ef4444' },
};

const SLOW_THRESHOLD_MS = 1500;

interface ProbeDefinition {
  name: string;
  description: string;
  run: () => Promise<unknown>;
}

const PROBES: ProbeDefinition[] = [
  {
    name: 'Firestore — Kullanıcılar',
    description: 'users koleksiyonu okuması',
    run: () => adminService.getAllUsers(),
  },
  {
    name: 'Firestore — Aktivite İstatistikleri',
    description: 'activity_stats koleksiyonu okuması',
    run: () => statsService.getAllStats(),
  },
  {
    name: 'Firestore — İçerik Motoru',
    description: 'config_activities koleksiyonu okuması',
    run: () => adminService.getAllActivities(),
  },
];

async function probe(def: ProbeDefinition): Promise<ServiceHealth> {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    await def.run();
    const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latency = Math.round(finishedAt - startedAt);
    return {
      name: def.name,
      status: latency > SLOW_THRESHOLD_MS ? 'degraded' : 'operational',
      latency,
      lastChecked: new Date().toISOString(),
      message: latency > SLOW_THRESHOLD_MS ? `${def.description} yavaş yanıt verdi` : undefined,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logError('Sistem sağlık kontrolü başarısız', { probe: def.name, error: message });
    return {
      name: def.name,
      status: 'down',
      lastChecked: new Date().toISOString(),
      message,
    };
  }
}

function summarize(services: ServiceHealth[]): SystemHealthReport['status'] {
  if (services.some((service) => service.status === 'down')) return 'down';
  if (services.some((service) => service.status === 'degraded')) return 'degraded';
  return 'healthy';
}

export const SystemHealth: React.FC = () => {
  const [report, setReport] = useState<SystemHealthReport>({
    status: 'healthy',
    services: [],
    lastChecked: '',
  });
  const [checking, setChecking] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runChecks = useCallback(async () => {
    setChecking(true);
    const services = await Promise.all(PROBES.map((def) => probe(def)));
    setReport({
      status: summarize(services),
      services,
      lastChecked: new Date().toISOString(),
    });
    setChecking(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  useEffect(() => {
    if (!autoRefresh) return;
    const intervalId = setInterval(() => {
      void runChecks();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [autoRefresh, runChecks]);

  const overallStyle = STATUS_STYLES[report.status === 'healthy' ? 'operational' : report.status === 'degraded' ? 'degraded' : 'down'];
  const slowest = report.services.reduce<ServiceHealth | null>((worst, service) => {
    if (service.latency === undefined) return worst;
    if (!worst || (worst.latency ?? 0) < service.latency) return service;
    return worst;
  }, null);

  return (
    <section aria-label="Sistem Durumu" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🖥️ Sistem Durumu</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Ölçüm: tarayıcıdan yapılan gerçek Firestore okuma gecikmeleri
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
            Otomatik Yenile (30 sn)
          </label>
          <button onClick={() => void runChecks()} style={btnStyle} disabled={checking}>
            {checking ? '⏳ Kontrol ediliyor...' : '🔄 Yenile'}
          </button>
        </div>
      </div>

      {report.lastChecked && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>
          Son kontrol: {new Date(report.lastChecked).toLocaleTimeString('tr-TR')}
        </p>
      )}

      <div style={{ background: overallStyle.bg, border: `1px solid ${overallStyle.dot}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: overallStyle.dot }} />
        <span style={{ fontWeight: 700, color: overallStyle.color }}>Genel Durum: {overallStyle.label}</span>
        {slowest?.latency !== undefined && (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            en yavaş yanıt: {slowest.name} ({slowest.latency}ms)
          </span>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
        <h3 style={{ margin: '12px 14px 8px', fontSize: '0.9rem', color: '#374151' }}>🔌 Servis Durumları</h3>
        {report.services.length === 0 ? (
          <p style={{ margin: 0, padding: '0 14px 14px', fontSize: '0.8rem', color: '#94a3b8' }}>Kontrol çalıştırılıyor...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {report.services.map((service, index) => {
              const style = STATUS_STYLES[service.status];
              return (
                <div
                  key={service.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    gap: 10,
                    borderTop: index > 0 ? '1px solid #f1f5f9' : undefined,
                    background: service.status !== 'operational' ? style.bg : undefined,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500 }}>{service.name}</span>
                  {service.latency !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{service.latency}ms</span>
                  )}
                  <span style={{ fontSize: '0.78rem', color: style.color, fontWeight: 600 }}>{style.label}</span>
                  {service.message && (
                    <span style={{ fontSize: '0.72rem', color: '#d97706' }}>{service.message}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#374151' }}>ℹ️ Ölçülemeyen metrikler</h3>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
          CPU, RAM ve disk kullanımı tarayıcıdan okunamaz; bu değerler için sunucu tarafı izleme (örn. Vercel Analytics)
          gerekir. Bu panel yalnızca gerçekten ölçülebilen veritabanı gecikmelerini gösterir, tahmini değer üretmez.
        </p>
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
