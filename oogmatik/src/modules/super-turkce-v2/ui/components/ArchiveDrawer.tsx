import React from 'react';
import { useSuperTurkceV2Store } from '../../core/store';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ArchiveDrawer: React.FC<Props> = ({ isOpen, onClose }: any) => {
    const history = useSuperTurkceV2Store((state: any) => state.worksheetHistory);
    const setCurrentWorksheet = useSuperTurkceV2Store((state: any) => state.setCurrentWorksheet);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
            <div className="w-96 bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
                <div className="h-16 shrink-0 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        <i className="fa-solid fa-box-archive text-brand-500 mr-2"></i> Üretim Arşivi
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="text-center py-10">
                            <i className="fa-solid fa-ghost text-4xl text-slate-300 mb-4 block"></i>
                            <p className="text-slate-500 text-sm font-medium">Henüz üretilmiş bir kayıt yok.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {history.map((record: any, index: any) => (
                                <div key={record.id || index} className="p-4 bg-white border border-slate-200 hover:border-brand-300 rounded-xl shadow-sm transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Şablon: {record.templateId}</span>
                                        <span className="text-[10px] text-slate-400">Yeni</span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{record.data?.title || 'İsimsiz Çalışma'}</h4>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setCurrentWorksheet(record);
                                                onClose();
                                            }}
                                            className="flex-1 py-2 bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            <i className="fa-solid fa-eye mr-1"></i> Önizle
                                        </button>
                                        <button className="w-10 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Sil (Yakında)">
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 text-center shrink-0">
                    <p className="text-[10px] text-slate-500">Bu arşiv sadece cihazınızda tutulur. Buluta kaydedilmez.</p>
                </div>
            </div>
        </div>
    );
};
