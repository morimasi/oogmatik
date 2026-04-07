import { describe, it, expect } from 'vitest';
import { EsAnlamliKelimelerGenerator } from '../src/services/generators/esAnlamliKelimeler';
import { ActivityType } from '../src/types';

describe('EsAnlamliKelimelerGenerator', () => {
  it('exports EsAnlamliKelimelerGenerator class', () => {
    const gen = new EsAnlamliKelimelerGenerator();
    expect(gen).toBeDefined();
    expect(typeof gen.generate).toBe('function');
  });

  it('ActivityType includes ES_ANLAMLI_KELIMELER', () => {
    expect(ActivityType.ES_ANLAMLI_KELIMELER).toBe('ES_ANLAMLI_KELIMELER');
  });
});
