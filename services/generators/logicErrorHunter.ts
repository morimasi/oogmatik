import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, LogicErrorHunterData } from '../../types/verbal';

export const generateLogicErrorHunter = async (options: GeneratorOptions): Promise<LogicErrorHunterData> => {
    const difficulty = options.difficulty || 'Orta';
    const absurdityDegree = options.absurdityDegree || 'obvious';
    const errorCount = options.errorCount || 3;
    const student = options.studentContext;

    let degreeInstruction = 'Çok açık, herkesin kolayca fark edebileceği günlük mantık hataları kullan (Örn: Suyu çatalla içti, Güneş gece doğdu).';
    if (absurdityDegree === 'minimal') {
        degreeInstruction = 'Daha ince, dikkat gerektiren ve okuduğunu anlamaya dayalı ufak mantık hataları kullan (Örn: Havuza atladığında elbisesi kupkuruydu, çok terlediği için kazak giydi).';
    } else if (absurdityDegree === 'surreal') {
        degreeInstruction = 'Gerçeküstü, fantastik düzeyde absürt ve komik hatalar içeren ancak yapısal olarak doğru olan cümleler kur (Örn: Uçan inekler trafik sıkışıklığına yol açtı).';
    }

    let studentContextInfo = '';
    if (student) {
        studentContextInfo = `Öğrenci Profili: ${student.age} yaşında. Konuları öğrencinin ilgisini çekecek yaş grubuna uygun (hayvanlar, okul, oyun, kahramanlar vs) belirle. Eğitsel ancak eğlenceli olsun.`;
    }

    const prompt = `
Sen disleksi ve okuduğunu anlama zorluğu yaşayan çocuklar için "Mantık Hataları Avcısı" (Absürt Hikayeler) etkinliği oluşturan uzman bir yapay zekasın.
Görev: Yaklaşık ${errorCount * 2} - ${errorCount * 3} cümlelik tek parça bir kısa hikaye oluşturmak ve bu hikayenin içine TAM OLARAK ${errorCount} ADET mantık hatası gizlemek.

PARAMETRELER:
- Zorluk Derecesi: ${difficulty}
- İstenen Hata Sayısı: ${errorCount}
- Absürtlük/Hata Türü: ${degreeInstruction}
${studentContextInfo}

TASARIM KURALLARI:
1. "story" alanında yaratıcı bir kısa öykü ver.
   (Hataları bold yapmak veya işaretlemek ZORUNDA DEĞİLSİN, öğrenci metni düz okuyup kendisi bulacaktır.)
2. Hikayenin içinde kesinlikle tam ${errorCount} tane anlamsal, mantıksal veya fiziksel hata (çelişki) olsun. Fazla veya eksik hata kurgulama.
3. Her hatayı "errors" listesinde obje olarak tanımla.
   - id: E1, E2 şeklinde benzersiz bir string olsun.
   - faultyWordOrPhrase: Metnin içinde geçen hatalı TAM kelime veya kelime öbeği. (Hatayı kapsayan en kısa metin parçası).
   - correction: Mantıklı olması için oraya ne gelmeliydi?
   - explanation: Bu durum neden mantıksız? (Öğrencinin dilinden basitçe açıkla).

İSTENEN FORMAT (Asla açıklama metni ekleme, direk JSON üret):

{
    "id": "logic_error_activity",
    "activityType": "LOGIC_ERROR_HUNTER",
    "title": "Hata Avcısı Hikayesi",
    "settings": {
        "difficulty": "${difficulty}",
        "absurdityDegree": "${absurdityDegree}",
        "errorCount": ${errorCount}
    },
    "content": {
        "title": "Kış Ortasında Güneşlenmek",
        "story": "Bugün hava çok ama çok soğuktu. Her yer bembeyaz karla kaplıydı. Mert dışarı çıkmak için şortunu ve terliklerini giydi. Kapıyı açtığında dondurucu rüzgar yüzüne vurdu. Kardan adam yapmak için hızlıca koştu. O kadar terlemişti ki, arkadaşı Ali'ye 'Havuza atlasak harika olur!' diye bağırdı. Sonra sobanın yanına oturup soğuktan titremeye devam ettiler.",
        "errors": [
            {
                "id": "E1",
                "faultyWordOrPhrase": "şortunu ve terliklerini",
                "correction": "montunu ve botlarını",
                "explanation": "Her yerin karla kaplı olduğu çok soğuk bir havada şort ve terlikle dışarı çıkılmaz."
            },
            {
                "id": "E2",
                "faultyWordOrPhrase": "O kadar terlemişti ki",
                "correction": "O kadar üşümüştü ki",
                "explanation": "Dondurucu rüzgarda ve karda oynarken terlenmez, tam tersine üşünür."
            },
            {
                "id": "E3",
                "faultyWordOrPhrase": "Havuza atlasak",
                "correction": "Sıcak bir çikolata içsek",
                "explanation": "Karda oynarken havuza atlanmaz, çünkü havuz suyu soğuktur ve kışın havuza girilmez."
            }
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.8, // Hikaye üretimi için yaratıcılığı artırıyoruz ama formatı koruması lazım
    });

    return parsedData as LogicErrorHunterData;
}
