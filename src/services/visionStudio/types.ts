// VisionStudio — Servis katmanı paylaşılan tipleri
import type { AnalyzeResponse as SchemaAnalyzeResponse } from '../../utils/schemas/visionStudio';

export interface AnalyzeRequest {
  fileUrl?: string;
  fileBase64?: string;
  fileName?: string;
  fileType: 'pdf' | 'image';
  fileId: string;
  userId: string;
  generateVariations: number;
}

/** Sunucu yanıtı Zod şemasından türetilir (tek doğruluk kaynağı). */
export type AnalyzeResponse = SchemaAnalyzeResponse;
