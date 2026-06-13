import { AdminTab } from './admin';

export type AdStudioTarget =
  | AdminTab
  | 'math_studio'
  | 'reading_studio'
  | 'writing_studio'
  | 'screening_assessment'
  | 'sari_kitap'
  | 'infographic_studio'
  | 'super_studio'
  | 'all_modules';

export type AdAudience = 'teachers' | 'parents' | 'therapists' | 'school_admin' | 'investors';

export type AdTone = 'corporate' | 'emotional' | 'scientific' | 'playful' | 'urgent';

export type AdFormat = 'storyboard' | 'video_script' | 'social_media' | 'email' | 'press_release' | 'brochure' | 'web_copy';

export type AdStatus = 'draft' | 'generated' | 'exported' | 'archived';

export const AD_TARGET_LABELS: Record<AdStudioTarget, string> = {
  dashboard: 'Yönetim Paneli',
  users: 'Kullanıcı Yönetimi',
  teachers: 'Öğretmen Yönetimi',
  students: 'Öğrenci Yönetimi',
  activities: 'Aktivite Yöneticisi',
  prompts: 'Prompt Stüdyosu',
  static_content: 'İçerik Yönetimi',
  feedbacks: 'Geri Bildirimler',
  drafts: 'Taslaklar',
  approvals: 'İçerik Onayları',
  permissions: 'İzin Yönetimi',
  content_engine: 'İçerik Motoru',
  math_studio: 'Matematik Stüdyosu',
  reading_studio: 'Okuma Stüdyosu',
  writing_studio: 'Yazma Stüdyosu',
  screening_assessment: 'Değerlendirme Modülü',
  sari_kitap: 'Sarı Kitap',
  infographic_studio: 'İnfografik Stüdyosu',
  super_studio: 'Süper Stüdyo',
  ad_studio: 'Reklam Stüdyosu',
  audit_log: 'Denetim Kayıtları',
  all_modules: 'Tüm Modüller',
};

export const AD_TARGET_DESCRIPTIONS: Record<AdStudioTarget, string> = {
  dashboard: 'Merkezi admin yönetim paneli. Kullanıcı, içerik ve sistem istatistikleri.',
  users: 'Kullanıcı hesapları, roller ve yetkilendirme yönetimi.',
  teachers: 'Öğretmen kaydı, sınıf atama ve performans takibi.',
  students: 'Öğrenci profilleri, gelişim takibi ve BEP yönetimi.',
  activities: 'Dinamik aktivite havuzu, AI yapılandırması ve içerik düzenleme.',
  prompts: 'AI prompt şablonları, snippet yönetimi ve simülasyon.',
  static_content: 'Statik içerik ve veri kaynakları yönetimi.',
  feedbacks: 'Kullanıcı geri bildirimleri ve değerlendirme yönetimi.',
  drafts: 'Taslak içerikler ve düzenleme süreçleri.',
  approvals: 'İçerik onay akışı ve versiyon yönetimi.',
  permissions: 'Rol bazlı erişim ve izin yönetimi.',
  content_engine: 'AI içerik üretim motoru ve pipeline sağlığı.',
  math_studio: 'Diskalkuli dostu matematik çalışma kağıtları üretir.',
  reading_studio: 'Okuma güçlüğü çeken çocuklar için hece, kelime ve okuma anlama aktiviteleri.',
  writing_studio: 'Yazma becerilerini geliştiren el yazısı ve kompozisyon aktiviteleri.',
  screening_assessment: 'Öğrenme güçlüğü tarama ve bilişsel değerlendirme test bataryası.',
  sari_kitap: 'Sarı Kitap metodolojisi ile okuma ve anlama çalışmaları.',
  infographic_studio: 'Görsel bilgi grafikleri ve infografik tasarım aracı.',
  super_studio: 'Tüm stüdyoları tek çatı altında toplayan süper stüdyo modülü.',
  ad_studio: 'Ürün ve hizmet tanıtımı için AI destekli reklam ve pazarlama içerikleri üretir.',
  audit_log: 'Sistem denetim ve güvenlik log kayıtları.',
  all_modules: 'bdmind platformunun tüm modülleri ve özellikleri.',
};

export interface BrandKit {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  slogan: string;
  website: string;
  createdAt: string;
}

export interface AdScene {
  sceneNo: number;
  duration: number;
  visualDesc: string;
  voiceover: string;
  textOverlay: string;
  transition: string;
  sceneVisual?: string;
}

export interface AdOutput {
  id: string;
  campaignId: string;
  title: string;
  target: AdStudioTarget;
  audience: AdAudience[];
  tone: AdTone;
  format: AdFormat;
  duration: number;
  language: 'tr' | 'en';
  brandKitId: string;
  scenes: AdScene[];
  script: string;
  socialCopy: string;
  emailSubject: string;
  emailBody: string;
  tags: string[];
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface AdCampaign {
  id: string;
  name: string;
  description: string;
  ads: string[];
  targetAudience: AdAudience[];
  season: string;
  budget: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  settings: {
    target: AdStudioTarget;
    audience: AdAudience[];
    tone: AdTone;
    format: AdFormat;
    duration: number;
    toneMix?: Record<AdTone, number>;
    language?: 'tr' | 'en';
    urgency?: 'low' | 'medium' | 'high';
    callToAction?: string;
    season?: string;
    tags?: string[];
  };
  createdAt: string;
}

export interface AdStudioSettings {
  target: AdStudioTarget;
  audience: AdAudience[];
  tone: AdTone;
  toneMix: Record<AdTone, number>;
  format: AdFormat;
  duration: number;
  language: 'tr' | 'en';
  urgency: 'low' | 'medium' | 'high';
  callToAction: string;
  season: string;
  brandKitId: string;
  tags: string[];
}

export const DEFAULT_SETTINGS: AdStudioSettings = {
  target: 'all_modules',
  audience: ['school_admin'],
  tone: 'corporate',
  toneMix: { corporate: 60, emotional: 20, scientific: 10, playful: 5, urgent: 5 },
  format: 'storyboard',
  duration: 30,
  language: 'tr',
  urgency: 'medium',
  callToAction: 'Hemen keşfet',
  season: '',
  brandKitId: 'default',
  tags: [],
};

export interface MediaAsset {
  id: string;
  name: string;
  data: string;
  type: string;
  size: number;
  createdAt: string;
}
