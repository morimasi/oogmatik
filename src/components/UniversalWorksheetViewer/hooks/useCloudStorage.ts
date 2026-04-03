import { useState, useCallback, useRef } from 'react';
import type { CloudProvider, CloudStorageConfig, CloudFile, CloudSyncStatus } from '../types/worksheet';

const STORAGE_KEY_PREFIX = 'uwv_cloud_';

// Generate a cryptographically secure random base-36 string of the given length.
// Uses the Web Crypto API when available.
function getSecureRandomString(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const alphabetLength = alphabet.length;

  // Prefer the Web Crypto API when available (browser / worker contexts).
  const cryptoObj: Crypto | undefined =
    (typeof window !== 'undefined' && (window.crypto || (window as any).msCrypto)) ||
    (typeof self !== 'undefined' && (self as any).crypto);

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < length; i++) {
      // Map each random byte to a character in the alphabet.
      result += alphabet[bytes[i] % alphabetLength];
    }
    return result;
  }

  // Fallback: use Math.random() only if crypto is unavailable.
  // This path is retained for compatibility and is not expected
  // to be used in modern browsers where crypto is present.
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabetLength)];
  }
  return result;
}

interface UseCloudStorageReturn {
  configs: Partial<Record<CloudProvider, CloudStorageConfig>>;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;
  cloudFiles: CloudFile[];
  activeProvider: CloudProvider | null;
  isAuthenticated: (provider: CloudProvider) => boolean;
  connect: (provider: CloudProvider) => Promise<void>;
  disconnect: (provider: CloudProvider) => void;
  uploadFile: (provider: CloudProvider, name: string, content: string, mimeType: string) => Promise<CloudFile | null>;
  listFiles: (provider: CloudProvider) => Promise<CloudFile[]>;
  setAutoSync: (provider: CloudProvider, enabled: boolean) => void;
  setActiveProvider: (provider: CloudProvider | null) => void;
  generateShareLink: (provider: CloudProvider, fileId: string) => Promise<string | null>;
}

function loadConfig(provider: CloudProvider): CloudStorageConfig | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${provider}`);
    if (!raw) return null;
    return JSON.parse(raw) as CloudStorageConfig;
  } catch {
    return null;
  }
}

function saveConfig(config: CloudStorageConfig): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${config.provider}`, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

function removeConfig(provider: CloudProvider): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider}`);
}

function loadAllConfigs(): Partial<Record<CloudProvider, CloudStorageConfig>> {
  const providers: CloudProvider[] = ['google_drive', 'dropbox', 'onedrive'];
  const result: Partial<Record<CloudProvider, CloudStorageConfig>> = {};
  for (const p of providers) {
    const cfg = loadConfig(p);
    if (cfg) result[p] = cfg;
  }
  return result;
}

/**
 * Simulates OAuth2 popup flow. In a real implementation this would open
 * the provider's authorization endpoint in a popup window and exchange
 * the authorization code for tokens via a server-side proxy.
 */
async function mockOAuth2Flow(provider: CloudProvider): Promise<CloudStorageConfig> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 800));

  const providerLabels: Record<CloudProvider, string> = {
    google_drive: 'Google Drive',
    dropbox: 'Dropbox',
    onedrive: 'OneDrive',
  };

  return {
    provider,
    accessToken: `mock-token-${provider}-${Date.now()}`,
    refreshToken: `mock-refresh-${provider}`,
    expiresAt: Date.now() + 3600 * 1000,
    userEmail: `user@${provider.replace('_', '')}.example`,
    userId: `uid-${getSecureRandomString(8)}`,
    autoSync: false,
    folderName: `Oogmatik - ${providerLabels[provider]}`,
  };
}

async function mockUploadFile(
  config: CloudStorageConfig,
  name: string,
  content: string,
  mimeType: string,
): Promise<CloudFile> {
  await new Promise((res) => setTimeout(res, 500));
  const fileId = `file-${Date.now()}-${getSecureRandomString(6)}`;
  return {
    id: fileId,
    name,
    mimeType,
    size: new Blob([content]).size,
    modifiedAt: new Date().toISOString(),
    webViewLink: `https://${config.provider}.example/view/${fileId}`,
    downloadUrl: `https://${config.provider}.example/download/${fileId}`,
    provider: config.provider,
  };
}

async function mockListFiles(config: CloudStorageConfig): Promise<CloudFile[]> {
  await new Promise((res) => setTimeout(res, 400));
  return [
    {
      id: `file-sample-1`,
      name: 'Sample Worksheet.pdf',
      mimeType: 'application/pdf',
      size: 204800,
      modifiedAt: new Date(Date.now() - 86400000).toISOString(),
      provider: config.provider,
    },
    {
      id: `file-sample-2`,
      name: 'Math Exercise.json',
      mimeType: 'application/json',
      size: 4096,
      modifiedAt: new Date(Date.now() - 172800000).toISOString(),
      provider: config.provider,
    },
  ];
}

export function useCloudStorage(): UseCloudStorageReturn {
  const [configs, setConfigs] = useState<Partial<Record<CloudProvider, CloudStorageConfig>>>(() => loadAllConfigs());
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);
  const [activeProvider, setActiveProviderState] = useState<CloudProvider | null>(null);
  const uploadQueueRef = useRef<Array<() => Promise<void>>>([]);

  const isAuthenticated = useCallback(
    (provider: CloudProvider): boolean => {
      const cfg = configs[provider];
      if (!cfg) return false;
      if (cfg.expiresAt && cfg.expiresAt < Date.now()) return false;
      return Boolean(cfg.accessToken);
    },
    [configs],
  );

  const connect = useCallback(async (provider: CloudProvider) => {
    setSyncStatus('syncing');
    try {
      const config = await mockOAuth2Flow(provider);
      saveConfig(config);
      setConfigs((prev) => ({ ...prev, [provider]: config }));
      setSyncStatus('idle');
    } catch (err) {
      setSyncStatus('error');
      console.error(`Cloud connect error (${provider}):`, err);
    }
  }, []);

  const disconnect = useCallback((provider: CloudProvider) => {
    removeConfig(provider);
    setConfigs((prev) => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });
    setActiveProviderState((prev) => (prev === provider ? null : prev));
  }, []);

  const uploadFile = useCallback(
    async (provider: CloudProvider, name: string, content: string, mimeType: string): Promise<CloudFile | null> => {
      const config = configs[provider];
      if (!config || !isAuthenticated(provider)) return null;

      setSyncStatus('syncing');
      try {
        const file = await mockUploadFile(config, name, content, mimeType);
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('synced');
        return file;
      } catch (err) {
        setSyncStatus('error');
        console.error(`Upload error (${provider}):`, err);
    uploadQueueRef.current.push(() => uploadFile(provider, name, content, mimeType).then(() => undefined));
        return null;
      }
    },
    [configs, isAuthenticated],
  );

  const listFiles = useCallback(
    async (provider: CloudProvider): Promise<CloudFile[]> => {
      const config = configs[provider];
      if (!config || !isAuthenticated(provider)) return [];

      try {
        const files = await mockListFiles(config);
        setCloudFiles(files);
        return files;
      } catch (err) {
        console.error(`List files error (${provider}):`, err);
        return [];
      }
    },
    [configs, isAuthenticated],
  );

  const setAutoSync = useCallback(
    (provider: CloudProvider, enabled: boolean) => {
      const config = configs[provider];
      if (!config) return;
      const updated = { ...config, autoSync: enabled };
      saveConfig(updated);
      setConfigs((prev) => ({ ...prev, [provider]: updated }));
    },
    [configs],
  );

  const setActiveProvider = useCallback((provider: CloudProvider | null) => {
    setActiveProviderState(provider);
  }, []);

  const generateShareLink = useCallback(
    async (provider: CloudProvider, fileId: string): Promise<string | null> => {
      const config = configs[provider];
      if (!config || !isAuthenticated(provider)) return null;
      await new Promise((res) => setTimeout(res, 200));
      return `https://${provider.replace('_', '')}.example/share/${fileId}?token=${Math.random().toString(36).slice(2)}`;
    },
    [configs, isAuthenticated],
  );

  return {
    configs,
    syncStatus,
    lastSyncedAt,
    cloudFiles,
    activeProvider,
    isAuthenticated,
    connect,
    disconnect,
    uploadFile,
    listFiles,
    setAutoSync,
    setActiveProvider,
    generateShareLink,
  };
}

export type { UseCloudStorageReturn };
