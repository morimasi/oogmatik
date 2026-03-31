import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { DyslexiaTextReveal } from '../../remotion/templates/DyslexiaTextReveal';
import { useAnimationGenerate } from './hooks/useAnimationGenerate';
import { ActivityType } from '../../types/activity';
import { motion, AnimatePresence } from 'framer-motion';

export const RemotionStudio: React.FC = () => {
    const { isGenerating, result, generate } = useAnimationGenerate();

    // UI Local State
    const [topic, setTopic] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<ActivityType>(ActivityType.INFOGRAPHIC_SEQUENCE); // Örnek başlangıç

    const handleGenerate = async () => {
        await generate(selectedActivity, topic, {
            ageGroup: '8-10',
            profile: 'dyslexia'
        });
    };

    const currentProps = (result?.props || {
        title: 'Hazırlanıyor...',
        segments: [{ text: 'Lütfen bir konu girip üretin.' }],
        pedagogicalNote: '',
        templateType: 'default',
        fps: 30,
        durationInFrames: 300
    }) as any; // Cast to any temporarily to avoid deep type mismatch with DyslexiaTextReveal if they differ slightly

    return (
        <div className="flex flex-col h-full bg-[#050810] text-slate-200 overflow-hidden font-inter selection:bg-indigo-500/30">

            {/* Üst Header - Premium Gradient */}
            <header className="h-16 shrink-0 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-30 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                        <i className="fa-solid fa-wand-magic-sparkles text-white text-lg"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            ANİMASYON STÜDYOSU <span className="text-[10px] text-indigo-400 ml-2 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-widest">v1.2 Ultra</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Remotion Player Engine • AI Driven</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">MOTOR AKTİF</span>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Sol Panel: Kontrol Merkezi */}
                <aside className="w-96 shrink-0 bg-[#0B1120]/40 backdrop-blur-md border-r border-white/5 flex flex-col z-20">
                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Eğitici Senaryo Konusu</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Örn: 'B ve D harflerini karıştırmıyorum' veya 'Güneş Sistemi'..."
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Öğrenme Alanı & Aktivite</label>
                            <select
                                value={selectedActivity}
                                onChange={(e) => setSelectedActivity(e.target.value as ActivityType)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value={ActivityType.INFOGRAPHIC_SEQUENCE}>Okuma Akışı (Syllabic)</option>
                                <option value={ActivityType.NUMBER_PATTERN}>Sayı Örüntüsü (Math)</option>
                                <option value={ActivityType.STORY_SEQUENCING}>Olay Sıralama (ADHD)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic.trim()}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:grayscale py-4 rounded-2xl shadow-xl transition-all active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative font-black text-sm tracking-widest flex items-center justify-center gap-3">
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ÜRETİLİYOR...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-sparkles"></i>
                                        ANİMASYON ÜRET
                                    </>
                                )}
                            </span>
                        </button>

                    </div>

                    {/* Alt Bilgi */}
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                                <i className="fa-solid fa-graduation-cap"></i>
                            </div>
                            <p className="text-[10px] leading-relaxed text-slate-500">
                                Üretilen her animasyon %100 <b>Lexend Font</b> ve disleksi dostu renk paletiyle yapılandırılır.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Orta Panel: Render Preview */}
                <section className="flex-1 bg-black relative flex flex-col">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                        <motion.div
                            layout
                            className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 relative group"
                        >
                            <Player
                                component={DyslexiaTextReveal}
                                inputProps={currentProps}
                                durationInFrames={currentProps.durationInFrames || 300}
                                fps={currentProps.fps || 30}
                                compositionWidth={1920}
                                compositionHeight={1080}
                                style={{ width: '100%', height: '100%' }}
                                controls
                                autoPlay
                                loop
                            />

                            {/* Loading Overlay */}
                            <AnimatePresence>
                                {isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-[#050810]/90 backdrop-blur-2xl flex flex-col items-center justify-center space-y-6 z-50"
                                    >
                                        <div className="relative">
                                            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <i className="fa-solid fa-brain text-indigo-400 animate-pulse"></i>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl font-black tracking-tighter text-white mb-2">GEMINI SAHNEYİ ÇALIŞIYOR</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Timeline Parametreleri Hesaplanıyor...</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="mt-12 flex gap-8 items-center text-slate-500">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">30 FPS Render</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <i className="fa-solid fa-microchip text-xs"></i>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Z-Index Matrix</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <i className="fa-solid fa-eye text-xs"></i>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Eye-Tracking Ready</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sağ Panel: Pedagojik Detaylar */}
                <aside className="w-80 shrink-0 bg-[#0B1120]/60 backdrop-blur-md border-l border-white/5 flex flex-col overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 space-y-3">
                            <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Klinik Not (Dr. Ahmet Kaya)</h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                {result ? result.props.pedagogicalNote : "Lütfen önce bir animasyon üretin."}
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#0B1120] border border-white/5 space-y-4">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sahneler</h4>
                            <div className="space-y-3">
                                {result?.props.segments.map((seg, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-default">
                                        <div className="w-6 h-6 rounded bg-slate-800 text-[10px] flex items-center justify-center font-bold">{idx + 1}</div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-slate-200">{seg.text}</p>
                                            {seg.isHighlight && <span className="text-[9px] text-indigo-400 font-black uppercase tracking-tighter">Vurgu Aktif</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};
