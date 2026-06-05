export * from './common';
export * from './core';
export * from './math';
export * from './verbal';
export * from './visual';
export * from './admin';
export * from './screening';
export * from './ocr-activity';
export * from './worksheet';
export * from './creativeStudio';
export * from './activityStudio';
export * from './student-advanced';
export * from './progress';
export * from './messaging';
export * from './user';
export * from './student';
export * from './studio';
export * from './profile';
export * from './rbac';
export * from './rbac-advanced';
export * from './teacher';
export * from './neuroProfile';
export * from './gamification';
export * from './workbook';
export * from './sinav';
export * from './matSinav';
export * from './kelimeCumle';
export * from './sariKitap';
export * from './adStudio';
export * from './superStudio';
export * from './assignment';
export * from './activity';

// ==========================================
// FAZ 4: EXPORT AMBIGUITY ÇÖZÜMLERİ
// Aşağıdaki tanımlar birden fazla dosyada bulunduğu için TypeScript'e önceliği açıkça söylüyoruz.
// ==========================================

export type { StudentProfile } from './student';
export type { WorkbookSettings } from './workbook';
export type { AgeGroup, LearningDisabilityProfile } from './creativeStudio';
export type { 
  ActivityPermission, 
  CategoryPermission, 
  ModulePermission, 
  PermissionAction, 
  PermissionModule, 
  RBACSettings, 
  RolePermissions 
} from './rbac-advanced';

