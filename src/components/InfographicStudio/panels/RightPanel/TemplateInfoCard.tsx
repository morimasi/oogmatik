import React from 'react';
import { Settings2, Type } from 'lucide-react';

interface TemplateInfoCardProps {
    templateType?: string;
}

export const TemplateInfoCard: React.FC<TemplateInfoCardProps> = ({ templateType }) => {
    if (!templateType) return null;

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" />
                Sistem Bilgileri
            </h3>

            <div className="space-y-3 font-mono text-xs text-slate-300">
                <div className="flex items-start justify-between">
                    <span className="text-slate-500">Render Şablonu:</span>
                    <span className="text-accent/70 font-medium bg-accent/10 px-2 py-0.5 rounded">
                        {templateType}
                    </span>
                </div>

                <div className="flex items-start justify-between">
                    <span className="text-slate-500">Disleksi Fontu:</span>
                    <div className="flex items-center gap-1.5 bg-accent/10 text-accent/70 px-2 py-0.5 rounded">
                        <Type className="w-3 h-3" />
                        <span>Lexend</span>
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <span className="text-slate-500">AI Motoru:</span>
                    <span className="text-emerald-300 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                        gemini-2.5-flash
                    </span>
                </div>
            </div>
        </div>
    );
};
