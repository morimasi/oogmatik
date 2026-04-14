import type { ComponentType } from 'react';
import type { SariKitapActivityType, SariKitapConfig, SariKitapGeneratedContent } from '../../types/sariKitap';

// ─── Modül Arayüz Tipleri ────────────────────────────────────────

export interface ConfigPanelProps {
    config: SariKitapConfig;
    onUpdate: (updates: Partial<SariKitapConfig>) => void;
}

export interface RendererProps {
    config: SariKitapConfig;
    content: SariKitapGeneratedContent;
}

export interface SariKitapModule {
    type: SariKitapActivityType;
    label: string;
    icon: string;
    color: string;
    description: string;
    ConfigPanel: ComponentType<ConfigPanelProps>;
    Renderer: ComponentType<RendererProps>;
}

// ─── Modül Registry ──────────────────────────────────────────────

const MODULE_REGISTRY = new Map<SariKitapActivityType, SariKitapModule>();

export function registerModule(module: SariKitapModule): void {
    MODULE_REGISTRY.set(module.type, module);
}

export function getModule(type: SariKitapActivityType): SariKitapModule | undefined {
    return MODULE_REGISTRY.get(type);
}

export function getAllModules(): SariKitapModule[] {
    return Array.from(MODULE_REGISTRY.values());
}

// ─── Modül Kayıtları ─────────────────────────────────────────────
// Her modül kendini buraya kaydeder

import { PencereConfigPanel, PencereRenderer } from './modules/pencere';
import { NoktaConfigPanel, NoktaRenderer } from './modules/nokta';
import { KopruConfigPanel, KopruRenderer } from './modules/kopru';
import { CiftMetinConfigPanel, CiftMetinRenderer } from './modules/ciftMetin';
import { BellekConfigPanel, BellekRenderer } from './modules/bellek';
import { HizliOkumaConfigPanel, HizliOkumaRenderer } from './modules/hizliOkuma';

registerModule({
    type: 'pencere',
    label: 'Pencere',
    icon: '🪟',
    color: '#3b82f6',
    description: 'Maskeleme ile odaklanma',
    ConfigPanel: PencereConfigPanel,
    Renderer: PencereRenderer,
});

registerModule({
    type: 'nokta',
    label: 'Nokta',
    icon: '⚫',
    color: '#10b981',
    description: 'Göz takibi noktaları',
    ConfigPanel: NoktaConfigPanel,
    Renderer: NoktaRenderer,
});

registerModule({
    type: 'kopru',
    label: 'Köprü',
    icon: '🌉',
    color: '#8b5cf6',
    description: 'Hece yay bağlantıları',
    ConfigPanel: KopruConfigPanel,
    Renderer: KopruRenderer,
});

registerModule({
    type: 'cift_metin',
    label: 'Çift Metin',
    icon: '📖',
    color: '#f59e0b',
    description: 'İki hikaye ayrıştırma',
    ConfigPanel: CiftMetinConfigPanel,
    Renderer: CiftMetinRenderer,
});

registerModule({
    type: 'bellek',
    label: 'Bellek',
    icon: '🧠',
    color: '#ef4444',
    description: 'Kelime hafıza blokları',
    ConfigPanel: BellekConfigPanel,
    Renderer: BellekRenderer,
});

registerModule({
    type: 'hizli_okuma',
    label: 'Hızlı Okuma',
    icon: '⚡',
    color: '#06b6d4',
    description: 'Seriyal kelime blokları',
    ConfigPanel: HizliOkumaConfigPanel,
    Renderer: HizliOkumaRenderer,
});
