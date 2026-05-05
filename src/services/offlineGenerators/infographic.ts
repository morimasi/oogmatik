import { ActivityType, GeneratorOptions, SingleWorksheetData } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { getWordsForDifficulty, shuffle, getRandomItems } from './helpers';

/**
 * generateOfflineInfographic — İnfografik Stüdyosu Çevrimdışı Üretim Motoru
 * 
 * Yapay zeka olmadan, hızlı bir şekilde pedagojik şablonlar üretir.
 */
export async function generateOfflineInfographic(
    type: ActivityType,
    options: GeneratorOptions
): Promise<SingleWorksheetData> {
    const { difficulty = 'Orta', topic = 'Rastgele' } = options;
    const title = _getInfographicTitle(type);
    
    const builder = new WorksheetBuilder(type, title)
        .addPremiumHeader();

    // Aktivite türüne göre içerik oluştur
    switch (type) {
        case ActivityType.INFOGRAPHIC_5W1H_BOARD:
            _build5N1KBoard(builder, difficulty, topic);
            break;
            
        case ActivityType.INFOGRAPHIC_CONCEPT_MAP:
            _buildConceptMap(builder, difficulty, topic);
            break;

        case ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM:
        case ActivityType.INFOGRAPHIC_VOCAB_TREE:
            _buildVocabTree(builder, difficulty, topic);
            break;

        case ActivityType.INFOGRAPHIC_COMPARE:
        case ActivityType.INFOGRAPHIC_VENN_DIAGRAM:
            _buildVennDiagram(builder, difficulty, topic);
            break;

        case ActivityType.INFOGRAPHIC_SHORT_ANSWER:
            _buildShortAnswerGrid(builder, difficulty, topic, options);
            break;

        default:
            // Genel düşen (fallback) şablon
            _buildGenericInfographic(builder, difficulty, topic);
            break;
    }

    return builder.addSuccessIndicator().build();
}

/**
 * 5N1K Panosu Şablonu
 */
function _build5N1KBoard(builder: WorksheetBuilder, difficulty: string, topic: string) {
    const questions = [
        { q: 'KİM?', a: '................................' },
        { q: 'NE?', a: '................................' },
        { q: 'NEREDE?', a: '................................' },
        { q: 'NE ZAMAN?', a: '................................' },
        { q: 'NASIL?', a: '................................' },
        { q: 'NİÇİN?', a: '................................' }
    ];

    builder.addPrimaryActivity('infographic_5n1k', {
        syntax: `<five-w-one-h title="5N1K Çözümleme Panosu">
            ${questions.map(item => `<item question="${item.q}">${item.a}</item>`).join('')}
        </five-w-one-h>`
    });

    builder.addSupportingDrill('Kısa Hikaye Analizi', {
        text: 'Aşağıdaki kısa cümleyi okuyup 5N1K sorularından ikisini cevaplayın: "Ali bugün okulda kalemini kaybettiği için çok üzüldü."',
        questions: ['Kim üzüldü?', 'Niçin üzüldü?']
    });
}

/**
 * Kavram Haritası Şablonu
 */
function _buildConceptMap(builder: WorksheetBuilder, difficulty: string, topic: string) {
    const rootLabel = topic !== 'Rastgele' ? topic : 'Ana Kavram';
    
    builder.addPrimaryActivity('infographic_concept', {
        syntax: `<concept-map title="Kavram İlişkileri Haritası">
            <root label="${rootLabel}">
                <node label="Alt Başlık 1"> <branch label="Özellik A" /> </node>
                <node label="Alt Başlık 2"> <branch label="Özellik B" /> </node>
            </root>
        </concept-map>`
    });

    builder.addSupportingDrill('Kelimeleri Grupla', {
        text: `"${rootLabel}" kavramı ile ilgili 3 tane kelime yazınız:`,
        inputs: ['', '', '']
    });
}

/**
 * Kelime Ağacı / Eş Anlamlılar Şablonu
 */
function _buildVocabTree(builder: WorksheetBuilder, difficulty: string, topic: string) {
    const words = getRandomItems(getWordsForDifficulty(difficulty, topic), 4);
    
    builder.addPrimaryActivity('infographic_vocab', {
        syntax: `<concept-map title="Kelime ve Anlam Ağacı">
            <root label="Kelime Bağla">
                ${words.map(w => `<node label="${w}"> <branch label="Eş Anlamlısı" /> </node>`).join('')}
            </root>
        </concept-map>`
    });

    builder.addSupportingDrill('Eşleştirme', {
        left: words,
        right: shuffle([...words]),
        instruction: 'Kelimeleri anlamdaşları ile eşleştirin.'
    });
}

/**
 * Venn Diyagramı Şablonu
 */
function _buildVennDiagram(builder: WorksheetBuilder, difficulty: string, topic: string) {
    builder.addPrimaryActivity('infographic_venn', {
        syntax: `<venn-diagram title="Karşılaştırma ve Farklar">
            <set-a label="Kavram A"> <item>Özellik 1</item> </set-a>
            <set-b label="Kavram B"> <item>Özellik 2</item> </set-b>
            <intersection> <item>Ortak Özellik</item> </intersection>
        </venn-diagram>`
    });
}

/**
 * Genel Fallback Şablonu
 */
function _buildGenericInfographic(builder: WorksheetBuilder, difficulty: string, topic: string) {
    builder.addPrimaryActivity('text', {
        content: 'Bu aktivite için özel bir çevrimdışı şablon henüz tanımlanmadı. Lütfen yapay zeka (AI) modunu deneyiniz veya konu belirtiniz.'
    });
}

/**
 * Kısa Cevaplı Sorular Panosu (Görsel Mimariye Sadık)
 */
function _buildShortAnswerGrid(builder: WorksheetBuilder, difficulty: string, topic: string, options: GeneratorOptions) {
    const questionCount = parseInt(String(options.params?.questionCount || '15'), 10);
    const lineCount = options.params?.lineCount || 2;
    const colorMode = options.params?.colorMode || 'Karma Renkli';

    // Geniş soru havuzu (Görseldeki tarzda)
    const questionPool = [
        'Bir mutfak eşyası yazalım.',
        'Ot yiyen bir hayvan yazalım.',
        'Bir meyve ismi yazalım.',
        'Suda giden bir taşıt yazalım.',
        'Yazıyı ne ile yazarız?',
        'Gökyüzünden yağan bir şey yazalım.',
        'Zıplayan bir şey yazalım.',
        'Ayağımıza giydiğimiz bir şey yazalım.',
        'Tavuğun yavrusuna ne denir?',
        'Saçımızı kim keser?',
        'Sınıfımızda bulunan bir eşya yazalım.',
        'En sevdiğin yemek hangisidir?',
        'Hangi hayvan bal yapar?',
        'Kızlar saçına ne takar?',
        'Dünyamızı ısıtan şeyin ismi nedir?',
        'Kışın giydiğimiz bir kıyafet?',
        'En sevdiğin oyun hangisidir?',
        'Denizde yaşayan bir canlı?',
        'Hangi meyve sarı renklidir?',
        'Gece gökyüzünde ne görürüz?',
        'Burnumuzla ne yaparız?',
        'Süt veren bir hayvan?',
        'En sevdiğin renk hangisidir?',
        'Okula giderken ne takarız?',
        'Yemekten önce ne yapmalıyız?'
    ];

    // Konu varsa konuya göre basit sorular üret (Statik taklit)
    const questions = getRandomItems(questionPool, questionCount);

    builder.addPrimaryActivity('infographic_short_answer', {
        syntax: `<short-answer-grid title="Kısa Cevaplı Sorular" count="${questionCount}" lines="${lineCount}" mode="${colorMode}">
            ${questions.map(q => `<item question="${q}" />`).join('')}
        </short-answer-grid>`
    });

    builder.addSupportingDrill('Hızlı Kontrol', {
        text: 'Yukarıdaki soruları cevapladıktan sonra en sevdiğin 3 tanesini yıldızla işaretle.',
        inputs: ['', '', '']
    });
}

function _getInfographicTitle(type: ActivityType): string {
    switch (type) {
        case ActivityType.INFOGRAPHIC_5W1H_BOARD: return '5N1K Panosu';
        case ActivityType.INFOGRAPHIC_CONCEPT_MAP: return 'Kavram Haritası';
        case ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM: return 'Eş ve Zıt Anlamlılar';
        case ActivityType.INFOGRAPHIC_COMPARE: return 'Karşılaştırma Tablosu';
        case ActivityType.INFOGRAPHIC_SHORT_ANSWER: return 'Kısa Cevaplı Sorular';
        default: return 'İnfografik Çalışması';
    }
}

