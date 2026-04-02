import { WorksheetBlock, ActivityType, SingleWorksheetData } from '../../../types';

/**
 * WorksheetBuilder — Premium A4 Çalışma Kağıdı Mimarı
 * 
 * Bu sınıf, basit bir etkinlik çıktısını "Premium" standartlarda, 
 * çok bölümlü ve pedagojik olarak zengin bir çalışma kağıdına dönüştürür.
 */
export class WorksheetBuilder {
  private blocks: WorksheetBlock[] = [];
  private title: string = '';
  private activityType: ActivityType;

  private instruction: string = 'Lütfen aşağıdaki etkinliği dikkatlice tamamlayınız.';

  constructor(type: ActivityType, title: string) {
    this.activityType = type;
    this.title = title;
  }

  /**
   * Etkinlik talimatını ayarlar.
   */
  public setInstruction(instruction: string): this {
    this.instruction = instruction;
    return this;
  }

  /**
   * Sayfa başlığını ve öğrenci bilgi alanını ekler.
   */
  public addPremiumHeader(): this {
    this.blocks.push({
      type: 'header',
      content: {
        title: this.title,
        showStudentInfo: true,
        logo: 'Oogmatik Premium'
      },
      weight: 0
    });
    return this;
  }

  /**
   * Öğretmen için pedagojik not alanı ekler.
   */
  public addPedagogicalNote(note: string): this {
    if (!note) return this;
    this.blocks.push({
      type: 'text',
      content: note,
      style: {
        fontSize: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        color: '#475569'
      },
      id: 'pedagogical-note',
      weight: 1
    });
    return this;
  }

  /**
   * Ana etkinlik içeriğini ekler.
   */
  public addPrimaryActivity(type: string, content: any): this {
    this.blocks.push({
      type: type as any,
      content: content,
      weight: 10
    });
    return this;
  }

  /**
   * Ana etkinliği destekleyen kısa bir alıştırma ekler.
   */
  public addSupportingDrill(title: string, content: any, type: string = 'question'): this {
    this.blocks.push({
        type: 'text',
        content: `### 🌟 Destekleyici Alıştırma: ${title}`,
        style: { fontWeight: 'black', fontSize: 14, color: '#4f46e5' },
        weight: 20
    });
    this.blocks.push({
      type: type as any,
      content: content,
      style: { backgroundColor: '#fefce8', borderRadius: 12 },
      weight: 21
    });
    return this;
  }

  /**
   * Sayfa sonuna başarı göstergesi / self-evaluation alanı ekler.
   */
  public addSuccessIndicator(): this {
    this.blocks.push({
      type: 'footer_validation',
      content: {
        label: 'Bu etkinliği nasıl buldun?',
        options: ['🤩 Harika', '🙂 İyi', '😐 Biraz Zor', '🧐 Tekrar Lazım']
      },
      weight: 100
    });
    return this;
  }

  /**
   * Nihai SingleWorksheetData objesini döndürür.
   */
  public build(): SingleWorksheetData {
    return {
      id: `ws_${Date.now()}`,
      type: this.activityType,
      title: this.title,
      instruction: this.instruction,
      layoutArchitecture: {
        cols: 1,
        gap: 20,
        blocks: this.blocks.sort((a, b) => (a.weight || 0) - (b.weight || 0))
      }
    };
  }
}
