import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, FamilyTreeMatrixData } from '../../types';

export const generateFamilyTreeMatrixFromAI = async (options: GeneratorOptions): Promise<FamilyTreeMatrixData> => {
    const difficulty = options.difficulty || 'Orta';
    const familySize = options.familySize || 'nuclear';
    const clueComplexity = options.clueComplexity || 'logical';
    const emptyNodesCount = options.emptyNodesCount || 2;
    const student = options.studentContext;

    let sizeInstruction = '3-4 kişilik küçük bir çekirdek aile (Anne, Baba, 1 veya 2 Çocuk).';
    if (familySize === 'extended') {
        sizeInstruction = '6-8 kişilik geniş bir aile (Dede, Nine, Anne, Baba, Çocuklar veya Amca/Hala gibi). İşleri çok karıştırmadan 3 nesil bağlamı.';
    }

    let clueInstruction = 'Basit ve doğrudan ("Ali\'nin babası Ahmet\'tir" gibi).';
    if (clueComplexity === 'logical') {
        clueInstruction = 'Mantıksal çıkarım gerektiren dolaylı ipuçları ("Ayşe, dedesinin tek oğlunun eşidir" veya "Mehmet, Zeynep\'in abisidir").';
    }

    let studentInstruction = '';
    if (student) {
        studentInstruction = `Öğrenci: ${student.age} yaşında, sınıf: ${student.grade}. İpuçlarını çocuğun anlayabileceği ama biraz düşünmeye sevk edecek şekilde ayarla.`;
    }

    const prompt = `
Sen mantık bulmacaları ve OÖG (Özel Öğrenme Güçlüğü) etkinlikleri üreten bir yapay zekasın.
Verilen parametrelere göre bir "Akrabalık ve Soy Ağacı Matrisi" senaryosu üret.

PARAMETRELER:
Zorluk: ${difficulty}
Aile Boyutu: ${sizeInstruction}
İpucu Karmaşıklığı: ${clueInstruction}
Boş Düğüm Hedefi: Tam olarak ${emptyNodesCount} kişinin ismini veya rolünü öğrencinin bulması gerekecek (isHidden = true).
${studentInstruction}

Görev:
1. Eğlenceli kısa bir hikaye/giriş uydur (Örn: "Hafta sonu pikniği", "Bayram ziyareti").
2. Aile ağacı düğümlerini (nodes) oluştur. Her düğüme eşsiz bir id (P1, P2 vs.) ver.
3. Çocuğun bulması için tam olarak ${emptyNodesCount} kişiyi gizli yap (isHidden: true).
4. Gizlenen kişileri bulabilmesi için, açıkta olan kişiler ve ilişkileri üzerinden yeterli sayıda "İpucu" (clues) üret. Dolaylı çıkarım yapabilsin.

Aşağıdaki JSON formatında kesin ve geçerli bir cevap dön:

{
    "id": "family_tree",
    "activityType": "FAMILY_TREE_MATRIX",
    "title": "Akrabalık ve Soy Ağacı Matrisi",
    "settings": {
        "difficulty": "${difficulty}",
        "familySize": "${familySize}",
        "clueComplexity": "${clueComplexity}",
        "emptyNodesCount": ${emptyNodesCount}
    },
    "content": {
        "title": "Uydurduğun Etkinlik Başlığı",
        "storyIntro": "Eğlenceli kısa başlangıç hikayesi...",
        "nodes": [
            {
                "id": "P1",
                "role": "Dede",
                "name": "Hüseyin",
                "gender": "M",
                "generation": 0,
                "partnersWith": "P2",
                "isHidden": false
            },
            {
                "id": "P3",
                "role": "Baba",
                "name": "Kemal",
                "gender": "M",
                "generation": 1,
                "parents": ["P1", "P2"],
                "isHidden": true
            }
        ],
        "clues": [
            "Birinci ipucu...",
            "İkinci ipucu..."
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.7,
    });

    return parsedData as FamilyTreeMatrixData;
};
