import React from 'react';

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
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ params, onChange, isClinicalMode }) => {
    const updateParam = (key: keyof ParameterPanelState, value: string) => {
        onChange({ ...params, [key]: value });
    };

    return (
        <div className="flex flex-col space-y-4">
            <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Konu veya Başlık</label>
                <input
                    type="text"
                    value={params.topic}
                    onChange={(e) => updateParam('topic', e.target.value)}
                    placeholder="Örn: Güneş sistemi, Heceleme..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-white/30"
                />
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
