export interface YazimNoktalamaSettings {
    focusRules: ('buyuk-harf' | 'kesme-isareti' | 'noktalama' | 'bitisik-ayri')[];
    exerciseCount: number;
    showRuleHint: boolean;
    errorCorrectionMode: boolean; // Metindeki hataları düzeltme etkinliği
}
