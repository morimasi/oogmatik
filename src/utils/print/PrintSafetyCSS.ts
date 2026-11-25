/**
 * bdmind Print Engine — Baskı Güvenlik CSS'i
 *
 * Akıllı mizanpaj sayfaları zaten kağıda sığdırır. Bu katman, tarayıcının
 * sonradan yapacağı istenmeyen kırılmaları engeller:
 *  - Başlık/etiket ile içeriğinin ayrılmaması (orphan heading)
 *  - Paragraf sonunda tek satır kalması (widow/orphan)
 *  - Kart, soru, tablo satırı ve SVG'nin ortadan bölünmemesi
 *  - Devam rozetinin doğru basılması
 */
export const PRINT_SAFETY_CSS = `
  /* === Akıllı Mizanpaj Güvenlik Katmanı === */
  @media print {
    p, li, blockquote {
      orphans: 3 !important;
      widows: 3 !important;
    }

    h1, h2, h3, h4, h5, h6 {
      break-after: avoid-page !important;
      page-break-after: avoid !important;
      break-inside: avoid !important;
    }

    li, tr, td, th, figure, figcaption {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    svg, img, canvas, video {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      max-height: 100% !important;
    }

    /* Kart / soru / etkinlik birimleri asla ortadan kesilmez */
    .activity-card,
    .question-container,
    .problem-card,
    .operation-card,
    .logic-card,
    .worksheet-item,
    .math-division-card,
    .block-table-container,
    .block-grid-container,
    .block-match,
    .block-categorical,
    .block-logic-card,
    [data-keep-together="true"] {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Akıllı mizanpajın ürettiği sayfa parçaları */
    #print-overlay .bdmind-print-wrapper {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-after: page !important;
      page-break-after: always !important;
    }

    #print-overlay .bdmind-print-wrapper:last-child {
      break-after: auto !important;
      page-break-after: avoid !important;
    }

    #print-overlay .bdmind-continuation-chip {
      display: block !important;
      visibility: visible !important;
      color: #64748b !important;
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }

    /* Yazdırma sırasında gizlenen yardımcı katmanlar */
    #bdmind-export-stage {
      display: none !important;
    }
  }
`;
