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
}

export const dlpService = DLPService.getInstance();
