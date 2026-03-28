import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { DyslexiaTextReveal, DyslexiaTextRevealProps } from '../../remotion/templates/DyslexiaTextReveal';

export const RemotionStudio: React.FC = () => {
    const [_isPlaying, _setIsPlaying] = useState(false);

    // Örnek Props: Geliştirme aşamasında manuel, ileride Gemini'den gelecek
    const [props, setProps] = useState<DyslexiaTextRevealProps>({
        title: 'Disleksi Dostu Okuma Egzersizi',
        segments: [
            { text: 'B', isHighlight: true },
            { text: 've' },
            { text: 'D' },
            { text: 'harflerini' },
            { text: 'karıştırmamak', isHighlight: true },
            { text: 'için' },
            { text: 'dikkatli' },
            { text: 'bak.' }
        ]
    });

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">

            {/* Üst Kısım: Araç Çubuğu */}
            <div className="h-16 shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <i className="fa-solid fa-film text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Animasyon Stüdyosu</h1>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Remotion Player Engine (v1.0)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Player Aktif
                    </div>
                </div>
            </div>

            {/* İçerik: Paneller */}
            <div className="flex-1 flex overflow-hidden">

                {/* Sol Panel: Video Önizleme */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-200/50 dark:bg-black/50 overflow-y-auto">
                    <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 relative bg-white dark:bg-zinc-900">
                        <Player
                            component={DyslexiaTextReveal}
                            inputProps={props}
                            durationInFrames={300}
                            fps={30}
                            compositionWidth={1920}
                            compositionHeight={1080}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            controls // Remotion timeline kontrol çubuğu
                            autoPlay={false}
                            loop
                        />
                    </div>

                    <div className="mt-8 text-center max-w-xl">
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                            <i className="fa-solid fa-circle-info text-indigo-500 mr-2"></i>
                            Browser-tabanlı Gerçek Video Render
                        </h3>
                        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                            Bu alan CSS ile değil, <b>Remotion Frame-by-Frame Engine</b> ile çalışıyor.
                            Zaman tüneli üzerindeki her bir kare (frame) React kullanılarak canlı şekilde hesaplanır.
                            Gelecekte AI bu kelimeleri ve renk kodlarını (isHighlight) dinamik olarak üretecek.
                        </p>
                    </div>
                </div>

                {/* Sağ Panel: Manuel Kontroller / JSON (Şimdilik) */}
                <div className="w-96 shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
                    <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            <i className="fa-solid fa-sliders text-zinc-400"></i>
                            Animasyon Özellikleri (Props)
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Başlık</label>
                            <input
                                type="text"
                                value={props.title}
                                onChange={(e) => setProps({ ...props, title: e.target.value })}
                                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between">
                                Kelimeler (Segmentler)
                                <span className="text-indigo-400 normal-case">Canlı Önizleme</span>
                            </label>

                            <div className="space-y-2">
                                {props.segments.map((seg, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <span className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-xs flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 font-semibold truncate">"{seg.text}"</span>
                                        {seg.isHighlight && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-bold tracking-wider">
                                                VURGU
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/40">
                            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-2">
                                <i className="fa-solid fa-robot text-indigo-500"></i> AI Entegrasyon Planı
                            </h4>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
                                Şu an sabit array görüyorsunuz. Bir sonraki aşamada "Gerçek Anımasyon Üret" butonuna bastığınızda, Gemini bu kelime ağlarını saniyelik bazda hesaplayıp Remotion Player'a besleyecek.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
