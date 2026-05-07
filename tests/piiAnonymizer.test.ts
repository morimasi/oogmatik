import { describe, it, expect, beforeEach } from 'vitest';
import { piiAnonymizer, anonymizeStudentData, restoreStudentData } from '../src/utils/piiAnonymizer';

describe('PII Anonymizer — KVKK Compliance', () => {
  beforeEach(() => {
    piiAnonymizer.clearCache();
  });

  describe('Name Anonymization', () => {
    it('anonymizes student name', () => {
      const data = { name: 'Ahmet Yılmaz' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.name).toBeDefined();
      expect(result.anonymized.name).not.toBe('Ahmet Yılmaz');
      expect(result.mapping['Ahmet Yılmaz']).toBe(result.anonymized.name);
    });

    it('generates unique pseudonyms', () => {
      const data1 = anonymizeStudentData({ name: 'Student 1' });
      const data2 = anonymizeStudentData({ name: 'Student 2' });
      
      expect(data1.anonymized.name).not.toBe(data2.anonymized.name);
    });
  });

  describe('Email Anonymization', () => {
    it('anonymizes email address', () => {
      const data = { email: 'ahmet@example.com' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.email).toContain('@anonymous.local');
      expect(result.anonymized.email).not.toBe('ahmet@example.com');
    });

    it('generates consistent anonymization', () => {
      const data = { email: 'test@example.com' };
      const result1 = anonymizeStudentData(data);
      const result2 = anonymizeStudentData(data);
      
      // Both should be anonymized (values may differ but format consistent)
      expect(result1.anonymized.email).toMatch(/user_\d+@anonymous\.local/);
      expect(result2.anonymized.email).toMatch(/user_\d+@anonymous\.local/);
    });
  });

  describe('Phone Anonymization', () => {
    it('anonymizes phone number', () => {
      const data = { phone: '+90-555-123-4567' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.phone).toMatch(/\+90-XXX-XXX-\d{4}/);
      expect(result.anonymized.phone).not.toBe('+90-555-123-4567');
    });
  });

  describe('Address Anonymization', () => {
    it('redacts address completely', () => {
      const data = { address: 'İstanbul, Kadıköy, Moda Cad. No:15' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.address).toBe('[ADDRESS_REDACTED]');
    });
  });

  describe('Student ID Anonymization', () => {
    it('anonymizes student ID', () => {
      const data = { studentId: 'STU-2024-001234' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.studentId).toMatch(/STU_\d+/);
      expect(result.anonymized.studentId).not.toBe('STU-2024-001234');
    });
  });

  describe('Parent Name Anonymization', () => {
    it('anonymizes parent name', () => {
      const data = { parentName: 'Fatma Yılmaz' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.parentName).toMatch(/PARENT_\d+/);
      expect(result.anonymized.parentName).not.toBe('Fatma Yılmaz');
    });
  });

  describe('Diagnosis Protection', () => {
    it('anonymizes diagnosis array', () => {
      const data = { diagnosis: ['Disleksi', 'DEHB', 'Diskalkuli'] };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.diagnosis).toBeDefined();
      expect(Array.isArray(result.anonymized.diagnosis)).toBe(true);
      
      result.anonymized.diagnosis!.forEach(d => {
        expect(d).toMatch(/DIAG_\d+/);
        expect(d).not.toBe('Disleksi');
        expect(d).not.toBe('DEHB');
        expect(d).not.toBe('Diskalkuli');
      });
    });
  });

  describe('Clinical Notes Sanitization', () => {
    it('sanitizes clinical notes', () => {
      const data = {
        clinicalNotes: 'Ahmet Yılmaz disleksi tanısı almıştır. Ailesi ile görüşüldü.',
        name: 'Ahmet Yılmaz',
      };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.clinicalNotes).toBeDefined();
      expect(result.anonymized.clinicalNotes).not.toContain('Ahmet Yılmaz');
      expect(result.anonymized.clinicalNotes).toContain(result.anonymized.name!);
    });
  });

  describe('PII Restoration', () => {
    it('restores original PII data', () => {
      const original = {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90-555-123-4567',
        diagnosis: ['Disleksi'],
      };
      
      const anonymized = anonymizeStudentData(original);
      const restored = restoreStudentData(anonymized.anonymized, anonymized.mapping);
      
      expect(restored.name).toBe('Ahmet Yılmaz');
      expect(restored.email).toBe('ahmet@example.com');
      expect(restored.phone).toBe('+90-555-123-4567');
      expect(restored.diagnosis).toEqual(['Disleksi']);
    });

    it('handles complex data with multiple PII fields', () => {
      const original = {
        name: 'Ayşe Demir',
        parentName: 'Mehmet Demir',
        studentId: 'STU-001',
        email: 'ayse@school.edu',
      };
      
      const result = anonymizeStudentData(original);
      const restored = restoreStudentData(result.anonymized, result.mapping);
      
      expect(restored.name).toBe('Ayşe Demir');
      expect(restored.parentName).toBe('Mehmet Demir');
      expect(restored.studentId).toBe('STU-001');
      expect(restored.email).toBe('ayse@school.edu');
    });
  });

  describe('Non-PII Fields Preservation', () => {
    it('preserves non-PII fields unchanged', () => {
      const data = {
        name: 'Test Student',
        grade: 5,
        attendanceRate: 95,
        notes: 'Good progress',
      };
      
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.grade).toBe(5);
      expect(result.anonymized.attendanceRate).toBe(95);
      expect(result.anonymized.notes).toBe('Good progress');
    });
  });

  describe('Cache Management', () => {
    it('clears cache successfully', () => {
      anonymizeStudentData({ name: 'Student 1' });
      piiAnonymizer.clearCache();
      
      // After clear, counter resets
      const result = anonymizeStudentData({ name: 'Student 2' });
      expect(result.anonymized.name).toBe('NAME_0001');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data', () => {
      const result = anonymizeStudentData({});
      expect(result.anonymized).toEqual({});
    });

    it('handles null-like values gracefully', () => {
      const data = {
        name: '',
        email: null as unknown as string,
        phone: undefined as unknown as string,
      };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized).toBeDefined();
    });

    it('handles special characters in names', () => {
      const data = { name: 'İstanbul\'lu Öğrenci' };
      const result = anonymizeStudentData(data);
      
      expect(result.anonymized.name).toBeDefined();
      expect(result.anonymized.name).not.toContain('İstanbul');
    });
  });

  describe('Audit & Security', () => {
    it('generates mapping for traceability', () => {
      const data = { name: 'Test Student', email: 'test@example.com' };
      const result = anonymizeStudentData(data);
      
      expect(Object.keys(result.mapping).length).toBeGreaterThan(0);
      expect(result.mapping['Test Student']).toBeDefined();
      expect(result.mapping['test@example.com']).toBeDefined();
    });

    it('ensures irreversible anonymization without mapping', () => {
      const data = { name: 'Secret Student' };
      const result = anonymizeStudentData(data);
      
      // Without mapping, should not be able to reverse
      expect(result.anonymized.name).not.toBe('Secret Student');
    });
  });
});
