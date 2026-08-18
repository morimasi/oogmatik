import { GeneratorOptions, SingleWorksheetData, ActivityType } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { getRandomInt } from './helpers';

export async function generateOfflineBasicOperations(
    options: GeneratorOptions
): Promise<SingleWorksheetData> {
    const { difficulty = 'Orta', itemCount = 12 } = options;
    const count = Math.max(4, Math.min(20, itemCount || 12));

    const puzzles = Array.from({ length: count }, (_, i) => {
        const isZor = difficulty === 'Zor';
        const isKolay = difficulty === 'Kolay';

        // Rastgele işlem seç (+, -, *)
        const ops = ['+', '-'];
        if (!isKolay) ops.push('*');
        if (isZor) ops.push('/');

        const op = ops[getRandomInt(0, ops.length - 1)];

        let a = 0, b = 0, ans = 0;

        if (op === '+') {
            a = getRandomInt(1, isZor ? 200 : isKolay ? 20 : 50);
            b = getRandomInt(1, isZor ? 200 : isKolay ? 20 : 50);
            ans = a + b;
        } else if (op === '-') {
            a = getRandomInt(10, isZor ? 200 : isKolay ? 20 : 50);
            b = getRandomInt(1, a - 1);
            ans = a - b;
        } else if (op === '*') {
            a = getRandomInt(2, isZor ? 20 : 10);
            b = getRandomInt(2, isZor ? 20 : 10);
            ans = a * b;
        } else if (op === '/') {
            b = getRandomInt(2, 10);
            ans = getRandomInt(2, 20);
            a = b * ans;
        }

        return {
            id: `m_${i}`,
            question: `${a} ${op} ${b} = ?`,
            answer: ans,
            visualHint: `${a} ve ${b} sayılarının ${op === '+' ? 'toplamı' : op === '-' ? 'farkı' : op === '*' ? 'çarpımı' : 'bölümü'}`
        };
    });

    const builder = new WorksheetBuilder(ActivityType.MATH_BASIC_OPERATIONS as any, 'Temel Matematik İşlemleri')
        .addPremiumHeader()
        .setInstruction('Aşağıdaki matematik işlemlerini dikkatlice yapınız ve sonuçları kutucuklara yazınız.')
        .addSuccessIndicator();

    builder.addPrimaryActivity('matrix', {
        patterns: puzzles,
        problems: puzzles,
        items: puzzles
    });

    return builder.build();
}

export async function generateOfflineMathWordProblems(
    options: GeneratorOptions
): Promise<SingleWorksheetData> {
    const { difficulty = 'Orta', itemCount = 5 } = options;
    const count = Math.max(2, Math.min(10, itemCount || 5));

    const templates = [
        { text: "Ali'nin {a} elması vardı. Ayşe ona {b} elma daha verdi. Ali'nin kaç elması oldu?", op: '+' },
        { text: "Bir ağaçta {a} kuş vardı. {b} tanesi uçtu. Ağaçta kaç kuş kaldı?", op: '-' },
        { text: "Bir markette {a} koli elma var. Her kolide {b} elma varsa, toplam kaç elma vardır?", op: '*' }
    ];

    const puzzles = Array.from({ length: count }, (_, i) => {
        const isZor = difficulty === 'Zor';
        const isKolay = difficulty === 'Kolay';

        const template = templates[getRandomInt(0, templates.length - 1)];
        let a = 0, b = 0, ans = 0;

        if (template.op === '+') {
            a = getRandomInt(5, isZor ? 100 : isKolay ? 10 : 30);
            b = getRandomInt(5, isZor ? 100 : isKolay ? 10 : 30);
            ans = a + b;
        } else if (template.op === '-') {
            a = getRandomInt(20, isZor ? 150 : isKolay ? 20 : 50);
            b = getRandomInt(5, a - 5);
            ans = a - b;
        } else if (template.op === '*') {
            a = getRandomInt(3, isZor ? 15 : 8);
            b = getRandomInt(3, isZor ? 12 : 6);
            ans = a * b;
        }

        const question = template.text.replace('{a}', a.toString()).replace('{b}', b.toString());

        return {
            id: `wp_${i}`,
            question: question,
            answer: ans,
            visualHint: "Problemi adım adım oku. Eylem bildiren kelimelere (uçtu, geldi, vb.) dikkat et."
        };
    });

    const builder = new WorksheetBuilder(ActivityType.MATH_WORD_PROBLEMS as any, 'Matematik Süreç Problemleri')
        .addPremiumHeader()
        .setInstruction('Aşağıdaki problemleri dikkatlice okuyup çözümlerini bulunuz.')
        .addSuccessIndicator();

    builder.addPrimaryActivity('matrix', {
        problems: puzzles,
        items: puzzles
    });

    return builder.build();
}
