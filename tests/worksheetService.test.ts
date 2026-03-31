import { describe, it, expect } from 'vitest';
import { sanitizeForFirestore } from '@/services/worksheetService';

/**
 * Tests for the sanitizeForFirestore utility.
 *
 * Firestore rejects any payload that contains `undefined` field values
 * (FirebaseError: Unsupported field value: undefined).
 * sanitizeForFirestore recursively replaces undefined with null before
 * the payload is sent to addDoc / updateDoc.
 */
describe('sanitizeForFirestore', () => {
    it('replaces a top-level undefined value with null', () => {
        expect(sanitizeForFirestore(undefined)).toBe(null);
    });

    it('leaves null as null', () => {
        expect(sanitizeForFirestore(null)).toBe(null);
    });

    it('leaves primitives unchanged', () => {
        expect(sanitizeForFirestore('hello')).toBe('hello');
        expect(sanitizeForFirestore(42)).toBe(42);
        expect(sanitizeForFirestore(true)).toBe(true);
    });

    it('replaces undefined object properties with null', () => {
        const input = { activityType: undefined, name: 'test', count: 1 };
        const result = sanitizeForFirestore(input) as Record<string, unknown>;
        expect(result.activityType).toBe(null);
        expect(result.name).toBe('test');
        expect(result.count).toBe(1);
    });

    it('preserves null object properties', () => {
        const input = { studentId: null, userId: 'abc' };
        const result = sanitizeForFirestore(input) as Record<string, unknown>;
        expect(result.studentId).toBe(null);
        expect(result.userId).toBe('abc');
    });

    it('recursively sanitizes nested objects', () => {
        const input = {
            category: { id: undefined, title: 'Math' },
            meta: { level: undefined, score: 90 },
        };
        const result = sanitizeForFirestore(input) as Record<string, Record<string, unknown>>;
        expect(result.category.id).toBe(null);
        expect(result.category.title).toBe('Math');
        expect(result.meta.level).toBe(null);
        expect(result.meta.score).toBe(90);
    });

    it('sanitizes undefined entries inside arrays', () => {
        const input = { tags: ['a', undefined, 'b'] };
        const result = sanitizeForFirestore(input) as Record<string, unknown[]>;
        expect(result.tags).toEqual(['a', null, 'b']);
    });

    it('preserves Date objects unchanged (Firestore supports them natively)', () => {
        const date = new Date('2024-01-15T00:00:00Z');
        const input = { createdAt: date, name: 'test' };
        const result = sanitizeForFirestore(input) as Record<string, unknown>;
        expect(result.createdAt).toBe(date);
        expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('handles a complete worksheet payload with undefined activityType', () => {
        const payload = {
            userId: 'user123',
            studentId: null,
            name: 'Test Sheet',
            activityType: undefined,   // ← the reported bug
            worksheetData: '[]',
            icon: 'fa-solid fa-file',
            category: { id: 'uncategorized', title: 'Kategorisiz' },
            createdAt: new Date().toISOString(),
            styleSettings: undefined,  // optional fields may also be undefined
        };
        const result = sanitizeForFirestore(payload) as Record<string, unknown>;
        expect(result.activityType).toBe(null);
        expect(result.styleSettings).toBe(null);
        expect(result.userId).toBe('user123');
        expect(result.name).toBe('Test Sheet');
    });
});
