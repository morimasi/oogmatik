/**
 * OOGMATIK - Input Validation Utilities
 * Basit validators (Zod'a geçilirse daha gelişkin hale getirilecek)
 */

import { ValidationError } from './AppError.js';
import sanitizeHtmlLib from 'sanitize-html';
import { z } from 'zod';

/**
 * ============================================================
 * VALIDATION HELPERS
 * ============================================================
 */

/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
};

/**
 * Password validation
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 6) errors.push('Şifre en az 6 karakter olmalı');
  if (password.length > 128) errors.push('Şifre çok uzun');
  return { valid: errors.length === 0, errors };
};

/**
 * Name validation
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'İsim en az 2 karakter olmalı' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'İsim çok uzun' };
  }
  return { valid: true };
};

/**
 * UUID validation
 */
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * URL validation
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * ============================================================
 * REQUEST VALIDATORS
 * ============================================================
 */

export const validateLoginRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  if (!d.email || typeof d.email !== 'string' || !validateEmail(d.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  const passwordValidation = validatePassword(typeof d.password === 'string' ? d.password : '');
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors[0];
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateRegisterRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  if (!d.email || typeof d.email !== 'string' || !validateEmail(d.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  const passwordValidation = validatePassword(typeof d.password === 'string' ? d.password : '');
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors[0];
  }

  const nameValidation = validateName(typeof d.name === 'string' ? d.name : '');
  if (!nameValidation.valid) {
    errors.name = nameValidation.error || 'İsim gereklidir';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateGenerateActivityRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  if (!d.prompt || typeof d.prompt !== 'string') {
    errors.prompt = 'Talimat gereklidir';
  } else if (d.prompt.length < 5) {
    errors.prompt = 'Talimat en az 5 karakter olmalı';
  } else if (d.prompt.length > 5000) {
    errors.prompt = 'Talimat 5000 karakterden fazla olamaz';
  } else if (
    d.prompt.toLowerCase().includes('drop table') ||
    d.prompt.toLowerCase().includes('delete from')
  ) {
    errors.prompt = 'Geçersiz ifade kullanıldı';
  }

  if (d.activityType && typeof d.activityType !== 'string') {
    errors.activityType = 'Aktivite türü metin olmalı';
  }

  if (d.studentAge && (typeof d.studentAge !== 'number' || d.studentAge < 5 || d.studentAge > 18)) {
    errors.studentAge = 'Yaş 5-18 arasında olmalı';
  }

  if (d.image) {
    const img = d.image as Record<string, unknown>;
    if (!img.data || typeof img.data !== 'string') {
      errors.image = 'Görüntü verisi gereklidir';
    } else {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (typeof img.mimeType === 'string' && !validMimeTypes.includes(img.mimeType)) {
        errors.imageMimeType = 'Geçersiz görüntü formatı';
      }
      if (img.data.length > 5_000_000) {
        errors.imageSize = "Görüntü 5MB'den küçük olmalı";
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateFeedbackRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  if (!d.rating || typeof d.rating !== 'number' || d.rating < 1 || d.rating > 5) {
    errors.rating = 'Puan 1-5 arasında olmalı';
  }

  if (!d.message || typeof d.message !== 'string') {
    errors.message = 'Mesaj gereklidir';
  } else if (d.message.length < 10) {
    errors.message = 'Mesaj en az 10 karakter olmalı';
  } else if (d.message.length > 2000) {
    errors.message = 'Mesaj 2000 karakterden fazla olamaz';
  }

  if (d.email && typeof d.email === 'string' && !validateEmail(d.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateUpdateProfileRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  if (d.name && typeof d.name === 'string') {
    const nameValidation = validateName(d.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error || 'İsim geçersiz';
    }
  }

  if (d.bio && typeof d.bio === 'string' && d.bio.length > 500) {
    errors.bio = 'Biyografi 500 karakterden fazla olamaz';
  }

  if (d.avatar && typeof d.avatar === 'string' && !validateURL(d.avatar)) {
    errors.avatar = 'Geçerli bir URL girin';
  }

  if (d.phone && typeof d.phone === 'string' && !/^[\d\s\-\+\(\)]+$/.test(d.phone)) {
    errors.phone = 'Geçerli bir telefon numarası girin';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateSaveWorksheetRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  if (!d.name || typeof d.name !== 'string' || d.name.trim().length === 0) {
    errors.name = 'Çalışma adı gereklidir';
  } else if (d.name.length > 200) {
    errors.name = 'Çalışma adı çok uzun';
  }

  if (!d.activityType) {
    errors.activityType = 'Aktivite türü gereklidir';
  }

  if (!d.worksheetData || !Array.isArray(d.worksheetData) || d.worksheetData.length === 0) {
    errors.worksheetData = 'En az bir aktivite gereklidir';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateOCRScanRequest = (
  data: unknown
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: { payload: 'Geçersiz veri' } };
  }
  const d = data as Record<string, unknown>;

  const img = d.image as Record<string, unknown> | undefined;

  if (!img || !img.data || typeof img.data !== 'string') {
    errors.image = 'Görüntü gereklidir';
  } else if (img.data.length > 10_000_000) {
    errors.image = "Görüntü 10MB'den küçük olmalı";
  }

  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!img || typeof img.mimeType !== 'string' || !validMimeTypes.includes(img.mimeType)) {
    errors.imageMimeType = 'Geçersiz görüntü formatı (JPEG, PNG, WebP, GIF)';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * ============================================================
 * ANIMATION STUDIO (REMOTION v2.0) SCHEMAS
 * ============================================================
 */

/**
 * PedagogicalNote Kalite Doğrulayıcı
 *
 * Kural (Elif Yıldız, Pedagoji Direktörü):
 * - Minimum 80 karakter — öğretmene "neden bu aktivite" tam açıklanmalı
 * - En az bir pedagojik beceri/alan anahtar kelimesi içermeli
 *   (örn: "fonolojik farkındalık", "çalışma belleği", "görsel algı", vb.)
 *
 * Neden: "pedagogicalNote zorunlu kalır, ama artık KALİTELİ olmak zorunda."
 */
export const PEDAGOGICAL_KEYWORDS = [
  'fonolojik',
  'görsel',
  'bellek',
  'dikkat',
  'motor',
  'okuma',
  'matematik',
  'yazma',
  'iskele',
  'farkındalık',
  'kavrama',
  'beceri',
  'zpd',
  'scaffold',
  'algı',
  'akıcılık',
  'anlama',
  'sözel',
  'sayısal',
  'uzamsal',
  'yürütücü',
  'inhibisyon',
] as const;

export const PedagogicalNoteSchema = z
  .string()
  .min(
    80,
    'Pedagojik not en az 80 karakter olmalı — öğretmene "neden bu aktivite" tam olarak açıklanmalı'
  )
  .refine(
    (note) =>
      PEDAGOGICAL_KEYWORDS.some((kw) => note.toLowerCase().includes(kw.toLowerCase())),
    {
      message:
        'Pedagojik not en az bir hedef beceri/alan ifadesi içermeli (örn: "fonolojik farkındalık", "çalışma belleği", "görsel algı", "okuma akıcılığı")',
    }
  );

export const NeuroProfileParamsSchema = z.object({
  profileType: z.enum(['dyslexia', 'adhd', 'dyscalculia', 'mixed']),
  ageGroup: z.enum(['5-7', '8-10', '11-13', '14+']),
  readingSpeed: z.enum(['yavas', 'normal', 'hizli']).optional(),
  attentionSpan: z.number().min(10).max(120).optional(), // Saniye cinsinden
});

export const AnimationTimingSchema = z.object({
  startFrame: z.number().int().min(0),
  durationInFrames: z.number().int().min(1),
  easingCurve: z.enum(['ease-in', 'ease-out', 'ease-in-out', 'linear', 'spring']),
});

export const AnimationPayloadSchema = z.object({
  title: z.string().min(3).max(100),
  // Kural: Her AI çıktısında öğretmene "neden" açıklaması zorunludur — artık kalite de şart.
  pedagogicalNote: PedagogicalNoteSchema,
  cognitiveLoadParams: z.object({
    maxConcurrentObjects: z.number().max(3),
    visualCrowdingScore: z.number().min(0).max(100), // 0 en az (disleksi/dehb için ideal)
  }),
  timeline: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(['text', 'shape', 'kinetic-number', 'liquid-bar', 'image']),
      content: z.string().optional(),
      timing: AnimationTimingSchema,
      colorPalette: z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)),
    })
  ),
});

export type NeuroProfileParamsType = z.infer<typeof NeuroProfileParamsSchema>;
export type AnimationPayloadType = z.infer<typeof AnimationPayloadSchema>;
export type PedagogicalNoteType = z.infer<typeof PedagogicalNoteSchema>;


/**
 * ============================================================
 * SANITIZATION
 * ============================================================
 */

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') {
    return '';
  }

  return sanitizeHtmlLib(html, {
    // By default sanitize-html removes <script> and dangerous attributes/protocols.
    // Here we keep a conservative set of common formatting tags.
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.filter((tag) => tag !== 'script'),
    allowedAttributes: {
      // Use the default allowed attributes per tag, which do not include event handlers.
      ...sanitizeHtmlLib.defaults.allowedAttributes,
    },
  });
};

/**
 * ============================================================
 * ERROR THROWING
 * ============================================================
 */

export const throwValidationError = (errors: Record<string, string>): never => {
  throw new ValidationError('Giriş verileri geçersiz', errors);
};

export const validateOrThrow = (validationResult: {
  valid: boolean;
  errors: Record<string, string>;
}): void => {
  if (!validationResult.valid) {
    throwValidationError(validationResult.errors);
  }
};
