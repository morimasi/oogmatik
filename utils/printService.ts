
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
  }
};

// Listen for afterprint to cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing-mode');
  });
}
