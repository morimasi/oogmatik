/**
 * OOGMATIK - Offline Infographic Generator
 * AI gerektirmeden hızlı infographic aktiviteleri üretir
 * Fast mode için kullanılır
 */

import { GeneratorOptions, ActivityType } from '../../types';
import { AppError } from '../../utils/AppError';

/**
 * Offline infographic generator - rule-based content generation
 */
export const generateOfflineInfographic = async (
  activityType: string,
  options: GeneratorOptions
): Promise<any> => {
  const {
    topic = 'Genel',
    ageGroup = '8-10',
    difficulty = 'Orta',
    profile = 'general',
    itemCount = 5
  } = options;

  // Template-based generation for offline mode
  const templates = getInfographicTemplates(activityType);
  const content = generateContentFromTemplate(templates, {
    topic,
    ageGroup,
    difficulty,
    itemCount,
    profile
  });

  return {
    id: `infographic_offline_${Date.now()}`,
    type: activityType as ActivityType,
    title: `${topic} - İnfografik Aktivite`,
    description: `Hızlı mod üretilmiş ${topic} konusu infografik aktivite`,
    content,
    difficulty,
    targetSkills: generateTargetSkills(activityType, topic),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Get templates for infographic activity type
 */
function getInfographicTemplates(activityType: string) {
  const templates: Record<string, any> = {
    INFOGRAPHIC_SHORT_ANSWER: {
      structure: 'question-answer',
      formats: ['multiple-choice', 'fill-blank'],
      visualElements: ['icons', 'simple-diagrams']
    },
    INFOGRAPHIC_MATCHING: {
      structure: 'two-column-matching',
      formats: ['line-matching', 'box-matching'],
      visualElements: ['arrows', 'numbered-items']
    },
    INFOGRAPHIC_TRUE_FALSE: {
      structure: 'statement-evaluation',
      formats: ['true-false', 'correct-incorrect'],
      visualElements: ['checkmarks', 'crosses']
    },
    INFOGRAPHIC_ORDERING: {
      structure: 'sequence',
      formats: ['numbered-list', 'timeline'],
      visualElements: ['arrows', 'numbers']
    },
    INFOGRAPHIC_CLASSIFICATION: {
      structure: 'category-grouping',
      formats: ['table', 'groups'],
      visualElements: ['boxes', 'headers']
    }
  };

  return templates[activityType] || templates.INFOGRAPHIC_SHORT_ANSWER;
}

/**
 * Generate content from template
 */
function generateContentFromTemplate(template: any, params: any) {
  const { topic, difficulty, itemCount, profile } = params;
  
  // Disleksi-dostu font ve stil
  const fontStyle = "font-family:'Lexend',sans-serif; font-size:11px; line-height:1.4";
  
  // Generate structured HTML content based on template
  let html = `<div class="infographic-activity" style="${fontStyle}; padding:12px;">`;
  html += `<h2 style="color:#2c3e50; margin-bottom:12px; font-size:14px; font-weight:600;">📊 ${topic} - İnfografik Etkinlik</h2>`;
  html += `<p style="margin-bottom:10px; color:#555;">Bu aktivite hızlı modda üretilmiştir. Konuyu öğren ve cevapla!</p>`;
  
  // Generate questions/items based on count
  for (let i = 1; i <= itemCount; i++) {
    html += generateQuestionItem(i, template, topic, difficulty);
  }
  
  html += `</div>`;
  return html;
}

/**
 * Generate individual question item
 */
function generateQuestionItem(index: number, template: any, topic: string, difficulty: string) {
  const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
  
  return `
    <div class="question-item" style="margin-bottom:12px; padding:10px; border:1px solid #e0e0e0; border-radius:6px; background:${bgColor};">
      <p style="font-size:11px; line-height:1.4; margin:0 0 8px 0;">
        <strong style="color:#2c3e50;">Soru ${index}:</strong> ${topic} hakkında aşağıdakilerden hangisi doğrudur?
      </p>
      <div class="options" style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <div style="padding:6px 10px; background:#e8f5e9; border-radius:4px; border:1px solid #a5d6a7;">A) Birinci seçenek</div>
        <div style="padding:6px 10px; background:#e3f2fd; border-radius:4px; border:1px solid #90caf9;">B) İkinci seçenek</div>
        <div style="padding:6px 10px; background:#fff3e0; border-radius:4px; border:1px solid #ffcc80;">C) Üçüncü seçenek</div>
        <div style="padding:6px 10px; background:#f3e5f5; border-radius:4px; border:1px solid #ce93d8;">D) Dördüncü seçenek</div>
      </div>
    </div>
  `;
}

/**
 * Generate target skills based on activity type
 */
function generateTargetSkills(activityType: string, topic: string): string[] {
  const skills: Record<string, string[]> = {
    INFOGRAPHIC_SHORT_ANSWER: ['Kısa cevap yazma', 'Bilgi hatırlama', 'Konu kavrama'],
    INFOGRAPHIC_MATCHING: ['Eşleştirme becerisi', 'İlişkilendirme', 'Görsel algı'],
    INFOGRAPHIC_TRUE_FALSE: ['Doğru-yanlış ayırt etme', 'Eleştirel düşünme', 'Bilgi değerlendirme'],
    INFOGRAPHIC_ORDERING: ['Sıralama becerisi', 'Mantıksal düşünce', 'Adım adım ilerleme'],
    INFOGRAPHIC_CLASSIFICATION: ['Sınıflandırma', 'Kategori oluşturma', 'Ortak özellik bulma'],
  };

  return skills[activityType] || ['Bilgi', 'Beceri', 'Kavrama'];
}
