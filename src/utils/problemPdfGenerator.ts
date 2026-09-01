/**
 * Matematik Problem Stüdyosu PDF Jeneratörü
 * Açık uçlu problemleri ve adım adım cevap anahtarını jsPDF ile A4 çıktısına dönüştürür.
 */

import jsPDF from 'jspdf';
import type { MatProblemSeti, ProblemDizgiAyarlari } from '../types/matProblem';

const tr = (s: string): string =>
    s
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'i')
        .replace(/Ğ/g, 'G')
        .replace(/ğ/g, 'g')
        .replace(/Ş/g, 'S')
        .replace(/ş/g, 's')
        .replace(/Ö/g, 'O')
        .replace(/ö/g, 'o')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'u')
        .replace(/Ç/g, 'C')
        .replace(/ç/g, 'c');

export const generateProblemPDF = (problemSeti: MatProblemSeti, dizgiAyarlari?: ProblemDizgiAyarlari): void => {
    if (!problemSeti || !problemSeti.problemler || !Array.isArray(problemSeti.problemler)) {
        throw new Error('Geçersiz problem seti verisi');
    }

    const config = dizgiAyarlari || problemSeti.dizgiAyarlari || {
        fontAilesi: 'Lexend',
        fontBoyutu: '11pt',
        kenarBoslugu: 'orta',
        sutunDuzeni: 'tek',
        metinHizalama: 'left',
        satirAraligi: 'normal',
    };

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PAGE_W = 210;
    const PAGE_H = 297;
    const M = config.kenarBoslugu === 'dar' ? 12 : config.kenarBoslugu === 'genis' ? 25 : 18;
    const FS = parseInt(config.fontBoyutu) || 11;
    const COLS = config.sutunDuzeni === 'cift' ? 2 : 1;
    const contentW = PAGE_W - 2 * M;
    const colGap = 10;
    const colW = (contentW - (COLS - 1) * colGap) / COLS;

    let y = M;
    let pageNum = 1;
    let currentCol = 0;

    const getX = (offset = 0) => M + currentCol * (colW + colGap) + offset;

    const newPage = () => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160);
        doc.text(`Sayfa ${pageNum} — bdmind Matematik Problem Stüdyosu`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
        doc.setTextColor(0);
        doc.addPage();
        pageNum++;
        y = M;
        currentCol = 0;
    };

    const check = (need: number) => {
        if (y + need > PAGE_H - 14) {
            if (COLS > 1 && currentCol < COLS - 1) {
                currentCol++;
                y = pageNum === 1 ? headerBottomY : M;
            } else {
                newPage();
            }
        }
    };

    // ── BAŞLIK BÖLÜMÜ ──────────────────────────────────────────
    doc.setDrawColor(8, 145, 178);
    doc.setLineWidth(0.5);
    doc.rect(M, y, contentW, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FS + 3);
    doc.setTextColor(14, 116, 144);
    const titleLines = doc.splitTextToSize(tr(problemSeti.baslik), contentW - 6);
    doc.text(titleLines, M + 3, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FS - 2);
    doc.setTextColor(80);
    doc.text(
        tr(`${problemSeti.sinif}. Sinif  |  ${problemSeti.problemler.length} Açık Uçlu Problem  |  ${problemSeti.toplamPuan} Puan  |  ~${Math.ceil(problemSeti.tahminiSure / 60)} dakika`),
        M + 3,
        y + 18
    );
    doc.setTextColor(0);
    y += 26;

    // Öğrenci bilgi satırı
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FS - 1);
    doc.setTextColor(60);
    doc.text(tr('Ad Soyad: ___________________________   Tarih: ____/____/________'), M, y);
    doc.setTextColor(0);
    y += 8;

    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(M, y, PAGE_W - M, y);
    y += 6;

    const headerBottomY = y;

    // ── PROBLEMLER ──────────────────────────────────────────────
    problemSeti.problemler.forEach((prob, i) => {
        check(35);

        // Problem Numarası ve Bilgileri
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(FS);
        doc.setTextColor(8, 145, 178);
        doc.text(`${i + 1}.`, getX(), y);

        doc.setFontSize(FS - 2);
        doc.setTextColor(100);
        doc.text(tr(` [${prob.kazanimKodu} • ${prob.zorluk} • ${prob.puan} Puan]`), getX(8), y);
        doc.setTextColor(0);
        y += 5;

        // Soru Metni
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(FS);
        const soruLines = doc.splitTextToSize(tr(prob.soruMetni), colW - 4);
        doc.text(soruLines, getX(), y);
        y += soruLines.length * (FS * 0.38) + 3;

        // Verilenler ve İstenenler Kutusu
        if (prob.verilenler && prob.verilenler.length > 0) {
            check(15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(FS - 2);
            doc.setTextColor(21, 128, 61);
            doc.text(tr('Verilenler:'), getX(), y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);
            const verilenlerStr = prob.verilenler.map(v => tr(v)).join('; ');
            const vLines = doc.splitTextToSize(verilenlerStr, colW - 20);
            doc.text(vLines, getX(18), y);
            y += vLines.length * (FS * 0.35) + 3;
        }

        if (prob.istenenler) {
            check(10);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(FS - 2);
            doc.setTextColor(29, 78, 216);
            doc.text(tr('İstenen:'), getX(), y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);
            const iLines = doc.splitTextToSize(tr(prob.istenenler), colW - 16);
            doc.text(iLines, getX(14), y);
            y += iLines.length * (FS * 0.35) + 3;
        }

        // Çözüm Kutusu Çizgileri
        check(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(120);
        doc.text(tr('COZUM ALANI:'), getX(), y);
        y += 4;

        for (let lineIdx = 0; lineIdx < 3; lineIdx++) {
            doc.setDrawColor(220);
            doc.setLineWidth(0.15);
            doc.line(getX(), y, getX() + colW, y);
            y += 6;
        }
        y += 4;
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160);
    doc.text(`Sayfa ${pageNum} — bdmind Matematik Problem Stüdyosu`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });

    // ── CEVAP ANAHTARI SAYFASI ──────────────────────────────────
    doc.addPage();
    pageNum++;
    y = M;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FS + 2);
    doc.setTextColor(8, 145, 178);
    doc.text(tr('CEVAP ANAHTARI & ADIM ADIM ÇÖZÜMLER'), M, y);
    doc.setTextColor(0);
    y += 8;

    problemSeti.cevapAnahtari.problemler.forEach((c) => {
        check(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(FS - 1);
        doc.setTextColor(14, 116, 144);
        doc.text(tr(`Problem ${c.problemNo} (${c.kazanimKodu} - ${c.seviye} - ${c.puan} Puan)`), M, y);
        y += 4.5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(FS - 1);
        doc.setTextColor(21, 128, 61);
        doc.text(tr(`Doğru Cevap: ${c.dogruCevap}`), M + 4, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(FS - 2);
        doc.setTextColor(50);
        c.cozumAdimlari.forEach((adim) => {
            check(5);
            const adimLines = doc.splitTextToSize(tr(`• ${adim}`), contentW - 8);
            doc.text(adimLines, M + 4, y);
            y += adimLines.length * (FS * 0.34) + 1;
        });
        y += 4;
    });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160);
    doc.text(`Sayfa ${pageNum} — bdmind Matematik Problem Stüdyosu`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });

    const safeFileName = problemSeti.baslik.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    doc.save(`${safeFileName || 'matematik-problemleri'}.pdf`);
};
