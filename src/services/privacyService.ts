/**
 * OOGMATIK - DLP (Data Loss Prevention) Service
 * KVKK Uyumluluğu: Öğrenci adı, tanısı ve skorların bir arada sızmasını engeller.
 */

export interface DLPConfig {
    maskNames?: boolean;
    maskDiagnosis?: boolean;
    maskScores?: boolean;
}

export class DLPService {
    private static instance: DLPService;
    
    private constructor() {}

    public static getInstance(): DLPService {
        if (!DLPService.instance) {
            DLPService.instance = new DLPService();
        }
        return DLPService.instance;
    }

    /**
     * Hassas verileri maskeler
     */
    public maskSensitiveData(text: string): string {
        if (!text) return text;
        
        // Örnek: T.C. Kimlik No maskeleme (Varsa)
        const tcRegex = /\b[1-9][0-9]{10}\b/g;
        let masked = text.replace(tcRegex, '***********');

        // Örnek: E-posta maskeleme
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        masked = masked.replace(emailRegex, (match) => {
            const [user, domain] = match.split('@');
            return `${user[0]}***@${domain}`;
        });

        return masked;
    }

    /**
     * Öğrenci ismini KVKK'ya uygun maskeler (örn: Ahmet Yılmaz -> A**** Y****)
     */
    public maskStudentName(name: string): string {
        if (!name) return 'Öğrenci';
        return name.split(' ').map(part => {
            if (part.length <= 1) return part;
            return part[0] + '*'.repeat(part.length - 1);
        }).join(' ');
    }

    /**
     * Klinik veriyi maskeler (Sadece uzman görebilir mantığı için)
     */
    public protectClinicalContext(context: string, userRole: string): string {
        if (userRole === 'admin' || userRole === 'teacher') {
            return context;
        }
        return 'Bu alan sadece yetkili eğitimciler tarafından görüntülenebilir.';
    }

    /**
     * T.C. Kimlik numarasını hash'ler
     */
    public hashTcNo(tcNo: string): string {
        if (!tcNo) return '';
        // Simple hash for demo - in production use proper hashing
        return btoa(tcNo).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }

    /**
     * Öğrenci verilerini anonimleştirir
     */
    public anonymizeStudent(studentData: { name?: string; tcNo?: string; diagnosis?: string; scores?: number[] }): any {
        return {
            ...studentData,
            name: studentData.name ? this.maskStudentName(studentData.name) : 'Öğrenci',
            tcNo: studentData.tcNo ? this.hashTcNo(studentData.tcNo) : '',
            diagnosis: studentData.diagnosis ? '[MASKED]' : undefined,
            scores: studentData.scores ? studentData.scores.map(() => '[MASKED]') : undefined
        };
    }

    /**
     * AI gönderimi için veriyi temizler
     */
    public sanitizeForAI(text: string): string {
        if (!text) return text;
        
        let sanitized = text;
        
        // Remove T.C. Kimlik numbers
        sanitized = sanitized.replace(/\b[1-9][0-9]{10}\b/g, '[TC_NO]');
        
        // Remove full names (keep initials)
        sanitized = sanitized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, (match) => {
            return match.split(' ').map(part => part[0] + '.').join(' ');
        });
        
        // Remove emails
        sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
        
        // Remove phone numbers
        sanitized = sanitized.replace(/\b0?[5-9][0-9]{9}\b/g, '[PHONE]');
        
        return sanitized;
    }
}

export const dlpService = DLPService.getInstance();

// Legacy exports for test compatibility
export const hashTcNo = (tcNo: string) => dlpService.hashTcNo(tcNo);
export const anonymizeStudent = (studentData: any) => dlpService.anonymizeStudent(studentData);
export const sanitizeForAI = (text: string) => dlpService.sanitizeForAI(text);
