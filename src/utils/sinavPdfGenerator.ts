/**
 * Sınav PDF Generator — Kompakt A4, Çoklu Sayfa
 * Türkçe karakter desteği (Helvetica latin-1 encode normalizer)
 */

import jsPDF from 'jspdf';
import type { Sinav, Soru } from '../types/sinav';

export interface PrintConfig {
  fontSize: number;       // 9 | 10 | 11 | 12
  fontFamily: 'helvetica' | 'times';
  columns: 1 | 2;
  marginMm: number;       // 10 | 15 | 20 | 25
  questionSpacingMm: number; // 6 | 8 | 10 | 14
  lineHeight: number;     // 1.4 | 1.6 | 1.8
  textAlign: 'left' | 'justify';
}

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  fontSize: 10,
  fontFamily: 'helvetica',
  columns: 1,
  marginMm: 18,
  questionSpacingMm: 8,
  lineHeight: 1.6,
  textAlign: 'left',
};

/** Türkçe özel karakterleri latin-1 muadilleriyle değiştirir (jsPDF Helvetica uyumu) */
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

export const generateExamPDF = (sinav: Sinav, config: PrintConfig = DEFAULT_PRINT_CONFIG): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const { marginMm: M, fontSize: FS, fontFamily: FF, questionSpacingMm: QS, columns: COLS } = config;
  const contentW = PAGE_W - 2 * M;
  const colGap = 10;
  const colW = (contentW - (COLS - 1) * colGap) / COLS;

  let y = M;
  let pageNum = 1;
  let currentCol = 0;

  const getX = (offset = 0) => M + currentCol * (colW + colGap) + offset;

  const newPage = () => {
    // Sayfa numarası footer
    doc.setFontSize(8);
    doc.setFont(FF, 'normal');
    doc.setTextColor(160);
    doc.text(`Sayfa ${pageNum} — EduMind Sınav Stüdyosu`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
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
        // Başlık ve öğrenci bilgisinden sonraki ilk sütun geçişi ise, 
        // y değerini başlık sonrası y değerine çekmeliyiz.
        // Ama basitleştirmek için: her sütun geçişinde en tepeye (M) çıkalım 
        // veya header span olduğu için header sonrası sabit bir y'ye çıkalım.
        
        // Header her zaman ilk sayfada en üsttedir.
        // Eğer ilk sayfadaysak ve header render edilmişse, 
        // kolon geçişi header altından başlamalı.
        // Değilse (diğer sayfalar) M'den başlamalı.
        if (pageNum === 1) {
          y = headerBottomY;
        } else {
          y = M;
        }
      } else {
        newPage();
      }
    }
  };

  // ── BAŞLIK BÖLÜMÜ ──────────────────────────────────────────
  // Header her zaman tam genişliktedir (span all)
  doc.setDrawColor(80, 80, 160);
  doc.setLineWidth(0.4);
  doc.rect(M, y, contentW, 22, 'S');

  doc.setFont(FF, 'bold');
  doc.setFontSize(FS + 3);
  doc.setTextColor(40, 40, 120);
  const titleLines = doc.splitTextToSize(tr(sinav.baslik), contentW - 6);
  doc.text(titleLines, M + 3, y + 7);

  doc.setFont(FF, 'normal');
  doc.setFontSize(FS - 1);
  doc.setTextColor(80);
  doc.text(
    tr(`${sinav.sinif}. Sinif  |  ${sinav.sorular.length} Soru  |  ${sinav.toplamPuan} Puan  |  ~${Math.ceil(sinav.tahminiSure / 60)} dakika  |  ${new Date(sinav.olusturmaTarihi).toLocaleDateString('tr-TR')}`),
    M + 3,
    y + 18
  );
  doc.setTextColor(0);
  y += 26;

  // Öğrenci bilgi satırı
  doc.setFont(FF, 'normal');
  doc.setFontSize(FS - 1);
  doc.setTextColor(60);
  doc.text(tr('Ad Soyad: ___________________________   Sinif/Sube: _________   Tarih: _________'), M, y);
  doc.setTextColor(0);
  y += 8;

  // Ayırıcı
  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.line(M, y, PAGE_W - M, y);
  y += 6;

  const headerBottomY = y; // İkinci kolonun başlayacağı başlangıç noktası (ilk sayfa için)

  // ── SORULAR ─────────────────────────────────────────────────
  doc.setFont(FF, 'bold');
  doc.setFontSize(FS + 1);
  doc.setTextColor(40);
  doc.text('SORULAR', getX(), y);
  y += 6;

  sinav.sorular.forEach((soru: Soru, i: number) => {
    check(20); // Soru başlığı ve en az bir satır için yer ayır

    // Soru No + tip etiketi
    doc.setFont(FF, 'bold');
    doc.setFontSize(FS);
    doc.setTextColor(0);
    const soruLabel = `${i + 1}.`;
    doc.text(soruLabel, getX(), y);

    // Zorluk rengi (küçük kare)
    const zorlukColor: [number, number, number] =
      soru.zorluk === 'Kolay' ? [34, 197, 94] :
        soru.zorluk === 'Orta' ? [234, 179, 8] : [239, 68, 68];
    doc.setFillColor(...zorlukColor);
    doc.rect(getX(7), y - 3, 2, 3, 'F');

    // Soru metni
    doc.setFont(FF, 'normal');
    doc.setFontSize(FS);
    doc.setTextColor(0);
    const soruLines = doc.splitTextToSize(tr(soru.soruMetni), colW - 12);
    doc.text(soruLines, getX(11), y);
    y += soruLines.length * (FS * 0.38) + 2;

    // Seçenekler
    if (soru.tip === 'coktan-secmeli' && Array.isArray(soru.secenekler)) {
      const labels = ['A', 'B', 'C', 'D'];
      soru.secenekler.forEach((sec, si) => {
        check(7);
        doc.setFont(FF, 'normal');
        doc.setFontSize(FS - 0.5);
        doc.setTextColor(30);
        const secLines = doc.splitTextToSize(`${labels[si]}) ${tr(sec)}`, colW - 18);
        doc.text(secLines, getX(14), y);
        y += secLines.length * (FS * 0.36) + 1.5;
      });
    }

    // Doğru-Yanlış şıkları
    if (soru.tip === 'dogru-yanlis-duzeltme') {
      check(8);
      doc.setFont(FF, 'normal');
      doc.setFontSize(FS - 0.5);
      doc.setTextColor(60);
      doc.text(tr('( ) Dogru   ( ) Yanlis   Duzeltme: ____________________'), getX(14), y);
      y += 7;
    }

    // Boşluk doldurma cevap alanı
    if (soru.tip === 'bosluk-doldurma') {
      check(7);
      doc.setFontSize(FS - 0.5);
      doc.setTextColor(60);
      doc.text(tr('Cevap: ___________________________'), getX(14), y);
      y += 7;
    }

    // Açık uçlu yanıt alanı (4 satır)
    if (soru.tip === 'acik-uclu') {
      for (let ln = 0; ln < 4; ln++) {
        check(6);
        doc.setDrawColor(200);
        doc.setLineWidth(0.15);
        doc.line(getX(14), y + 1, getX() + colW, y + 1);
        y += 6;
      }
    }

    // Kazanım kodu (gri, küçük)
    check(5);
    doc.setFont(FF, 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(140);
    doc.text(tr(`[${soru.kazanimKodu}]`), getX() + colW, y, { align: 'right' });
    doc.setTextColor(0);

    y += QS; // Sorular arası boşluk
  });

  // Sayfa footer son sayfa (içerik bittikten sonra)
  doc.setFontSize(8);
  doc.setFont(FF, 'normal');
  doc.setTextColor(160);
  doc.text(`Sayfa ${pageNum} — EduMind Sınav Stüdyosu`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
  doc.setTextColor(0);

  // ── CEVAP ANAHTARI (yeni sayfa) ─────────────────────────────
  doc.addPage();
  pageNum++;
  y = M;
  currentCol = 0;

  doc.setFont(FF, 'bold');
  doc.setFontSize(FS + 2);
  doc.setTextColor(0, 100, 60);
  doc.text('CEVAP ANAHTARI', M, y);
  doc.setTextColor(0);
  y += 8;

  // Tablo başlıkları
  const colWidths = [12, 60, 22, 50];
  const headers = ['No', 'Dogru Cevap', 'Puan', 'Kazanim'];
  let cx = M;
  doc.setFont(FF, 'bold');
  doc.setFontSize(FS - 0.5);
  doc.setFillColor(230, 240, 255);
  doc.rect(M, y - 4, contentW, 7, 'F');
  headers.forEach((h, i) => {
    doc.text(tr(h), cx + 1, y);
    cx += colWidths[i];
  });
  y += 5;

  doc.setFont(FF, 'normal');
  sinav.cevapAnahtari.sorular.forEach((c, i) => {
    if (y + 7 > PAGE_H - 14) {
      doc.addPage();
      y = M;
    }
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(M, y - 4, contentW, 6.5, 'F');
    }
    cx = M;
    const row = [`${c.soruNo}.`, tr(String(c.dogruCevap)), `${c.puan} puan`, tr(c.kazanimKodu)];
    doc.setFontSize(FS - 0.5);
    row.forEach((cell, i) => {
      const lines = doc.splitTextToSize(cell, colWidths[i] - 2);
      doc.text(lines, cx + 1, y);
      cx += colWidths[i];
    });
    y += 6.5;
  });

  // Toplam puan satırı
  y += 4;
  doc.setFont(FF, 'bold');
  doc.setFontSize(FS);
  doc.setFillColor(220, 252, 231);
  doc.rect(M, y - 4, contentW, 8, 'F');
  doc.text(tr(`Toplam: ${sinav.toplamPuan} Puan`), M + 3, y + 1);
  doc.setTextColor(0);
  y += 12;

  // Footer son sayfa
  doc.setFontSize(8);
  doc.setFont(FF, 'normal');
  doc.setTextColor(160);
  doc.text(`Sayfa ${pageNum} — EduMind Sınav Stüdyosu`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });

  // ── İNDİR ────────────────────────────────────────────────
  const safeFileName = sinav.baslik.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  doc.save(`${safeFileName || 'sinav'}.pdf`);
};
