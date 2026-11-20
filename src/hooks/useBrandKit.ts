import { useState, useEffect, useCallback } from 'react';
import { BrandKit } from '../types/adStudio';
import defaultKit from '../components/AdStudio/assets/default-brand-kit.json';

const STORAGE_KEY = 'bdmind_brand_kits';
const ACTIVE_KEY = 'bdmind_active_brand_kit';

const DEFAULT_BRAND_KITS: BrandKit[] = [
  defaultKit as BrandKit,
  {
    id: 'pastel_dyslexia',
    name: 'Disleksi Dostu Pastel',
    logo: '',
    primaryColor: '#0D9488',
    secondaryColor: '#F59E0B',
    font: 'Lexend',
    slogan: 'Sıfır bilişsel yük ile özgüvenli öğrenme',
    website: 'https://bdmind.com/disleksi',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'meb_kurumsal',
    name: 'MEB & Özel Eğitim Kurumsal',
    logo: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#E11D48',
    font: 'Lexend',
    slogan: 'MEB 573 KHK ve BEP Tam Uyumlu',
    website: 'https://bdmind.com/kurumsal',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'modern_edtech',
    name: 'Modern EdTech İnovasyon',
    logo: '',
    primaryColor: '#10B981',
    secondaryColor: '#6366F1',
    font: 'Lexend',
    slogan: 'Geleceğin Nöro-Pedagojik Eğitim Platformu',
    website: 'https://bdmind.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function loadAll(): BrandKit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BrandKit[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_BRAND_KITS;
}

function loadActive(): BrandKit {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw) return JSON.parse(raw) as BrandKit;
  } catch { /* ignore */ }
  return defaultKit as BrandKit;
}

function saveAll(kits: BrandKit[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kits));
}

function saveActive(kit: BrandKit): void {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(kit));
}

export function useBrandKit() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>(loadAll);
  const [activeBrandKit, setActiveBrandKitState] = useState<BrandKit>(loadActive);

  useEffect(() => {
    saveAll(brandKits);
  }, [brandKits]);

  useEffect(() => {
    saveActive(activeBrandKit);
  }, [activeBrandKit]);

  const addBrandKit = useCallback((kit: BrandKit) => {
    setBrandKits(prev => [...prev, kit]);
  }, []);

  const updateBrandKit = useCallback((id: string, updates: Partial<BrandKit>) => {
    setBrandKits(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
    setActiveBrandKitState(prev => prev.id === id ? { ...prev, ...updates } : prev);
  }, []);

  const deleteBrandKit = useCallback((id: string) => {
    setBrandKits(prev => prev.filter(k => k.id !== id));
    if (activeBrandKit.id === id) {
      const defaultK = defaultKit as BrandKit;
      setActiveBrandKitState(defaultK);
    }
  }, [activeBrandKit.id]);

  const setActiveBrandKit = useCallback((kit: BrandKit) => {
    setActiveBrandKitState(kit);
  }, []);

  const duplicateBrandKit = useCallback((id: string) => {
    const source = brandKits.find(k => k.id === id) || activeBrandKit;
    const dup: BrandKit = {
      ...source,
      id: crypto.randomUUID(),
      name: `${source.name} (Kopya)`,
      createdAt: new Date().toISOString(),
    };
    addBrandKit(dup);
    return dup;
  }, [brandKits, activeBrandKit, addBrandKit]);

  return {
    brandKits,
    activeBrandKit,
    addBrandKit,
    updateBrandKit,
    deleteBrandKit,
    setActiveBrandKit,
    duplicateBrandKit,
  };
}
