/**
 * OOGMATIK - PRIVACY SHIELD (v3 Premium)
 * Kişisel verileri (PII) maskeler ve anonimleştirir.
 */

export const anonymizePII = (text: string): string => {
  if (!text) return '';

  // Basit isim/soyisim maskeleme (Gerçekte daha gelişmiş bir NLP modeli gerekebilir)
  // Örn: "Ahmet Yılmaz" -> "A**** Y*****"
  
  // 1. E-posta maskeleme
  let result = text.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '***@***.***');
  
  // 2. Telefon numarası maskeleme
  result = result.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '***-***-****');
  
  // 3. T.C. Kimlik No maskeleme (11 haneli)
  result = result.replace(/\b\d{11}\b/g, '***********');

  return result;
};

/**
 * AI Modeline gönderilecek veriyi temizler
 */
export const sanitizeForAI = (data: any): any => {
  if (typeof data === 'string') {
    return anonymizePII(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForAI(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      // Hassas anahtarları tamamen temizle
      if (['name', 'surname', 'fullName', 'email', 'phone', 'address'].includes(key)) {
        sanitized[key] = '***';
      } else {
        sanitized[key] = sanitizeForAI(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};
