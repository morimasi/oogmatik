import { ActivityType, CognitiveErrorTag, Difficulty } from '../../types';

/**
 * Bir etkinliğin otonom olarak üretilmesi için gereken tüm tanımları içeren ana yapı.
 */
export interface ActivityBlueprint {
  identity: {
    key: string;               // Enum anahtarı (Örn: 'LETTER_MAZE')
    enumValue: string;         // 'letter-maze' formatında string de olabilir
    title: string;             // Kullanıcıya görünen başlık
    description: string;       // Kısa açıklama
    icon: string;              // FontAwesome icon class
    categoryId: string;        // 'reading-verbal', 'math-logic' vb.
  };

  dataModel: {
    interfaceName: string;     // Örn: 'LetterMazeData'
    itemsName?: string;        // Örn: 'LetterMazeItem'
    fields: DataField[];       // Ana data alanları
    itemFields?: DataField[];  // Tekil soru/öğe alanları
  };

  logic: {
    offlineAlgorithm: string;  // Algoritma pseudocode/açıklama
    aiPrompt: {
      role: string;            // 'Matematik Profesörü' vb.
      task: string;            // AI'ya yönelik görev tanımı
      rules: string[];         // Katı kurallar
      schema: Record<string, any>; // JSON çıktı şeması
    };
  };

  ui: {
    columnsPerDifficulty: Record<Difficulty, number>;
    configFields: ConfigFieldDefinition[];
    renderType: 'list' | 'grid' | 'table' | 'custom';
  };

  pedagogical: {
    targetSkills: string[];
    errorTags: CognitiveErrorTag[];
    ageGroups: string[];
  };

  /** Ajan denetim onay kayıtları (Faz 7 — AgentOrchestrator tarafından doldurulur) */
  approvals?: {
    pedagogical?: AgentApproval;
    clinical?: AgentApproval;
    engineering?: AgentApproval;
    aiQuality?: AgentApproval;
  };
}

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ConfigFieldDefinition {
  id: string;
  label: string;
  type: 'range' | 'select' | 'toggle' | 'number';
  min?: number;
  max?: number;
  options?: { label: string; value: unknown }[];
  defaultValue: unknown;
}

/** Ajan denetim onay kaydı */
export interface AgentApproval {
  approved: boolean;
  notes: string;
  agent: 'elif' | 'ahmet' | 'bora' | 'selin';
  timestamp?: string;
}
