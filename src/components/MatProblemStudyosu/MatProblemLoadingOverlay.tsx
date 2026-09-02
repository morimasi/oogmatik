import React, { useState, useEffect } from 'react';

interface MatProblemLoadingOverlayProps {
    isVisible: boolean;
    sinif?: number | null;
    kategori?: string;
}

const LOADING_STEPS = [
    { text: 'MEB 2024-2025 Müfredatı & Sınıf Kazanımları İnceleniyor...', subText: 'Pedagojik ZPD seviyesi ve ders kitabı standartları haritalanıyor.' },
    { text: 'LGS & Beceri Temelli Açık Uçlu Senaryo Kurgulanıyor...', subText: 'Disleksi dostu anlaşılır dil ve gerçek yaşam bağlamı oluşturuluyor.' },
    { text: 'Vektörel SVG Şemalar & Grafik Verileri Çiziliyor...', subText: 'Çetele, sııklık, abaküs, geometri ve LGS görselleri hazırlanıyor.' },
    { text: 'Çözüm Adımları & Cevap Anahtarı Hesaplanıyor...', subText: 'Adım adım açıklayıcı çözümler ve puanlama anahtarı kuruluyor.' },
    { text: 'Lexend Tipografisi & A4 Dizgisi Tamamlanıyor...', subText: 'Sayfa formatı baskıya ve dijital önizlemeye hazır getiriliyor.' },
];

export const MatProblemLoadingOverlay: React.FC<MatProblemLoadingOverlayProps> = ({ isVisible, sinif = 5, kategori }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(10);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            setProgress(10);
            return;
        }

        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
        }, 1800);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return 95;
                return prev + Math.floor(Math.random() * 8) + 3;
            });
        }, 300);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-xl transition-all duration-500 animate-fadeIn">
            {/* Arka Plan Işık Auraları ve Yüzen Semboller */}
            <div className="absolute w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700" />

            {/* Yüzen Matematik Sembolleri (Floating Math Particles) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 text-cyan-300 font-extrabold select-none">
                <span className="absolute top-1/4 left-1/5 text-3xl animate-bounce">∑</span>
                <span className="absolute top-1/3 right-1/4 text-4xl animate-pulse">π</span>
                <span className="absolute bottom-1/4 left-1/3 text-2xl animate-bounce delay-300">√x</span>
                <span className="absolute bottom-1/3 right-1/5 text-3xl animate-pulse delay-500">∞</span>
                <span className="absolute top-1/5 right-1/3 text-2xl animate-bounce delay-700">Δ</span>
                <span className="absolute bottom-1/5 left-1/4 text-3xl animate-pulse delay-200">∫</span>
            </div>

            {/* Ana Yükleme Kartı */}
            <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(6,182,212,0.25)] flex flex-col items-center text-center">

                {/* LOGO & CANLI ANİMASYON HALKALARI */}
                <div className="relative mb-6 flex items-center justify-center">
                    {/* Dış Dönel Işık Halkası */}
                    <div className="w-28 h-28 rounded-full border-2 border-transparent border-t-cyan-400 border-r-indigo-400 border-b-cyan-500 animate-spin" />

                    {/* İç Ters Dönel Işık Halkası */}
                    <div className="absolute w-24 h-24 rounded-full border-2 border-transparent border-b-rose-400 border-l-cyan-300 animate-spin-reverse opacity-75" />

                    {/* Merkez Logomuz & Aurası */}
                    <div className="absolute w-16 h-16 rounded-full bg-slate-950 p-2 shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center border border-cyan-500/40">
                        <img
                            src="/assets/logo.png"
                            alt="Oogmatik AI Logo"
                            className="w-12 h-12 object-contain animate-pulse"
                            onError={(e) => {
                                // Fallback icon if image path differs
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                        <span className="text-2xl select-none">📐</span>
                    </div>
                </div>

                {/* Başlık ve Rozet */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Gemini 2.5 AI Motoru Çalışıyor</span>
                </div>

                <h3 className="text-lg font-extrabold text-white tracking-wide mb-1">
                    {sinif}. Sınıf Matematik Problemi Üretiliyor
                </h3>
                {kategori && (
                    <p className="text-xs text-slate-400 font-medium mb-4">
                        Kategori: <span className="text-cyan-400 font-bold">{kategori}</span>
                    </p>
                )}

                {/* Dinamik İlerleme Adımı Metni */}
                <div className="w-full min-h-[56px] flex flex-col items-center justify-center bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 my-2">
                    <p className="text-xs font-extrabold text-cyan-200 transition-all duration-300">
                        {LOADING_STEPS[currentStep].text}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 transition-all duration-300">
                        {LOADING_STEPS[currentStep].subText}
                    </p>
                </div>

                {/* İlerleme Çubuğu (Progress Bar) */}
                <div className="w-full mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5 px-1">
                        <span>Otonom Şema & Soru Üretimi</span>
                        <span className="text-cyan-400 font-black">%{progress}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <p className="text-[9px] text-slate-500 mt-4 italic">
                    💡 İpucu: Üretilen açık uçlu problemler LGS beceri temelli standartlardadır ve A4 baskısına uygundur.
                </p>
            </div>
        </div>
    );
};
