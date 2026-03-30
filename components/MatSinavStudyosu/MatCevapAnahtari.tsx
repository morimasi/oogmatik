/**
 * MatCevapAnahtari — Detaylı Cevap Anahtarı Tablosu
 */

import React from 'react';
import type { MatCevapAnahtari } from '../../src/types/matSinav';

interface MatCevapAnahtariComponentProps {
    cevapAnahtari: MatCevapAnahtari;
    sinavBaslik: string;
    pedagogicalNote: string;
}

const ZORLUK_RENKLERI: Record<string, string> = {
    'Kolay': 'text-green-600',
    'Orta': 'text-amber-600',
    'Zor': 'text-red-600',
};

export const MatCevapAnahtariComponent: React.FC<MatCevapAnahtariComponentProps> = ({
    cevapAnahtari,
    sinavBaslik,
    pedagogicalNote,
}) => {
    const toplamPuan = cevapAnahtari.sorular.reduce((s, c) => s + c.puan, 0);

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-[800px] mx-auto p-6">
            {/* Başlık */}
            <div className="mb-4">
                <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                    ✅ Cevap Anahtarı
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{sinavBaslik}</p>
            </div>

            {/* Tablo */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-emerald-50">
                            <th className="px-3 py-2 text-left font-bold text-emerald-800 border-b border-emerald-100">No</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-800 border-b border-emerald-100">Doğru Cevap</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-800 border-b border-emerald-100">Seviye</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-800 border-b border-emerald-100">Puan</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-800 border-b border-emerald-100">Kazanım</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-800 border-b border-emerald-100 hidden lg:table-cell">Çözüm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cevapAnahtari.sorular.map((cevap) => (
                            <tr key={cevap.soruNo} className="hover:bg-gray-50 transition-colors even:bg-gray-50/50">
                                <td className="px-3 py-2.5 font-bold text-indigo-700 border-b border-gray-100">
                                    {cevap.soruNo}.
                                </td>
                                <td className="px-3 py-2.5 font-bold border-b border-gray-100">
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">{cevap.dogruCevap}</span>
                                </td>
                                <td className={`px-3 py-2.5 font-bold border-b border-gray-100 ${ZORLUK_RENKLERI[cevap.seviye] || 'text-gray-600'}`}>
                                    {cevap.seviye}
                                </td>
                                <td className="px-3 py-2.5 border-b border-gray-100">{cevap.puan} puan</td>
                                <td className="px-3 py-2.5 border-b border-gray-100 font-mono text-[10px] text-gray-500">
                                    {cevap.kazanimKodu}
                                </td>
                                <td className="px-3 py-2.5 border-b border-gray-100 text-gray-500 hidden lg:table-cell max-w-[200px] truncate">
                                    {cevap.cozumAciklamasi || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-indigo-50 font-bold">
                            <td className="px-3 py-2" colSpan={3}>Toplam</td>
                            <td className="px-3 py-2 text-indigo-700">{toplamPuan} puan</td>
                            <td className="px-3 py-2" colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pedagojik Not */}
            {pedagogicalNote && (
                <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-xs font-bold text-blue-800 mb-1.5 flex items-center gap-1.5">
                        📋 Öğretmenin Dikkatine
                    </h3>
                    <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-line">{pedagogicalNote}</p>
                </div>
            )}
        </div>
    );
};
