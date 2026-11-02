import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { rbacService } from '../../services/rbacService';
import { ALL_MODULES, MODULE_LABELS } from '../../types/rbac-advanced';
import type { RBACSettings, PermissionModule } from '../../types/rbac-advanced';
import type { UserRole } from '../../types/user';
import { useToastStore } from '../../store/useToastStore';
import { logError } from '../../utils/logger';

const MATRIX_ROLES: UserRole[] = ['superadmin', 'admin', 'teacher'];

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Süper Admin',
  admin: 'Admin',
  teacher: 'Öğretmen',
};

interface ModuleRow {
  module: PermissionModule;
  label: string;
  cells: { role: UserRole; enabled: boolean; actions: number; categories: number }[];
}

function buildRows(settings: RBACSettings): ModuleRow[] {
  return ALL_MODULES.map((module) => ({
    module,
    label: MODULE_LABELS[module] ?? module,
    cells: MATRIX_ROLES.map((role) => {
      const roleSettings = settings.roles.find((r) => r.role === role);
      const moduleSettings = roleSettings?.modules.find((m) => m.module === module);
      return {
        role,
        enabled: moduleSettings?.enabled ?? false,
        actions: moduleSettings?.actions.length ?? 0,
        categories: moduleSettings?.categoryPermissions?.filter((c) => c.enabled).length ?? 0,
      };
    }),
  }));
}

/**
 * İzin Matrisi — `settings/rbac` dokümanındaki gerçek RBAC konfigürasyonunun
 * denetim görünümü. Düzenleme Yetki IDE'sinde yapılır; burada matris, CSV
 * çıktısı ve varsayılana dönüş işlemleri bulunur.
 */
export const PermissionManager: React.FC = () => {
  const toast = useToastStore();
  const [settings, setSettings] = useState<RBACSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await rbacService.initialize();
      // Servis iç durumunu paylaşmamak için derin kopya alınır
      const snapshot = JSON.parse(JSON.stringify(rbacService.getSettings())) as RBACSettings;
      setSettings(snapshot);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      logError('RBAC matrisi yüklenemedi', { error: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => (settings ? buildRows(settings) : []), [settings]);

  const exportCsv = useCallback(() => {
    if (!settings) return;
    const header = ['Modül', ...MATRIX_ROLES.map((role) => ROLE_LABELS[role] ?? role)].join(',');
    const body = rows.map((row) =>
      [
        `"${row.label}"`,
        ...row.cells.map((cell) => `"${cell.enabled ? 'Açık' : 'Kapalı'} (${cell.actions} eylem)"`),
      ].join(','),
    );
    const csv = [header, ...body].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `izin-matrisi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [rows, settings]);

  const resetToDefaults = useCallback(async () => {
    const confirmation = window.confirm(
      'Tüm rol yetkileri fabrika varsayılanlarına döndürülecek. Özel tanımlar kaybolacak. Onaylıyor musunuz?',
    );
    if (!confirmation) return;

    setResetting(true);
    try {
      await rbacService.resetToDefaults();
      await load();
      toast.success('RBAC ayarları varsayılana döndürüldü.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logError('RBAC sıfırlanamadı', { error: message });
      toast.error('Ayarlar sıfırlanamadı. Lütfen tekrar deneyin.');
    } finally {
      setResetting(false);
    }
  }, [load, toast]);

  const enabledCount = rows.reduce(
    (sum, row) => sum + row.cells.filter((cell) => cell.enabled).length,
    0,
  );

  return (
    <section aria-label="İzin Matrisi" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🔐 İzin Matrisi (RBAC)</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {rows.length} modül · {enabledCount} açık modül-rol eşleşmesi · kaynak: <code>settings/rbac</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => void load()} style={btnStyle} disabled={loading}>🔄 Yenile</button>
          <button onClick={exportCsv} style={btnStyle} disabled={rows.length === 0}>📥 CSV İndir</button>
          <button onClick={() => void resetToDefaults()} style={{ ...btnStyle, background: '#ef4444' }} disabled={resetting}>
            {resetting ? 'Sıfırlanıyor...' : 'Varsayılana Dön'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.8rem' }}>
          Yetki matrisi yüklenemedi: {error}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>⏳ Yetki matrisi yükleniyor...</p>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 620, width: '100%' }} role="grid" aria-label="İzin matrisi">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ ...thStyle, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1 }}>Modül</th>
                {MATRIX_ROLES.map((role) => (
                  <th key={role} style={{ ...thStyle, textAlign: 'center' }}>{ROLE_LABELS[role] ?? role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.module} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, position: 'sticky', left: 0, background: '#fff', fontWeight: 500 }}>
                    {row.label}
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>{row.module}</div>
                  </td>
                  {row.cells.map((cell) => (
                    <td key={`${row.module}-${cell.role}`} style={{ ...tdStyle, textAlign: 'center' }}>
                      {cell.enabled ? (
                        <span title={`${cell.actions} eylem${cell.categories > 0 ? `, ${cell.categories} kategori` : ''}`}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                          <span style={{ color: '#94a3b8', marginLeft: 4, fontSize: '0.7rem' }}>{cell.actions}</span>
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 10 }}>
        Not: hücrelerdeki sayı, o rolün modülde sahip olduğu eylem sayısıdır. Düzenleme için “Yetki IDE” görünümünü kullanın;
        süper admin rolü tüm modüllere koşulsuz erişir.
      </p>
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
  padding: '6px 10px',
};

PermissionManager.displayName = 'PermissionManager';
