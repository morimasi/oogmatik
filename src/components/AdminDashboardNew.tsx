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
export const AdminDashboardNew: React.FC<AdminDashboardNewProps> = ({
  onBack,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const { stats, loading, refresh, lastUpdatedAt } = useAdminStats();

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        minHeight: 0,
        fontFamily: 'inherit',
        fontSize: '0.85rem',
      }}
    >
      {/* Ultra Compact Sidebar (Themed) */}
      <nav
        style={{
          width: 140,
          background: 'var(--bg-paper)',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 6px',
          gap: 2,
          flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
        }}
        aria-label="Admin navigasyonu"
      >
        <div style={{ padding: '2px 8px', marginBottom: 10 }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            ⚙️ ADMIN
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            MERKEZ
          </div>
        </div>

        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 8px',
              border: 'none',
              borderRadius: 6,
              background: activeTab === id ? 'var(--accent-muted)' : 'transparent',
              color: activeTab === id ? 'var(--accent-color)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: activeTab === id ? 800 : 500,
              textAlign: 'left',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
            }}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <span style={{ fontSize: '0.9rem', opacity: activeTab === id ? 1 : 0.5 }}>{icon}</span>
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
              gap: 4,
              padding: '6px',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 700,
              marginTop: 'auto',
              textTransform: 'uppercase',
            }}
          >
            ← Geri
          </button>
        )}
      </nav>

      {/* Main content (Themed) */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-secondary)', minWidth: 0 }}>
        {activeTab === 'overview' && (
          <div style={{ padding: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: 8,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-primary)',
                }}
              >
                🏠 GENEL BAKIŞ
              </h1>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  onClick={refresh}
                  style={{
                    ...btnStyle,
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'var(--bg-paper)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Yenile
                </button>
                {lastUpdatedAt && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(lastUpdatedAt).toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  padding: 40,
                  fontSize: '0.75rem',
                }}
              >
                ⏳ Yükleniyor...
              </div>
            ) : stats ? (
              <>
                {/* Metric cards (Themed) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {[
                    {
                      label: 'Kullanıcı',
                      value: stats.totalUsers,
                      icon: '👥',
                      color: 'var(--accent-color)',
                      sub: `${stats.activeUsers} aktif`,
                    },
                    {
                      label: 'Kağıtlar',
                      value: stats.totalWorksheets,
                      icon: '📄',
                      color: '#10b981',
                      sub: 'toplam',
                    },
                    {
                      label: 'İndirme',
                      value: stats.exportsToday,
                      icon: '⬇',
                      color: '#f59e0b',
                      sub: `bugün`,
                    },
                    {
                      label: 'Oturum',
                      value: stats.activeSessionsCount || 0,
                      icon: '👤',
                      color: '#8b5cf6',
                      sub: 'şu an',
                    },
                    {
                      label: 'Hız',
                      value: `${stats.avgResponseMs || 0}ms`,
                      icon: '⚡',
                      color: '#06b6d4',
                      sub: 'ortalama',
                    },
                    {
                      label: 'Hata',
                      value: `${stats.errorRatePercent || 0}%`,
                      icon: '⚠️',
                      color: (stats.errorRatePercent || 0) > 1 ? '#ef4444' : '#22c55e',
                      sub: '24s',
                    },
                  ].map(({ label, value, icon, color, sub }) => (
                    <div
                      key={label}
                      style={{
                        background: 'var(--bg-paper)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        padding: '10px',
                        boxShadow: 'var(--shadow-premium)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {label}
                        </span>
                        <span style={{ fontSize: '0.8rem' }}>{icon}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 900,
                          color: 'var(--text-primary)',
                          lineHeight: 1,
                        }}
                      >
                        {value}
                      </div>
                      <div
                        style={{
                          fontSize: '0.55rem',
                          color: 'var(--text-muted)',
                          marginTop: 2,
                          fontWeight: 600,
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <h2 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>
                    ⚡ Hızlı İşlemler
                  </h2>
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
