/**
 * imageValidator.ts
 *
 * Görsel dosyalarını OCR ve varyasyon üretimi için doğrulayan utility.
 *
 * Kritik Kontroller:
 * - Dosya boyutu (max 15MB image, 20MB PDF)
 * - MIME type whitelist
 * - Minimum boyut (corrupt file tespiti)
 * - Görsel kalite değerlendirmesi (brightness, contrast)
 */

import { AppError } from './AppError.js';

// ─── DOSYA BOYUT LİMİTLERİ ──────────────────────────────────────────────

export const FILE_SIZE_LIMITS = {
  image: 15 * 1024 * 1024,    // 15 MB for images
  pdf: 20 * 1024 * 1024,      // 20 MB for PDFs
  total: 50 * 1024 * 1024,    // 50 MB total batch
  min: 10 * 1024              // 10 KB minimum (corrupt file protection)
} as const;

// ─── MIME TYPE WHITELIST ────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  pdf: ['application/pdf']
} as const;

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.pdf
] as const;

// ─── VALIDATION RESULT TYPES ────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  file: File;
  metadata?: {
    sizeInMB: number;
    type: string;
    estimatedProcessingTime: number; // ms
    warnings?: string[];
  };
}

export interface BatchValidationResult {
  validFiles: File[];
  rejectedFiles: Array<{ file: File; reason: string }>;
  totalSizeMB: number;
  estimatedProcessingTime: number;
  warnings: string[];
}

// ─── IMAGE QUALITY ASSESSMENT ──────────────────────────────────────────

export interface ImageQualityResult {
  brightness: number;        // 0-1 (0=tamamen siyah, 1=tamamen beyaz)
  isTooDark: boolean;        // brightness < 0.2
  isTooLight: boolean;       // brightness > 0.95
  estimatedResolution: {     // Piksel boyutları
    width: number;
    height: number;
  };
  qualityScore: number;      // 0-100
  recommendations: string[];
}

// ─── SINGLE FILE VALIDATION ────────────────────────────────────────────

export const validateSingleFile = (file: File, index: number = 0, total: number = 1): ValidationResult => {
  const sizeInMB = file.size / (1024 * 1024);

  // 1. MIME Type Check
  if (!ALL_ALLOWED_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      reason: `"${file.name}" formatı desteklenmiyor (${file.type || 'bilinmeyen'}). Desteklenen: JPG, PNG, WebP, GIF, PDF`,
      file
    };
  }

  // 2. Minimum Size Check (Corrupt File Protection)
  if (file.size < FILE_SIZE_LIMITS.min) {
    return {
      valid: false,
      reason: `"${file.name}" çok küçük veya hasar görmüş (${sizeInMB.toFixed(2)}MB). Minimum 10KB gerekli.`,
      file
    };
  }

  // 3. Maximum Size Check (Type-Specific)
  const isImage = ALLOWED_MIME_TYPES.images.includes(file.type as any);
  const isPDF = ALLOWED_MIME_TYPES.pdf.includes(file.type as any);
  const sizeLimit = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.pdf;
  const limitMB = (sizeLimit / (1024 * 1024)).toFixed(0);

  if (file.size > sizeLimit) {
    return {
      valid: false,
      reason: `"${file.name}" çok büyük (${sizeInMB.toFixed(2)}MB, max ${limitMB}MB). Lütfen daha küçük bir dosya kullanın.`,
      file
    };
  }

  // 4. Estimated Processing Time
  const estimatedTime = isPDF ? sizeInMB * 500 : sizeInMB * 200; // ms per MB

  return {
    valid: true,
    file,
    metadata: {
      sizeInMB,
      type: file.type,
      estimatedProcessingTime: estimatedTime
    }
  };
};

// ─── BATCH VALIDATION ───────────────────────────────────────────────────

export const validateBatch = (files: File[]): BatchValidationResult => {
  const validFiles: File[] = [];
  const rejectedFiles: Array<{ file: File; reason: string }> = [];
  const warnings: string[] = [];
  let totalSize = 0;
  let totalEstimatedTime = 0;

  // Max file count check
  if (files.length > 10) {
    warnings.push(`Maksimum 10 dosya yüklenebilir. ${files.length - 10} dosya göz ardı edilecek.`);
    files = files.slice(0, 10);
  }

  for (const [index, file] of files.entries()) {
    const validation = validateSingleFile(file, index, files.length);

    if (!validation.valid) {
      rejectedFiles.push({ file, reason: validation.reason || 'Bilinmeyen hata' });
      continue;
    }

    // Check if adding this file exceeds total limit
    if (totalSize + file.size > FILE_SIZE_LIMITS.total) {
      const totalMB = ((totalSize + file.size) / (1024 * 1024)).toFixed(1);
      rejectedFiles.push({
        file,
        reason: `Toplam dosya boyutu çok büyük olur (${totalMB}MB). Toplamda max 50MB.`
      });
      continue;
    }

    validFiles.push(file);
    totalSize += file.size;
    totalEstimatedTime += validation.metadata?.estimatedProcessingTime || 0;
  }

  // Large batch warning
  if (validFiles.length > 5) {
    warnings.push(`${validFiles.length} dosya işlenecek. Bu işlem ${Math.ceil(totalEstimatedTime / 1000)}+ saniye sürebilir.`);
  }

  return {
    validFiles,
    rejectedFiles,
    totalSizeMB: totalSize / (1024 * 1024),
    estimatedProcessingTime: totalEstimatedTime,
    warnings
  };
};

// ─── IMAGE QUALITY ASSESSMENT ──────────────────────────────────────────

/**
 * Bir görselin kalitesini değerlendirir (brightness, contrast, resolution)
 * Canvas API kullanarak client-side analiz yapar
 */
export const assessImageQuality = async (base64: string): Promise<ImageQualityResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new AppError('Canvas context alınamadı', 'CANVAS_ERROR', 500));
      return;
    }

    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Brightness calculation (average of all pixels)
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Relative luminance formula
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        totalBrightness += brightness;
      }

      const avgBrightness = totalBrightness / (data.length / 4);
      const isTooDark = avgBrightness < 0.2;
      const isTooLight = avgBrightness > 0.95;

      // Quality score calculation
      let qualityScore = 100;
      const recommendations: string[] = [];

      if (isTooDark) {
        qualityScore -= 30;
        recommendations.push('Görsel çok karanlık. Daha iyi aydınlatma ile yeniden fotoğraflayın.');
      } else if (isTooLight) {
        qualityScore -= 25;
        recommendations.push('Görsel çok açık/soluk. Kontrast ayarı yapın veya yeniden fotoğraflayın.');
      }

      // Resolution check
      if (img.width < 800 || img.height < 600) {
        qualityScore -= 20;
        recommendations.push('Düşük çözünürlük. Daha yüksek kalitede görsel kullanın (min 800x600px).');
      }

      // Aspect ratio check (too wide/narrow images)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.5 || aspectRatio > 2.5) {
        qualityScore -= 10;
        recommendations.push('Uygunsuz en-boy oranı. Standart belge formatında (A4/Letter) görsel kullanın.');
      }

      // Cleanup
      canvas.remove();

      resolve({
        brightness: avgBrightness,
        isTooDark,
        isTooLight,
        estimatedResolution: {
          width: img.width,
          height: img.height
        },
        qualityScore: Math.max(0, qualityScore),
        recommendations
      });
    };

    img.onerror = () => {
      canvas.remove();
      reject(new AppError('Görsel yüklenemedi veya hasar görmüş', 'IMAGE_LOAD_ERROR', 400));
    };

    img.src = base64;
  });
};

// ─── BASE64 IMAGE VALIDATION ────────────────────────────────────────────

/**
 * Base64 encoded image string doğrulama
 * API endpoint'leri için kullanılır
 */
export const validateBase64Image = (base64: string): ValidationResult => {
  // Base64 header check
  const headerMatch = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);

  if (!headerMatch) {
    return {
      valid: false,
      reason: 'Geçersiz base64 formatı. Data URL header eksik.',
      file: new File([], 'unknown'),
      metadata: {
        sizeInMB: base64.length / (1024 * 1024),
        type: 'unknown',
        estimatedProcessingTime: 0
      }
    };
  }

  const mimeType = headerMatch[1];

  // MIME type check
  if (!ALL_ALLOWED_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      reason: `Desteklenmeyen format: ${mimeType}. Desteklenen: JPG, PNG, WebP, GIF, PDF`,
      file: new File([], 'unknown'),
      metadata: {
        sizeInMB: base64.length / (1024 * 1024),
        type: mimeType,
        estimatedProcessingTime: 0
      }
    };
  }

  // Base64 boyut tahmini (base64 ~33% daha büyük)
  const base64Data = base64.split(',')[1] || '';
  const estimatedSize = (base64Data.length * 3) / 4;
  const estimatedSizeMB = estimatedSize / (1024 * 1024);

  // Size limit check
  const isImage = ALLOWED_MIME_TYPES.images.includes(mimeType as any);
  const sizeLimit = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.pdf;
  const limitMB = (sizeLimit / (1024 * 1024)).toFixed(0);

  if (estimatedSize > sizeLimit) {
    return {
      valid: false,
      reason: `Görsel çok büyük (~${estimatedSizeMB.toFixed(2)}MB, max ${limitMB}MB). Lütfen daha küçük bir dosya kullanın.`,
      file: new File([], 'unknown'),
      metadata: {
        sizeInMB: estimatedSizeMB,
        type: mimeType,
        estimatedProcessingTime: 0
      }
    };
  }

  // Estimated processing time
  const estimatedTime = isImage ? estimatedSizeMB * 200 : estimatedSizeMB * 500;

  const warnings: string[] = [];

  // Size warning
  if (estimatedSizeMB > 10) {
    warnings.push('Büyük dosya boyutu. İşlem süresi uzun olabilir.');
  }

  return {
    valid: true,
    file: new File([], 'base64-image'),
    metadata: {
      sizeInMB: estimatedSizeMB,
      type: mimeType,
      estimatedProcessingTime: estimatedTime,
      warnings
    }
  };
};

// ─── DYSLEXIA-SAFE DIGIT VALIDATION ────────────────────────────────────

/**
 * İçerikte karıştırılabilir rakamların (6/9, 2/5, 3/8, 1/7) birlikte kullanılıp
 * kullanılmadığını kontrol eder - disleksi güvenliği için
 */
export const validateDyslexiaSafeDigits = (content: string): boolean => {
  const CONFUSABLE_PAIRS = [
    ['6', '9'],
    ['2', '5'],
    ['3', '8'],
    ['1', '7']
  ];

  const digits = content.match(/\d/g) || [];
  const uniqueDigits = [...new Set(digits)];

  for (const [a, b] of CONFUSABLE_PAIRS) {
    if (uniqueDigits.includes(a) && uniqueDigits.includes(b)) {
      return false; // Aynı içerikte karıştırılabilir rakamlar var
    }
  }

  return true;
};

/**
 * Batch içeriğinde karıştırılabilir rakamları filtrele ve uyarı ver
 */
export const filterConfusableDigitsInBatch = (items: string[]): {
  safe: string[];
  unsafe: string[];
  warnings: string[];
} => {
  const safe: string[] = [];
  const unsafe: string[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    if (validateDyslexiaSafeDigits(item)) {
      safe.push(item);
    } else {
      unsafe.push(item);
      warnings.push(`Karıştırılabilir rakamlar tespit edildi: "${item.substring(0, 30)}..."`);
    }
  }

  return { safe, unsafe, warnings };
};
