/**
 * VFS File Service
 * Virtual File System ile gerçek dosya sistemi arasında köprü
 * Dosya okuma, yazma, import/export işlemlerini yönetir
 */

import { useVFSStore, VFSFile } from '../store/useVFSStore';
import { useAuthStore } from '../store/useAuthStore';
import { safeFetch, getAuthHeaders } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

// ==================== File Operations ====================

export const VFSService = {
  /**
   * VFS'e başlangıç dosyalarını yükle
   * Kritik dosyaları otomatik yükler
   */
  async loadInitialFiles(): Promise<void> {
    const { setFile } = useVFSStore.getState();
    
    // Default files for scaffold
    const defaultFiles: Record<string, VFSFile> = {
      'ActivityEngine.tsx': {
        name: 'ActivityEngine.tsx',
        language: 'typescript',
        content: `import React from 'react';
import { motion } from 'framer-motion';

// AUTONOM_CONFIG_START
export const Config = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Activity Configuration</h2>
    </div>
  );
}
// AUTONOM_CONFIG_END

export const Activity = () => {
  return (
    <div className="immersive-layout-v4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-100"
      >
        <h2 className="text-2xl font-black text-indigo-600 mb-4">
          Otonom Etkinlik
        </h2>
        <p className="text-zinc-600 leading-relaxed font-medium">
          Bu içerik AI motoru tarafından otonom olarak sentezlenmiştir.
        </p>
      </motion.div>
    </div>
  );
}`,
        lastModified: new Date(),
        size: 0
      },
      'registry.ts': {
        name: 'registry.ts',
        language: 'typescript',
        content: `export const ACTIVITY_REGISTRY = {
  // AUTONOM_REGISTRY_START
  // New modules are registered here otonomously
  // AUTONOM_REGISTRY_END
};`,
        lastModified: new Date(),
        size: 0
      }
    };

    // Load files into VFS
    for (const [path, file] of Object.entries(defaultFiles)) {
      setFile(path, file);
    }

    toast.success('VFS dosyaları yüklendi');
  },

  /**
   * VFS'teki dosyayı dışa aktar (download)
   */
  exportFile(filePath: string): void {
    const { files } = useVFSStore.getState();
    const file = files[filePath];

    if (!file) {
      toast.error(`Dosya bulunamadı: ${filePath}`);
      return;
    }

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Dosya indirildi: ${file.name}`);
  },

  /**
   * Tüm VFS'i JSON olarak dışa aktar
   */
  exportAllFiles(): void {
    const { exportVFS } = useVFSStore.getState();
    const data = exportVFS();

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vfs-backup.json';
    link.click();
    URL.revokeObjectURL(url);

    toast.success('VFS backup indirildi');
  },

  /**
   * JSON dosyasından VFS'e içe aktar
   */
  async importFiles(file: File): Promise<void> {
    const { importVFS, setFiles } = useVFSStore.getState();

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate
      if (typeof data !== 'object' || data === null) {
        throw new Error('Geçersiz VFS formatı');
      }

      // Import to VFS
      setFiles(data);
      toast.success(`VFS içe aktarıldı: ${Object.keys(data).length} dosya`);
    } catch (error) {
      toast.error(`İçe aktarma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      throw error;
    }
  },

  /**
   * Dosya içeriğini kopyala (clipboard)
   */
  copyToClipboard(filePath: string): void {
    const { files } = useVFSStore.getState();
    const file = files[filePath];

    if (!file) {
      toast.error(`Dosya bulunamadı: ${filePath}`);
      return;
    }

    navigator.clipboard.writeText(file.content)
      .then(() => toast.success('Panoya kopyalandı'))
      .catch(() => toast.error('Kopyalama başarısız'));
  },

  /**
   * Dosya boyutunu hesapla
   */
  calculateFileSize(filePath: string): number {
    const { files } = useVFSStore.getState();
    const file = files[filePath];

    if (!file) return 0;

    return new Blob([file.content]).size;
  },

  /**
   * Dosya ağacını getir (hierarchical)
   */
  getFileTree(): Array<{
    name: string;
    path: string;
    language: string;
    size: number;
    lastModified: Date;
  }> {
    const { files } = useVFSStore.getState();

    return (Object.entries(files) as Array<[string, VFSFile]>).map(([path, file]) => ({
      name: file.name,
      path,
      language: file.language,
      size: new Blob([file.content]).size,
      lastModified: file.lastModified || new Date()
    }));
  },

  /**
   * VFS'i temizle
   */
  clearVFS(): void {
    const { clearFiles } = useVFSStore.getState();
    clearFiles();
    toast.success('VFS temizlendi');
  },

  /**
   * Dosya adı öner
   */
  suggestFileName(prefix: string, extension = 'tsx'): string {
    const timestamp = Date.now();
    return `${prefix.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${extension}`;
  },

  /**
   * Kod dilini algıla
   */
  detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'md': 'markdown',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'py': 'python',
      'txt': 'plaintext'
    };

    return langMap[ext || ''] || 'plaintext';
  }
};

// ==================== API Integration (Optional) ====================

/**
 * Backend API ile senkronizasyon (gelecekte kullanılabilir)
 */
export const VFSSyncService = {
  /**
   * VFS'i backend'e kaydet
   */
  async syncToBackend(): Promise<void> {
    const { files } = useVFSStore.getState();
    const user = useAuthStore.getState().user;

    if (!user) {
      toast.error('Yayınlama için lütfen giriş yapın.');
      throw new Error('Kullanıcı oturumu yok.');
    }

    const payload = Object.values(files).map((file) => ({
      path: file.name === 'registry.ts'
        ? 'src/services/generators/registry.ts'
        : `src/components/generators/${file.name}`,
      content: file.content,
    }));

    try {
      await safeFetch('/api/admin/fs-proxy', {
        method: 'POST',
        headers: getAuthHeaders(user.id, user.role),
        body: JSON.stringify({ files: payload }),
      });

      toast.success('VFS fiziksel kaydı başarıyla tamamlandı.');
    } catch (error) {
      toast.error('Fiziksel kaydetme sırasında hata oluştu.');
      throw error;
    }
  },

  /**
   * Backend'den VFS yükle
   */
  async loadFromBackend(): Promise<void> {
    try {
      // Future: Implement API load
      console.log('Loading from backend');
      toast.success('Backend yükleme (simülasyon)');
    } catch (error) {
      toast.error('Backend yükleme hatası');
      throw error;
    }
  }
};

// Export for convenience
export default VFSService;
