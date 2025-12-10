
import React, { useState, useRef } from 'react';
import { analyzeImage } from '../services/geminiClient';
import { Type } from '@google/genai';

interface OCRScannerProps {
    onBack: () => void;
    onResult: (data: any) => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBack, onResult }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);

        const prompt = `
        Bu görseli analiz et. Bu bir eğitim materyali, çalışma kağıdı veya el yazısı not olabilir.
        
        GÖREV:
        1. Görseldeki metinleri çıkar.
        2. Bu içeriğin türünü belirle (Soru, Hikaye, Matematik Problemi).
        3. Bunu dijital bir aktiviteye dönüştürmek için yapılandırılmış veri oluştur.
        
        Eğer MATEMATİK ise: İşlemleri listele.
        Eğer METİN ise: Metni ve varsa soruları çıkar.
        Eğer LİSTE ise: Maddeleri çıkar.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                rawText: { type: Type.STRING },
                detectedType: { type: Type.STRING, enum: ['math', 'reading', 'list', 'other'] },
                title: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } }, // Flexible content array
                suggestedActivity: { type: Type.STRING } // Enum match like 'BASIC_OPERATIONS'
            },
            required: ['rawText', 'detectedType', 'content']
        };

        try {
            const result = await analyzeImage(image, prompt, schema);
            onResult(result);
        } catch (error) {
            console.error(error);
            alert("Görsel analiz edilemedi.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                        <i className="fa-solid fa-camera text-indigo-500"></i> Akıllı Tarayıcı (OCR)
                    </h2>
                    <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="flex flex-col items-center gap-6">
                    {/* Preview Area */}
                    <div 
                        className={`w-full aspect-video rounded-2xl border-4 border-dashed flex items-center justify-center relative overflow-hidden bg-zinc-100 dark:bg-black/30 ${image ? 'border-indigo-500' : 'border-zinc-300 dark:border-zinc-600'}`}
                        onClick={() => !image && fileInputRef.current?.click()}
                    >
                        {image ? (
                            <img src={image} className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center text-zinc-400 cursor-pointer">
                                <i className="fa-solid fa-cloud-arrow-up text-5xl mb-4"></i>
                                <p className="font-bold">Fotoğraf Yükle veya Çek</p>
                                <p className="text-xs mt-2">Kitap sayfası, çalışma kağıdı veya notlar</p>
                            </div>
                        )}
                        
                        {/* Actions overlay */}
                        {image && (
                             <button 
                                onClick={() => setImage(null)} 
                                className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                             >
                                 <i className="fa-solid fa-trash"></i>
                             </button>
                        )}
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" capture="environment" />

                    {/* Action Buttons */}
                    <div className="flex gap-4 w-full">
                        {!image ? (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-camera"></i> Kamera / Galeri
                            </button>
                        ) : (
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                {isAnalyzing ? 'Analiz Ediliyor...' : 'Dijitalleştir'}
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200 flex gap-3">
                    <i className="fa-solid fa-circle-info mt-0.5"></i>
                    <p>Çektiğiniz fotoğraflardaki metinler ve sorular yapay zeka tarafından okunarak düzenlenebilir etkinliklere dönüştürülür.</p>
                </div>
            </div>
        </div>
    );
};
