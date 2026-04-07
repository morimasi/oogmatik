import { describe, it, expect } from 'vitest';
import { KavramHaritasiGenerator } from '../src/services/generators/kavramHaritasi';
import { ActivityType } from '../src/types';

describe('KavramHaritasiGenerator', () => {
  it('exports KavramHaritasiGenerator class', () => {
    const gen = new KavramHaritasiGenerator();
    expect(gen).toBeDefined();
    expect(typeof gen.generate).toBe('function');
  });

  it('ActivityType includes KAVRAM_HARITASI', () => {
    expect(ActivityType.KAVRAM_HARITASI).toBe('KAVRAM_HARITASI');
  });
});
