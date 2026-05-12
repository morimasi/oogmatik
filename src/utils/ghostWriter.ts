/**
 * Ghost Writing Engine
 * AI ajanlarının kodu satır satır veya blok blok yazmasını simüle eder
 * "Yaşayan kod" efekti yaratır
 */

export interface GhostWriterOptions {
  lineDelay?: number;      // Satır yazma arası bekleme (ms)
  blockDelay?: number;     // Blok yazma arası bekleme (ms)
  onProgress?: (currentLine: number, totalLines: number) => void;
  onComplete?: () => void;
}

export class GhostWriter {
  private onUpdate: (content: string) => void;
  private options: GhostWriterOptions;
  private isCancelled = false;
  private abortController = new AbortController();

  constructor(
    onUpdate: (content: string) => void,
    options: GhostWriterOptions = {}
  ) {
    this.onUpdate = onUpdate;
    this.options = {
      lineDelay: options.lineDelay || 50,
      blockDelay: options.blockDelay || 80,
      onProgress: options.onProgress,
      onComplete: options.onComplete
    };
  }

  /**
   * Kodu satır satır yaz
   */
  async writeLineByLine(code: string): Promise<void> {
    const lines = code.split('\n');
    let content = '';

    for (let i = 0; i < lines.length; i++) {
      if (this.isCancelled) {
        break;
      }

      content += lines[i];
      if (i < lines.length - 1) {
        content += '\n';
      }

      this.onUpdate(content);
      this.options.onProgress?.(i + 1, lines.length);

      // Delay before next line
      await this.delay(this.options.lineDelay!);
    }

    this.options.onComplete?.();
  }

  /**
   * Kodu kelime kelime yaz (daha dramatik efekt)
   */
  async writeWordByWord(code: string): Promise<void> {
    // Split by spaces and newlines but keep them
    const tokens = code.split(/(\s+)/);
    let content = '';

    for (let i = 0; i < tokens.length; i++) {
      if (this.isCancelled) {
        break;
      }

      content += tokens[i];
      this.onUpdate(content);

      // Shorter delay for words
      await this.delay(tokens[i].trim() ? 30 : 15);
    }

    this.options.onComplete?.();
  }

  /**
   * Belirli bir marker arasına blok yaz
   * Örnek: // AUTONOM_CONFIG_START ... // AUTONOM_CONFIG_END
   */
  async writeBlockWithMarkers(
    currentContent: string,
    markerName: string,
    newContent: string
  ): Promise<void> {
    const startMarker = `// AUTONOM_${markerName}_START`;
    const endMarker = `// AUTONOM_${markerName}_END`;

    const startIdx = currentContent.indexOf(startMarker);
    const endIdx = currentContent.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      // Markers not found, append at end
      const updated = currentContent + '\n' + newContent;
      await this.writeLineByLine(updated);
      return;
    }

    const before = currentContent.substring(0, startIdx + startMarker.length);
    const after = currentContent.substring(endIdx);

    // Write the new content line by line
    const lines = newContent.split('\n');
    let accumulated = before + '\n';

    for (let i = 0; i < lines.length; i++) {
      if (this.isCancelled) {
        break;
      }

      accumulated += lines[i];
      if (i < lines.length - 1) {
        accumulated += '\n';
      }

      this.onUpdate(accumulated + after);
      this.options.onProgress?.(i + 1, lines.length);

      await this.delay(this.options.blockDelay!);
    }

    // Final state
    const finalContent = before + '\n' + newContent + '\n' + after;
    this.onUpdate(finalContent);
    this.options.onComplete?.();
  }

  /**
   * Kodu patch et (diff uygulayarak)
   */
  async applyPatch(
    currentContent: string,
    patch: string
  ): Promise<void> {
    // Simple line-based patch application
    const currentLines = currentContent.split('\n');
    const patchLines = patch.split('\n');
    
    // Find the insertion point (simple append for now)
    const result = currentLines.join('\n') + '\n' + patchLines.join('\n');
    await this.writeLineByLine(result);
  }

  /**
   * Kodu tamamen değiştir (önce sil, sonra yaz)
   */
  async replaceContent(newContent: string): Promise<void> {
    // Clear first
    this.onUpdate('');
    await this.delay(200);
    
    // Then write new content
    await this.writeLineByLine(newContent);
  }

  /**
   * Yazmayı iptal et
   */
  cancel(): void {
    this.isCancelled = true;
    this.abortController.abort();
  }

  /**
   * Yazma devam ediyor mu?
   */
  isWriting(): boolean {
    return !this.isCancelled;
  }

  /**
   * Helper: Delay fonksiyonu
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timer = setTimeout(resolve, ms);
      
      this.abortController.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}

/**
 * Ghost Writer Factory
 */
export function createGhostWriter(
  onUpdate: (content: string) => void,
  options?: GhostWriterOptions
): GhostWriter {
  return new GhostWriter(onUpdate, options);
}

/**
 * Typing animation for terminal output
 */
export class TerminalTyper {
  private onUpdate: (text: string) => void;
  private typingDelay = 20;

  constructor(onUpdate: (text: string) => void, typingDelay = 20) {
    this.onUpdate = onUpdate;
    this.typingDelay = typingDelay;
  }

  async type(text: string): Promise<void> {
    let displayed = '';
    
    for (let i = 0; i < text.length; i++) {
      displayed += text[i];
      this.onUpdate(displayed);
      await this.delay(this.typingDelay);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
