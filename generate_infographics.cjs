const fs = require('fs');
const path = require('path');

const categories = [
    {
        name: 'Disleksi',
        mechanisms: [
            "Fonolojik eşleştirme", "B/D/P/Q görsel ayırt etme", "Kelime tanıma hızlandırma",
            "Heceleme merdiveni", "Sesteş kelime haritalandırma", "Satır okuma odaklanması",
            "Kafiye aileleri", "Görsel hafıza kartları", "Okuduğunu anlama (5N1K)", "Çoklu duyusal harf şablonu"
        ],
        themes: [
            "Hayvanlar dünyası", "Uzay serüveni", "Günlük yaşam nesneleri", "Doğa ve çevre",
            "Eski çağ masalları", "Mutfak eşyaları", "Deniz altı", "Bahar renkleri",
            "Spor aletleri", "Taşıtlar"
        ],
        hints: ['list', 'compare', 'hierarchy', 'sequence', 'timeline', 'auto']
    },
    {
        name: 'Diskalkuli',
        mechanisms: [
            "Somut kesir parçalama", "Algoritmik onluk bozma", "Sayı doğrusunda yön bulma",
            "Çarpım tablosu örüntüleri", "Para yönetimi ve alışveriş", "Geometrik şekil dedektifliği",
            "Zaman ve saat çarkı", "Miktar zıtlığı tartısı", "Problem çözme akış diyagramı", "Ritmik sayma köprüsü"
        ],
        themes: [
            "Market alışverişi", "Lego blokları", "Pizza dilimleri", "Tren vagonları",
            "Sihirli orman", "Banka kumbarası", "Saat kulesi", "Meyve bahçesi",
            "Robot fabrikası", "Karınca kolonisi"
        ],
        hints: ['sequence', 'timeline', 'hierarchy', 'list', 'auto', 'compare']
    },
    {
        name: 'DEHB',
        mechanisms: [
            "Pomodoro mola blokları", "Etki-Tepki neden sonuç", "Önceliklendirme matrisi (Acil/Önemli)",
            "Duygu regülasyon termometresi", "Görev başlama roketi", "Çalışma masası checklist'i",
            "Günlük rutin planlayıcı", "İç ses yönlendirme", "Aktif dinleme hedefleri", "Dikkat toplama istasyonları"
        ],
        themes: [
            "Uzay görev kontrolü", "Dedektiflik ofisi", "Trafik ışıkları", "Otomobil yarış pisti",
            "Gemi kaptanı köşkü", "Dağ tırmanışı", "Şövalye antrenmanı", "Süper kahraman üssü",
            "Bilim laboratuvarı", "İtfaiye merkezi"
        ],
        hints: ['timeline', 'list', 'compare', 'auto', 'sequence', 'hierarchy']
    },
    {
        name: 'Disgrafi/Karma',
        mechanisms: [
            "İnce motor harf yönergeleri", "5N1K hikaye iskeleti", "Duyusal regülasyon",
            "Doğru kalem tutuş biyomekaniği", "Zihin haritası organizatörü", "Cümle kurma treni",
            "Satır ve kelime arası boşluk rehberi", "Paragraf burger şablonu", "Tahtadan bakıp yazma döngüsü", "Görsel şekil kopyalama"
        ],
        themes: [
            "Ressam stüdyosu", "Mimari çizim masası", "Yazarın daktilosu", "Uzay astronotu adımları",
            "Hacker klavyesi", "Aşcının tarif defteri", "Doktorun reçetesi", "Müzisyenin notaları",
            "Bahçıvanın defteri", "Dedektifin not defteri"
        ],
        hints: ['sequence', 'hierarchy', 'compare', 'timeline', 'list', 'auto']
    }
];

const results = [];

categories.forEach(cat => {
    const categoryObj = {
        category: cat.name,
        items: []
    };

    cat.mechanisms.forEach((mech, mechIdx) => {
        cat.themes.forEach((theme, themeIdx) => {
            const index = (mechIdx * cat.themes.length) + themeIdx + 1;
            const hint = cat.hints[(mechIdx + themeIdx) % cat.hints.length];

            let prompt = "";
            let title = "";

            if (cat.name === 'Disleksi') {
                title = `${mech} - ${theme}`;
                prompt = `${theme} teması kullanılarak tasarlanmış, ${mech.toLowerCase()} becerilerini destekleyen disleksi dostu görsel çalışma diyagramı. Kelime veya görseller sade ve büyüktür.`;
            } else if (cat.name === 'Diskalkuli') {
                title = `${mech} - ${theme}`;
                prompt = `${theme} senaryosu üzerinden ${mech.toLowerCase()} kavramlarını anlatan, sayılardan çok somut miktar ve hiyerarşi ilişkilerine odaklanan diskalkuli özel diyagram.`;
            } else if (cat.name === 'DEHB') {
                title = `${mech} - ${theme}`;
                prompt = `${theme} metaforu çerçevesinde, dikkat süresini artırmak ve ${mech.toLowerCase()} hedeflerini parçalara bölmek üzere hazırlanmış, az renkli, yüksek odaklı şema.`;
            } else {
                title = `${mech} - ${theme}`;
                prompt = `${theme} konsepti temel alınarak, görsel uzamsal algıyı ve motor planlamayı destekleyen, disgrafi/karma profile uygun, rehber çizgili infografik metodu: ${mech.toLowerCase()}.`;
            }

            categoryObj.items.push({
                title: title,
                prompt: prompt,
                hint: hint
            });
        });
    });

    results.push(categoryObj);
});

const content = `export interface InfographicTemplate {
  title: string;
  prompt: string;
  hint: string;
}

export interface TemplateCategory {
  category: string;
  items: InfographicTemplate[];
}

export const SPLD_PREMIUM_TEMPLATES: TemplateCategory[] = ${JSON.stringify(results, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'src/data/infographicTemplates.ts'), content, 'utf8');
console.log('Successfully generated 400 infographic templates.');
