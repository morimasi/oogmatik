import React from 'react';
import { Download, PlusSquare, FileCheck2, Printer } from 'lucide-react';
import { cn } from '@/utils/tailwindUtils';

interface ExportActionsProps {
    onExportWorksheet: () => void;
    onExportPDF: () => void;
    onPrint: () => void;
    disabled: boolean;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
    onExportWorksheet,
    onExportPDF,
    onPrint,
    disabled
}) => {
    return (
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider font-lexend">
                Dışa Aktar ve Kaydet
            </h3>
            <div className="space-y-2 font-lexend">
                {/* Çalışma Kâğıdına Ekle */}
                <button
                    onClick={onExportWorksheet}
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                        disabled
                            ? "bg-white/5 text-white/30 cursor-not-allowed"
                            : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30"
                    )}
                >
                    <div className="flex items-center space-x-2">
                        <PlusSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Çalışma Kâğıdına Ekle</span>
                    </div>
                    {!disabled && <FileCheck2 className="w-4 h-4 text-indigo-400 opacity-50" />}
                </button>

                {/* PDF İndir */}
                <button
                    onClick={onExportPDF}
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                        disabled
                            ? "bg-white/5 text-white/30 cursor-not-allowed"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                >
                    <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                        <span>PDF Olarak İndir</span>
                    </div>
                </button>

                {/* Yazdır */}
                <button
                    onClick={onPrint}
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                        disabled
                            ? "bg-white/5 text-white/30 cursor-not-allowed"
                            : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                    )}
                >
                    <div className="flex items-center space-x-2">
                        <Printer className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Doğrudan Yazdır</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
