/**
 * OOGMATIK - Input Validation Utilities
 * Basit validators (Zod'a geçilirse daha gelişkin hale getirilecek)
 */

import { ValidationError } from './AppError';

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

export const validateLoginRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.email || !validateEmail(data.email)) {
        errors.email = 'Geçerli bir e-posta adresi girin';
    }

    const passwordValidation = validatePassword(data.password || '');
    if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors[0];
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateRegisterRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.email || !validateEmail(data.email)) {
        errors.email = 'Geçerli bir e-posta adresi girin';
    }

    const passwordValidation = validatePassword(data.password || '');
    if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors[0];
    }

    const nameValidation = validateName(data.name || '');
    if (!nameValidation.valid) {
        errors.name = nameValidation.error || 'İsim gereklidir';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateGenerateActivityRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.prompt || typeof data.prompt !== 'string') {
        errors.prompt = 'Talimat gereklidir';
    } else if (data.prompt.length < 5) {
        errors.prompt = 'Talimat en az 5 karakter olmalı';
    } else if (data.prompt.length > 5000) {
        errors.prompt = 'Talimat 5000 karakterden fazla olamaz';
    } else if (data.prompt.toLowerCase().includes('drop table') || data.prompt.toLowerCase().includes('delete from')) {
        errors.prompt = 'Geçersiz ifade kullanıldı';
    }

    if (!data.activityType || typeof data.activityType !== 'string') {
        errors.activityType = 'Aktivite türü gereklidir';
    }

    if (data.studentAge && (typeof data.studentAge !== 'number' || data.studentAge < 5 || data.studentAge > 18)) {
        errors.studentAge = 'Yaş 5-18 arasında olmalı';
    }

    if (data.image) {
        if (!data.image.data || typeof data.image.data !== 'string') {
            errors.image = 'Görüntü verisi gereklidir';
        }
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validMimeTypes.includes(data.image.mimeType)) {
            errors.imageMimeType = 'Geçersiz görüntü formatı';
        }
        if (data.image.data.length > 5_000_000) {
            errors.imageSize = 'Görüntü 5MB\'den küçük olmalı';
        }
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateFeedbackRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.rating || typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
        errors.rating = 'Puan 1-5 arasında olmalı';
    }

    if (!data.message || typeof data.message !== 'string') {
        errors.message = 'Mesaj gereklidir';
    } else if (data.message.length < 10) {
        errors.message = 'Mesaj en az 10 karakter olmalı';
    } else if (data.message.length > 2000) {
        errors.message = 'Mesaj 2000 karakterden fazla olamaz';
    }

    if (data.email && !validateEmail(data.email)) {
        errors.email = 'Geçerli bir e-posta adresi girin';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateUpdateProfileRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (data.name) {
        const nameValidation = validateName(data.name);
        if (!nameValidation.valid) {
            errors.name = nameValidation.error || 'İsim geçersiz';
        }
    }

    if (data.bio && data.bio.length > 500) {
        errors.bio = 'Biyografi 500 karakterden fazla olamaz';
    }

    if (data.avatar && !validateURL(data.avatar)) {
        errors.avatar = 'Geçerli bir URL girin';
    }

    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
        errors.phone = 'Geçerli bir telefon numarası girin';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateSaveWorksheetRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.name = 'Çalışma adı gereklidir';
    } else if (data.name.length > 200) {
        errors.name = 'Çalışma adı çok uzun';
    }

    if (!data.activityType) {
        errors.activityType = 'Aktivite türü gereklidir';
    }

    if (!data.worksheetData || !Array.isArray(data.worksheetData) || data.worksheetData.length === 0) {
        errors.worksheetData = 'En az bir aktivite gereklidir';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateOCRScanRequest = (data: any): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.image || !data.image.data) {
        errors.image = 'Görüntü gereklidir';
    } else if (data.image.data.length > 10_000_000) {
        errors.image = 'Görüntü 10MB\'den küçük olmalı';
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!data.image || !validMimeTypes.includes(data.image.mimeType)) {
        errors.imageMimeType = 'Geçersiz görüntü formatı (JPEG, PNG, WebP, GIF)';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

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
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    return sanitized;
};

/**
 * ============================================================
 * ERROR THROWING
 * ============================================================
 */

export const throwValidationError = (errors: Record<string, string>): never => {
    throw new ValidationError('Giriş verileri geçersiz', errors);
};

export const validateOrThrow = (validationResult: { valid: boolean; errors: Record<string, string> }): void => {
    if (!validationResult.valid) {
        throwValidationError(validationResult.errors);
    }
};
