/**
 * Sınav PDF Generator
 * Tek PDF içinde: Sorular + Cevap Anahtarı + Pedagojik Not
 */

import jsPDF from 'jspdf';
import type { Sinav, Soru } from '../types/sinav';

/**
 * Sınav PDF'i oluştur ve indir
 * Format: Sorular → Cevap Anahtarı → Pedagojik Not (sıralı)
 */
export const generateExamPDF = (sinav: Sinav): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Yardımcı fonksiyon: Sayfa sonu kontrolü
  const checkPageBreak = (requiredSpace: number): void => {
    if (yPos + requiredSpace > 270) {
      doc.addPage();
      yPos = margin;
    }
  };

  // ============= BAŞLIK VE SINAV BİLGİLERİ =============
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(sinav.baslik, margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sinif: ${sinav.sinif}`, margin, yPos);
  yPos += 6;
  doc.text(`Toplam Puan: ${sinav.toplamPuan}`, margin, yPos);
  yPos += 6;
  doc.text(`Tahmini Sure: ${Math.ceil(sinav.tahminiSure / 60)} dakika`, margin, yPos);
  yPos += 6;
  doc.text(`Olusturma Tarihi: ${new Date(sinav.olusturmaTarihi).toLocaleDateString('tr-TR')}`, margin, yPos);
  yPos += 12;

  // ============= SORULAR =============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SORULAR', margin, yPos);
  yPos += 10;

  sinav.sorular.forEach((soru: Soru, index: number) => {
    // Sayfa sonu kontrolü (her soru için ~40mm alan)
    checkPageBreak(40);

    // Soru numarası ve başlık
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const soruBaslik = `${index + 1}. ${soru.soruMetni} (${soru.puan} puan)`;
    const splitBaslik = doc.splitTextToSize(soruBaslik, contentWidth);
    doc.text(splitBaslik, margin, yPos);
    yPos += splitBaslik.length * 6 + 2;

    // Seçenekler (çoktan seçmeli için)
    if (soru.tip === 'coktan-secmeli' && Array.isArray(soru.secenekler)) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      soru.secenekler.forEach((secenek: string) => {
        checkPageBreak(8);
        const splitSecenek = doc.splitTextToSize(secenek, contentWidth - 5);
        doc.text(splitSecenek, margin + 5, yPos);
        yPos += splitSecenek.length * 5 + 2;
      });
      yPos += 2;
    }

    // Boşluk doldurma veya açık uçlu için yanıt alanı
    if (soru.tip === 'bosluk-doldurma' || soru.tip === 'acik-uclu') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120);
      if (soru.tip === 'acik-uclu') {
        doc.text('Yanit:', margin + 5, yPos);
        yPos += 6;
        // Çizgili alan çiz
        for (let i = 0; i < 4; i++) {
          checkPageBreak(8);
          doc.line(margin + 5, yPos, pageWidth - margin, yPos);
          yPos += 6;
        }
      } else {
        doc.text('Cevap: _____________________', margin + 5, yPos);
        yPos += 8;
      }
      doc.setTextColor(0);
    }

    // Kazanım kodu (küçük, gri)
    checkPageBreak(6);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(`[MEB Kazanim: ${soru.kazanimKodu}]`, margin, yPos);
    doc.setTextColor(0);
    yPos += 10;
  });

  // ============= YENİ SAYFA: CEVAP ANAHTARI =============
  doc.addPage();
  yPos = margin;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0); // Yeşil
  doc.text('CEVAP ANAHTARI', margin, yPos);
  doc.setTextColor(0);
  yPos += 12;

  // Tablo başlıkları
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Soru No', margin, yPos);
  doc.text('Dogru Cevap', margin + 30, yPos);
  doc.text('Puan', margin + 100, yPos);
  doc.text('Kazanim Kodu', margin + 130, yPos);
  yPos += 8;

  // Ayırıcı çizgi
  doc.setLineWidth(0.5);
  doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
  yPos += 2;

  // Cevaplar
  doc.setFont('helvetica', 'normal');
  sinav.cevapAnahtari.sorular.forEach((cevap, index) => {
    checkPageBreak(8);

    doc.text(`${cevap.soruNo}.`, margin, yPos);
    doc.text(String(cevap.dogruCevap), margin + 30, yPos);
    doc.text(`${cevap.puan} puan`, margin + 100, yPos);
    doc.text(cevap.kazanimKodu, margin + 130, yPos);
    yPos += 7;

    // Her 5 satırda bir ince çizgi
    if ((index + 1) % 5 === 0) {
      doc.setLineWidth(0.1);
      doc.setDrawColor(200);
      doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
      doc.setDrawColor(0);
      yPos += 2;
    }
  });

  // ============= YENİ SAYFA: PEDAGOJİK NOT =============
  doc.addPage();
  yPos = margin;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 150); // Mavi
  doc.text('OGRETMENIN DIKKATINE', margin, yPos);
  doc.setTextColor(0);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const splitNote = doc.splitTextToSize(sinav.pedagogicalNote, contentWidth);
  doc.text(splitNote, margin, yPos);
  yPos += splitNote.length * 6 + 10;

  // Alt bilgi
  yPos += 10;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    'Bu sinav Oogmatik Super Turkce Sinav Studyosu ile olusturulmustur.',
    margin,
    yPos
  );
  doc.text(`MEB 2024-2025 mufredati - ${sinav.secilenKazanimlar.length} kazanim`, margin, yPos + 5);

  // PDF'i indir
  const safeFileName = sinav.baslik.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').replace(/\s+/g, '-');
  doc.save(`${safeFileName}.pdf`);
};
