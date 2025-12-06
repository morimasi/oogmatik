
import React, { useState } from 'react';
import { AssessmentProfile, SavedAssessment, ActivityType, TestCategory } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { assessmentService } from '../services/assessmentService';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { useAuth } from '../context/AuthContext';
import { getRandomItems, shuffle, getRandomInt } from '../services/offlineGenerators/helpers';
import { TR_VOCAB, EMOJI_MAP } from '../data/vocabulary';

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
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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

    // --- DYNAMIC TEST GENERATOR ENGINE ---
    // Bu fonksiyonlar her çağrıldığında rastgele yeni sorular üretir.

    const generateLinguisticTest = (grade: number, count: number) => {
        const questions = [];
        const isEasy = grade <= 3;
        
        for (let i = 0; i < count; i++) {
            const type = getRandomInt(1, 4); // 1: Antonym, 2: Synonym/Category, 3: Logic/Grammar, 4: Spelling
            
            if (type === 1 && TR_VOCAB.antonyms.length > 0) {
                // Zıt Anlam
                const pair = getRandomItems(TR_VOCAB.antonyms, 1)[0];
                const distractors = getRandomItems(TR_VOCAB.antonyms.filter(a => a.word !== pair.word), 3).map(a => a.antonym);
                questions.push({
                    type: 'multiple-choice',
                    text: `Hangi kelime '${pair.word.toUpperCase()}' kelimesinin zıttıdır?`,
                    options: shuffle([pair.antonym, ...distractors]),
                    correct: pair.antonym
                });
            } else if (type === 2) {
                if (isEasy) {
                    // Kategori (Meyve/Hayvan)
                    const cat = Math.random() > 0.5 ? 'animals' : 'fruits_veggies';
                    const item = getRandomItems((TR_VOCAB as any)[cat], 1)[0] as string;
                    const correct = cat === 'animals' ? 'Hayvan' : 'Meyve/Sebze';
                    const wrong = cat === 'animals' ? 'Meyve/Sebze' : 'Hayvan';
                    questions.push({
                        type: 'multiple-choice',
                        text: `'${item.toUpperCase()}' nedir?`,
                        options: shuffle([correct, wrong, 'Eşya', 'Renk']),
                        correct: correct
                    });
                } else {
                    // Eş Anlam
                    const pair = getRandomItems(TR_VOCAB.synonyms, 1)[0];
                    const distractors = getRandomItems(TR_VOCAB.synonyms.filter(a => a.word !== pair.word), 3).map(a => a.synonym);
                    questions.push({
                        type: 'multiple-choice',
                        text: `Hangi kelime '${pair.word.toUpperCase()}' ile aynı anlama gelir?`,
                        options: shuffle([pair.synonym, ...distractors]),
                        correct: pair.synonym
                    });
                }
            } else if (type === 3) {
                // Cümle/Analoji
                if (isEasy) {
                    const actions = [
                        { q: "Ali topu kaleye...", a: "attı", d: ["yedi", "uyudu", "giydi"] },
                        { q: "Ayşe kitabı...", a: "okudu", d: ["içti", "koştu", "yüzdü"] },
                        { q: "Sabah uyanınca yüzümü...", a: "yıkarım", d: ["tararım", "giyerim", "yazarım"] }
                    ];
                    const qData = getRandomItems(actions, 1)[0];
                    questions.push({
                        type: 'multiple-choice',
                        text: `Boşluğu tamamla: ${qData.q}`,
                        options: shuffle([qData.a, ...qData.d]),
                        correct: qData.a
                    });
                } else {
                     const analogies = [
                        { q: "Yazar - Kitap", t: "Ressam", a: "Tablo", d: ["Fırça", "Boya", "Müze"] },
                        { q: "Öğretmen - Okul", t: "Doktor", a: "Hastane", d: ["İlaç", "Hasta", "Önlük"] },
                        { q: "Ayak - Ayakkabı", t: "El", a: "Eldiven", d: ["Yüzük", "Saat", "Bilezik"] }
                    ];
                    const qData = getRandomItems(analogies, 1)[0];
                    questions.push({
                        type: 'multiple-choice',
                        text: `Analoji: '${qData.q}' ilişkisi '${qData.t}' için hangisiyle kurulur?`,
                        options: shuffle([qData.a, ...qData.d]),
                        correct: qData.a
                    });
                }
            } else {
                // Yazım Yanlışı
                const wrongs = [
                    { w: "Yalnış", c: "Yanlış" }, { w: "Herkez", c: "Herkes" }, { w: "Şöför", c: "Şoför" }, { w: "Kirbit", c: "Kibrit" }
                ];
                const item = getRandomItems(wrongs, 1)[0];
                questions.push({
                    type: 'multiple-choice',
                    text: `Hangi kelimenin doğru yazılışı '${item.c}' şeklindedir?`,
                    options: shuffle([item.w, item.c, item.c + "ki", item.w + "ler"]),
                    correct: item.c // Soru: Hangisi doğru yazılmıştır?
                });
                 // Basitlestirilmis versiyon:
                 questions.pop();
                 questions.push({
                     type: 'multiple-choice',
                     text: "Hangi kelime YANLIŞ yazılmıştır?",
                     options: shuffle([item.w, "Kitap", "Kalem", "Okul"]),
                     correct: item.w
                 });
            }
        }
        return { id: 'linguistic', name: 'Sözel-Dilsel Zeka', questions };
    };

    const generateLogicalTest = (grade: number, count: number) => {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            const type = getRandomInt(1, 3); // 1: Pattern, 2: Word Problem, 3: Arithmetic Logic
            
            if (type === 1) {
                // Örüntü (Dinamik)
                const start = getRandomInt(1, 10);
                const step = getRandomInt(2, 5);
                const seq = [start, start+step, start+step*2, start+step*3];
                const answer = start + step * 4;
                const distractors = [answer+1, answer-1, answer+2];
                
                questions.push({
                    type: 'multiple-choice',
                    text: `Sıradaki sayıyı bul: ${seq.join(', ')}, ?`,
                    options: shuffle([answer.toString(), ...distractors.map(String)]),
                    correct: answer.toString()
                });
            } else if (type === 2) {
                // Problemler (Dinamik)
                const n1 = getRandomInt(5, 15);
                const n2 = getRandomInt(2, 5);
                const op = Math.random() > 0.5 ? 'çıkardı' : 'ekledi';
                const ans = op === 'çıkardı' ? n1 - n2 : n1 + n2;
                const distractors = [ans+1, ans-1, ans+2];
                
                questions.push({
                    type: 'multiple-choice',
                    text: `Ali'nin ${n1} bilyesi vardı. ${n2} tanesini ${op === 'çıkardı' ? 'kaybetti' : 'kazandı'}. Kaç bilyesi oldu?`,
                    options: shuffle([ans.toString(), ...distractors.map(String)]),
                    correct: ans.toString()
                });
            } else {
                // Mantık / Karşılaştırma
                const objs = ['Fil', 'Fare', 'Kedi', 'At'];
                const qObj = grade <= 2 ? "Hangisi en ağırdır?" : "Bir otobüs 40 yolcu alıyor, minibüs 15. İkisi toplam kaç yolcu alır?";
                if (grade <= 2) {
                    questions.push({ type: 'multiple-choice', text: qObj, options: shuffle(objs), correct: 'Fil' });
                } else {
                     const a = 40, b = 15, ans = 55;
                     questions.push({
                        type: 'multiple-choice',
                        text: qObj,
                        options: shuffle([ans.toString(), (ans-5).toString(), (ans+5).toString(), "60"]),
                        correct: ans.toString()
                     });
                }
            }
        }
        return { id: 'logical', name: 'Mantıksal-Matematiksel Zeka', questions };
    };

    const generateVisualTest = (grade: number, count: number) => {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const type = getRandomInt(1, 3);
            
            if (type === 1) {
                // Şekil Tanıma
                const shapes = [{n:'Üçgen', c:3}, {n:'Kare', c:4}, {n:'Beşgen', c:5}, {n:'Altıgen', c:6}];
                const target = getRandomItems(shapes, 1)[0];
                questions.push({
                    type: 'multiple-choice',
                    text: `Hangi şeklin ${target.c} köşesi vardır?`,
                    options: shuffle(shapes.map(s => s.n)),
                    correct: target.n
                });
            } else if (type === 2) {
                // Yön/Döndürme
                const letters = ['L', 'F', 'E', 'T'];
                const target = getRandomItems(letters, 1)[0];
                questions.push({
                    type: 'multiple-choice',
                    text: `Zihinsel Döndürme: '${target}' harfini ters çevirirsen (aynalarsan) hangisine benzer?`,
                    options: shuffle([`Ters ${target}`, target, 'V', 'O']),
                    correct: `Ters ${target}`
                });
            } else {
                // Görsel Dikkat
                const base = ['b', 'd', 'p', 'q'];
                const target = getRandomItems(base, 1)[0];
                const options = shuffle(base);
                questions.push({
                    type: 'multiple-choice',
                    text: `Aşağıdaki harfin aynısını bul: (${target})`,
                    options: options,
                    correct: target
                });
            }
        }
        return { id: 'spatial', name: 'Görsel-Uzamsal Zeka', questions };
    };

    // Kinesthetic, Musical, etc. rely on static pools but we randomize selection order
    // to make them feel fresh.
    const generateStaticPoolTest = (id: TestCategory, name: string, pool: any[], count: number) => {
        return { id, name, questions: getRandomItems(pool, count) };
    };

    // --- STATIC POOLS (But Randomized Selection) ---
    
    const kinestheticPool = [
        { text: "Ayakkabı bağlarken ilk ne yaparsın?", options: ["Düğüm atarım", "Fiyonk yaparım", "Ayağıma giyerim", "İpi keserim"], correct: "Ayağıma giyerim" },
        { text: "Dengenizi sağlamak için ip cambazı ne kullanır?", options: ["Uzun bir çubuk", "Top", "Kitap", "Sandalye"], correct: "Uzun bir çubuk" },
        { text: "Hangisi ince motor (parmak) becerisi gerektirir?", options: ["İğneye iplik geçirmek", "Koşmak", "Zıplamak", "Yürümek"], correct: "İğneye iplik geçirmek" },
        { text: "Futbol oynarken topa neyle vurursun?", options: ["Ayak", "El", "Kafa", "Diz"], correct: "Ayak" },
        { text: "Hangi aktivitede tüm vücudunu kullanırsın?", options: ["Yüzme", "Yazı yazma", "Sakız çiğneme", "Göz kırpma"], correct: "Yüzme" },
        { text: "Sağ elini havaya kaldırıp aynaya bakarsan, aynada hangi elin havada görünür?", options: ["Sol el (Görüntünün)", "Sağ el", "İkisi de", "Hiçbiri"], correct: "Sol el (Görüntünün)" },
        { text: "Heykel yaparken en çok neyini kullanırsın?", options: ["Ellerini", "Ayaklarını", "Kulaklarını", "Burnunu"], correct: "Ellerini" },
        { text: "Bisiklet sürerken dengeyi nasıl sağlarsın?", options: ["Hareket ederek", "Durarak", "Gözlerini kapatarak", "Bağırarak"], correct: "Hareket ederek" }
    ];

    const musicalPool = [
        { text: "Hangi kelime 'Masa' ile kafiyelidir?", options: ["Kasa", "Kapı", "Sandalye", "Mavi"], correct: "Kasa" },
        { text: "Ritmi tamamla: Dum-Tek-Dum-Tek-Dum-?", options: ["Tek", "Dum", "Tıs", "Bom"], correct: "Tek" },
        { text: "Hangisi bir müzik aletidir?", options: ["Gitar", "Tarak", "Kaşık", "Kalem"], correct: "Gitar" },
        { text: "Kuş sesi nasıl bir sestir?", options: ["İnce ve tiz", "Kalın ve bas", "Gürültülü", "Mekanik"], correct: "İnce ve tiz" },
        { text: "Bir şarkıyı mırıldanmak ne anlama gelir?", options: ["Melodisini söylemek", "Sözlerini okumak", "Bağırmak", "Susmak"], correct: "Melodisini söylemek" },
        { text: "Hangi enstrüman vurmalı çalgıdır?", options: ["Davul", "Keman", "Flüt", "Gitar"], correct: "Davul" },
        { text: "Müzikte hızın artmasına ne denir?", options: ["Tempo", "Ritim", "Nota", "Sus"], correct: "Tempo" },
        { text: "Do-Re-Mi-Fa-Sol-La-Si-?", options: ["Do", "Da", "Di", "Du"], correct: "Do" }
    ];

    const naturalisticPool = [
        { text: "Hangisi kış uykusuna yatar?", options: ["Ayı", "Kedi", "Kuş", "At"], correct: "Ayı" },
        { text: "Bir bitkinin büyümesi için hangisi GEREKLİ DEĞİLDİR?", options: ["Çikolata", "Su", "Güneş", "Toprak"], correct: "Çikolata" },
        { text: "Hangi hayvan suda yaşar?", options: ["Balık", "Tavşan", "Zürafa", "Kelebek"], correct: "Balık" },
        { text: "Sonbaharda ağaçlara ne olur?", options: ["Yapraklarını dökerler", "Çiçek açarlar", "Meyve verirler", "Yeşerirler"], correct: "Yapraklarını dökerler" },
        { text: "Hangisi bir doğal afettir?", options: ["Deprem", "Trafik kazası", "Yangın", "Kavga"], correct: "Deprem" },
        { text: "Tırtıl büyüyünce neye dönüşür?", options: ["Kelebek", "Sinek", "Arı", "Böcek"], correct: "Kelebek" },
        { text: "Hangisi yenilenebilir enerji kaynağıdır?", options: ["Güneş", "Kömür", "Petrol", "Doğalgaz"], correct: "Güneş" },
        { text: "Arılar ne yapar?", options: ["Bal", "Süt", "Yumurta", "Yün"], correct: "Bal" }
    ];

    const interpersonalPool = [
        { text: "Arkadaşın oyuncağını kaybetti ve ağlıyor. Ne yaparsın?", options: ["Bulmasına yardım ederim", "Onunla dalga geçerim", "Görmezden gelirim", "Öğretmene şikayet ederim"], correct: "Bulmasına yardım ederim" },
        { text: "Birisi sana hediye verdiğinde ne dersin?", options: ["Teşekkür ederim", "Bunu sevmedim", "Neden aldın?", "Susarım"], correct: "Teşekkür ederim" },
        { text: "Sınıfa yeni bir öğrenci geldi. Ne yapmalısın?", options: ["Onunla tanışıp hoş geldin derim", "Ona bakmam", "Ona gülerim", "Sıramı saklarım"], correct: "Onunla tanışıp hoş geldin derim" },
        { text: "Takım oyununda kazanmak için ne önemlidir?", options: ["İşbirliği yapmak", "Tek başına oynamak", "Hile yapmak", "Küsler"], correct: "İşbirliği yapmak" },
        { text: "İki arkadaşın kavga ediyor. Ne yaparsın?", options: ["Onları barıştırmaya çalışırım", "Kavgayı izlerim", "Birini tutarım", "Kavgayı kızıştırırım"], correct: "Onları barıştırmaya çalışırım" },
        { text: "Bir grup çalışmasında fikrin kabul edilmedi. Tepkin ne olur?", options: ["Diğer fikirlere saygı duyarım", "Küsüp giderim", "Bağırırım", "Çalışmayı bozarım"], correct: "Diğer fikirlere saygı duyarım" },
        { text: "Biri yere düştü, ne yaparsın?", options: ["Kalkmasına yardım ederim", "Gülerim", "Bakıp geçerim", "Fotoğrafını çekerim"], correct: "Kalkmasına yardım ederim" }
    ];

    const intrapersonalPool = [
        { text: "Bir konuda başarısız olduğunda ne düşünürsün?", options: ["Daha çok çalışıp tekrar denemeliyim", "Ben yeteneksizim", "Herkes suçlu", "Şanssızım"], correct: "Daha çok çalışıp tekrar denemeliyim" },
        { text: "Kendini çok kızgın hissettiğinde ne yaparsın?", options: ["Derin nefes alıp sakinleşmeye çalışırım", "Etrafı kırıp dökerim", "Bağırırım", "Arkadaşıma vururum"], correct: "Derin nefes alıp sakinleşmeye çalışırım" },
        { text: "En sevdiğin aktiviteyi seçmen gerekse hangisini seçersin?", options: ["Bana en çok keyif vereni", "Arkadaşımın sevdiğini", "En pahalı olanı", "Rastgele birini"], correct: "Bana en çok keyif vereni" },
        { text: "Gelecekte ne olmak istediğine nasıl karar verirsin?", options: ["İlgi ve yeteneklerime göre", "Arkadaşım ne olursa", "Annem ne derse", "Bilmiyorum"], correct: "İlgi ve yeteneklerime göre" },
        { text: "Güçlü yönlerini bilmek sana ne kazandırır?", options: ["Hangi alanlarda başarılı olacağımı gösterir", "Hiçbir şey", "Hava atmamı sağlar", "Ders çalışmamı engeller"], correct: "Hangi alanlarda başarılı olacağımı gösterir" },
        { text: "Hata yaptığında kendine ne söylersin?", options: ["Bu bir öğrenme fırsatı", "Ben aptalım", "Bir daha asla yapmamalıyım", "Saklanmalıyım"], correct: "Bu bir öğrenme fırsatı" },
        { text: "Canın sıkıldığında ne yaparsın?", options: ["İlgi duyduğum bir şeyle uğraşırım", "Ağlarım", "Duvara bakarım", "Bağırırım"], correct: "İlgi duyduğum bir şeyle uğraşırım" }
    ];

    const generateAttentionTest = (grade: number, count: number) => {
        const questions = [];
        for(let i=0; i<count; i++) {
            const type = getRandomInt(1, 3);
            if (type === 1) {
                // Dizi farkı (Dinamik)
                const base = getRandomInt(100, 999);
                const wrong = base + 10; // slightly diff
                const opts = shuffle([base.toString(), base.toString(), wrong.toString(), base.toString()]);
                questions.push({
                    type: 'multiple-choice',
                    text: `Hangi sayı diğerlerinden farklıdır? ( ${opts.join(' - ')} )`,
                    options: opts,
                    correct: wrong.toString()
                });
            } else {
                // Şekil/Kelime (Static pool fallback randomized)
                const items = [
                    {q: 'Aşağıdaki dizide kuralı bozan şekli bul: ⭐ ⭐ ☀️ ⭐ ⭐', a: '☀️', o: ['☀️', '1. Yıldız', 'Sonuncu Yıldız', 'Hepsi Aynı']},
                    {q: 'Hangi harf farklıdır? ( b - b - d - b )', a: 'd', o: ['3. d', '1. b', '4. b', 'Hepsi aynı']},
                    {q: 'Tersten okunuşu kendisiyle aynı olan kelime hangisidir?', a: 'KAYAK', o: ['KAYAK', 'KİTAP', 'MASA', 'ELMA']}
                ];
                const item = getRandomItems(items, 1)[0];
                questions.push({
                    type: 'multiple-choice',
                    text: item.q,
                    options: shuffle(item.o),
                    correct: item.a
                });
            }
        }
        return { id: 'attention', name: 'Dikkat & Konsantrasyon', questions };
    };

    const prepareTests = () => {
        const gradeNum = parseInt(profile.grade.split('.')[0]) || 1;
        const battery = [];
        const qPerModule = 5; 

        battery.push(generateLinguisticTest(gradeNum, qPerModule));
        battery.push(generateLogicalTest(gradeNum, qPerModule));
        battery.push(generateVisualTest(gradeNum, qPerModule));
        battery.push(generateStaticPoolTest('kinesthetic', 'Bedensel-Kinestetik Zeka', kinestheticPool, qPerModule));
        battery.push(generateStaticPoolTest('musical', 'Müziksel-Ritmik Zeka', musicalPool, qPerModule));
        battery.push(generateStaticPoolTest('naturalistic', 'Doğacı Zeka', naturalisticPool, qPerModule));
        battery.push(generateStaticPoolTest('interpersonal', 'Sosyal Zeka', interpersonalPool, qPerModule));
        battery.push(generateStaticPoolTest('intrapersonal', 'İçsel Zeka', intrapersonalPool, qPerModule));
        battery.push(generateAttentionTest(gradeNum, 4));

        setTestBattery(battery);
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
        
        const compiledResults: any = {};
        testBattery.forEach(test => {
            const testAnswers = answers.filter(a => a.testId === test.id);
            const correctCount = testAnswers.filter((a: any) => a.isCorrect).length;
            compiledResults[test.id] = {
                id: test.id,
                name: test.name,
                score: correctCount * 10,
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
                setIsSaved(true);
            }
            
            setGeneratedReport(savedAssessment);
            setStep('report');
        } catch (error) {
            console.error(error);
            alert("Rapor oluşturulurken bir hata oluştu.");
            setStep('profile');
        }
    };

    const handleManualSave = async () => {
        if (!user) {
            alert("Kaydetmek için lütfen giriş yapın.");
            return;
        }
        if (!generatedReport) return;

        setIsSaving(true);
        try {
            await assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, generatedReport.report);
            setIsSaved(true);
            alert("Rapor başarıyla arşive kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme sırasında hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

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
                        Senin için <strong>{profile.grade}</strong> seviyesinde özel sorular hazırladık. 
                        Sorular her seferinde farklıdır! Toplam {testBattery.length} bölüm.
                    </p>
                    <button onClick={() => setStep('testing')} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-300">
                        Başla!
                    </button>
                </div>
            );
        }

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
                     <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 text-center mb-10 whitespace-pre-line">{currentQ.text}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {currentQ.options.map((opt: string, i: number) => (
                             <button key={i} onClick={() => handleAnswer(opt)} 
                                 className="p-6 text-lg font-bold text-zinc-700 bg-zinc-50 border-2 border-zinc-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95">
                                 {opt}
                             </button>
                         ))}
                     </div>
                </div>
            </div>
        );
    }

    if (step === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center h-full mt-20">
                <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-zinc-800">Analiz Yapılıyor...</h3>
                <p className="text-zinc-500 mt-2">Sonuçların işleniyor.</p>
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
                onManualSave={handleManualSave}
                isSaving={isSaving}
                isSaved={isSaved}
            />
        );
    }

    return null;
};
