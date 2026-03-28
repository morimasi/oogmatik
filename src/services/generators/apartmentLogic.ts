import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, ApartmentLogicData } from '../../types';

export const generateApartmentLogicPuzzleFromAI = async (options: GeneratorOptions): Promise<ApartmentLogicData> => {
    const difficulty = options.difficulty || 'Orta';
    const floors = options.apartmentFloors || 2;
    const roomsPerFloor = options.apartmentRoomsPerFloor || 3;
    const totalRooms = floors * roomsPerFloor;
    const variableCount = options.variableCount || 2;
    const includeNegativeClues = options.negativeClues === true;
    const student = options.studentContext;

    let variableInstruction = 'Sadece 1 değişken (Örn: Çocukların isimleri).';
    if (variableCount === 2) variableInstruction = '2 değişken (Örn: İsim + Sevdikleri Renk veya Hayvan).';
    if (variableCount === 3) variableInstruction = '3 değişken (Örn: İsim + Renk + Meslek/Hayvan). Oldukça zorlayıcı.';

    const negativeInstruction = includeNegativeClues ? 'İpuçları arasında "Ayşe kırmızı kapılı evde OTURMAMAKTADIR" gibi negatif (değil) bildirimler de OLMALIDIR.' : 'Sadece pozitif ve doğrudan ("Ali üst kattadır" veya "Mavi kapılı ev Ayşe\'nin hemen sağındadır") ipuçları KULLAN, negatif bildirim kullanma.';

    let studentInstruction = '';
    if (student) {
        studentInstruction = `Öğrenci Profili: ${student.age} yaşında, ${student.grade} sınıf. Hikayeyi ve apartman temalarını onun yaş grubuna uygun (Örn: Hayvanlar apartmanı, Süper kahramanlar sitesi vs.) tasarla.`;
    }

    const prompt = `
Sen "Einstein Mantık Bulmacası" (Zebra Puzzle) türünde OÖG (Özel Öğrenme Güçlüğü) etkinlikleri üreten zeki bir algoritmasın.
Görev: ${floors} katlı ve her katında ${roomsPerFloor} daire olan (Toplam ${totalRooms} daire) bir apartman mantık bulmacası üretmek.

PARAMETRELER:
- Zorluk Kategorisi: ${difficulty}
- Değişken Sayısı: ${variableInstruction}
- Negatif İpucu Durumu: ${negativeInstruction}
${studentInstruction}

Görev Tanımı:
1. Eğlenceli bir tema bul ve "title" olarak ayarla (Örn: "Renkli Neşe Apartmanı", "Pati Dostları Sitesi").
2. "variableTypes" dizisini tanımla (Örn: ["İsim", "Kapı Rengi"]). (Değişken sayısına göre length 1, 2 veya 3 olmalı).
3. "residents" (sakinler) dizisini oluştur. Tam olarak ${totalRooms} kişi olmalı.
   Daire Numaralandırma Mantığı Seçenekleri (Hangisini sağlarsanız sağlayın tutarlı olun): 
   floor (1'den ${floors}'a kadar). room (1'den ${roomsPerFloor}'a kadar, soldan sağa).
4. Bu tabloyu oluşturduktan sonra, öğrencinin boş ızgarayı sadece bu ipuçlarını okuyarak DOLDURABİLECEĞİ, TEK VE KESİN BİR ÇÖZÜME götüren "clues" (ipuçları) dizisi oluştur.
   İpuçları "Alt kat", "Üst kat", "Hemen sağında", "Solunda", "Aralarında 1 daire var", "En üst katta vs." gibi mekansal ifadeler içermelidir (Öğrencinin uzamsal becerilerini zorlamak için).
5. Mantıksal bir çelişki OLMADIĞINDAN emin ol. Eksik ipucu nedeniyle bulmaca çözülemez OLMAMALIDIR. Bulmaca kusursuz olmalıdır.

Aşağıdaki JSON formatında döndür (Başka açıklama veya text yazma):

{
    "id": "apartment_puzzle",
    "activityType": "APARTMENT_LOGIC_PUZZLE",
    "title": "Apartman Bulmacası",
    "settings": {
        "difficulty": "${difficulty}",
        "apartmentFloors": ${floors},
        "apartmentRoomsPerFloor": ${roomsPerFloor},
        "variableCount": ${variableCount},
        "negativeClues": ${includeNegativeClues}
    },
    "content": {
        "title": "Renkli Pati Apartmanı",
        "variableTypes": ["İsim", "Hayvan"], // variableCount kadar uzun olmalı
        "residents": [
            {
                "id": "R1",
                "floor": 1, 
                "room": 1, // 1. kat, 1. daire (en sol)
                "variables": {
                    "İsim": "Ali",
                    "Hayvan": "Kedi"
                }
            },
            {
                "id": "R2",
                "floor": 1,
                "room": 2,
                "variables": {
                    "İsim": "Ayşe",
                    "Hayvan": "Köpek"
                }
            }
            // toplam ${totalRooms} kayıt olmalı
        ],
        "clues": [
            "Ali, birinci katta en sağda oturmaktadır.",
            "Köpeği olan kişi, Ali'nin hemen alt katında yaşar.",
            "Ayşe'nin kapısı mavidir ve kedisi olan kişinin hemen solundadır."
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.8, // Mantık üretiminde yaratıcılık ile kurallılık dengesi
    });

    return parsedData as ApartmentLogicData;
}
