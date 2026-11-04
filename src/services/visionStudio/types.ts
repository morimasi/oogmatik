// VisionStudio — Servis katmanı paylaşılan tipleri
import type { AIAnalysisResult, GeneratedActivity } from '../../types/visionStudio';

export interface AnalyzeRequest {
  fileUrl: string;
  fileType: 'pdf' | 'image';
  fileId: string;
  userId: string;
  generateVariations: number;
}

export interface AnalyzeResponse {
  analysis: AIAnalysisResult;
  activities: GeneratedActivity[];
}
