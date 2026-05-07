import { describe, it, expect } from 'vitest';
import {
  balanceBraces,
  truncateToLastValidEntry,
  tryRepairJson,
} from '../src/utils/jsonRepair';
import { AppError } from '../src/utils/AppError';

describe('JSON Repair Engine — Multi-Layer', () => {
  // Layer 1: balanceBraces
  describe('Layer 1: balanceBraces', () => {
    it('balances unmatched opening braces', () => {
      const input = '{"name": "test", "items": [1, 2';
      const result = balanceBraces(input);
      expect(result).toContain('}');
      expect(result).toContain(']');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('handles unclosed strings', () => {
      const input = '{"message": "hello';
      const result = balanceBraces(input);
      expect(result).toContain('}');
      expect(result).toContain('"');
    });

    it('preserves valid JSON', () => {
      const input = '{"valid": true}';
      const result = balanceBraces(input);
      expect(JSON.parse(result)).toEqual({ valid: true });
    });

    it('handles escaped quotes in strings', () => {
      const input = '{"text": "say \\"hello\\"';
      const result = balanceBraces(input);
      expect(result).toContain('}');
    });

    it('handles nested objects', () => {
      const input = '{"outer": {"inner": 123';
      const result = balanceBraces(input);
      const parsed = JSON.parse(result);
      expect(parsed.outer.inner).toBe(123);
    });
  });

  // Layer 2: truncateToLastValidEntry
  describe('Layer 2: truncateToLastValidEntry', () => {
    it('truncates to last complete object', () => {
      const input = '{"id": 1} garbage';
      const result = truncateToLastValidEntry(input);
      expect(result).toBe('{"id": 1}');
    });

    it('finds nested object boundaries', () => {
      const input = '{"data": {"nested": true}} [incomplete';
      const result = truncateToLastValidEntry(input);
      expect(result).toBe('{"data": {"nested": true}}');
    });

    it('handles arrays correctly', () => {
      const input = '[1, 2, 3] garbage';
      const result = truncateToLastValidEntry(input);
      expect(result).toBe('[1, 2, 3]');
    });

    it('truncates at comma boundary', () => {
      const input = '{"a": 1, "b": 2, "c":';
      const result = truncateToLastValidEntry(input);
      expect(result).toContain('"b": 2');
    });
  });

  // Layer 3: tryRepairJson (full repair)
  describe('Layer 3: tryRepairJson (full repair)', () => {
    it('repairs and parses layer 1 error', () => {
      const input = '{"key": "value", "array": [1, 2';
      const result = tryRepairJson(input);
      expect(result).toEqual(expect.objectContaining({ key: 'value' }));
    });

    it('repairs layer 2 truncation needed', () => {
      const input = '{"complete": true} {"incomplete": ';
      const result = tryRepairJson(input);
      expect(result).toEqual({ complete: true });
    });

    it('throws AppError on unrecoverable JSON', () => {
      const input = 'completely invalid text with no braces';
      expect(() => tryRepairJson(input)).toThrow(AppError);
    });

    it('handles Gemini multiline output', () => {
      const input = `{
        "output": "hello",
        "items": [
          {"id": 1},
          {"id": 2}
        ]
      `;
      const result = tryRepairJson(input);
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items.length).toBe(2);
    });

    it('handles escaped newlines in strings', () => {
      const input = '{"text": "line1\\nline2"}';
      const result = tryRepairJson(input);
      expect(result.text).toBe('line1\nline2');
    });

    it('removes markdown code fences', () => {
      const input = '```json\n{"data": "test"}\n```';
      const result = tryRepairJson(input);
      expect(result).toEqual({ data: 'test' });
    });

    it('handles zero-width characters', () => {
      const input = '{"text": "hello"}\u200B\u200C\u200D';
      const result = tryRepairJson(input);
      expect(result).toEqual({ text: 'hello' });
    });

    it('finds JSON starting at bracket', () => {
      const input = 'Some text before {"id": 123}';
      const result = tryRepairJson(input);
      expect(result).toEqual({ id: 123 });
    });
  });

  // Integration: Error handling
  describe('Integration: Error handling', () => {
    it('throws AppError on empty input', () => {
      expect(() => tryRepairJson('')).toThrow(AppError);
      expect(() => tryRepairJson(null as any)).toThrow(AppError);
    });

    it('includes helpful error message', () => {
      try {
        tryRepairJson('invalid');
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.userMessage).toContain('AI verisi');
          expect(error.code).toBe('INTERNAL_ERROR');
        }
      }
    });
  });
});
