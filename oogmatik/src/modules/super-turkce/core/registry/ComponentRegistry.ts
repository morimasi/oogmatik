/**
 * Süper Türkçe Bileşen Kayıt Sistemi (Component Registry)
 * 
 * Tüm etkinlik formatlarının (60+ format) merkezi kayıt ve yönetim sistemi.
 * Her format metadata, JSON Schema ve üretim fonksiyonları ile tanımlanır.
 * 
 * @module ComponentRegistry
 */

import { ActivityFormatDef, StudioCategory } from '../types/activity-formats';

// Registry Map - Tüm formatları kategorilere göre saklar
const registry: Map<StudioCategory, ActivityFormatDef[]> = new Map();

/**
 * Bir formatı registry'ye kaydeder
 * @param format - Kaydedilecek format tanımı
 */
export function registerFormat(format: ActivityFormatDef): void {
  const categoryFormats = registry.get(format.category) || [];
  
  // Duplicate check
  if (categoryFormats.some(f => f.id === format.id)) {
    console.warn(`Format '${format.id}' zaten kayıtlı, üzerine yazılıyor...`);
  }
  
  categoryFormats.push(format);
  registry.set(format.category, categoryFormats);
}

/**
 * Belirli bir kategorideki tüm formatları döndürür
 * @param category - Kategori ID
 * @returns Format tanımları dizisi
 */
export function getFormatsByCategory(category: StudioCategory): ActivityFormatDef[] {
  return registry.get(category) || [];
}

/**
 * Tüm kategorilerdeki tüm formatları döndürür
 * @returns Tüm format dizisi
 */
export function getAllFormats(): ActivityFormatDef[] {
  const allFormats: ActivityFormatDef[] = [];
  registry.forEach(formats => {
    allFormats.push(...formats);
  });
  return allFormats;
}

/**
 * ID'ye göre format arar
 * @param formatId - Format ID'si
 * @returns Format tanımı veya undefined
 */
export function getFormatById(formatId: string): ActivityFormatDef | undefined {
  for (const formats of registry.values()) {
    const found = formats.find(f => f.id === formatId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Registry'deki toplam format sayısını döndürür
 * @returns Toplam format sayısı
 */
export function getTotalFormatCount(): number {
  let count = 0;
  registry.forEach(formats => {
    count += formats.length;
  });
  return count;
}

/**
 * Kategori bazlı format istatistiklerini döndürür
 * @returns Kategori bazlı format sayıları
 */
export function getCategoryStats(): Record<StudioCategory, number> {
  const stats: Record<StudioCategory, number> = {
    'okuma_anlama': 0,
    'mantik_muhakeme': 0,
    'dil_bilgisi': 0,
    'yazim_noktalama': 0,
    'soz_varligi': 0,
    'ses_olaylari': 0,
  };
  
  registry.forEach((formats, category) => {
    stats[category] = formats.length;
  });
  
  return stats;
}

/**
 * Registry'yi temizler (özellikle development/test için)
 */
export function clearRegistry(): void {
  registry.clear();
}

// Export registry instance for direct access if needed
export { registry };
