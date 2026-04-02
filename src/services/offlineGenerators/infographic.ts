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
        .addPremiumHeader()
        .addPedagogicalNote(_getPedagogicalNote(type));

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

function _getInfographicTitle(type: ActivityType): string {
    switch (type) {
        case ActivityType.INFOGRAPHIC_5W1H_BOARD: return '5N1K Panosu';
        case ActivityType.INFOGRAPHIC_CONCEPT_MAP: return 'Kavram Haritası';
        case ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM: return 'Eş ve Zıt Anlamlılar';
        case ActivityType.INFOGRAPHIC_COMPARE: return 'Karşılaştırma Tablosu';
        default: return 'İnfografik Çalışması';
    }
}

function _getPedagogicalNote(type: ActivityType): string {
    return 'Bu infografik çalışması, öğrencinin bilgiyi görsel olarak organize etmesini sağlayarak bilişsel yükü azaltır. Görsel-mekansal zekayı desteklerken kavramlar arası hiyerarşik bağların kurulmasına yardımcı olur. Disleksi dostu yapısı sayesinde metin yoğunluğunu düşürür.';
}
