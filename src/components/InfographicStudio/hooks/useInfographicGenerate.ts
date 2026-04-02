import { useState, useCallback } from 'react';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';
import { InfographicGenMode } from './useInfographicStudio';
import { generateCompositeWorksheet } from '../../../services/generators/premiumCompositeGenerator';
import { CompositeWorksheet } from '../../../types/worksheet';
import { generateCreativeMultimodal } from '../../../services/geminiClient';

export const useInfographicGenerate = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<CompositeWorksheet | null>(null);
    const { show } = useToastStore(); 

    const generate = useCallback(async (
        widgets: { id: string; activityId: string }[],
        mode: InfographicGenMode,
        topic: string,
        params: Record<string, any> = {}
    ) => {
        if (!topic.trim()) {
            show('Lütfen bir konu veya metin giriniz', 'warning');
            return null;
        }
        if (widgets.length === 0) {
            show('Lütfen en az bir bileşen ekleyin', 'warning');
            return null;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const worksheet = await generateCompositeWorksheet({
                topic,
                studentAge: params.studentAge || '8-10',
                difficulty: params.difficulty || 'Orta',
                profile: params.profile,
                mode,
                widgets
            });

            if (worksheet) {
                setResult(worksheet);
                show('Çalışma kağıdı başarıyla üretildi!', 'success');
                return worksheet;
            } else {
                throw new AppError('Üretim sırasında bir hata oluştu', 'GENERATE_FAILED', 500);
            }
        } catch (error: unknown) {
            if (error instanceof AppError) {
                show(error.userMessage, 'error');
            } else if (error instanceof Error) {
                show(error.message, 'error');
            } else {
                show('Beklenmeyen bir hata oluştu', 'error');
            }
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [show]);

    const enrichPrompt = useCallback(async (currentPrompt: string) => {
        if (!currentPrompt.trim()) return currentPrompt;

        const SYSTEM_INSTRUCTION = `
Sen "Premium Çalışma Kağıdı Üreticisi" platformunun Prompt Mühendisi ve Başöğretmenisin.
Kullanıcı (öğretmen) kağıda bazı etkinlik modülleri (infografik, 3D çizim, LGS sorusu vb.) ekledi ve bu modüllerin bir listesini/notunu "Master Prompt" kutusuna bıraktı.
Senin GÖREVİN, kullanıcının girdiği bu darmadağınık notları, etkinlik türlerini ve konu içeriğini; yapay zekanın anlayabileceği "Zengin, Akıcı, Tek Bir Bağlam Etrafında Toplanmış, Detaylı ve Profesyonel bir Ana Komuta (Master Prompt)" dönüştürmektir.

KURALLAR:
1. Etkinlik parçaları arasındaki mantıksal bağı (hikayeleştirmeyi) sen kur. 
2. Örnek olarak: Bir ağacın yapısı hakkında hem Venn Diyagramı hem de Test sorusu eklendiyse, ana prompta "Tüm kağıt ağacın yapısı ekseninde, birbirine atıfta bulunarak ilerlesin" gibi bir bağlam kat.
3. Çıktın sadece JSON formatında ve 'enrichedPrompt' anahtarına sahip olmalıdır.
`;

        const schema = {
            type: 'OBJECT',
            properties: {
                enrichedPrompt: { type: 'STRING', description: 'Geliştirilmiş, zengin ve profesyonel Master Prompt metni' }
            },
            required: ['enrichedPrompt']
        };

        const USER_PROMPT = `İşte öğretmenin mevcut notları (modül eklentileri dahil):\n\n"${currentPrompt}"\n\nLütfen bunu çok daha profesyonel, bağlamsal olarak tutarlı ve tüm modülleri kapsayan tek bir süper komuta dönüştür.`;

        try {
            const data: any = await generateCreativeMultimodal({
                prompt: USER_PROMPT,
                systemInstruction: SYSTEM_INSTRUCTION,
                schema,
                temperature: 0.8
            });
            if (data && data.enrichedPrompt) {
                show('Prompt başarıyla AI ile zenginleştirildi.', 'success');
                return data.enrichedPrompt;
            }
        } catch (e) {
            console.error('Enrichment error', e);
            show('Zenginleştirme sırasında bir hata oluştu.', 'error');
        }
        return currentPrompt; 
    }, [show]);

    const clearResult = useCallback(() => {
        setResult(null);
    }, []);

    return {
        isGenerating,
        result,
        generate,
        enrichPrompt,
        clearResult,
    };
};