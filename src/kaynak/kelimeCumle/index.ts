export * from './boslukDoldurmaData';
export * from './testData';
export * from './kelimeTamamlamaData';
export * from './karisikCumleData';
export * from './zitAnlamData';

import { BOSLUK_DOLDURMA_SOURCES } from './boslukDoldurmaData';
import { TEST_SOURCES } from './testData';
import { KELIME_TAMAMLAMA_SOURCES } from './kelimeTamamlamaData';
import { KARISIK_CUMLE_SOURCES } from './karisikCumleData';
import { ZIT_ANLAM_SOURCES } from './zitAnlamData';

export const KELIME_CUMLE_SOURCES = {
    bosluk_doldurma: BOSLUK_DOLDURMA_SOURCES,
    test: TEST_SOURCES,
    kelime_tamamlama: KELIME_TAMAMLAMA_SOURCES,
    karisik_cumle: KARISIK_CUMLE_SOURCES,
    zit_anlam: ZIT_ANLAM_SOURCES
};
