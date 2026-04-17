export * from './boslukDoldurmaData';
export * from './testData';
export * from './kelimeTamamlamaData';
export * from './karisikCumleData';
export * from './zitAnlamData';

// Yeni Modüller
import { UZAY_BOSLUK_DOLDURMA, UZAY_TEST, UZAY_KELIME_TAMAMLAMA, UZAY_KARISIK_CUMLE, UZAY_ZIT_ANLAM } from './modules/uzayData';
import { BILIM_BOSLUK_DOLDURMA, BILIM_TEST, BILIM_KELIME_TAMAMLAMA, BILIM_KARISIK_CUMLE, BILIM_ZIT_ANLAM } from './modules/bilimData';
import { TARIH_BOSLUK_DOLDURMA, TARIH_TEST, TARIH_KELIME_TAMAMLAMA, TARIH_KARISIK_CUMLE, TARIH_ZIT_ANLAM } from './modules/tarihData';
import { AKADEMIK_BOSLUK_DOLDURMA, AKADEMIK_TEST, AKADEMIK_KELIME_TAMAMLAMA, AKADEMIK_KARISIK_CUMLE, AKADEMIK_ZIT_ANLAM } from './modules/akademikData';
import { LGS_BULK_BOSLUK_DOLDURMA, LGS_BULK_TEST, LGS_BULK_KELIME_TAMAMLAMA, LGS_BULK_KARISIK_CUMLE, LGS_BULK_ZIT_ANLAM } from './modules/lgsBulkData';

import { BOSLUK_DOLDURMA_SOURCES } from './boslukDoldurmaData';
import { TEST_SOURCES } from './testData';
import { KELIME_TAMAMLAMA_SOURCES } from './kelimeTamamlamaData';
import { KARISIK_CUMLE_SOURCES } from './karisikCumleData';
import { ZIT_ANLAM_SOURCES } from './zitAnlamData';

export const KELIME_CUMLE_SOURCES = {
    bosluk_doldurma: [
        ...BOSLUK_DOLDURMA_SOURCES,
        ...UZAY_BOSLUK_DOLDURMA,
        ...BILIM_BOSLUK_DOLDURMA,
        ...TARIH_BOSLUK_DOLDURMA,
        ...AKADEMIK_BOSLUK_DOLDURMA,
        ...LGS_BULK_BOSLUK_DOLDURMA
    ],
    test: [
        ...TEST_SOURCES,
        ...UZAY_TEST,
        ...BILIM_TEST,
        ...TARIH_TEST,
        ...AKADEMIK_TEST,
        ...LGS_BULK_TEST
    ],
    kelime_tamamlama: [
        ...KELIME_TAMAMLAMA_SOURCES,
        ...UZAY_KELIME_TAMAMLAMA,
        ...BILIM_KELIME_TAMAMLAMA,
        ...TARIH_KELIME_TAMAMLAMA,
        ...AKADEMIK_KELIME_TAMAMLAMA,
        ...LGS_BULK_KELIME_TAMAMLAMA
    ],
    karisik_cumle: [
        ...KARISIK_CUMLE_SOURCES,
        ...UZAY_KARISIK_CUMLE,
        ...BILIM_KARISIK_CUMLE,
        ...TARIH_KARISIK_CUMLE,
        ...AKADEMIK_KARISIK_CUMLE,
        ...LGS_BULK_KARISIK_CUMLE
    ],
    zit_anlam: [
        ...ZIT_ANLAM_SOURCES,
        ...UZAY_ZIT_ANLAM,
        ...BILIM_ZIT_ANLAM,
        ...TARIH_ZIT_ANLAM,
        ...AKADEMIK_ZIT_ANLAM,
        ...LGS_BULK_ZIT_ANLAM
    ]
};
