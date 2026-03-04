
import { getRandomInt, getRandomItems } from './helpers';
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
        if (parseInt(s1[i]) > parseInt(s2[i])) return false; // Borrows only needed if current digit smaller
    }
    return false;
};

const getRangeFromDigits = (digits: number) => {
    if (digits <= 0) return { min: 1, max: 9 }; 
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return { min, max };
};

// Main Drill Generator with Deep Constraints
export const generateMathDrillSet = (
    count: number,
    selectedOperations: string[], // Changed to array
    settings: { 
        digit1: number,
        digit2: number,
        digit3?: number,
        useThirdNumber?: boolean, // New
        allowCarry: boolean, 
        allowBorrow: boolean, 
        allowRemainder: boolean,
        allowNegative: boolean
    }
): MathOperation[] => {
    const operations: MathOperation[] = [];
    
    // Fallback if empty
    const opsList = (selectedOperations && selectedOperations.length > 0) ? selectedOperations : ['add'];

    const range1 = getRangeFromDigits(settings.digit1);
    const range2 = getRangeFromDigits(settings.digit2);
    // Use defined digit3 or fallback to digit2 for 3rd number
    const range3 = getRangeFromDigits(settings.digit3 || settings.digit2); 

    for (let i = 0; i < count; i++) {
        // Pick a random operation from the selected list for this specific item
        const currentOp = opsList[getRandomInt(0, opsList.length - 1)];
        
        let n1 = 0, n2 = 0, n3 = 0, ans = 0, symbol = '+', symbol2 = '', rem = 0;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 200) {
            attempts++;
            
            // Generate basic numbers
            n1 = getRandomInt(range1.min, range1.max);
            n2 = getRandomInt(range2.min, range2.max);
            
            // Third number logic (Usually for addition/subtraction chains)
            const hasThird = settings.useThirdNumber && ['add', 'sub', 'mixed'].includes(currentOp);
            if (hasThird) {
                n3 = getRandomInt(range3.min, range3.max);
            }

            if (currentOp === 'add') {
                symbol = '+';
                // Carry Constraint
                let isCarry = hasCarry(n1, n2);
                if (hasThird) isCarry = isCarry || hasCarry(n1 + n2, n3);

                if (!settings.allowCarry && isCarry) continue;
                
                ans = n1 + n2 + (hasThird ? n3 : 0);
                if (hasThird) symbol2 = '+';
                valid = true;
            } 
            else if (currentOp === 'sub') {
                symbol = '-';
                
                // --- NEGATIVE CHECK ---
                // If negative results NOT allowed, ensure n1 > n2
                if (!settings.allowNegative) {
                    if (hasThird) {
                        // For 3 numbers, total sum must be positive? Or intermediate?
                        // Let's assume simplest: n1 must be biggest start
                        if (n1 < n2) [n1, n2] = [n2, n1];
                        if (n1 - n2 < n3) continue;
                    } else {
                         if (n1 < n2) [n1, n2] = [n2, n1];
                    }
                }
                
                // --- BORROW CHECK ---
                // If borrowing NOT allowed, check digits
                if (!settings.allowBorrow) {
                    if (hasBorrow(n1, n2)) continue;
                    if (hasThird && hasBorrow(n1 - n2, n3)) continue;
                }
                
                let tempAns = n1 - n2;
                
                if (hasThird) {
                    symbol2 = '-';
                    tempAns -= n3;
                }
                
                ans = tempAns;
                valid = true;
            } 
            else if (currentOp === 'mult') {
                symbol = 'x';
                // Multiplication is straightforward
                ans = n1 * n2;
                valid = true;
            } 
            else if (currentOp === 'div') {
                symbol = '÷';
                // Division Logic:
                if (n2 === 0) n2 = 1;
                
                // Force dividend to be related to divisor for cleaner numbers if possible
                // OR calculate answer and remainder
                
                // If Remainder NOT allowed
                if (!settings.allowRemainder) {
                    // Reverse engineer: Create a multiplication problem
                    // n1 = n2 * answer
                    const quotient = getRandomInt(Math.ceil(range1.min / n2), Math.floor(range1.max / n2));
                    if (quotient < 1) continue;
                    
                    n1 = n2 * quotient;
                    ans = quotient;
                    rem = 0;
                    valid = true;
                } else {
                    // Remainder Allowed
                    // Ensure n1 > n2
                    if (n1 < n2) {
                        const temp = n1; n1 = n2; n2 = temp;
                    }
                    if (n2 === 0) n2 = 1;

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
            num3: n3 > 0 ? n3 : undefined,
            symbol,
            symbol2: n3 > 0 ? symbol2 : undefined,
            answer: ans, 
            remainder: rem > 0 ? rem : undefined 
        });
    }
    return operations;
};
