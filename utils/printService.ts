
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
   * Premium Print Engine v6.0 (Overlay Mode)
   * Creates a dedicated overlay for printing to ensure 100% isolation from UI.
   * Supports multi-page content, canvas cloning, and input preservation.
   */
  print: (elementSelector: string = '.worksheet-page') => {
    // 1. Find the target content
    const originalContent = document.querySelector(elementSelector);
    if (!originalContent) {
      console.warn(`Print target "${elementSelector}" not found, falling back to window.print()`);
      window.print();
      return;
    }

    // 2. Create or clear the print overlay
    let overlay = document.getElementById('print-overlay');
    if (overlay) {
      overlay.innerHTML = '';
    } else {
      overlay = document.createElement('div');
      overlay.id = 'print-overlay';
      document.body.appendChild(overlay);
    }

    // 3. Clone the content deeply
    const clonedContent = originalContent.cloneNode(true) as HTMLElement;

    // 3.1. Preserve Canvas Content (cloning doesn't copy canvas state)
    const originalCanvases = originalContent.querySelectorAll('canvas');
    const clonedCanvases = clonedContent.querySelectorAll('canvas');
    originalCanvases.forEach((orig, i) => {
      const dest = clonedCanvases[i];
      if (dest) {
        const ctx = dest.getContext('2d');
        if (ctx) {
          ctx.drawImage(orig, 0, 0);
        } else {
          // Fallback: Convert to image if context is not available (e.g. webgl)
          try {
            const dataUrl = orig.toDataURL();
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.width = '100%';
            img.style.height = 'auto';
            dest.parentNode?.replaceChild(img, dest);
          } catch (e) {
            console.warn('Canvas clone failed', e);
          }
        }
      }
    });

    // 3.2. Preserve Form Inputs (textarea, select, input)
    const originalInputs = originalContent.querySelectorAll('input, textarea, select');
    const clonedInputs = clonedContent.querySelectorAll('input, textarea, select');
    originalInputs.forEach((orig: any, i) => {
      const dest: any = clonedInputs[i];
      if (dest) {
        if (orig.type === 'checkbox' || orig.type === 'radio') {
          dest.checked = orig.checked;
        } else {
          dest.value = orig.value;
        }
      }
    });

    // 4. Wrap clone in Table Structure for Guaranteed Margins (The "Table Header Hack")
    // This forces the browser to repeat the header space on every new page
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '0';
    table.style.padding = '0';
    
    // Header (Top Margin Spacer)
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const tdHead = document.createElement('td');
    // 10mm height spacer
    tdHead.innerHTML = '<div style="height: 10mm; overflow: hidden;">&nbsp;</div>'; 
    tdHead.style.border = 'none';
    tdHead.style.padding = '0';
    trHead.appendChild(tdHead);
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Body (Content)
    const tbody = document.createElement('tbody');
    const trBody = document.createElement('tr');
    const tdBody = document.createElement('td');
    tdBody.style.border = 'none';
    tdBody.style.padding = '0';
    tdBody.appendChild(clonedContent);
    trBody.appendChild(tdBody);
    tbody.appendChild(trBody);
    table.appendChild(tbody);

    // Footer (Bottom Margin Spacer)
    const tfoot = document.createElement('tfoot');
    const trFoot = document.createElement('tr');
    const tdFoot = document.createElement('td');
    // 10mm height spacer
    tdFoot.innerHTML = '<div style="height: 10mm; overflow: hidden;">&nbsp;</div>';
    tdFoot.style.border = 'none';
    tdFoot.style.padding = '0';
    trFoot.appendChild(tdFoot);
    tfoot.appendChild(trFoot);
    table.appendChild(tfoot);

    // Append table to overlay instead of raw content
    overlay.appendChild(table);

    // 5. Add printing class to body to trigger CSS overrides
    document.body.classList.add('printing-mode');

    // 6. Force layout recalculation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    // 7. Call print
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error("Print failed", e);
        document.body.classList.remove('printing-mode');
        if (overlay) overlay.innerHTML = ''; // Cleanup immediately on error
      }
    }, 100); // Small delay to allow DOM to settle
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

      // Call the new print method with selector
      printService.print(elementSelector);

      // Restore title after print dialog is closed
      // We rely on the 'afterprint' event listener below for cleanup, 
      // but title restoration is safe here.
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      document.body.classList.remove('printing-mode');
    }
  }
};

// Listen for afterprint to cleanup
if (typeof window !== 'undefined') {
  const cleanup = () => {
    document.body.classList.remove('printing-mode');
    const overlay = document.getElementById('print-overlay');
    if (overlay) {
      overlay.innerHTML = ''; // Clear content to save memory
      // We keep the container to avoid recreating it
      overlay.style.display = 'none'; 
    }
  };
  
  window.addEventListener('afterprint', cleanup);
  
  // Fallback for browsers that block print or don't fire afterprint
  window.addEventListener('focus', () => {
    // Small delay to ensure afterprint has a chance to fire first
    setTimeout(cleanup, 1000);
  });
}
