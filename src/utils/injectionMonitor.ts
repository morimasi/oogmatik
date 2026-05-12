/**
 * Injection Monitor
 * AUTONOM_ markerları arasındaki kod bloklarını otomatik olarak algılar ve günceller
 * AI ajanlarının kod enjeksiyonunu yönetir
 */

import { GhostWriter } from './ghostWriter';

export interface MarkerRange {
  name: string;
  startMarker: string;
  endMarker: string;
  content: string;
  position: {
    start: number;
    end: number;
  };
  lineNumber: {
    start: number;
    end: number;
  };
}

export interface InjectionResult {
  success: boolean;
  marker: string;
  message: string;
  updatedContent?: string;
}

export class InjectionMonitor {
  private markerPattern = /\/\/\s*AUTONOM_(\w+)_START([\s\S]*?)\/\/\s*AUTONOM_\1_END/g;

  /**
   * Dosyadaki tüm AUTONOM_ markerlarını tara
   */
  scanFile(content: string): MarkerRange[] {
    const markers: MarkerRange[] = [];
    let match;

    // Reset regex
    this.markerPattern.lastIndex = 0;

    while ((match = this.markerPattern.exec(content)) !== null) {
      const name = match[1];
      const blockContent = match[2].trim();
      const fullMatch = match[0];

      const startMarker = `// AUTONOM_${name}_START`;
      const endMarker = `// AUTONOM_${name}_END`;

      // Calculate line numbers
      const linesBefore = content.substring(0, match.index).split('\n');
      const startLine = linesBefore.length;
      
      const blockLines = blockContent.split('\n');
      const endLine = startLine + blockLines.length + 1; // +1 for end marker

      markers.push({
        name,
        startMarker,
        endMarker,
        content: blockContent,
        position: {
          start: match.index,
          end: match.index + fullMatch.length
        },
        lineNumber: {
          start: startLine,
          end: endLine
        }
      });
    }

    return markers;
  }

  /**
   * Belirli bir marker bloğunu güncelle
   * Ghost writing efekti ile satır satır yaz
   */
  async updateMarker(
    currentContent: string,
    markerName: string,
    newContent: string,
    onUpdate: (content: string) => void,
    enableGhostWriting = true
  ): Promise<InjectionResult> {
    const startMarker = `// AUTONOM_${markerName}_START`;
    const endMarker = `// AUTONOM_${markerName}_END`;

    const startIdx = currentContent.indexOf(startMarker);
    const endIdx = currentContent.indexOf(endMarker);

    if (startIdx === -1) {
      return {
        success: false,
        marker: markerName,
        message: `Start marker "${startMarker}" bulunamadı`
      };
    }

    if (endIdx === -1) {
      return {
        success: false,
        marker: markerName,
        message: `End marker "${endMarker}" bulunamadı`
      };
    }

    if (endIdx <= startIdx) {
      return {
        success: false,
        marker: markerName,
        message: 'Marker sıralaması hatalı'
      };
    }

    const before = currentContent.substring(0, startIdx + startMarker.length);
    const after = currentContent.substring(endIdx);

    if (enableGhostWriting) {
      // Ghost writing efekti ile güncelle
      const ghostWriter = new GhostWriter(
        (content) => onUpdate(content),
        { lineDelay: 30, blockDelay: 40 }
      );

      const lines = newContent.split('\n');
      let accumulated = before + '\n';

      for (let i = 0; i < lines.length; i++) {
        accumulated += lines[i];
        if (i < lines.length - 1) {
          accumulated += '\n';
        }

        onUpdate(accumulated + after);
        await this.delay(40);
      }

      // Final content
      const finalContent = before + '\n' + newContent + '\n' + after;
      onUpdate(finalContent);
    } else {
      // Direkt güncelle
      const finalContent = before + '\n' + newContent + '\n' + after;
      onUpdate(finalContent);
    }

    return {
      success: true,
      marker: markerName,
      message: `AUTONOM_${markerName} bloğu başarıyla güncellendi`,
      updatedContent: before + '\n' + newContent + '\n' + after
    };
  }

  /**
   * Birden fazla marker bloğunu toplu güncelle
   */
  async updateMultipleMarkers(
    currentContent: string,
    updates: Array<{
      markerName: string;
      newContent: string;
    }>,
    onUpdate: (content: string) => void
  ): Promise<InjectionResult[]> {
    const results: InjectionResult[] = [];
    let workingContent = currentContent;

    for (const update of updates) {
      const result = await this.updateMarker(
        workingContent,
        update.markerName,
        update.newContent,
        (content) => {
          workingContent = content;
          onUpdate(content);
        }
      );

      results.push(result);
    }

    return results;
  }

  /**
   * Marker bloğu ekle (yeni marker oluştur)
   */
  async addMarker(
    currentContent: string,
    markerName: string,
    content: string,
    onUpdate: (content: string) => void,
    position: 'append' | 'prepend' | number = 'append'
  ): Promise<InjectionResult> {
    const startMarker = `// AUTONOM_${markerName}_START`;
    const endMarker = `// AUTONOM_${markerName}_END`;
    const block = `${startMarker}\n${content}\n${endMarker}`;

    let newContent: string;

    if (position === 'append') {
      newContent = currentContent + '\n\n' + block;
    } else if (position === 'prepend') {
      newContent = block + '\n\n' + currentContent;
    } else {
      // Insert at specific position
      const lines = currentContent.split('\n');
      lines.splice(position, 0, block);
      newContent = lines.join('\n');
    }

    onUpdate(newContent);

    return {
      success: true,
      marker: markerName,
      message: `Yeni AUTONOM_${markerName} bloğu eklendi`,
      updatedContent: newContent
    };
  }

  /**
   * Marker bloğunu sil
   */
  async removeMarker(
    currentContent: string,
    markerName: string,
    onUpdate: (content: string) => void
  ): Promise<InjectionResult> {
    const startMarker = `// AUTONOM_${markerName}_START`;
    const endMarker = `// AUTONOM_${markerName}_END`;

    const startIdx = currentContent.indexOf(startMarker);
    const endIdx = currentContent.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      return {
        success: false,
        marker: markerName,
        message: `Marker bulunamadı: ${markerName}`
      };
    }

    const before = currentContent.substring(0, startIdx);
    const after = currentContent.substring(endIdx + endMarker.length);
    const newContent = before + after.trim();

    onUpdate(newContent);

    return {
      success: true,
      marker: markerName,
      message: `AUTONOM_${markerName} bloğu silindi`,
      updatedContent: newContent
    };
  }

  /**
   * Marker validasyonu - Marker'ların doğru formatta olduğunu kontrol et
   */
  validateMarkers(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const markers = this.scanFile(content);

    // Check for unclosed markers
    const startPattern = /\/\/\s*AUTONOM_(\w+)_START/g;
    const endPattern = /\/\/\s*AUTONOM_(\w+)_END/g;

    const starts: string[] = [];
    const ends: string[] = [];
    let match;

    while ((match = startPattern.exec(content)) !== null) {
      starts.push(match[1]);
    }

    while ((match = endPattern.exec(content)) !== null) {
      ends.push(match[1]);
    }

    // Find unmatched markers
    for (const name of starts) {
      if (!ends.includes(name)) {
        errors.push(`Unclosed marker: AUTONOM_${name}_START`);
      }
    }

    for (const name of ends) {
      if (!starts.includes(name)) {
        errors.push(`Unexpected end marker: AUTONOM_${name}_END`);
      }
    }

    // Check for duplicate markers
    const startCounts = starts.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [name, count] of Object.entries(startCounts)) {
      if (count > 1) {
        errors.push(`Duplicate marker: AUTONOM_${name}_START (${count} kez)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Tüm marker isimlerini getir
   */
  getMarkerNames(content: string): string[] {
    const markers = this.scanFile(content);
    return markers.map(m => m.name);
  }

  /**
   * Marker count
   */
  getMarkerCount(content: string): number {
    return this.scanFile(content).length;
  }

  /**
   * Helper: Delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Singleton instance
 */
export const injectionMonitor = new InjectionMonitor();
