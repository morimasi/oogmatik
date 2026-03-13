
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

    // 2. Force layout recalculation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;
    window.dispatchEvent(new Event('resize'));

    // 3. Call print synchronously to avoid popup blockers
    try {
      window.print();
    } catch (e) {
      console.error("Print failed", e);
      document.body.classList.remove('printing-mode');
    }
  },

  /**
   * Backward compatibility for existing components calling generatePdf
   */
  generatePdf: async (
    elementSelector: string,
    title: string = "Bursa_Disleksi_AI_Etkinlik",
    options?: PrintOptions
  ) => {
    try {
      // Set document title temporarily for the print dialog
      const originalTitle = document.title;
      const safeTitle = title || "Bursa_Disleksi_AI_Etkinlik";
      document.title = safeTitle.replace(/[^a-z0-9ğüşıöç]/gi, '_');

      // Call the new print method
      printService.print();

      // Restore title after print dialog is closed
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      // Ensure cleanup on error
      document.body.classList.remove('printing-mode');
    }
  }
};

// Listen for afterprint to cleanup
if (typeof window !== 'undefined') {
  const cleanup = () => {
    document.body.classList.remove('printing-mode');
  };
  window.addEventListener('afterprint', cleanup);
  
  // Fallback for browsers that block print or don't fire afterprint
  window.addEventListener('focus', () => {
    // Small delay to ensure afterprint has a chance to fire first
    setTimeout(cleanup, 500);
  });
}
