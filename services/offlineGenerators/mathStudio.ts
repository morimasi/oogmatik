
import { getRandomInt } from './helpers';

// Helper: Check constraints
const hasCarry = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    const len = Math.max(s1.length, s2.length);
    let carry = 0;
    for (let i = 0; i < len; i++) {
        const d1 = parseInt(s1[i] || '0');
        const d2 = parseInt(s2[i] || '0');
        if (d1 + d2 + carry >= 10) return true;
        carry = Math.floor((d1 + d2 + carry) / 10);
    }
    return false;
};

const hasBorrow = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    for (let i = 0; i < s2.length; i++) {
        if (parseInt(s1[i]) < parseInt(s2[i])) return true;
    }
    return false;
};

// Main Drill Generator with Deep Constraints
export const generateMathDrillSet = (
    count: number,
    opType: 'add' | 'sub' | 'mult' | 'div' | 'mixed',
    settings: { min: number, max: number, allowCarry: boolean, allowBorrow: boolean, allowRemainder: boolean }
) => {
    const operations = [];
    const opsList = opType === 'mixed' ? ['add', 'sub', 'mult', 'div'] : [opType];

    for (let i = 0; i < count; i++) {
        const currentOp = opsList[getRandomInt(0, opsList.length - 1)];
        let n1, n2, ans, symbol;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 200) {
            attempts++;
            
            // Adjust ranges based on operation to avoid impossible constraints
            let effectiveMin = settings.min;
            let effectiveMax = settings.max;
            
            if (currentOp === 'mult') {
                effectiveMax = Math.min(settings.max, 20); // Keep multiplication factors reasonable unless expert
                effectiveMin = 1;
            } else if (currentOp === 'div') {
                effectiveMax = Math.min(settings.max, 100);
            }

            n1 = getRandomInt(effectiveMin, effectiveMax);
            n2 = getRandomInt(effectiveMin, effectiveMax);

            if (currentOp === 'add') {
                symbol = '+';
                if (!settings.allowCarry && hasCarry(n1, n2)) continue;
                ans = n1 + n2;
                valid = true;
            } else if (currentOp === 'sub') {
                symbol = '-';
                if (n1 < n2) [n1, n2] = [n2, n1]; // Ensure positive
                if (!settings.allowBorrow && hasBorrow(n1, n2)) continue;
                ans = n1 - n2;
                valid = true;
            } else if (currentOp === 'mult') {
                symbol = 'x';
                ans = n1 * n2;
                valid = true;
            } else if (currentOp === 'div') {
                symbol = '÷';
                n2 = getRandomInt(2, 12); // Divisor usually small
                if (!settings.allowRemainder) {
                    const factor = getRandomInt(1, 15);
                    n1 = n2 * factor;
                    ans = factor;
                } else {
                    n1 = getRandomInt(10, 100);
                    ans = Math.floor(n1 / n2);
                }
                valid = true;
            }
        }
        operations.push({ n1, n2, symbol, ans, id: i });
    }
    return operations;
};
