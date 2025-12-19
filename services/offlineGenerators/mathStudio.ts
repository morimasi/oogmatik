
import { MathStudioConfig } from '../../types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

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

export const generateMathOperationsFast = (config: MathStudioConfig, count: number = 20) => {
    const operations = [];
    const min1 = Math.pow(10, config.digitCount1 - 1);
    const max1 = Math.pow(10, config.digitCount1) - 1;
    const min2 = Math.pow(10, config.digitCount2 - 1);
    const max2 = Math.pow(10, config.digitCount2) - 1;

    for (let i = 0; i < count; i++) {
        const opType = config.operations[getRandomInt(0, config.operations.length - 1)];
        let n1, n2, ans, valid = false;
        let attempts = 0;

        while (!valid && attempts < 100) {
            attempts++;
            n1 = getRandomInt(min1, max1);
            n2 = getRandomInt(min2, max2);

            if (opType === 'add') {
                if (!config.constraints.allowCarry && hasCarry(n1, n2)) continue;
                ans = n1 + n2;
                valid = true;
            } else if (opType === 'sub') {
                if (n1 < n2) [n1, n2] = [n2, n1];
                if (!config.constraints.allowBorrow && hasBorrow(n1, n2)) continue;
                ans = n1 - n2;
                valid = true;
            } else if (opType === 'mult') {
                ans = n1 * n2;
                valid = true;
            } else if (opType === 'div') {
                if (n2 === 0) continue;
                if (!config.constraints.allowRemainder) {
                    n1 = n2 * getRandomInt(1, 20);
                }
                ans = Math.floor(n1 / n2);
                valid = true;
            }
        }

        const unknownPos = config.constraints.findUnknown ? (['n1', 'n2', 'ans'][getRandomInt(0, 2)] as any) : 'ans';

        operations.push({
            n1, n2, op: opType === 'add' ? '+' : opType === 'sub' ? '-' : opType === 'mult' ? 'x' : '÷',
            ans, unknownPos
        });
    }

    return operations;
};
