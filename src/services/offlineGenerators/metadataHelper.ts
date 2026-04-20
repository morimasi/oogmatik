
import { ActivityType } from '../../types/activity';

export interface ActivityMetadata {
    targetSkills: string[];
    description: string;
}

const METADATA_MAP: Partial<Record<ActivityType, ActivityMetadata>> = {
    [ActivityType.STORY_COMPREHENSION]: {
        targetSkills: ["Okuduğunu Anlama", "Kelime Bilgisi", "Bağlamsal Akıl Yürütme"],
        description: "Pedagojik olarak yapılandırılmış okuma ve anlama etkinliği."
    },
    [ActivityType.READING_STROOP]: {
        targetSkills: ["Dürtü Kontrolü", "Dikkat", "İşlemleme Hızı"],
        description: "Renk ve kelime çelişkisi üzerinden dikkat ve ketleme çalışması."
    },
    [ActivityType.READING_SUDOKU]: {
        targetSkills: ["Çalışma Belleği", "Görsel Tarama", "Mantıksal Akıl Yürütme"],
        description: "Harf, kelime veya sembollerle yapılandırılmış dil sudokusu."
    },
    [ActivityType.SYNONYM_ANTONYM_MATCH]: {
        targetSkills: ["Anlam Bilgisi", "Kelime Dağarcığı", "Eş/Zıt Anlam"],
        description: "Kelimeler arası anlamsal ilişkileri kurmayı hedefleyen eşleştirme çalışması."
    },
    [ActivityType.MATH_STUDIO]: {
        targetSkills: ["Sayı Hissi", "İşlem Becerisi", "Problem Çözme"],
        description: "Kişiselleştirilmiş matematik problemleri ve alıştırmaları."
    },
    [ActivityType.VISUAL_PERCEPTION]: {
        targetSkills: ["Görsel Ayırt Etme", "Figür-Zemin İlişkisi", "Görsel Dikkat"],
        description: "Görsel algı ve dikkat odaklı gelişim etkinliği."
    },
    [ActivityType.MEMORY_GAME]: {
        targetSkills: ["Görsel Hafıza", "Çalışma Belleği", "Odaklanma"],
        description: "Eşleştirme ve hatırlama tabanlı hafıza çalışması."
    },
    [ActivityType.ATTENTION_FOCUS]: {
        targetSkills: ["Sürdürülebilir Dikkat", "Seçici Dikkat", "Detay Analizi"],
        description: "Yüksek odaklanma gerektiren dikkat performansı çalışması."
    },
    [ActivityType.PATTERN_COMPLETION]: {
        targetSkills: ["Mantıksal Akıl Yürütme", "Örüntü Tanıma", "Serisel Muhakeme"],
        description: "Mantıksal örüntü tamamlama ve kural bulma etkinliği."
    },
    [ActivityType.HIDDEN_PASSWORD_GRID]: {
        targetSkills: ["Seçici Dikkat", "Görsel Tarama", "Okuma Hazırlığı"],
        description: "Harfler arasına gizlenmiş şifreyi bulma etkinliği."
    },
    [ActivityType.WORD_SEARCH]: {
        targetSkills: ["Görsel Tarama", "Kelime Tanıma", "Şekil-Zemin Algısı"],
        description: "Karmaşık harf tablosu içinde gizli kelimeleri bulma çalışması."
    }
};

/**
 * Belirli bir aktivite tipi için standart pedagojik meta verileri döndürür.
 */
export const getOfflineMetadata = (type: ActivityType): ActivityMetadata => {
    return METADATA_MAP[type] || {
        targetSkills: ["Genel Bilişsel Beceriler"],
        description: "Özel eğitim destekli öğrenme etkinliği."
    };
};
