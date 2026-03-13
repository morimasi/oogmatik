
export interface PrintOptions {
  action?: 'print' | 'download';
  selectedPages?: number[];
  grayscale?: boolean;
  worksheetData?: any[];
  compact?: boolean;
  columnsPerPage?: 1 | 2;
  fontSize?: 10 | 11 | 12;
}

export const printService = {
  /**
   * Premium Print Engine v5.0
   * Uses native browser printing with CSS-first approach for 100% fidelity.
   * No DOM cloning, no complex calculations. WYSIWYG.
   */
  print: () => {
    // 1. Add printing class to body to trigger CSS overrides
    document.body.classList.add('printing-mode');

    // 2. Wait for a moment to ensure styles are applied and layout is recalculated
    setTimeout(() => {
      window.print();
    }, 100);
  },

  /**
   * Backward compatibility for existing components calling generatePdf
   */
  generatePdf: async (
    elementSelector: string,
    title: string = "Bursa_Disleksi_AI_Etkinlik",
    options?: PrintOptions
  ) => {
    // Set document title temporarily for the print dialog
    const originalTitle = document.title;
    document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');

    // Call the new print method
    printService.print();

    // Restore title after print dialog is closed
    // We use a timeout because window.print() is blocking in some browsers
    // but we want to ensure the title is restored after the dialog closes.
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }
};

// Listen for afterprint to cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing-mode');
  });
}
