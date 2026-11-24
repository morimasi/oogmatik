/**
 * MatProblemStudyosu — Cevap Anahtarı Modal
 * %100 Tema Uyumlu, Disleksi Dostu ve Doğrudan Yazdırma/PDF İndirme Destekli
 */

import React, { useState } from 'react';
import type { MatProblemSeti } from '../../types/matProblem';
import { printService } from '../../utils/printService';

interface MatProblemCevapAnahtariProps {
    problemSeti: MatProblemSeti;
    onClose: () => void;
}

export const MatProblemCevapAnahtari: React.FC<MatProblemCevapAnahtariProps> = ({ problemSeti, onClose }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrintAnswerKey = async () => {
        setIsPrinting(true);
        try {
            await printService.generatePdf(
                '#mat-problem-answer-key-print-content',
                `${problemSeti.baslik} - Cevap Anahtarı`,
                { action: 'print', paperSize: 'A4' }
            );
        } finally {
            setIsPrinting(false);
        }
    };

    const handleDownloadAnswerKeyPdf = async () => {
        setIsDownloading(true);
        try {
            await printService.generatePdf(
                '#mat-problem-answer-key-print-content',
                `${problemSeti.baslik} - Cevap Anahtarı`,
                { action: 'download', paperSize: 'A4', quality: 'high' }
            );
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-lexend animate-in fade-in" onClick={onClose}>
            <div
                className="bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col border border-[var(--border-color)] shadow-2xl overflow-hidden transition-colors duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ═══ BAŞLIK ÇUBUĞU ═══ */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 font-bold text-lg shadow-sm">
                            ✓
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                                Cevap Anahtarı & Çözüm Rehberi
                            </h2>
                            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                                {problemSeti.baslik} • {problemSeti.cevapAnahtari.problemler.length} Açık Uçlu Problem
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Yazdır Butonu */}
                        <button
                            onClick={handlePrintAnswerKey}
                            disabled={isPrinting}
                            title="Cevap Anahtarını Doğrudan Yazdır"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-cyan-500 border border-[var(--border-color)] transition-all flex items-center gap-1.5 shadow-xs"
                        >
                            <span>🖨️</span>
                            <span className="hidden sm:inline">{isPrinting ? 'Yazdırılıyor...' : 'Yazdır'}</span>
                        </button>

                        {/* PDF İndir Butonu */}
                        <button
                            onClick={handleDownloadAnswerKeyPdf}
                            disabled={isDownloading}
                            title="Cevap Anahtarını A4 PDF Olarak İndir"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-600/20"
                        >
                            <span>📥</span>
                            <span className="hidden sm:inline">{isDownloading ? 'İndiriliyor...' : 'PDF İndir'}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-color)] font-bold text-base transition-all ml-1"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* ═══ İÇERİK LİSTESİ (MODAL GÖRÜNÜMÜ) ═══ */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                    {problemSeti.pedagogicalNote && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-3.5 text-xs text-cyan-600 dark:text-cyan-300">
                            <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                                💡 Pedagojik Öğretmen Notu & ZPD Rehberi:
                            </span>
                            <p className="leading-relaxed font-medium">
                                {problemSeti.pedagogicalNote}
                            </p>
                        </div>
                    )}

                    {problemSeti.cevapAnahtari.problemler.map((item, index) => {
                        const problem = problemSeti.problemler[index];
                        return (
                            <div
                                key={index}
                                className="bg-[var(--bg-secondary)]/50 rounded-2xl p-4 border border-[var(--border-color)] hover:border-cyan-500/40 transition-all shadow-xs"
                            >
                                {/* Üst Rozet Barı */}
                                <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="bg-cyan-600 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-xs">
                                            {item.problemNo}
                                        </span>
                                        <span className="text-[10px] bg-[var(--bg-paper)] text-cyan-600 dark:text-cyan-400 border border-[var(--border-color)] px-2.5 py-1 rounded-xl font-bold">
                                            {item.kazanimKodu} • {item.seviye} Seviye • {item.puan} Puan
                                        </span>
                                    </div>
                                    {problem?.kazanimMetni && (
                                        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-lg font-semibold truncate max-w-xs">
                                            📚 {problem.kazanimMetni}
                                        </span>
                                    )}
                                </div>

                                {/* Problem Metni */}
                                {problem && (
                                    <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed font-medium bg-[var(--bg-paper)]/70 p-3 rounded-xl border border-[var(--border-color)]">
                                        {problem.soruMetni}
                                    </p>
                                )}

                                {/* Çözüm Adımları */}
                                <div className="bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-500/20 mb-2.5">
                                    <h4 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <span>📋</span> Adım Adım Çözüm Aşamaları
                                    </h4>
                                    <div className="space-y-1.5">
                                        {item.cozumAdimlari.map((adim, ai) => (
                                            <div key={ai} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex-shrink-0">{ai + 1}.</span>
                                                <span className="leading-snug">{adim}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Doğru Cevap */}
                                <div className="flex items-center gap-2 bg-[var(--bg-paper)] p-2.5 rounded-xl border border-[var(--border-color)]">
                                    <span className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400">✓ Doğru Cevap:</span>
                                    <span className="text-xs font-black text-[var(--text-primary)]">
                                        {item.dogruCevap}
                                    </span>
                                </div>

                                {/* Gerçek Yaşam Bağlantısı */}
                                {item.gercekYasamBaglantisi && (
                                    <p className="text-[11px] text-[var(--text-muted)] mt-2 font-medium italic flex items-center gap-1.5">
                                        <span>💡</span> {item.gercekYasamBaglantisi}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ═══ ALT BİLGİ BARI ═══ */}
                <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                    <span className="text-[11px] text-[var(--text-muted)] font-semibold">
                        Toplam Puan: <strong className="text-[var(--text-primary)]">{problemSeti.toplamPuan}</strong> •
                        Tahmini Süre: <strong className="text-[var(--text-primary)]">~{Math.round(problemSeti.tahminiSure / 60)} dk</strong>
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                        Kapat
                    </button>
                </div>
            </div>

            {/* ═══ YAZDIRMA VE PDF İÇİN TEMİZ A4 SAYFASI (YALNIZCA YAZDIRMA MOTORU TARAFINDAN GÖRÜLÜR) ═══ */}
            <div id="mat-problem-answer-key-print-content" className="hidden print:block" style={{ width: '210mm', padding: '15mm', background: '#ffffff', color: '#1f2937', fontFamily: 'Lexend, sans-serif' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #0891b2', paddingBottom: '10px' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0e7490', margin: 0 }}>
                        {problemSeti.baslik} — ÇÖZÜM & CEVAP ANAHTARI
                    </h1>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        {problemSeti.sinif}. Sınıf • {problemSeti.cevapAnahtari.problemler.length} Açık Uçlu Problem • Toplam {problemSeti.toplamPuan} Puan
                    </div>
                </div>

                {problemSeti.pedagogicalNote && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#166534' }}>
                        <strong>Öğretmen Pedagojik Rehberi:</strong> {problemSeti.pedagogicalNote}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {problemSeti.cevapAnahtari.problemler.map((item, index) => {
                        const problem = problemSeti.problemler[index];
                        return (
                            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <span style={{ background: '#0891b2', color: 'white', fontWeight: 800, fontSize: '11px', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.problemNo}
                                    </span>
                                    <span style={{ fontSize: '10px', background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                        {item.kazanimKodu} • {item.seviye} • {item.puan} Puan
                                    </span>
                                    {problem?.kazanimMetni && (
                                        <span style={{ fontSize: '9px', color: '#854d0e', background: '#fef9c3', padding: '2px 8px', borderRadius: '6px' }}>
                                            {problem.kazanimMetni}
                                        </span>
                                    )}
                                </div>

                                {problem && (
                                    <p style={{ fontSize: '11px', color: '#4b5563', margin: '0 0 8px 0', fontStyle: 'italic' }}>
                                        {problem.soruMetni}
                                    </p>
                                )}

                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', marginBottom: '6px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        Çözüm Aşamaları:
                                    </div>
                                    {item.cozumAdimlari.map((adim, ai) => (
                                        <div key={ai} style={{ fontSize: '10px', color: '#334155', marginBottom: '2px' }}>
                                            <strong>{ai + 1}.</strong> {adim}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0e7490' }}>
                                    ✓ Doğru Cevap: <span style={{ color: '#111827' }}>{item.dogruCevap}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
