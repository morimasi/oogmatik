import type { CiftMetinConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getCiftMetinCiftiByTopic } from './metinHavuzu';
import { buildGeneratedContent } from './heceMotoru';
import { metniHecele } from '../../../utils/heceAyirici';

export function generateCiftMetinOffline(config: CiftMetinConfig): SariKitapGeneratedContent {
    const topic = config.topics[0] || 'Kaynak Kitap';
    const cifti = getCiftMetinCiftiByTopic(topic, config.difficulty, config.ageGroup);
    const combinedText = `${cifti.a.metin}\n${cifti.b.metin}`;
    const heceRows = metniHecele(combinedText);

    return buildGeneratedContent(
        `${cifti.a.baslik} & ${cifti.b.baslik}`,
        combinedText,
        heceRows,
        config,
        {
            sourceTexts: {
                a: { title: cifti.a.baslik, text: cifti.a.metin, questions: cifti.a.questions },
                b: { title: cifti.b.baslik, text: cifti.b.metin, questions: cifti.b.questions },
            },
        }
    );
}
