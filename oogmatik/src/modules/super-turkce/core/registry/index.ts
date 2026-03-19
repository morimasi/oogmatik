/**
 * Süper Türkçe Bileşen Kayıt Sistemi Index
 * 
 * Merkezi registry sistemi ve tüm format tanımları.
 */

// Registry Core
export {
  registerFormat,
  getFormatsByCategory,
  getAllFormats,
  getFormatById,
  getTotalFormatCount,
  getCategoryStats,
  clearRegistry,
  registry
} from './ComponentRegistry';

// Type Definitions
export type { ActivityFormatDef, SettingDef, StudioCategory } from '../types/activity-formats';
