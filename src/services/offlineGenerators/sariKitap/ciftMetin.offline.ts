import type { CiftMetinConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getCiftMetinCifti } from './metinHavuzu';
import { buildGeneratedContent } from './heceMotoru';
import { metniHecele } from '../../../utils/heceAyirici';

export function generateCiftMetinOffline(config: CiftMetinConfig): SariKitapGeneratedContent {
    const cifti = getCiftMetinCifti();
    const combinedText = `${cifti.a.metin}\n${cifti.b.metin}`;
    const heceRows = metniHecele(combinedText);

    return buildGeneratedContent(
        `${cifti.a.baslik} & ${cifti.b.baslik}`,
        combinedText,
        heceRows,
        config,
        {
            sourceTexts: {
                a: { title: cifti.a.baslik, text: cifti.a.metin },
                b: { title: cifti.b.baslik, text: cifti.b.metin },
            },
        }
    );
}
