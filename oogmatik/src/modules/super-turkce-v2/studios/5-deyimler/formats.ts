import { TemplateDef } from '../../core/types';

export const idiomProverbFormats: TemplateDef[] = [
    {
        id: 'IDIOM_01_MATCH_PICTURE',
        studioId: 'deyimler',
        label: 'Görselden Deyimi Tahmin Et',
        description: 'Verilen karikatürize metinden / konudan doğru deyimi bulma.',
        icon: 'fa-images',
        difficulty: 'kolay',
        settings: [
            { key: 'sayi', label: 'Deyim Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                items: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            visualDescription: { type: "STRING", description: "Öğrenciye verilecek somut sahne/karikatür tasviri" },
                            idiom: { type: "STRING", description: "Cevap olan deyim" },
                            meaning: { type: "STRING", description: "Deyimin öğretmen için anlamı" }
                        },
                        required: ["visualDescription", "idiom", "meaning"]
                    }
                }
            },
            required: ["items"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temasına (veya insani duygulara) uygun ${s.sayi} adet sık kullanılan, ${grade}. sınıfa uygun DEYİM seç.
      Her deyim için, o deyimi kelimenin tam anlamıyla "resmeden" somut, komik veya canlandırıcı bir sahne tasviri (visualDescription) yaz.
      Örneğin "Küplere binmek" için "Adamın biri sinirden kıpkırmızı olmuş, üst üste dizilmiş küplerin üzerine zıplıyor." gibi.
    `,
        fastGenerate: () => ({
            items: [
                { visualDescription: "Bir adam düşünün, burnu havada yürüyor ve kimseye bakmıyor, adeta bulutlara değiyor.", idiom: "Burnu havada olmak", meaning: "Kibirli davranmak." },
                { visualDescription: "Küçük çocuk, annesinin sözlerini dinlemiyor, sanki sözler bir kulağından girip diğerinden çıkıyor.", idiom: "Bir kulağından girip diğerinden çıkmak", meaning: "Söylenenleri umursamamak." }
            ]
        })
    },
    {
        id: 'PROVERB_02_FILL_BLANK',
        studioId: 'deyimler',
        label: 'Atasözü Tamamlama',
        description: 'Yarım bırakılmış atasözünün devamını getirme.',
        icon: 'fa-feather',
        difficulty: 'orta',
        settings: [
            { key: 'secenekVer', label: 'Eşleştirme Seçeneği Ver', type: 'toggle', defaultValue: true }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                proverbs: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            firstHalf: { type: "STRING" },
                            secondHalf: { type: "STRING" },
                            fullMeaning: { type: "STRING" }
                        },
                        required: ["firstHalf", "secondHalf", "fullMeaning"]
                    }
                }
            },
            required: ["proverbs"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda veya genel kültüre ait ${grade}. sınıf müfredatındaki 5 adet popüler ATASÖZÜ seç.
      Bu atasözlerini mantıksal olarak tam ortadan (virgülden veya anlam bütünlüğünden) ikiye böl. (firstHalf, secondHalf)
      Anlamını da fullMeaning bölümüne ekle.
    `,
        fastGenerate: () => ({
            proverbs: [
                { firstHalf: "Sakla samanı,", secondHalf: "gelir zamanı.", fullMeaning: "Gereksiz görünen şeyleri saklamalı, ileride lazım olabilir." },
                { firstHalf: "Damlaya damlaya", secondHalf: "göl olur.", fullMeaning: "Küçük birikimler zamanla büyük şeylere dönüşür." }
            ]
        })
    }
];
