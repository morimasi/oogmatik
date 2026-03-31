import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export interface ParameterPanelState {
    topic: string;
    ageGroup: '5-7' | '8-10' | '11-13' | '14+';
    profile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed' | 'general';
    difficulty: 'Kolay' | 'Orta' | 'Zor';
}

interface ParameterPanelProps {
    params: ParameterPanelState;
    onChange: (params: ParameterPanelState) => void;
    isClinicalMode?: boolean;
    onEnrichPrompt?: () => Promise<void>;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ params, onChange, isClinicalMode, onEnrichPrompt }) => {
    const [isEnriching, setIsEnriching] = useState(false);

    const updateParam = (key: keyof ParameterPanelState, value: string) => {
        onChange({ ...params, [key]: value });
    };

    const handleEnrich = async () => {
        if (!onEnrichPrompt || !params.topic.trim()) return;
        setIsEnriching(true);
        try {
            await onEnrichPrompt();
        } finally {
            setIsEnriching(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Etkinlik Üretim Promptu (Master Prompt)</label>
                <textarea
                    value={params.topic}
                    onChange={(e) => updateParam('topic', e.target.value)}
                    placeholder="Örn: Güneş sistemi ile ilgili okuma parçası ve üçgen sorusu içeren bir etkinlik..."
                    rows={4}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-white/30 resize-y"
                />
                
                <button 
                    onClick={handleEnrich}
                    disabled={isEnriching || !params.topic.trim() || !onEnrichPrompt}
                    className="mt-2 w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>AI İle Birleştir & Zenginleştir</span>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Öğrenme Profili</label>
                    <select
                        value={params.profile}
                        onChange={(e) => updateParam('profile', e.target.value)}
                        disabled={isClinicalMode}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none disabled:opacity-50"
                    >
                        <option value="general">Genel Sınıf</option>
                        <option value="dyslexia">Disleksi</option>
                        <option value="dyscalculia">Diskalkuli</option>
                        <option value="adhd">DEHB</option>
                        <option value="mixed">Karma Profil</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Yaş Grubu</label>
                    <select
                        value={params.ageGroup}
                        onChange={(e) => updateParam('ageGroup', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                    >
                        <option value="5-7">5-7 Yaş</option>
                        <option value="8-10">8-10 Yaş</option>
                        <option value="11-13">11-13 Yaş</option>
                        <option value="14+">14+ Yaş</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Zorluk Seviyesi</label>
                <select
                    value={params.difficulty}
                    onChange={(e) => updateParam('difficulty', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                >
                    <option value="Kolay">Kolay (Destekli)</option>
                    <option value="Orta">Orta (Standart)</option>
                    <option value="Zor">Zor (Geliştiren)</option>
                </select>
            </div>
        </div>
    );
};
