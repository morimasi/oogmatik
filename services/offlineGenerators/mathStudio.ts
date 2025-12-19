
import { getRandomInt } from './helpers';
import { MathOperation } from '../../types/math';

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

const getRangeFromDigits = (digits: number) => {
    if (digits <= 0) return { min: 1, max: 10 }; 
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return { min, max };
};

// Main Drill Generator with Deep Constraints
export const generateMathDrillSet = (
    count: number,
    opType: 'add' | 'sub' | 'mult' | 'div' | 'mixed',
    settings: { 
        digit1: number,
        digit2: number,
        allowCarry: boolean, 
        allowBorrow: boolean, 
        allowRemainder: boolean
    }
): MathOperation[] => {
    const operations: MathOperation[] = [];
    const opsList = opType === 'mixed' ? ['add', 'sub', 'mult', 'div'] : [opType];

    const range1 = getRangeFromDigits(settings.digit1);
    const range2 = getRangeFromDigits(settings.digit2);

    for (let i = 0; i < count; i++) {
        const currentOp = opsList[getRandomInt(0, opsList.length - 1)];
        let n1 = 0, n2 = 0, ans = 0, symbol = '+', rem = 0;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 200) {
            attempts++;
            
            // Generate basic numbers
            n1 = getRandomInt(range1.min, range1.max);
            n2 = getRandomInt(range2.min, range2.max);

            if (currentOp === 'add') {
                symbol = '+';
                // Carry Constraint
                if (!settings.allowCarry && hasCarry(n1, n2)) continue;
                // Just in case check max JS integer safety (unlikely for worksheet)
                ans = n1 + n2;
                valid = true;
            } 
            else if (currentOp === 'sub') {
                symbol = '-';
                // Swap to ensure positive result
                if (n1 < n2) [n1, n2] = [n2, n1]; 
                
                // Borrow Constraint
                if (!settings.allowBorrow && hasBorrow(n1, n2)) continue;
                
                ans = n1 - n2;
                valid = true;
            } 
            else if (currentOp === 'mult') {
                symbol = 'x';
                // Multiplication is straightforward, constraints usually just digits
                ans = n1 * n2;
                valid = true;
            } 
            else if (currentOp === 'div') {
                symbol = '÷';
                // Division Logic:
                // If strict digits for Dividend (n1) and Divisor (n2) are set:
                if (n2 === 0) n2 = 1;
                
                if (!settings.allowRemainder) {
                    // Force clean division: Reconstruct n1 from n2 * answer
                    // BUT n1 must still fit in digit1 range.
                    
                    // Strategy: Pick n2 (divisor) and answer (quotient), calculate n1
                    // n2 comes from range2.
                    // We need to find a quotient such that n2 * quotient is within range1.
                    const maxQuotient = Math.floor(range1.max / n2);
                    const minQuotient = Math.ceil(range1.min / n2);
                    
                    if (maxQuotient < minQuotient) continue; // Impossible constraints
                    
                    const quotient = getRandomInt(minQuotient, maxQuotient);
                    n1 = n2 * quotient;
                    ans = quotient;
                    rem = 0;
                    valid = true;
                } else {
                    // Allow remainder
                    ans = Math.floor(n1 / n2);
                    rem = n1 % n2;
                    valid = true;
                }
            }
        }

        operations.push({ 
            id: crypto.randomUUID(), 
            num1: n1, 
            num2: n2, 
            symbol, 
            answer: ans, 
            remainder: rem > 0 ? rem : undefined 
        });
    }
    return operations;
};
