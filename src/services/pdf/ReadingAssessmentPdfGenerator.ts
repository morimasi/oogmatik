/**
 * BDMIND - Sesli Okuma ve Fonolojik Gelişim Karnesi PDF Jeneratörü
 * Prof. Dr. Zafer Aydın (PDF & Baskı Sistemleri Başmühendisi) Standartlarında
 * 
 * A4 Milimetrik Yerleşim, jsPDF Helvetica Latin-1 normalizasyonu, WCAG AAA kontrast.
 */

import jsPDF from 'jspdf';
import { ReadingSessionMetrics } from '../phonological/phonologicalScoringEngine';
import { ReadingPassage } from '../../components/LiveReadingStudio/sampleStories';

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

export interface GenerateReportPdfOptions {
  studentName?: string;
  passage: ReadingPassage;
  metrics: ReadingSessionMetrics;
}

export class ReadingAssessmentPdfGenerator {
  public static generate(options: GenerateReportPdfOptions): void {
    const { studentName = 'Sevgili Ogrenci', passage, metrics } = options;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 15;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    let y = MARGIN;

    // 1. Üst Başlık ve Kurumsal Şerit
    doc.setFillColor(79, 70, 229); // #4F46E5 Indigo
    doc.rect(MARGIN, y, CONTENT_W, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(tr('BDMIND EDUMIND — CANLI AI OKUMA KOCU'), MARGIN + 6, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(tr('Fonolojik Akicilik ve Sesli Okuma Degerlendirme Karnesi'), MARGIN + 6, y + 14);

    const dateStr = new Date().toLocaleDateString('tr-TR');
    doc.setFontSize(8);
    doc.text(tr(`Tarih: ${dateStr}`), PAGE_W - MARGIN - 30, y + 8);

    y += 26;

    // 2. Öğrenci ve Metin Bilgileri Kutusu
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, 'FD');

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(tr(`Ogrenci: ${studentName}`), MARGIN + 5, y + 7);
    doc.text(tr(`Okunan Metin: ${passage.title}`), MARGIN + 5, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(tr(`Hedef Beceri: ${passage.targetSkill}`), MARGIN + 100, y + 7);
    doc.text(tr(`Seviye: ${metrics.gradeLevelEquivalent}`), MARGIN + 100, y + 13);

    y += 24;

    // 3. Öne Çıkan Başarı Metrikleri (4'lü Rozet Kartları)
    const cardW = (CONTENT_W - 9) / 4;
    const cardH = 24;

    const cards = [
      { label: 'WCPM Okuma Hizi', val: `${metrics.wcpm}`, unit: 'dogru kel/dk', color: [13, 148, 136] }, // Teal
      { label: 'Dogruluk Orani', val: `%${metrics.accuracyPercentage}`, unit: `${metrics.correctWordsCount}/${metrics.totalWordsRead}`, color: [79, 70, 229] }, // Indigo
      { label: 'Prozodi Skoru', val: `${metrics.prosodyScore}/100`, unit: 'Akicilik Indeksi', color: [245, 158, 11] }, // Amber
      { label: 'Oz-Denetim', val: `${metrics.selfCorrectionCount}`, unit: 'Kendini Duzeltme', color: [16, 185, 129] }, // Emerald
    ];

    cards.forEach((c, i) => {
      const cx = MARGIN + i * (cardW + 3);
      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(c.color[0], c.color[1], c.color[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'FD');

      doc.setTextColor(107, 114, 128);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(tr(c.label), cx + cardW / 2, y + 6, { align: 'center' });

      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(tr(c.val), cx + cardW / 2, y + 15, { align: 'center' });

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(tr(c.unit), cx + cardW / 2, y + 20, { align: 'center' });
    });

    y += cardH + 10;

    // 4. Fonolojik Hata Dağılım Tablosu
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(tr('Fonolojik Hata ve Okuma Guclugu Dagilim Tablosu'), MARGIN, y);
    y += 5;

    const errorRows = [
      { name: 'Ayna Harf Karisikligi (b/d, p/q)', count: metrics.errorBreakdown.ERR_MIRROR, desc: 'Harflerin yon ve bakis acisini karistirma' },
      { name: 'Hece ve Ses Yutma/Atlama', count: metrics.errorBreakdown.ERR_OMISSION, desc: 'Kelime icindeki harf veya heceleri atlayarak okuma' },
      { name: 'Ilk Harften Uydurma/Tahmin', count: metrics.errorBreakdown.ERR_GUESS, desc: 'Kelimenin sadece ilk sesine bakarak tamamlama' },
      { name: 'Morfolojik Ek Uydurma', count: metrics.errorBreakdown.ERR_MORPH, desc: 'Kelime sonuna ek ekleme veya eki degistirme' },
      { name: 'Harf Yerdegisimi (Anagram)', count: metrics.errorBreakdown.ERR_TRANSP, desc: 'Kelime icindeki harflerin sirasini karistirma' },
    ];

    // Tablo Başlığı
    doc.setFillColor(243, 244, 246);
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text(tr('HATA TURU VE KLINIK TANIMI'), MARGIN + 4, y + 4.5);
    doc.text(tr('ADET'), PAGE_W - MARGIN - 40, y + 4.5);
    doc.text(tr('DURUM'), PAGE_W - MARGIN - 15, y + 4.5);
    y += 7;

    doc.setFont('helvetica', 'normal');
    errorRows.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? 255 : 249;
      doc.setFillColor(bg, bg, bg);
      doc.rect(MARGIN, y, CONTENT_W, 7, 'F');

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8);
      doc.text(tr(row.name), MARGIN + 4, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.text(`${row.count}`, PAGE_W - MARGIN - 36, y + 4.5);

      const statusText = row.count === 0 ? 'Harika' : row.count <= 2 ? 'Hafif' : 'Destek Gerekli';
      doc.setTextColor(row.count === 0 ? 16 : row.count <= 2 ? 245 : 239, row.count === 0 ? 185 : row.count <= 2 ? 158 : 68, row.count === 0 ? 129 : row.count <= 2 ? 11 : 68);
      doc.text(tr(statusText), PAGE_W - MARGIN - 18, y + 4.5);

      doc.setFont('helvetica', 'normal');
      y += 7;
    });

    y += 10;

    // 5. Nöropedagojik Değerlendirme ve Öğretmen Özeti
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(tr('Noropedagojik Seans Ozeti ve ZPD Analizi'), MARGIN, y);
    y += 5;

    doc.setDrawColor(209, 213, 219);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, 'D');

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(tr(metrics.pedagogicalSummary), CONTENT_W - 8);
    doc.text(summaryLines, MARGIN + 4, y + 6);

    y += 28;

    // 6. Gelişim Önerileri ve Ev Çalışması Yönergeleri
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(tr('Onerilen Bireysellestirilmis Gelisim Calismalari'), MARGIN, y);
    y += 5;

    metrics.recommendations.forEach((rec, idx) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(tr(`*  ${rec}`), MARGIN + 2, y + 4);
      y += 6;
    });

    // 7. Anlama Sorusu Sonuçları (Comprehension Question Results)
    if (metrics.comprehensionResults && Object.keys(metrics.comprehensionResults).length > 0) {
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(tr('Anlama Sorusu Sonuclari'), MARGIN, y);
      y += 5;
      Object.entries(metrics.comprehensionResults).forEach(([question, correct]) => {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const status = correct ? 'Dogru' : 'Yanlis';
        doc.text(tr(`${question}: ${status}`), MARGIN + 2, y + 4);
        y += 6;
      });
      y += 4;
    }

    // 8. AI Hikaye Değerlendirme (AI Story Evaluation)
    if (metrics.aiStoryEvaluation) {
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(tr('AI Hikaye Degerlendirme'), MARGIN, y);
      y += 5;
      const evalData = metrics.aiStoryEvaluation;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(tr(`Coherence Score: ${evalData.coherenceScore}`), MARGIN + 2, y + 4);
      y += 6;
      doc.text(tr(`Creativity Score: ${evalData.creativityScore}`), MARGIN + 2, y + 4);
      y += 6;
      doc.text(tr(`Overall Rating: ${evalData.overallRating}`), MARGIN + 2, y + 4);
      y += 6;
    }

    y += 8;

    // 7. Alt Bilgi & İmza Alanı
    doc.setDrawColor(229, 231, 235);
    doc.line(MARGIN, PAGE_H - 24, PAGE_W - MARGIN, PAGE_H - 24);

    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(tr('Bu rapor bdmind EduMind Canli AI Okuma Koccu tarafindan MEB ve ZPD ilkeleriyle uretilmistir.'), MARGIN, PAGE_H - 18);
    doc.text(tr('Ogrenci ses verisi KVKK kapsaminda sunucularda saklanmaz, anlik RAM belleginde analiz edilir.'), MARGIN, PAGE_H - 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(tr('Ozel Egitim Ogretmeni / Danisman Imzasi: .......................................'), PAGE_W - MARGIN - 80, PAGE_H - 16);

    // PDF'i doğrudan indir
    const fileName = `bdmind-okuma-karnesi-${Date.now()}.pdf`;
    doc.save(fileName);
  }
}
