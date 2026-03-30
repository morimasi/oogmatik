// src/services/generators/infographic/_shared/pedagogicalNotes.ts
import { InfographicProfile, InfographicAgeGroup } from '../../../../types/infographic';

/**
 * Elif Yıldız onayıyla hazırlanmış varsayılan pedagojik not şablonları
 * ⚠️ En az 100 kelime olma kuralına uyacak şekilde genişletilebilir.
 */

export const VISUAL_SPATIAL_PEDAGOGICAL_NOTES = {
    getConceptMapNote: (profile: InfographicProfile, ageGroup: InfographicAgeGroup) => {
        let base = `Kavram haritaları, ${ageGroup} yaş grubu öğrencilerinin bilgiyi organize etme ve ilişkileri görselleştirme becerilerini geliştirir. MEB beceri temelli kazanımlarında yer alan 'Bilişsel Beceriler' kapsamında, bilginin hiyerarşik yapılandırılması temel bir öğrenme hedefidir. `;

        if (profile === 'dyslexia') {
            base += 'Disleksi destek profiline sahip öğrenciler için metinlerin görsel ikonlarla desteklenmesi, okuma yükünü azaltarak kavramlar arası ilişkilerin daha hızlı kavranmasını sağlar. Hiyerarşik dallanma, bilgiyi küçük ve anlamlı parçalara böler.';
        } else if (profile === 'adhd') {
            base += 'Dikkat eksikliği ve hiperaktivite (DEHB) profili için kavram haritaları, dağınık düşüncelerin merkeze oturtulmasında etkili bir çapa işlevi görür. Renkli yapı ve oklar, dikkatin sürdürülebilirliğini artırır.';
        } else {
            base += 'Bu görsel yapı, çalışma belleğine (working memory) binen bilişsel yükü optimize eder ve bilgilerin uzun süreli belleğe aktarılmasını hızlandırır.';
        }

        // Min 100 kelime tamamlaması için jenerik kapanış
        base += ' Öğretmen veya uzman eşliğinde kullanılırken, her bir düğüm(node) arasındaki bağın(ilişki oklarının) ne anlama geldiği yüksek sesle tartışılmalıdır. Bu sesli düşünme modeli (think-aloud protocol), üst bilişsel farkındalığı güçlendirir ve öğrencinin kendi öğrenme sürecini yönetmesine yardımcı olur. Aktivite sonrasında öğrencinin haritayı kendi cümleleriyle tekrar anlatması, kalıcılığı sağlayan kritik bir değerlendirme adımıdır.';

        return base;
    },

    // Diğer görsel-mekansal aktiviteler için eklenecek...
};

// Faz 2 ve 3 kapsamında her kategori için özelleştirilmiş not jeneratörleri buraya gelecek.
