
import React, { useState } from 'react';
import { AssessmentProfile, SavedAssessment, ActivityType, TestCategory } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { assessmentService } from '../services/assessmentService';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { useAuth } from '../context/AuthContext';
import { getRandomItems, shuffle, getRandomInt } from '../services/offlineGenerators/helpers';
import { TR_VOCAB } from '../data/vocabulary';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity, onAddToWorkbook }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'profile' | 'test-intro' | 'testing' | 'generating' | 'report'>('profile');
    
    // Profile State
    const [profile, setProfile] = useState<AssessmentProfile>({
        studentName: '',
        age: 7,
        grade: '1. Sınıf',
        gender: 'Erkek',
        observations: [],
        testResults: {}
    });

    // Test State
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [testBattery, setTestBattery] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [generatedReport, setGeneratedReport] = useState<SavedAssessment | null>(null);

    // Profile Handlers
    const grades = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'];
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        prepareTests();
        setStep('test-intro');
    };

    const toggleObservation = (obs: string) => {
        setProfile(prev => ({
            ...prev,
            observations: prev.observations.includes(obs) 
                ? prev.observations.filter(o => o !== obs) 
                : [...prev.observations, obs]
        }));
    };

    // --- HELPER: PICK RANDOM QUESTIONS ---
    const getRandomQuestions = (pool: any[], count: number) => {
        return shuffle(pool).slice(0, count);
    };

    // --- ADVANCED DYNAMIC TEST GENERATOR ENGINE (MULTIPLE INTELLIGENCES) ---
    const prepareTests = () => {
        const gradeNum = parseInt(profile.grade.split('.')[0]) || 1;
        const battery = [];

        // Her modülden 4-5 soru seçerek toplam 40-50 soruluk kapsamlı bir test oluştur.
        const qPerModule = 5; 

        // 1. LINGUISTIC (Sözel-Dilsel)
        battery.push(generateLinguisticTest(gradeNum, qPerModule));

        // 2. LOGICAL-MATHEMATICAL (Mantıksal)
        battery.push(generateLogicalTest(gradeNum, qPerModule));

        // 3. VISUAL-SPATIAL (Görsel-Uzamsal)
        battery.push(generateVisualTest(gradeNum, qPerModule));

        // 4. KINESTHETIC (Bedensel)
        battery.push(generateKinestheticTest(gradeNum, qPerModule));
        
        // 5. MUSICAL (Müziksel)
        battery.push(generateMusicalTest(gradeNum, qPerModule));
        
        // 6. NATURALISTIC (Doğacı)
        battery.push(generateNaturalisticTest(gradeNum, qPerModule));
        
        // 7. INTERPERSONAL (Sosyal)
        battery.push(generateInterpersonalTest(gradeNum, qPerModule));
        
        // 8. INTRAPERSONAL (İçsel)
        battery.push(generateIntrapersonalTest(gradeNum, qPerModule));
        
        // 9. ATTENTION (Dikkat - Ekstra)
        battery.push(generateAttentionTest(gradeNum, 4));

        setTestBattery(battery);
    };

    // --- GENERATORS PER INTELLIGENCE TYPE ---

    const generateLinguisticTest = (grade: number, count: number) => {
        const pool = [];
        
        if (grade <= 3) {
            // 1-3. Sınıf
            pool.push({ type: 'multiple-choice', text: "Hangi kelime 'Hızlı' kelimesinin zıttıdır?", options: ["Yavaş", "Koşan", "Süratli", "Çabuk"], correct: "Yavaş" });
            pool.push({ type: 'multiple-choice', text: "Aşağıdakilerden hangisi bir meyvedir?", options: ["Elma", "Pırasa", "Ispanak", "Marul"], correct: "Elma" });
            pool.push({ type: 'multiple-choice', text: "'Gözlük' kelimesi hangi heceyle başlar?", options: ["Göz", "Lük", "Gözl", "G"], correct: "Göz" });
            pool.push({ type: 'multiple-choice', text: "Cümleyi tamamla: Ali topu _______ attı.", options: ["kaleye", "yüzdü", "uyudu", "yedi"], correct: "kaleye" });
            pool.push({ type: 'multiple-choice', text: "Hangisi bir soru cümlesidir?", options: ["Eve geldim", "Okula gidiyor musun", "Çok güzel", "Hızlı koştu"], correct: "Okula gidiyor musun" });
            pool.push({ type: 'multiple-choice', text: "Hangisi alfabemizin ilk harfidir?", options: ["A", "B", "C", "Z"], correct: "A" });
            pool.push({ type: 'multiple-choice', text: "'Kitaplık' kelimesinde kaç hece vardır?", options: ["3", "2", "4", "1"], correct: "3" });
            pool.push({ type: 'multiple-choice', text: "Hangi kelime yanlış yazılmıştır?", options: ["Yalnış", "Herkes", "Kirpik", "Şemsiye"], correct: "Yalnış" });
        } else {
            // 4-6. Sınıf
            pool.push({ type: 'multiple-choice', text: "Hangi kelime 'Cesur' kelimesinin eş anlamlısıdır?", options: ["Yürekli", "Korkak", "Sessiz", "Hızlı"], correct: "Yürekli" });
            pool.push({ type: 'multiple-choice', text: "Analoji: 'Yazar' için 'Kitap' ne ise, 'Ressam' için _____ odur.", options: ["Tablo", "Boya", "Fırça", "Müze"], correct: "Tablo" });
            pool.push({ type: 'multiple-choice', text: "Aşağıdaki cümlede hangi duygu hakimdir? 'Sınavdan yüz aldığını görünce havalara uçtu.'", options: ["Sevinç", "Üzüntü", "Öfke", "Şaşkınlık"], correct: "Sevinç" });
            pool.push({ type: 'multiple-choice', text: "Deyim Anlamı: 'Göz boyamak' ne demektir?", options: ["Kandırmak, iyi göstermeye çalışmak", "Resim yapmak", "Gözlük takmak", "Makyaj yapmak"], correct: "Kandırmak, iyi göstermeye çalışmak" });
            pool.push({ type: 'multiple-choice', text: "Hangisi bir 'sebep-sonuç' cümlesidir?", options: ["Yağmur yağdığı için ıslandım.", "Eve gittim ve uyudum.", "Yarın sinemaya gideceğiz.", "Kitap okumayı severim."], correct: "Yağmur yağdığı için ıslandım." });
            pool.push({ type: 'multiple-choice', text: "Hangi cümlede 'yaz' kelimesi mevsim anlamında kullanılmıştır?", options: ["Bu yaz tatile gideceğiz.", "Tahtaya adını yaz.", "Bana mektup yaz.", "Kaderini yaz."], correct: "Bu yaz tatile gideceğiz." });
            pool.push({ type: 'multiple-choice', text: "Atasözünü tamamla: 'Sakla samanı, ______ zamanı.'", options: ["gelir", "gider", "biter", "yoktur"], correct: "gelir" });
            pool.push({ type: 'multiple-choice', text: "Hangisi öznel bir yargıdır?", options: ["Mavi en güzel renktir.", "Türkiye'nin başkenti Ankara'dır.", "Bir hafta yedi gündür.", "Su 100 derecede kaynar."], correct: "Mavi en güzel renktir." });
        }

        return { id: 'linguistic', name: 'Sözel-Dilsel Zeka', questions: getRandomQuestions(pool, count) };
    };

    const generateLogicalTest = (grade: number, count: number) => {
        const pool = [];
        if (grade <= 3) {
            pool.push({ type: 'multiple-choice', text: "Örüntüyü tamamla: 2, 4, 6, 8, ?", options: ["10", "9", "12", "11"], correct: "10" });
            pool.push({ type: 'multiple-choice', text: "Hangi şeklin 3 köşesi vardır?", options: ["Üçgen", "Kare", "Daire", "Dikdörtgen"], correct: "Üçgen" });
            pool.push({ type: 'multiple-choice', text: "Bir çiftlikte 3 inek ve 2 tavuk var. Toplam kaç ayak vardır?", options: ["16", "14", "20", "10"], correct: "16" });
            pool.push({ type: 'multiple-choice', text: "5 elman var, 2 tanesini yedin. Kaç elman kaldı?", options: ["3", "2", "7", "5"], correct: "3" });
            pool.push({ type: 'multiple-choice', text: "Hangisi diğerlerinden daha ağırdır?", options: ["Fil", "Kedi", "Fare", "Tavuk"], correct: "Fil" });
            pool.push({ type: 'multiple-choice', text: "Saat 3:00. Yarım saat sonra saat kaç olur?", options: ["3:30", "4:00", "2:30", "3:15"], correct: "3:30" });
            pool.push({ type: 'multiple-choice', text: "10 tane cevizim var. Yarısını kardeşime verdim. Bende kaç ceviz kaldı?", options: ["5", "10", "2", "8"], correct: "5" });
        } else {
            pool.push({ type: 'multiple-choice', text: "Mantık: Ali, Veli'den uzundur. Veli, Can'dan uzundur. En kısa kimdir?", options: ["Can", "Veli", "Ali", "Bilinemez"], correct: "Can" });
            pool.push({ type: 'multiple-choice', text: "Bir kutuda 3 kırmızı, 2 mavi top var. Rastgele çekilen bir topun mavi olma olasılığı nedir?", options: ["2/5", "3/5", "1/2", "1/5"], correct: "2/5" });
            pool.push({ type: 'multiple-choice', text: "Örüntüyü bul: 1, 4, 9, 16, ?", options: ["25", "20", "30", "24"], correct: "25" });
            pool.push({ type: 'multiple-choice', text: "Hangisi asal sayıdır?", options: ["17", "15", "21", "9"], correct: "17" });
            pool.push({ type: 'multiple-choice', text: "Çeyreği 5 olan sayının tamamı kaçtır?", options: ["20", "10", "15", "25"], correct: "20" });
            pool.push({ type: 'multiple-choice', text: "Bir araç saatte 60 km gidiyor. 3 saatte kaç km gider?", options: ["180", "120", "200", "150"], correct: "180" });
            pool.push({ type: 'multiple-choice', text: "Hangi sayı hem 2'ye hem 3'e tam bölünür?", options: ["12", "10", "9", "14"], correct: "12" });
            pool.push({ type: 'multiple-choice', text: "A + B = 10 ve A - B = 2 ise A kaçtır?", options: ["6", "5", "8", "4"], correct: "6" });
        }
        return { id: 'logical', name: 'Mantıksal-Matematiksel Zeka', questions: getRandomQuestions(pool, count) };
    };

    const generateVisualTest = (grade: number, count: number) => {
        const pool = [];
        if (grade <= 3) {
            pool.push({ type: 'multiple-choice', text: "Aşağıdaki şeklin aynısı hangisidir? (b)", options: ["b", "d", "p", "q"], correct: "b" });
            pool.push({ type: 'multiple-choice', text: "Hangi şekil yuvarlaktır?", options: ["Top", "Kutu", "Kitap", "Masa"], correct: "Top" });
            pool.push({ type: 'multiple-choice', text: "Yapbozun eksik parçasını tamamla: 🟦 🟦 🟨 🟨 🟦 ?", options: ["🟦", "🟨", "🟥", "⬛"], correct: "🟦" });
            pool.push({ type: 'multiple-choice', text: "Trafik ışığında 'Dur' anlamına gelen renk hangisidir?", options: ["Kırmızı", "Yeşil", "Sarı", "Mavi"], correct: "Kırmızı" });
            pool.push({ type: 'multiple-choice', text: "Hangi harf simetriktir (Ortadan katlanınca aynıdır)?", options: ["A", "F", "G", "L"], correct: "A" });
        } else {
            pool.push({ type: 'multiple-choice', text: "Zihinsel Döndürme: 'L' şeklini saat yönünde 90 derece çevirirsen neye benzer?", options: ["Γ (Ters L)", "L (Aynı)", "V", "I"], correct: "Γ (Ters L)" });
            pool.push({ type: 'multiple-choice', text: "Kuş bakışı: Bir bardağa tam tepeden bakarsan ne görürsün?", options: ["Daire", "Kare", "Üçgen", "Dikdörtgen"], correct: "Daire" });
            pool.push({ type: 'multiple-choice', text: "Harita Bilgisi: Güneşin doğduğu yön hangisidir?", options: ["Doğu", "Batı", "Kuzey", "Güney"], correct: "Doğu" });
            pool.push({ type: 'multiple-choice', text: "Bir küpün kaç yüzü vardır?", options: ["6", "4", "8", "12"], correct: "6" });
            pool.push({ type: 'multiple-choice', text: "Hangi şekil diğerlerinden farklıdır? (Üçgen, Kare, Daire, Beşgen)", options: ["Daire", "Kare", "Üçgen", "Beşgen"], correct: "Daire" });
        }
        return { id: 'spatial', name: 'Görsel-Uzamsal Zeka', questions: getRandomQuestions(pool, count) };
    };

    const generateKinestheticTest = (grade: number, count: number) => {
        const pool = [];
        pool.push({ type: 'multiple-choice', text: "Ayakkabı bağlarken ilk ne yaparsın?", options: ["Düğüm atarım", "Fiyonk yaparım", "Ayağıma giyerim", "İpi keserim"], correct: "Ayağıma giyerim" });
        pool.push({ type: 'multiple-choice', text: "Dengenizi sağlamak için ip cambazı ne kullanır?", options: ["Uzun bir çubuk", "Top", "Kitap", "Sandalye"], correct: "Uzun bir çubuk" });
        pool.push({ type: 'multiple-choice', text: "Hangisi el becerisi gerektirir?", options: ["İğneye iplik geçirmek", "Televizyon izlemek", "Müzik dinlemek", "Uyumak"], correct: "İğneye iplik geçirmek" });
        pool.push({ type: 'multiple-choice', text: "Sağ elini havaya kaldırıp aynaya bakarsan, aynada hangi elin havada görünür?", options: ["Sol el (Aynadaki görüntünün)", "Sağ el", "Hiçbiri", "İkisi de"], correct: "Sol el (Aynadaki görüntünün)" });
        pool.push({ type: 'multiple-choice', text: "Futbol oynarken topa neyle vurursun?", options: ["Ayak", "El", "Kafa", "Diz"], correct: "Ayak" });
        pool.push({ type: 'multiple-choice', text: "Hangi aktivitede tüm vücudunu kullanırsın?", options: ["Yüzme", "Yazı yazma", "Sakız çiğneme", "Göz kırpma"], correct: "Yüzme" });
        
        if (grade > 3) {
             pool.push({ type: 'multiple-choice', text: "Bir şeyi taklit ederek anlatma oyununa ne denir?", options: ["Sessiz Sinema", "Körebe", "Saklambaç", "Satranç"], correct: "Sessiz Sinema" });
             pool.push({ type: 'multiple-choice', text: "Heykel yaparken en çok neyini kullanırsın?", options: ["Ellerini ve parmaklarını", "Ayaklarını", "Kulaklarını", "Burnunu"], correct: "Ellerini ve parmaklarını" });
        }
        
        return { id: 'kinesthetic', name: 'Bedensel-Kinestetik Zeka', questions: getRandomQuestions(pool, count) };
    }

    const generateMusicalTest = (grade: number, count: number) => {
        const pool = [];
        pool.push({ type: 'multiple-choice', text: "Hangi kelime 'Masa' ile kafiyelidir?", options: ["Kasa", "Kapı", "Sandalye", "Mavi"], correct: "Kasa" });
        pool.push({ type: 'multiple-choice', text: "Ritmi tamamla: Dum-Tek-Dum-Tek-Dum-?", options: ["Tek", "Dum", "Tıs", "Bom"], correct: "Tek" });
        pool.push({ type: 'multiple-choice', text: "Hangisi bir müzik aletidir?", options: ["Gitar", "Tarak", "Kaşık", "Kalem"], correct: "Gitar" });
        pool.push({ type: 'multiple-choice', text: "Kuş sesi nasıl bir sestir?", options: ["İnce ve tiz", "Kalın ve bas", "Gürültülü", "Mekanik"], correct: "İnce ve tiz" });
        pool.push({ type: 'multiple-choice', text: "Bir şarkıyı mırıldanmak ne anlama gelir?", options: ["Melodisini söylemek", "Sözlerini okumak", "Bağırmak", "Susmak"], correct: "Melodisini söylemek" });
        
        if (grade > 3) {
             pool.push({ type: 'multiple-choice', text: "Hangi enstrüman vurmalı çalgıdır?", options: ["Davul", "Keman", "Flüt", "Gitar"], correct: "Davul" });
             pool.push({ type: 'multiple-choice', text: "Müzikte hızın artmasına ne denir?", options: ["Tempo", "Ritim", "Nota", "Sus"], correct: "Tempo" });
        }

        return { id: 'musical', name: 'Müziksel-Ritmik Zeka', questions: getRandomQuestions(pool, count) };
    };

    const generateNaturalisticTest = (grade: number, count: number) => {
        const pool = [];
        pool.push({ type: 'multiple-choice', text: "Hangisi kış uykusuna yatar?", options: ["Ayı", "Kedi", "Kuş", "At"], correct: "Ayı" });
        pool.push({ type: 'multiple-choice', text: "Bir bitkinin büyümesi için hangisi GEREKLİ DEĞİLDİR?", options: ["Çikolata", "Su", "Güneş", "Toprak"], correct: "Çikolata" });
        pool.push({ type: 'multiple-choice', text: "Hangi hayvan suda yaşar?", options: ["Balık", "Tavşan", "Zürafa", "Kelebek"], correct: "Balık" });
        pool.push({ type: 'multiple-choice', text: "Sonbaharda ağaçlara ne olur?", options: ["Yapraklarını dökerler", "Çiçek açarlar", "Meyve verirler", "Yeşerirler"], correct: "Yapraklarını dökerler" });
        pool.push({ type: 'multiple-choice', text: "Hangisi bir doğal afettir?", options: ["Deprem", "Trafik kazası", "Yangın", "Kavga"], correct: "Deprem" });
        
        if (grade > 3) {
            pool.push({ type: 'multiple-choice', text: "Tırtıl büyüyünce neye dönüşür?", options: ["Kelebek", "Sinek", "Arı", "Böcek"], correct: "Kelebek" });
            pool.push({ type: 'multiple-choice', text: "Hangisi yenilenebilir enerji kaynağıdır?", options: ["Güneş", "Kömür", "Petrol", "Doğalgaz"], correct: "Güneş" });
            pool.push({ type: 'multiple-choice', text: "Bulutlar neyden oluşur?", options: ["Su buharı", "Pamuk", "Duman", "Kar"], correct: "Su buharı" });
        }

        return { id: 'naturalistic', name: 'Doğacı Zeka', questions: getRandomQuestions(pool, count) };
    };
    
    const generateInterpersonalTest = (grade: number, count: number) => {
        const pool = [];
        pool.push({ type: 'multiple-choice', text: "Arkadaşın oyuncağını kaybetti ve ağlıyor. Ne yaparsın?", options: ["Bulmasına yardım ederim", "Onunla dalga geçerim", "Görmezden gelirim", "Öğretmene şikayet ederim"], correct: "Bulmasına yardım ederim" });
        pool.push({ type: 'multiple-choice', text: "Birisi sana hediye verdiğinde ne dersin?", options: ["Teşekkür ederim", "Bunu sevmedim", "Neden aldın?", "Susarım"], correct: "Teşekkür ederim" });
        pool.push({ type: 'multiple-choice', text: "Sınıfa yeni bir öğrenci geldi. Ne yapmalısın?", options: ["Onunla tanışıp hoş geldin derim", "Ona bakmam", "Ona gülerim", "Sıramı saklarım"], correct: "Onunla tanışıp hoş geldin derim" });
        pool.push({ type: 'multiple-choice', text: "Takım oyununda kazanmak için ne önemlidir?", options: ["İşbirliği yapmak", "Tek başına oynamak", "Hile yapmak", "Küsler"], correct: "İşbirliği yapmak" });
        
        if (grade > 3) {
            pool.push({ type: 'multiple-choice', text: "İki arkadaşın kavga ediyor. Ne yaparsın?", options: ["Onları barıştırmaya çalışırım", "Kavgayı izlerim", "Birini tutarım", "Kavgayı kızıştırırım"], correct: "Onları barıştırmaya çalışırım" });
            pool.push({ type: 'multiple-choice', text: "Bir grup çalışmasında fikrin kabul edilmedi. Tepkin ne olur?", options: ["Diğer fikirlere saygı duyarım", "Küsüp giderim", "Bağırırım", "Çalışmayı bozarım"], correct: "Diğer fikirlere saygı duyarım" });
        }
        
        return { id: 'interpersonal', name: 'Sosyal Zeka', questions: getRandomQuestions(pool, count) };
    }

    const generateIntrapersonalTest = (grade: number, count: number) => {
        const pool = [];
        pool.push({ type: 'multiple-choice', text: "Bir konuda başarısız olduğunda ne düşünürsün?", options: ["Daha çok çalışıp tekrar denemeliyim", "Ben yeteneksizim", "Herkes suçlu", "Şanssızım"], correct: "Daha çok çalışıp tekrar denemeliyim" });
        pool.push({ type: 'multiple-choice', text: "Kendini çok kızgın hissettiğinde ne yaparsın?", options: ["Derin nefes alıp sakinleşmeye çalışırım", "Etrafı kırıp dökerim", "Bağırırım", "Arkadaşıma vururum"], correct: "Derin nefes alıp sakinleşmeye çalışırım" });
        pool.push({ type: 'multiple-choice', text: "En sevdiğin aktiviteyi seçmen gerekse hangisini seçersin?", options: ["Bana en çok keyif vereni", "Arkadaşımın sevdiğini", "En pahalı olanı", "Rastgele birini"], correct: "Bana en çok keyif vereni" });
        pool.push({ type: 'multiple-choice', text: "Gelecekte ne olmak istediğine nasıl karar verirsin?", options: ["İlgi ve yeteneklerime göre", "Arkadaşım ne olursa", "Annem ne derse", "Bilmiyorum"], correct: "İlgi ve yeteneklerime göre" });
        
        if (grade > 3) {
             pool.push({ type: 'multiple-choice', text: "Güçlü yönlerini bilmek sana ne kazandırır?", options: ["Hangi alanlarda daha başarılı olacağımı gösterir", "Hiçbir şey", "Hava atmamı sağlar", "Ders çalışmamı engeller"], correct: "Hangi alanlarda daha başarılı olacağımı gösterir" });
             pool.push({ type: 'multiple-choice', text: "Hata yaptığında kendine ne söylersin?", options: ["Bu bir öğrenme fırsatı", "Ben aptalım", "Bir daha asla yapmamalıyım", "Saklanmalıyım"], correct: "Bu bir öğrenme fırsatı" });
        }

        return { id: 'intrapersonal', name: 'İçsel Zeka', questions: getRandomQuestions(pool, count) };
    }

    const generateAttentionTest = (grade: number, count: number) => {
        const isHard = grade > 3;
        const pool = [];
        
        pool.push({
            type: 'multiple-choice',
            text: 'Aşağıdaki dizide kuralı bozan şekli bul: ⭐ ⭐ ☀️ ⭐ ⭐',
            options: ['Ortadaki Güneş', '1. Yıldız', 'Sonuncu Yıldız', 'Hepsi Aynı'],
            correct: 'Ortadaki Güneş'
        });
        
        pool.push({
            type: 'multiple-choice',
            text: 'Hangi harf farklıdır? ( b - b - d - b )',
            options: ['3. d', '1. b', '4. b', 'Hepsi aynı'],
            correct: '3. d'
        });
        
        pool.push({
            type: 'multiple-choice',
            text: 'Hangi sayı dizisi farklıdır? ( 123 - 123 - 132 - 123 )',
            options: ['132', '123', 'Hepsi aynı', 'Bilinemez'],
            correct: '132'
        });

        if (isHard) {
            pool.push({
                type: 'multiple-choice',
                text: 'Hangi iki sayı birbirinin aynısıdır? ( 69 - 96 - 69 - 66 )',
                options: ['1. ve 3. (69)', '66 ve 96', 'Hiçbiri', 'Hepsi'],
                correct: '1. ve 3. (69)'
            });
            pool.push({
                type: 'multiple-choice',
                text: 'Tersten okunuşu kendisiyle aynı olan kelime hangisidir?',
                options: ['KAYAK', 'KİTAP', 'MASA', 'ELMA'],
                correct: 'KAYAK'
            });
        }

        return {
            id: 'attention', 
            name: 'Dikkat & Konsantrasyon',
            questions: getRandomQuestions(pool, count)
        };
    };

    // --- TEST EXECUTION HANDLERS ---
    const handleAnswer = (answer: any) => {
        const currentTest = testBattery[currentTestIndex];
        const currentQ = currentTest.questions[currentQuestionIndex];
        
        // Record Answer
        const isCorrect = String(answer) === String(currentQ.correct);
        setAnswers(prev => [...prev, {
            testId: currentTest.id,
            questionIdx: currentQuestionIndex,
            isCorrect,
            time: 0 
        }]);

        // Next Question or Next Test
        if (currentQuestionIndex < currentTest.questions.length - 1) {
            setCurrentQuestionIndex(p => p + 1);
        } else {
            if (currentTestIndex < testBattery.length - 1) {
                setCurrentTestIndex(p => p + 1);
                setCurrentQuestionIndex(0);
            } else {
                finishTests();
            }
        }
    };

    const finishTests = async () => {
        setStep('generating');
        
        // Compile Results
        const compiledResults: any = {};
        testBattery.forEach(test => {
            const testAnswers = answers.filter(a => a.testId === test.id);
            const correctCount = testAnswers.filter((a: any) => a.isCorrect).length;
            compiledResults[test.id] = {
                id: test.id,
                name: test.name,
                score: correctCount * 10, // Scale appropriately based on question count
                total: test.questions.length * 10,
                accuracy: test.questions.length > 0 ? (correctCount / test.questions.length) * 100 : 0,
                duration: 0,
                timestamp: Date.now()
            };
        });

        const finalProfile = { ...profile, testResults: compiledResults };
        setProfile(finalProfile);

        try {
            const report = await generateAssessmentReport(finalProfile);
            const savedAssessment: SavedAssessment = {
                id: crypto.randomUUID(),
                userId: user?.id || 'guest',
                studentName: profile.studentName,
                age: profile.age,
                gender: profile.gender,
                grade: profile.grade,
                report,
                createdAt: new Date().toISOString()
            };
            
            if (user) {
                await assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, report);
            }
            
            setGeneratedReport(savedAssessment);
            setStep('report');
        } catch (error) {
            console.error(error);
            alert("Rapor oluşturulurken bir hata oluştu.");
            setStep('profile');
        }
    };

    // --- RENDERERS ---

    if (step === 'profile') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl mt-8 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 border-zinc-200 dark:border-zinc-700">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Çoklu Zeka Değerlendirme Profili</h2>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Adı Soyadı</label>
                            <input type="text" required className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" 
                                value={profile.studentName} onChange={e => setProfile({...profile, studentName: e.target.value})} placeholder="Örn: Ali Yılmaz" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Cinsiyet</label>
                            <div className="flex gap-4">
                                {['Erkek', 'Kız'].map(g => (
                                    <button key={g} type="button" onClick={() => setProfile({...profile, gender: g as any})}
                                        className={`flex-1 p-3 rounded-xl border-2 font-bold transition-all ${profile.gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500'}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Yaş</label>
                            <input type="number" required min="5" max="15" className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" 
                                value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Sınıf (Test Seviyesi)</label>
                            <select className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                                value={profile.grade} onChange={e => setProfile({...profile, grade: e.target.value})}>
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-3">Eğitmen Gözlemleri (Varsa İşaretleyin)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {['Okumada güçlük', 'Yazı bozukluğu (Disgrafi)', 'Matematikte zorlanma (Diskalkuli)', 'Dikkat eksikliği', 'Aşırı hareketlilik', 'Harfleri karıştırma', 'Sosyal iletişimde zorluk', 'Yönleri karıştırma'].map(obs => (
                                <button key={obs} type="button" onClick={() => toggleObservation(obs)}
                                    className={`text-left p-3 rounded-lg border transition-all text-sm ${profile.observations.includes(obs) ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                                    <i className={`fa-solid ${profile.observations.includes(obs) ? 'fa-check-square' : 'fa-square'} mr-2`}></i>
                                    {obs}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Testi Başlat</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        );
    }

    if (step === 'test-intro' || step === 'testing') {
        const currentTest = testBattery[currentTestIndex];
        const currentQ = currentTest?.questions[currentQuestionIndex];

        if (step === 'test-intro') {
            return (
                <div className="max-w-xl mx-auto mt-20 text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-indigo-100 animate-in zoom-in">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-3xl">
                        <i className="fa-solid fa-rocket"></i>
                    </div>
                    <h2 className="text-2xl font-black text-zinc-800 mb-2">Hazır mısın {profile.studentName.split(' ')[0]}?</h2>
                    <p className="text-zinc-500 mb-8">
                        Senin için <strong>{profile.grade}</strong> seviyesinde ve farklı zeka alanlarını (Howard Gardner) ölçen özel sorular hazırladık. 
                        Toplam {testBattery.length} bölümden oluşuyor. Her bölümde yaklaşık 5 soru var.
                    </p>
                    <button onClick={() => setStep('testing')} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-300">
                        Başla!
                    </button>
                </div>
            );
        }

        // Safety check if questions are empty
        if (!currentTest || !currentQ) {
             finishTests();
             return null;
        }

        return (
            <div className="max-w-3xl mx-auto mt-8 p-6 md:p-12 bg-white rounded-3xl shadow-2xl border border-zinc-200 relative overflow-hidden min-h-[500px] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-2 bg-zinc-100">
                    <div className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{width: `${((currentTestIndex * 5 + currentQuestionIndex) / (testBattery.length * 5)) * 100}%`}}></div>
                </div>
                
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{currentTest.name}</span>
                    <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">{currentQuestionIndex + 1} / {currentTest.questions.length}</span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {currentQ.type === 'text-read' ? (
                        <div className="text-center mb-8">
                            <p className="text-2xl font-dyslexic leading-loose text-zinc-800 mb-8 bg-amber-50 p-6 rounded-xl border-2 border-amber-100">{currentQ.content}</p>
                            <button onClick={() => handleAnswer(true)} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">Okudum, Devam Et</button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 text-center mb-10 whitespace-pre-line">{currentQ.text}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((opt: string, i: number) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} 
                                        className="p-6 text-lg font-bold text-zinc-700 bg-zinc-50 border-2 border-zinc-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95">
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (step === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center h-full mt-20">
                <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-zinc-800">Yapay Zeka Analiz Yapıyor...</h3>
                <p className="text-zinc-500 mt-2">Tüm zeka alanlarındaki performansını inceliyorum.</p>
            </div>
        );
    }

    if (step === 'report' && generatedReport) {
        return (
            <AssessmentReportViewer 
                assessment={generatedReport} 
                onClose={onBack} 
                user={user}
                onAddToWorkbook={onAddToWorkbook}
            />
        );
    }

    return null;
};
