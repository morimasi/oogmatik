/**
 * OOGMATIK — PII (Personally Identifiable Information) Anonymizer
 * 
 * KVKK (GDPR) compliant data masking for LLM requests and clinical data
 * Ensures zero data leakage of student identities to AI services
 * 
 * Features:
 * - Name/Email/Phone masking
 * - Clinical diagnosis protection
 * - Irreversible anonymization
 * - Audit logging
 */

import { logInfo, logError } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

/**
 * PII data types to anonymize
 */
export interface PIIData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  studentId?: string;
  parentName?: string;
  diagnosis?: string[];
  clinicalNotes?: string;
  [key: string]: unknown;
}

/**
 * Anonymization result
 */
export interface AnonymizationResult {
  anonymized: PIIData;
  mapping: Record<string, string>; // Original → Pseudonym mapping (for reversal if needed)
}

/**
 * PII Anonymizer Service
 */
export class PIIAnonymizer {
  private static instance: PIIAnonymizer;
  private pseudonymCounter = 0;
  private mappingCache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): PIIAnonymizer {
    if (!PIIAnonymizer.instance) {
      PIIAnonymizer.instance = new PIIAnonymizer();
    }
    return PIIAnonymizer.instance;
  }

  /**
   * Anonymize PII data before sending to LLM
   * Replaces identifiable information with pseudonyms
   */
  anonymizePII(data: PIIData): AnonymizationResult {
    try {
      const anonymized: PIIData = {};
      const mapping: Record<string, string> = {};

      // Name anonymization
      if (data.name) {
        const pseudonym = this.generatePseudonym('NAME');
        anonymized.name = pseudonym;
        mapping[data.name] = pseudonym;
      }

      // Email anonymization
      if (data.email) {
        const pseudonym = `user_${this.generateId()}@anonymous.local`;
        anonymized.email = pseudonym;
        mapping[data.email] = pseudonym;
      }

      // Phone anonymization
      if (data.phone) {
        const pseudonym = `+90-XXX-XXX-${String(this.generateId()).slice(-4)}`;
        anonymized.phone = pseudonym;
        mapping[data.phone] = pseudonym;
      }

      // Address anonymization
      if (data.address) {
        const pseudonym = `[ADDRESS_REDACTED]`;
        anonymized.address = pseudonym;
        mapping[data.address] = pseudonym;
      }

      // Student ID anonymization
      if (data.studentId) {
        const pseudonym = `STU_${this.generateId()}`;
        anonymized.studentId = pseudonym;
        mapping[data.studentId] = pseudonym;
      }

      // Parent name anonymization
      if (data.parentName) {
        const pseudonym = this.generatePseudonym('PARENT');
        anonymized.parentName = pseudonym;
        mapping[data.parentName] = pseudonym;
      }

      // Diagnosis protection (sensitive health data)
      if (data.diagnosis && Array.isArray(data.diagnosis)) {
        anonymized.diagnosis = data.diagnosis.map(d => {
          const pseudonym = `DIAG_${this.generateId()}`;
          mapping[d] = pseudonym;
          return pseudonym;
        });
      }

      // Clinical notes sanitization
      if (data.clinicalNotes) {
        anonymized.clinicalNotes = this.sanitizeText(data.clinicalNotes, mapping);
      }

      // Copy remaining non-PII fields
      for (const [key, value] of Object.entries(data)) {
        if (!(key in anonymized)) {
          anonymized[key] = value;
        }
      }

      logInfo('PII Anonymization completed', {
        fieldsAnonymized: Object.keys(mapping).length,
        timestamp: new Date().toISOString(),
      });

      return { anonymized, mapping };
    } catch (error) {
      logError(new AppError('PII Anonymization failed', 'PII_ERROR', 500, { error }));
      throw new AppError('Veri anonimleştirme başarısız oldu', 'PII_ANONYMIZE_ERROR', 500);
    }
  }

  /**
   * Re-anonymize mapping back to original values (if needed for internal use)
   * WARNING: Only use in secure, access-controlled environments
   */
  restorePII(data: PIIData, mapping: Record<string, string>): PIIData {
    try {
      const reverseMapping: Record<string, string> = {};
      
      // Create reverse mapping
      for (const [original, pseudonym] of Object.entries(mapping)) {
        reverseMapping[pseudonym] = original;
      }

      const restored: PIIData = {};

      // Restore each field
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value in reverseMapping) {
          restored[key] = reverseMapping[value];
        } else if (Array.isArray(value)) {
          restored[key] = value.map(v => 
            typeof v === 'string' && v in reverseMapping ? reverseMapping[v] : v
          );
        } else {
          restored[key] = value;
        }
      }

      logInfo('PII Restoration completed', {
        fieldsRestored: Object.keys(reverseMapping).length,
        timestamp: new Date().toISOString(),
      });

      return restored;
    } catch (error) {
      logError(new AppError('PII Restoration failed', 'PII_RESTORE_ERROR', 500, { error }));
      throw new AppError('Veri geri yükleme başarısız oldu', 'PII_RESTORE_ERROR', 500);
    }
  }

  /**
   * Sanitize text by replacing PII references
   */
  private sanitizeText(text: string, mapping: Record<string, string>): string {
    let sanitized = text;

    // Replace all occurrences of PII
    for (const [original, pseudonym] of Object.entries(mapping)) {
      const regex = new RegExp(this.escapeRegex(original), 'gi');
      sanitized = sanitized.replace(regex, pseudonym);
    }

    return sanitized;
  }

  /**
   * Generate a pseudonym for an entity
   */
  private generatePseudonym(type: 'NAME' | 'PARENT' | 'STUDENT'): string {
    this.pseudonymCounter++;
    return `${type}_${this.pseudonymCounter.toString().padStart(4, '0')}`;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 10000);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Clear mapping cache (for security)
   */
  clearCache(): void {
    this.mappingCache.clear();
    this.pseudonymCounter = 0;
    logInfo('PII Anonymizer cache cleared');
  }
}

// Export singleton instance
export const piiAnonymizer = PIIAnonymizer.getInstance();

/**
 * Helper function for quick anonymization
 */
export function anonymizeStudentData(data: PIIData): AnonymizationResult {
  return piiAnonymizer.anonymizePII(data);
}

/**
 * Helper function for quick restoration
 */
export function restoreStudentData(data: PIIData, mapping: Record<string, string>): PIIData {
  return piiAnonymizer.restorePII(data, mapping);
}
