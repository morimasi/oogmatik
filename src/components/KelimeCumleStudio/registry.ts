import React from 'react';
import { KelimeCumleActivityType } from '../../types/kelimeCumle';
import { 
    BoslukDoldurmaRenderer, 
    TestRenderer, 
    KelimeTamamlamaRenderer, 
    KarisikCumleRenderer, 
    ZitAnlamRenderer 
} from './modules';

export const KELIME_CUMLE_REGISTRY: Record<KelimeCumleActivityType, {
    title: string;
    description: string;
    icon: string;
    renderer: React.FC<any>;
    defaultConfig: any;
}> = {
    bosluk_doldurma: {
        title: 'Boşluk Doldurma',
        description: 'Cümledeki eksik kelimeyi tamamlama.',
        icon: '📝',
        renderer: BoslukDoldurmaRenderer,
        defaultConfig: {
            itemCount: 10,
            showAnswers: false
        }
    },
    test: {
        title: 'Çoktan Seçmeli',
        description: 'Dört seçenek arasından doğruyu bulma.',
        icon: '🔘',
        renderer: TestRenderer,
        defaultConfig: {
            itemCount: 8,
            showAnswers: false
        }
    },
    kelime_tamamlama: {
        title: 'Kelime Tamamlama',
        description: 'Eksik harfli kelimeyi ipucuyla bulma.',
        icon: '🧩',
        renderer: KelimeTamamlamaRenderer,
        defaultConfig: {
            itemCount: 10,
            showAnswers: false
        }
    },
    karisik_cumle: {
        title: 'Karışık Cümle',
        description: 'Kelimeleri doğru sıraya dizerek cümle kurma.',
        icon: '🔀',
        renderer: KarisikCumleRenderer,
        defaultConfig: {
            itemCount: 8,
            showAnswers: false
        }
    },
    zit_anlam: {
        title: 'Zıt Anlam',
        description: 'Kelimenin karşıt anlamlısını bulma.',
        icon: '↔️',
        renderer: ZitAnlamRenderer,
        defaultConfig: {
            itemCount: 10,
            showAnswers: false
        }
    }
};
