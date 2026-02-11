
import React from 'react';

interface ControlPaneProps {
    difficulty: string;
    setDifficulty: (v: string) => void;
    itemCount: number;
    setItemCount: (v: number) => void;
    onGenerate: () => void;
    onCancel: () => void;
    isProcessing: boolean;
    isAnalyzing: boolean;
    status: string;
    statusMessage: string;
}

export const ControlPane: React.FC<ControlPaneProps> = ({
    difficulty, setDifficulty, itemCount, setItemCount, onGenerate, onCancel, isProcessing, isAnalyzing, status, statusMessage
}) => {
    return (
        <div className="bg-white/5 rounded-[3rem] border border-white/5 p-8 flex flex-col shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">ÜRETİM PARAMETRELERİ</h4>
            
            <div className="space-y-8">
                <div className="space-y-4">
                    <label className="text-sm font-bold text-zinc-400 flex items-center gap-2"><i className="fa-solid fa-layer-group text-indigo-500"></i> Zorluk Seviyesi</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(l => (
                            <button key={l} onClick={() => setDifficulty(l)} className={`py-3 rounded-xl text-xs font-black border transition-all ${difficulty === l ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}>{l}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                        <span>Öğe Adedi</span>
                        <span className="text-indigo-400 font-black text-lg">{itemCount}</span>
                    </div>
                    <input type="range" min={2} max={30} value={itemCount} onChange={e => setItemCount(Number(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
            </div>

            <div className="mt-12 space-y-4">
                <div className="h-16 flex flex-col items-center justify-center text-center">
                    {(isProcessing || isAnalyzing) ? (
                        <div className="flex flex-col items-center gap-2 animate-in fade-in">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] px-4 leading-tight">
                                {isAnalyzing ? "REFERANS ANALİZ EDİLİYOR..." : statusMessage}
                            </p>
                        </div>
                    ) : (
                        status && <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{status}</p>
                    )}
                </div>
                
                <button 
                    onClick={onGenerate} 
                    disabled={isProcessing || isAnalyzing} 
                    className="w-full py-6 bg-white text-indigo-950 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 text-base disabled:opacity-50"
                >
                    {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                    TASARIMI BAŞLAT
                </button>
                
                <button onClick={onCancel} className="w-full py-3 text-zinc-600 hover:text-zinc-400 text-sm font-bold transition-colors">Vazgeç</button>
            </div>
        </div>
    );
};
