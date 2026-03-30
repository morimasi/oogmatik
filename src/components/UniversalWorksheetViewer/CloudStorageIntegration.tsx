import React, { useState, useCallback, useEffect } from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { CloudProvider, CloudFile, CloudSyncStatus } from './types/worksheet';
import type { UseCloudStorageReturn } from './hooks/useCloudStorage';

const PROVIDER_META: Record<CloudProvider, { label: string; icon: string; color: string }> = {
  google_drive: { label: 'Google Drive', icon: '🔵', color: '#4285f4' },
  dropbox: { label: 'Dropbox', icon: '📦', color: '#0061ff' },
  onedrive: { label: 'OneDrive', icon: '☁️', color: '#0078d4' },
};

const SYNC_STATUS_LABELS: Record<CloudSyncStatus, string> = {
  idle: 'Hazır',
  syncing: '🔄 Senkronize ediliyor...',
  synced: '✅ Senkronize edildi',
  error: '❌ Hata',
  offline: '📴 Çevrimdışı',
};

interface CloudStorageIntegrationProps extends UseCloudStorageReturn {
  /** Called when user wants to save current worksheet to cloud */
  onSaveToCloud?: (provider: CloudProvider) => Promise<void>;
  /** Compact mode shows only status icons (for toolbar) */
  compact?: boolean;
}

export const CloudStorageIntegration: React.FC<CloudStorageIntegrationProps> = React.memo(
  ({
    configs,
    syncStatus,
    lastSyncedAt,
    cloudFiles,
    activeProvider,
    isAuthenticated,
    connect,
    disconnect,
    uploadFile: _uploadFile,
    listFiles,
    setAutoSync,
    setActiveProvider,
    generateShareLink,
    onSaveToCloud,
    compact = false,
  }) => {
    const [expandedProvider, setExpandedProvider] = useState<CloudProvider | null>(null);
    const [files, setFiles] = useState<CloudFile[]>(cloudFiles);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [shareLinks, setShareLinks] = useState<Record<string, string>>({});
    const [connectingProvider, setConnectingProvider] = useState<CloudProvider | null>(null);
    const [savingProvider, setSavingProvider] = useState<CloudProvider | null>(null);

    useEffect(() => {
      setFiles(cloudFiles);
    }, [cloudFiles]);

    const handleConnect = useCallback(
      async (provider: CloudProvider) => {
        setConnectingProvider(provider);
        try {
          await connect(provider);
        } finally {
          setConnectingProvider(null);
        }
      },
      [connect],
    );

    const handleToggleExpand = useCallback(
      async (provider: CloudProvider) => {
        if (expandedProvider === provider) {
          setExpandedProvider(null);
          return;
        }
        setExpandedProvider(provider);
        setActiveProvider(provider);

        if (isAuthenticated(provider)) {
          setLoadingFiles(true);
          try {
            const fetched = await listFiles(provider);
            setFiles(fetched);
          } finally {
            setLoadingFiles(false);
          }
        }
      },
      [expandedProvider, isAuthenticated, listFiles, setActiveProvider],
    );

    const handleSave = useCallback(
      async (provider: CloudProvider) => {
        if (!onSaveToCloud) return;
        setSavingProvider(provider);
        try {
          await onSaveToCloud(provider);
        } finally {
          setSavingProvider(null);
        }
      },
      [onSaveToCloud],
    );

    const handleShare = useCallback(
      async (provider: CloudProvider, fileId: string) => {
        const link = await generateShareLink(provider, fileId);
        if (link) {
          setShareLinks((prev) => ({ ...prev, [fileId]: link }));
          try {
            await navigator.clipboard.writeText(link);
          } catch {
            // clipboard not available – show link in UI
          }
        }
      },
      [generateShareLink],
    );

    if (compact) {
      const authenticatedProviders = (Object.keys(PROVIDER_META) as CloudProvider[]).filter(isAuthenticated);
      return (
        <div className={styles.cloudCompact} aria-label="Bulut depolama durumu">
          {SYNC_STATUS_LABELS[syncStatus]}{' '}
          {authenticatedProviders.map((p) => (
            <span key={p} title={PROVIDER_META[p].label}>
              {PROVIDER_META[p].icon}
            </span>
          ))}
          {lastSyncedAt && (
            <span style={{ fontSize: '0.7em', color: '#94a3b8' }}>
              {new Date(lastSyncedAt).toLocaleTimeString('tr-TR')}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className={styles.cloudPanel} role="region" aria-label="Bulut depolama entegrasyonu">
        <h3 className={styles.panelTitle}>☁️ Bulut Depolama</h3>

        <p className={styles.cloudSyncStatus} aria-live="polite">
          {SYNC_STATUS_LABELS[syncStatus]}
          {lastSyncedAt && ` — Son: ${new Date(lastSyncedAt).toLocaleTimeString('tr-TR')}`}
        </p>

        {(Object.keys(PROVIDER_META) as CloudProvider[]).map((provider) => {
          const meta = PROVIDER_META[provider];
          const connected = isAuthenticated(provider);
          const config = configs[provider];
          const isExpanded = expandedProvider === provider;
          const isConnecting = connectingProvider === provider;
          const isSaving = savingProvider === provider;

          return (
            <div key={provider} className={styles.cloudProviderCard}>
              {/* Provider header */}
              <div className={styles.cloudProviderHeader}>
                <span className={styles.cloudProviderIcon} style={{ color: meta.color }}>
                  {meta.icon}
                </span>
                <span className={styles.cloudProviderLabel}>{meta.label}</span>
                {connected && config?.userEmail && (
                  <span className={styles.cloudProviderEmail}>{config.userEmail}</span>
                )}

                <div className={styles.cloudProviderActions}>
                  {connected ? (
                    <>
                      {onSaveToCloud && (
                        <button
                          className={styles.toolbarBtn}
                          onClick={() => handleSave(provider)}
                          disabled={isSaving}
                          title="Bu çalışmayı kaydet"
                        >
                          {isSaving ? '💾...' : '💾 Kaydet'}
                        </button>
                      )}
                      <button
                        className={styles.toolbarBtn}
                        onClick={() => handleToggleExpand(provider)}
                        aria-expanded={isExpanded}
                        title="Dosyaları göster"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => disconnect(provider)}
                        title="Bağlantıyı kes"
                      >
                        Çıkış
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.exportBtn}
                      onClick={() => handleConnect(provider)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? '🔄 Bağlanıyor...' : '🔗 Bağlan'}
                    </button>
                  )}
                </div>
              </div>

              {/* Auto-sync toggle */}
              {connected && (
                <label className={styles.checkboxLabel} style={{ paddingLeft: 8, fontSize: '0.8rem' }}>
                  <input
                    type="checkbox"
                    checked={config?.autoSync ?? false}
                    onChange={(e) => setAutoSync(provider, e.target.checked)}
                  />
                  Kayıt edilince otomatik senkronize et
                </label>
              )}

              {/* File browser */}
              {isExpanded && connected && (
                <div className={styles.cloudFileBrowser} role="list" aria-label={`${meta.label} dosyaları`}>
                  {loadingFiles ? (
                    <p className={styles.cloudLoading}>Dosyalar yükleniyor...</p>
                  ) : files.length === 0 ? (
                    <p className={styles.emptyState}>Henüz dosya yok</p>
                  ) : (
                    files.map((file) => (
                      <div key={file.id} className={styles.cloudFileRow} role="listitem">
                        <span className={styles.cloudFileName}>📄 {file.name}</span>
                        <span className={styles.cloudFileMeta}>
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                        </span>
                        <div className={styles.cloudFileActions}>
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.toolbarBtn}
                              title="Aç"
                            >
                              🔗
                            </a>
                          )}
                          <button
                            className={styles.toolbarBtn}
                            onClick={() => handleShare(provider, file.id)}
                            title="Paylaşım bağlantısı kopyala"
                          >
                            📋
                          </button>
                          {shareLinks[file.id] && (
                            <span className={styles.shareLink} title={shareLinks[file.id]}>
                              ✅ Kopyalandı
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

CloudStorageIntegration.displayName = 'CloudStorageIntegration';
