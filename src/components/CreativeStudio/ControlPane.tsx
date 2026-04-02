
import React, { useState } from 'react';
import { TargetProfile, OutputFormat } from '../../types/creativeStudio';
import { TargetProfileSelector } from './components/TargetProfileSelector';
import { OutputFormatPicker } from './components/OutputFormatPicker';

interface ControlPaneProps {
    difficulty: string;
    setDifficulty: (v: string) => void;
    itemCount: number;
    setItemCount: (v: number) => void;
    distractionLevel: string;
    setDistractionLevel: (v: string) => void;
    fontSizePreference: string;
    setFontSizePreference: (v: string) => void;
    // Klinik profil props
    targetProfile: TargetProfile;
    setTargetProfile: (p: TargetProfile) => void;
    outputFormat: OutputFormat;
    setOutputFormat: (f: OutputFormat) => void;
    clinicalIntensity: number;
    setClinicalIntensity: (v: number) => void;
    visualLoad: number;
    setVisualLoad: (v: number) => void;

    onGenerate: () => void;
    onCancel: () => void;
    isProcessing: boolean;
    isAnalyzing: boolean;
    status: string;
    statusMessage: string;
}

interface ParameterGroupProps {
    label: string;
    icon: string;
    children: React.ReactNode;
    description?: string;
}

const ParameterGroup = ({ label, icon, children, description }: ParameterGroupProps) => (
    <div className="space-y-3 p-5 bg-black/20 rounded-[2rem] border border-white/5 shadow-inner">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent/70">
                <i className={`fa-solid ${icon} text-xs`}></i>
            </div>
            <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">{label}</label>
                {description && <p className="text-[8px] text-zinc-600 font-bold uppercase">{description}</p>}
            </div>
        </div>
        <div className="flex gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
            {children}
        </div>
    </div>
);

interface SegmentButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    color?: string;
}

const SegmentButton = ({ active, onClick, label, color = "accent" }: SegmentButtonProps) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${active
            ? color === 'accent'
                ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]'
                : `bg-${color}-600 text-white shadow-lg shadow-${color}-600/20 scale-[1.02]`
            : 'text-zinc-500 hover:text-zinc-300'
            }`}
    >
        {label}
    </button>
);

export const ControlPane: React.FC<ControlPaneProps> = ({
    difficulty, setDifficulty,
    itemCount, setItemCount,
    distractionLevel, setDistractionLevel,
    fontSizePreference, setFontSizePreference,
    targetProfile, setTargetProfile,
    outputFormat, setOutputFormat,
    clinicalIntensity, setClinicalIntensity,
    visualLoad, setVisualLoad,
    onGenerate, onCancel, isProcessing, isAnalyzing, status, statusMessage
}) => {
    const [activeSection, setActiveSection] = useState<'params' | 'profile' | 'format'>('params');

    return (
        <div className="bg-white/5 rounded-[3.5rem] border border-white/10 p-8 flex flex-col shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500 backdrop-blur-md max-h-[850px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 px-2">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Klinik Kokpit</h4>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>

            {/* Sekme Geçişleri */}
            <div className="flex gap-1 mb-6 bg-black/40 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setActiveSection('params')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeSection === 'params' ? 'bg-accent text-white' : 'text-zinc-500'}`}>
                    <i className="fa-solid fa-sliders mr-1"></i>Parametreler
                </button>
                <button onClick={() => setActiveSection('profile')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeSection === 'profile' ? 'bg-accent text-white' : 'text-zinc-500'}`}>
                    <i className="fa-solid fa-user-doctor mr-1"></i>Profil
                </button>
                <button onClick={() => setActiveSection('format')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeSection === 'format' ? 'bg-accent text-white' : 'text-zinc-500'}`}>
                    <i className="fa-solid fa-palette mr-1"></i>Format
                </button>
            </div>

            {activeSection === 'params' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* 1. Zorluk Seviyesi */}
                    <ParameterGroup label="Bilişsel Yük" icon="fa-brain" description="İçerik Karmaşıklığı">
                        <SegmentButton active={difficulty === 'Başlangıç'} onClick={() => setDifficulty('Başlangıç')} label="Kolay" color="emerald" />
                        <SegmentButton active={difficulty === 'Orta'} onClick={() => setDifficulty('Orta')} label="Orta" color="accent" />
                        <SegmentButton active={difficulty === 'Zor'} onClick={() => setDifficulty('Zor')} label="Zor" color="rose" />
                    </ParameterGroup>

                    {/* 2. Çeldirici Yoğunluğu */}
                    <ParameterGroup label="Görsel Dikkat" icon="fa-eye" description="Çeldirici Hassasiyeti">
                        <SegmentButton active={distractionLevel === 'low'} onClick={() => setDistractionLevel('low')} label="Az" />
                        <SegmentButton active={distractionLevel === 'medium'} onClick={() => setDistractionLevel('medium')} label="Orta" />
                        <SegmentButton active={distractionLevel === 'high'} onClick={() => setDistractionLevel('high')} label="Çok" />
                    </ParameterGroup>

                    {/* 3. Harf Boyutu */}
                    <ParameterGroup label="Tipografi" icon="fa-font" description="Okunabilirlik Oranı">
                        <SegmentButton active={fontSizePreference === 'small'} onClick={() => setFontSizePreference('small')} label="Küçük" />
                        <SegmentButton active={fontSizePreference === 'medium'} onClick={() => setFontSizePreference('medium')} label="Orta" />
                        <SegmentButton active={fontSizePreference === 'large'} onClick={() => setFontSizePreference('large')} label="Büyük" />
                    </ParameterGroup>

                    {/* 4. Öğe Adedi */}
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>Soru Yoğunluğu</span>
                            <span className="text-accent/70 text-lg font-mono">{itemCount}</span>
                        </div>
                        <input
                            type="range" min={2} max={30} value={itemCount}
                            onChange={e => setItemCount(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>

                    {/* 5. Klinik Yoğunluk */}
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>Klinik Yoğunluk</span>
                            <span className="text-rose-400 text-lg font-mono">%{clinicalIntensity}</span>
                        </div>
                        <input
                            type="range" min={0} max={100} value={clinicalIntensity}
                            onChange={e => setClinicalIntensity(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                        <p className="text-[8px] text-zinc-600 font-bold">Çeldirici karmaşıklık oranı</p>
                    </div>

                    {/* 6. Görsel Yük */}
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>Görsel Yük</span>
                            <span className="text-amber-400 text-lg font-mono">%{visualLoad}</span>
                        </div>
                        <input
                            type="range" min={0} max={100} value={visualLoad}
                            onChange={e => setVisualLoad(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <p className="text-[8px] text-zinc-600 font-bold">Sayfa uyaran yoğunluğu</p>
                    </div>
                </div>
            )}

            {activeSection === 'profile' && (
                <div className="animate-in fade-in duration-200">
                    <TargetProfileSelector profile={targetProfile} onChange={setTargetProfile} />
                </div>
            )}

            {activeSection === 'format' && (
                <div className="animate-in fade-in duration-200">
                    <OutputFormatPicker value={outputFormat} onChange={setOutputFormat} />
                </div>
            )}

            <div className="mt-8 space-y-4">
                <div className="h-20 flex flex-col items-center justify-center text-center">
                    {(isProcessing || isAnalyzing) ? (
                        <div className="flex flex-col items-center gap-3 animate-in fade-in">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                            <p className="text-[10px] font-black text-accent/70 uppercase tracking-[0.2em] px-6 leading-tight">
                                {isAnalyzing ? "REFERANS DNA ANALİZ EDİLİYOR..." : statusMessage}
                            </p>
                        </div>
                    ) : (
                        status && <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{status}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isProcessing || isAnalyzing}
                    className="group relative w-full py-6 bg-white text-indigo-950 font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 text-base disabled:opacity-50 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles text-accent"></i>}
                    TASARIMI BAŞLAT
                </button>

                <button onClick={onCancel} className="w-full py-3 text-zinc-600 hover:text-zinc-400 text-[10px] font-black uppercase tracking-widest transition-colors">Vazgeç</button>
            </div>
        </div>
    );
};


