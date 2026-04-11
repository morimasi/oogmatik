import { BoxMathData, BoxMathProblem, GeneratorOptions } from '../../types';
import { getRandomInt } from './helpers';

/**
 * Kutularla Matematik (Ters İşlem & Yerine Koyma) Yerel Üretici
 */
export const generateOfflineBoxMath = async (options: GeneratorOptions): Promise<BoxMathData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 18,
    variant = 'reverse',
    fontSizePreference = 'medium',
  } = options;
  const pages: BoxMathData[] = [];

  const getRanges = () => {
    switch (difficulty) {
      case 'Başlangıç':
        return { range: [1, 10], steps: 2, coeffRange: [1, 3] };
      case 'Zor':
        return { range: [5, 30], steps: 4, coeffRange: [1, 8] };
      case 'Uzman':
        return { range: [10, 50], steps: 6, coeffRange: [1, 12] };
      default:
        return { range: [1, 20], steps: 3, coeffRange: [1, 5] };
    }
  };

  const { range, steps, coeffRange } = getRanges();

  for (let p = 0; p < worksheetCount; p++) {
    const problems: BoxMathProblem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const boxValue = getRandomInt(range[0], range[1]);
      let currentResult = 0;
      const expressionParts: string[] = [];

      const numSteps = getRandomInt(2, steps);

      // Başlangıç terimi
      if (getRandomInt(0, 1) === 0) {
        const startConst = getRandomInt(1, 15);
        expressionParts.push(String(startConst));
        currentResult = startConst;
      } else {
        const coeff = getRandomInt(coeffRange[0], coeffRange[1]);
        expressionParts.push(`${coeff}x□`);
        currentResult = coeff * boxValue;
      }

      for (let s = 1; s < numSteps; s++) {
        const op = getRandomInt(0, 1) === 0 ? '+' : '-';
        if (getRandomInt(0, 1) === 0) {
          const val = getRandomInt(1, 15);
          if (op === '-' && currentResult - val < 0) {
            expressionParts.push(`+ ${val}`);
            currentResult += val;
          } else {
            expressionParts.push(`${op} ${val}`);
            currentResult = op === '+' ? currentResult + val : currentResult - val;
          }
        } else {
          const coeff = getRandomInt(coeffRange[0], coeffRange[1]);
          if (op === '-' && currentResult - coeff * boxValue < 0) {
            expressionParts.push(`+ ${coeff}x□`);
            currentResult += coeff * boxValue;
          } else {
            expressionParts.push(`${op} ${coeff}x□`);
            currentResult =
              op === '+' ? currentResult + coeff * boxValue : currentResult - coeff * boxValue;
          }
        }
      }

      const expression = expressionParts.join(' ');

      if (variant === 'reverse') {
        problems.push({
          id: `prob-${i}`,
          expression,
          targetValue: currentResult,
          answer: boxValue,
        });
      } else if (variant === 'substitution') {
        problems.push({
          id: `prob-${i}`,
          expression,
          givenValue: boxValue,
          answer: currentResult,
        });
      } else {
        // Simplification (Kutu Birleştirme)
        problems.push({
          id: `prob-${i}`,
          expression,
          answer: currentResult,
        });
      }
    }

    let title = 'Kutularla Matematik';
    let instruction = 'İşlemleri yap ve sonucu bul.';
    if (variant === 'reverse') {
      title = 'Kutularda Ters İşlem';
      instruction = 'Denklemi sağlayan kutu değerini (□) bulun.';
    } else if (variant === 'substitution') {
      title = 'Kutularla Yerine Koyma';
      instruction = 'Kutu yerine verilen sayıyı koyarak işlemin sonucunu bulun.';
    } else if (variant === 'simplification') {
      title = 'Kutu Birleştirme';
      instruction = 'İşlemi sadeleştirerek sonucu bulun.';
    }

    pages.push({
      title,
      instruction,
      pedagogicalNote: 'Cebirsel düşünme, işlem önceliği ve değişken kavramını pekiştirir.',
      mode: variant as any,
      problems,
      fontSizePreference: fontSizePreference as 'small' | 'medium' | 'large',
    });
  }

  return pages;
};
