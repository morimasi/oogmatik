import React, { useState } from 'react';
import { UserManagement } from './AdminDashboard/UserManagement';
import { WorksheetAnalytics } from './AdminDashboard/WorksheetAnalytics';
import { PermissionManager } from './AdminDashboard/PermissionManager';
import { SystemHealth } from './AdminDashboard/SystemHealth';
import { AuditLog } from './AdminDashboard/AuditLog';
import { useAdminStats } from '../hooks/useAdminStats';

type AdminTab = 'overview' | 'users' | 'analytics' | 'permissions' | 'health' | 'audit';

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Genel Bakış', icon: '🏠' },
  { id: 'users', label: 'Kullanıcılar', icon: '👥' },
  { id: 'analytics', label: 'Analitikler', icon: '📊' },
  { id: 'permissions', label: 'İzinler', icon: '🔐' },
  { id: 'health', label: 'Sistem', icon: '🖥️' },
  { id: 'audit', label: 'Denetim', icon: '📋' },
];

export interface AdminDashboardNewProps {
  /** Called when user navigates away from admin */
  onBack?: () => void;
  /** Initial tab to show */
  initialTab?: AdminTab;
}

/**
 * AdminDashboard (New FAZA 5 version)
 *
 * Comprehensive admin panel with:
 * - Key metrics overview
 * - User management (CRUD, role assignment, bulk actions)
 * - Worksheet analytics & export trends
 * - RBAC permission manager
 * - System health monitoring
 * - Complete audit log
 */
export const AdminDashboardNew: React.FC<AdminDashboardNewProps> = ({ onBack, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const { stats, loading, refresh, lastUpdatedAt } = useAdminStats();

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, fontFamily: 'inherit', fontSize: '0.85rem' }}>
      {/* Ultra Compact Sidebar */}
      <nav
        style={{
          width: 160,
          background: '#0f172a',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 6px',
          gap: 2,
          flexShrink: 0,
          borderRight: '1px solid #1e293b'
        }}
        aria-label="Admin navigasyonu"
      >
        <div style={{ padding: '4px 10px', marginBottom: 12 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>⚙️ ADMIN</div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>KONTROL MERKEZİ</div>
        </div>

        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              border: 'none',
              borderRadius: 6,
              background: activeTab === id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === id ? '#60a5fa' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 800,
              textAlign: 'left',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <span style={{ fontSize: '1rem', opacity: activeTab === id ? 1 : 0.5 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px',
              border: '1px solid #1e293b',
              borderRadius: 6,
              background: 'transparent',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 700,
              marginTop: 'auto',
              textTransform: 'uppercase'
            }}
          >
            ← Geri
          </button>
        )}
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#fdfdfd', minWidth: 0 }}>
        {activeTab === 'overview' && (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #f1f5f9', pb: 12 }}>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏠 GENEL BAKIŞ</h1>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={refresh} style={{ ...btnStyle, fontSize: '0.7rem', padding: '4px 10px', borderRadius: 4 }}>Yenile</button>
                {lastUpdatedAt && (
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                    {new Date(lastUpdatedAt).toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: '0.8rem' }}>⏳ Yükleniyor...</div>
            ) : stats ? (
              <>
                {/* Metric cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Kullanıcı', value: stats.totalUsers, icon: '👥', color: '#3b82f6', sub: `${stats.activeUsers} aktif` },
                    { label: 'Kağıtlar', value: stats.totalWorksheets, icon: '📄', color: '#10b981', sub: 'toplam' },
                    { label: 'İndirme', value: stats.exportsToday, icon: '⬇', color: '#f59e0b', sub: `bugün` },
                    { label: 'Oturum', value: stats.activeSessionsCount || 0, icon: '👤', color: '#8b5cf6', sub: 'şu an' },
                    { label: 'Hız', value: `${stats.avgResponseMs || 0}ms`, icon: '⚡', color: '#06b6d4', sub: 'ortalama' },
                    { label: 'Hata', value: `${stats.errorRatePercent || 0}%`, icon: '⚠️', color: (stats.errorRatePercent || 0) > 1 ? '#ef4444' : '#22c55e', sub: '24s' },
                  ].map(({ label, value, icon, color, sub }) => (
                    <div
                      key={label}
                      style={{
                        background: '#fff',
                        border: '1px solid #f1f5f9',
                        borderRadius: 8,
                        padding: '12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{label}</span>
                        <span style={{ fontSize: '1rem' }}>{icon}</span>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <h2 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>⚡ Hızlı İşlemler</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: '👥 Kullanıcı Yönet', tab: 'users' as AdminTab },
                      { label: '📊 Analitikleri Gör', tab: 'analytics' as AdminTab },
                      { label: '🔐 İzinleri Düzenle', tab: 'permissions' as AdminTab },
                      { label: '🖥️ Sistem Durumu', tab: 'health' as AdminTab },
                      { label: '📋 Denetim Günlüğü', tab: 'audit' as AdminTab },
                    ].map(({ label, tab }) => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={qaBtnStyle}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <WorksheetAnalytics />}
        {activeTab === 'permissions' && <PermissionManager />}
        {activeTab === 'health' && <SystemHealth />}
        {activeTab === 'audit' && <AuditLog />}
      </div>
    </div>
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

const qaBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  background: '#f8fafc',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 500,
  transition: 'background 0.15s',
};

AdminDashboardNew.displayName = 'AdminDashboardNew';
