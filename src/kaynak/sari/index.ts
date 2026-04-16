import { SARI_KITAP_PENCERE } from './pencereData';
import { SARI_KITAP_NOKTA } from './noktaData';
import { SARI_KITAP_KOPRU } from './kopruData';
import { SARI_KITAP_CIFT_METIN } from './ciftMetinData';
import { SARI_KITAP_BELLEK } from './bellekData';
import { SARI_KITAP_HIZLI_OKUMA } from './hizliOkumaData';
import { SariKitapActivityType, SariKitapSourceEntry } from '../../types/sariKitap';

export const SARI_KITAP_SOURCES: Record<SariKitapActivityType, SariKitapSourceEntry[]> = {
    pencere: SARI_KITAP_PENCERE,
    nokta: SARI_KITAP_NOKTA,
    kopru: SARI_KITAP_KOPRU,
    cift_metin: SARI_KITAP_CIFT_METIN,
    bellek: SARI_KITAP_BELLEK,
    hizli_okuma: SARI_KITAP_HIZLI_OKUMA
};
