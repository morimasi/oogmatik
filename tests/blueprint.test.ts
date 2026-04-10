import { describe, it, expect } from 'vitest';
import {
  isValidBlueprint,
  getBlueprintOrFallback,
  DEFAULT_BLUEPRINT,
} from '../src/utils/blueprint';

describe('Blueprint utilities', () => {
  it('validates blueprint shapes permissively', () => {
    expect(isValidBlueprint({ id: 'bp1' })).toBe(true);
    expect(isValidBlueprint({ content: [] })).toBe(true);
    expect(isValidBlueprint(null)).toBe(false);
    expect(isValidBlueprint(undefined as unknown as object)).toBe(false);
  });

  it('returns fallback when blueprint is invalid', () => {
    const fallback = getBlueprintOrFallback(null);
    expect(fallback).toEqual(DEFAULT_BLUEPRINT);
  });
});
