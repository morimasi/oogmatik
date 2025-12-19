
import { MathStudioConfig, MathOperation, MathStudioData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

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

export const generateMathStudioOffline = (config: MathStudioConfig): MathStudioData => {
    const operations: MathOperation[] = [];
    const count = config.itemCount || 20;
    
    for (let i = 0; i < count; i++) {
        const op = config.operations[getRandomInt(0, config.operations.length - 1)];
        let num1 = 0, num2 = 0, ans = 0, rem = 0, valid = false;
        let attempts = 0;

        while(!valid && attempts < 100) {
            attempts++;
            num1 = getRandomInt(Math.pow(10, config.num1Digits-1), Math.pow(10, config.num1Digits)-1);
            num2 = getRandomInt(Math.pow(10, config.num2Digits-1), Math.pow(10, config.num2Digits)-1);
            
            if (op === 'add') {
                if (!config.allowCarry && hasCarry(num1, num2)) continue;
                ans = num1 + num2;
                valid = true;
            } else if (op === 'sub') {
                if (num1 < num2) [num1, num2] = [num2, num1];
                if (!config.allowBorrow && hasBorrow(num1, num2)) continue;
                ans = num1 - num2;
                valid = true;
            } else if (op === 'mult') {
                ans = num1 * num2;
                valid = true;
            } else if (op === 'div') {
                if (num2 === 0) continue;
                if (!config.allowRemainder) {
                    num1 = num2 * getRandomInt(1, 20);
                }
                ans = Math.floor(num1 / num2);
                rem = num1 % num2;
                valid = true;
            }
        }

        const unknownPos = config.findUnknown ? (['num1', 'num2', 'ans'][getRandomInt(0, 2)] as any) : 'ans';

        operations.push({ num1, num2, operator: op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mult' ? 'x' : '÷', answer: ans, remainder: rem, unknownPos });
    }

    return {
        title: "Matematik Çalışma Sayfası",
        instruction: "İşlemleri dikkatle yapınız.",
        pedagogicalNote: "İşlem akıcılığı ve sayı hissi çalışması.",
        operations,
        problems: []
    };
};
