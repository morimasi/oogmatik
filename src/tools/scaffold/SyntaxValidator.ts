/**
 * SyntaxValidator: AI tarafından üretilen kodun sentaktik doğruluğunu kontrol eder.
 * 
 * Bu sınıf, Vite build zincirini kırmadan önce hataları yakalamak için tasarlanmıştır.
 */
export class SyntaxValidator {

    /**
     * Sağlanan kod bloğunun temel syntax denetimini yapar.
     * Şimdilik basit denge ve JSX tespiti yapar, ileride AST parser ile güçlendirilebilir.
     */
    static validate(file: string, code: string): { valid: boolean; error?: string } {
        try {
            // 1. Temel Parantez Dengesi Kontrolü
            if (!this.checkBalance(code, '{', '}')) throw new Error('Parantez dengesi bozuk (missing curly braces).');
            if (!this.checkBalance(code, '(', ')')) throw new Error('Parantez dengesi bozuk (missing parentheses).');
            if (!this.checkBalance(code, '[', ']')) throw new Error('Köşeli parantez dengesi bozuk.');

            // 2. Eksik Import Kontrolü (Temel)
            if (file.endsWith('.tsx') && !code.includes('import') && !code.includes('React')) {
                // Bazı basit dosyalar import gerektirmeyebilir ama WorksheetUI için şüpheli.
            }

            // 3. Geçersiz Karakter Kontrolü (LLM bazen mark-up ekleyebilir)
            if (code.includes('```')) throw new Error('Kod içerisinde Markdown "fenced code block" kalıntısı bulundu.');

            // 4. Deneme amaçlı eval/Function (Opsiyonel, riskli ama syntax check için)
            // Node.js ortamında syntax check yapmak için 'vm' modülü kullanılabilir.
            // logic jeneratörleri için deneme yapılabilir.

            return { valid: true };
        } catch (e: any) {
            return { valid: false, error: e.message };
        }
    }

    private static checkBalance(code: string, open: string, close: string): boolean {
        let count = 0;
        for (let char of code) {
            if (char === open) count++;
            if (char === close) count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    /**
     * Birden fazla kod dosyasını toplu denetler.
     */
    static validatePayload(payload: Record<string, string>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        for (const [file, code] of Object.entries(payload)) {
            const res = this.validate(file, code);
            if (!res.valid) {
                errors.push(`${file}: ${res.error}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors
        }
    }
}
