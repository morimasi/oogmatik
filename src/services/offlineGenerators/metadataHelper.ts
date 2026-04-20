
import { ActivityType } from '../../types/activity';

export interface ActivityMetadata {
    pedagogicalNote: string;
    targetSkills: string[];
    description: string;
}

const METADATA_MAP: Partial<Record<ActivityType, ActivityMetadata>> = {
    [ActivityType.STORY_COMPREHENSION]: {
        pedagogicalNote: "Okuduğunu anlama, kelime dağarcığı ve bağlamsal akıl yürütme becerilerini destekler. Disleksik öğrenciler için metin-anlam ilişkisini güçlendirir.",
        targetSkills: ["Okuduğunu Anlama", "Kelime Bilgisi", "Bağlamsal Akıl Yürütme"],
        description: "Pedagojik olarak yapılandırılmış okuma ve anlama etkinliği."
    },
    [ActivityType.READING_STROOP]: {
        pedagogicalNote: "Dürtü kontrolü, yönetici işlevler ve sözel işlemleme hızını geliştirir. Enterferans (karışma) etkisini azaltmaya yardımcı olur.",
        targetSkills: ["Dürtü Kontrolü", "Dikkat", "İşlemleme Hızı"],
        description: "Renk ve kelime çelişkisi üzerinden dikkat ve ketleme çalışması."
    },
    [ActivityType.READING_SUDOKU]: {
        pedagogicalNote: "Çalışma belleği, görsel tarama ve yönetici işlevleri (planlama, ketleme) sözel semboller üzerinden geliştirir.",
        targetSkills: ["Çalışma Belleği", "Görsel Tarama", "Mantıksal Akıl Yürütme"],
        description: "Harf, kelime veya sembollerle yapılandırılmış dil sudokusu."
    },
    [ActivityType.SYNONYM_ANTONYM_MATCH]: {
        pedagogicalNote: "Semantik hafıza, kelime dağarcığı ve kavramsal ilişkilendirme becerilerini güçlendirir.",
        targetSkills: ["Anlam Bilgisi", "Kelime Dağarcığı", "Eş/Zıt Anlam"],
        description: "Kelimeler arası anlamsal ilişkileri kurmayı hedefleyen eşleştirme çalışması."
    },
    [ActivityType.MATH_STUDIO]: {
        pedagogicalNote: "Sayı hissi, operasyonel akıcılık ve matematiksel mantık yürütme becerilerini diskalkuli dostu görsel desteklerle geliştirir.",
        targetSkills: ["Sayı Hissi", "İşlem Becerisi", "Problem Çözme"],
        description: "Kişiselleştirilmiş matematik problemleri ve alıştırmaları."
    },
    [ActivityType.VISUAL_PERCEPTION]: {
        pedagogicalNote: "Görsel ayırt etme, figür-zemin ilişkisi ve görsel bütünleme becerilerini destekleyerek okuma-yazma hazırlığını güçlendirir.",
        targetSkills: ["Görsel Ayırt Etme", "Figür-Zemin İlişkisi", "Görsel Dikkat"],
        description: "Görsel algı ve dikkat odaklı gelişim etkinliği."
    },
    [ActivityType.MEMORY_GAME]: {
        pedagogicalNote: "Kısa süreli bellek ve çalışma belleği kapasitesini artırır, bilgiyi akılda tutma ve geri çağırma pratiği sağlar.",
        targetSkills: ["Görsel Hafıza", "Çalışma Belleği", "Odaklanma"],
        description: "Eşleştirme ve hatırlama tabanlı hafıza çalışması."
    },
    [ActivityType.ATTENTION_FOCUS]: {
        pedagogicalNote: "Sürdürülebilir dikkat ve seçici dikkat becerilerini geliştirerek akademik görevlere odaklanma süresini artırır.",
        targetSkills: ["Sürdürülebilir Dikkat", "Seçici Dikkat", "Detay Analizi"],
        description: "Yüksek odaklanma gerektiren dikkat performansı çalışması."
    },
    [ActivityType.PATTERN_COMPLETION]: {
        pedagogicalNote: "Sıralama becerisi, mantıksal tahmin ve serisel muhakeme yeteneğini güçlendirir.",
        targetSkills: ["Mantıksal Akıl Yürütme", "Örüntü Tanıma", "Serisel Muhakeme"],
        description: "Mantıksal örüntü tamamlama ve kural bulma etkinliği."
    },
    [ActivityType.HIDDEN_PASSWORD_GRID]: {
        pedagogicalNote: "Seçici dikkat, görsel tarama ve harf-ses farkındalığını eğlenceli bir bulmaca formatında pekiştirir.",
        targetSkills: ["Seçici Dikkat", "Görsel Tarama", "Okuma Hazırlığı"],
        description: "Harfler arasına gizlenmiş şifreyi bulma etkinliği."
    },
    [ActivityType.WORD_SEARCH]: {
        pedagogicalNote: "Görsel arama, şekil-zemin algısı ve kelime tanıma becerilerini geliştirir. Sözel farkındalığı artırır.",
        targetSkills: ["Görsel Tarama", "Kelime Tanıma", "Şekil-Zemin Algısı"],
        description: "Karmaşık harf tablosu içinde gizli kelimeleri bulma çalışması."
    }
};

/**
 * Belirli bir aktivite tipi için standart pedagojik meta verileri döndürür.
 */
export const getOfflineMetadata = (type: ActivityType): ActivityMetadata => {
    return METADATA_MAP[type] || {
        pedagogicalNote: "Bu aktivite bilişsel becerileri ve öğrenme sürecini desteklemek için tasarlanmıştır.",
        targetSkills: ["Genel Bilişsel Beceriler"],
        description: "Özel eğitim destekli öğrenme etkinliği."
    };
};
