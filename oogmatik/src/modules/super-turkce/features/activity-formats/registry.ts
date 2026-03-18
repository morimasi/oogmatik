// =============================================================================
// MERKEZ FORMAT REGISTRY — Tüm 6 Stüdyo, 60 Format Tanımı
// Cockpit.tsx buradan veri okuyacak; FORMAT_REGISTRY artık bu dosyadan geliyor.
// =============================================================================

import { ActivityFormatDef } from '../../core/types/activity-formats';
import { okumaAnlamaFormats } from './okuma-anlama/formats';
import { mantikMuhakemeFormats } from './mantik-muhakeme/formats';
import { dilBilgisiFormats } from './dil-bilgisi/formats';
import { yazimNoktalamaFormats } from './yazim-noktalama/formats';
import { sozVarligiFormats } from './soz-varligi/formats';
import { sesOlaylariFormats } from './ses-olaylari/formats';

// Tüm formatlar bir arada
export const ALL_FORMATS: ActivityFormatDef[] = [
    ...okumaAnlamaFormats,
    ...mantikMuhakemeFormats,
    ...dilBilgisiFormats,
    ...yazimNoktalamaFormats,
    ...sozVarligiFormats,
    ...sesOlaylariFormats,
];

// Kategoriye göre filtreleme yardımcısı
export const getFormatsByCategory = (category: string): ActivityFormatDef[] => {
    return ALL_FORMATS.filter(f => f.category === category);
};

// ID ile format bul
export const getFormatById = (id: string): ActivityFormatDef | undefined => {
    return ALL_FORMATS.find(f => f.id === id);
};
