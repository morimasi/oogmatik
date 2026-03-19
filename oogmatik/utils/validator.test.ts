import { describe, it, expect } from 'vitest';
import { Validator } from './validator';

describe('Validator Utility', () => {
  describe('isObject', () => {
    it('should return true for valid objects', () => {
      expect(Validator.isObject({})).toBe(true);
      expect(Validator.isObject({ a: 1 })).toBe(true);
    });

    it('should return false for null, arrays, and primitives', () => {
      expect(Validator.isObject(null)).toBe(false);
      expect(Validator.isObject([])).toBe(false);
      expect(Validator.isObject('string')).toBe(false);
      expect(Validator.isObject(123)).toBe(false);
      expect(Validator.isObject(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(Validator.isArray([])).toBe(true);
      expect(Validator.isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(Validator.isArray({})).toBe(false);
      expect(Validator.isArray('string')).toBe(false);
      expect(Validator.isArray(null)).toBe(false);
    });
  });

  describe('validateSchema', () => {
    const userSchema = {
      type: 'object',
      required: ['name', 'age'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        isStudent: { type: 'boolean' }
      }
    };

    it('should validate a correct object against a schema', () => {
      const validUser = { name: 'John', age: 30, isStudent: true };
      expect(Validator.validateSchema(validUser, userSchema)).toBe(true);
    });

    it('should fail if a required property is missing', () => {
      const invalidUser = { name: 'John' };
      expect(Validator.validateSchema(invalidUser, userSchema)).toBe(false);
    });

    it('should fail if a property has the wrong type', () => {
      const invalidUser = { name: 'John', age: 'thirty' };
      expect(Validator.validateSchema(invalidUser, userSchema)).toBe(false);
    });

    it('should validate an array of objects', () => {
      const arraySchema = {
        type: 'array',
        items: userSchema
      };
      const validUsers = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      expect(Validator.validateSchema(validUsers, arraySchema)).toBe(true);
    });
  });
});
