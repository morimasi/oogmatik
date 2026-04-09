import { ActivityType, SingleWorksheetData, LayoutItem, WorksheetBlock } from '../../types';
import { A4_WIDTH_PX, A4_HEIGHT_PX, A4_DEFAULT_MARGIN_PX } from '../../utils/layoutConstants';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Tetris/Masonry benzeri yerleşim bulucu (Bin Packing)
class LayoutEngine {
  private canvasWidth = A4_WIDTH_PX;
  private canvasHeight = A4_HEIGHT_PX;
  private padding = 15; // A4 margins (reduced from 20)
  private gap = 8; // Öğeler arası mesafe (reduced from 15)

  constructor(orientation: 'portrait' | 'landscape' = 'portrait') {
    if (orientation === 'landscape') {
      this.canvasWidth = A4_HEIGHT_PX; // Swap width and height for landscape
      this.canvasHeight = A4_WIDTH_PX;
    }
  }

  private occupiedSpaces: { page: number; rect: Rect }[] = [];

  // Bir bileşen için olabilecek en üst ve en sol boşluğu bulur
  findSpace(w: number, h: number): { page: number; x: number; y: number } {
    let currentPage = 0;

    while (true) {
      let bestY = this.padding;
      let bestX = this.padding;
      let found = false;

      // Yukarıdan aşağıya (10px adımlarla) ve Soldan sağa (10px adımlarla) tara
      for (let y = this.padding; y <= this.canvasHeight - this.padding - h; y += 10) {
        for (let x = this.padding; x <= this.canvasWidth - this.padding - w; x += 10) {
          const candidate: Rect = { x, y, w, h };

          const isOccupied = this.occupiedSpaces
            .filter((s) => s.page === currentPage)
            .some((s) => this.isOverlapping(candidate, s.rect));

          if (!isOccupied) {
            bestX = x;
            bestY = y;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (found) {
        this.occupiedSpaces.push({ page: currentPage, rect: { x: bestX, y: bestY, w, h } });
        return { page: currentPage, x: bestX, y: bestY };
      } else {
        // Bu sayfada yer yoksa bir sonraki sayfaya geç
        currentPage++;
      }
    }
  }

  // Basit çakışma (AABB) kontrolü
  private isOverlapping(r1: Rect, r2: Rect): boolean {
    // Gap eklenmiş alanlarla hesapla ki öğeler birbirine yapışmasın
    return !(
      r1.x + r1.w + this.gap <= r2.x ||
      r1.x >= r2.x + r2.w + this.gap ||
      r1.y + r1.h + this.gap <= r2.y ||
      r1.y >= r2.y + r2.h + this.gap
    );
  }
}

export const convertToLayoutItems = (
  activityType: ActivityType | null,
  worksheetData: SingleWorksheetData[],
  settings?: any
): LayoutItem[] => {
  const layout: LayoutItem[] = [];

  if (!worksheetData || worksheetData.length === 0) return layout;

  const orientation = settings?.orientation || 'portrait';
  const engine = new LayoutEngine(orientation);
  const canvasWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
  const contentWidth = canvasWidth - 40; // Total width minus margins
  const contentHeight = canvasHeight - 250; // Estimated usable content height

  worksheetData.forEach((pageData, pIdx) => {
    const blocks = pageData.layoutArchitecture?.blocks || pageData.blocks;

    // Başlık (Sadece ayarlar izin veriyorsa)
    if (pageData.title && settings?.showTitle !== false) {
      const w = contentWidth;
      const h = 45; // Reduced from 60
      const pos = engine.findSpace(w, h);

      layout.push({
        id: 'header',
        label: 'Başlık',
        instanceId: `univ_header_${Date.now()}_${pIdx}`,
        isVisible: true,
        pageIndex: pos.page,
        style: {
          x: pos.x,
          y: pos.y,
          w,
          h,
          zIndex: 1,
          padding: 10,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 24,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderStyle: 'solid',
          borderRadius: 0,
          opacity: 1,
          boxShadow: 'none',
          color: '#000000',
          fontFamily: 'Lexend',
          lineHeight: 1.5,
          rotation: 0,
        },
        specificData: { title: pageData.title },
      });
    }

    if (blocks && blocks.length > 0) {
      // New Architecture (Atomized & Compact Layout)
      blocks.forEach((block: WorksheetBlock, bIdx: number) => {
        let w = contentWidth; // default full width
        let h = 100; // estimated default height

        // Tahmini boyutlandırma (Dinamik)
        if (block.type === 'text' || (block.type as string) === 'instruction') {
          const textLen = JSON.stringify(block.content).length;
          w = textLen < 50 ? contentWidth / 2 - 10 : contentWidth; // Kısa metinleri yan yana koyabilmek için daralt
          h = Math.max(60, Math.ceil(textLen / (orientation === 'landscape' ? 120 : 80)) * 30);
        } else if (block.type === 'svg_shape') {
          w = 150;
          h = 150; // SVG'ler küçük kutulardır, yan yana dizilebilirler
        } else if (block.type === 'image') {
          w = contentWidth / 2 - 10;
          h = 250; // Yarı genişlik resim
        } else if (block.type === 'grid') {
          const content: any = block.content;
          w = Math.min(contentWidth, (content.cols || 4) * 60 + 40); // Sütun sayısına göre dinamik genişlik
          const rows = Math.ceil((content.cells?.length || 0) / (content.cols || 4));
          h = Math.min(500, rows * 60 + 40);
        } else if (block.type === 'logic_card') {
          w = contentWidth / 2 - 10;
          h = 200; // Mantık kartları yarı genişliktedir
        } else if (block.type === 'table') {
          w = contentWidth;
          h = 300;
        } else if (block.type === 'categorical_sorting') {
          w = contentWidth;
          h = 300;
        }

        // Tetris motorundan en iyi boşluğu bul
        const pos = engine.findSpace(w, h);

        layout.push({
          id: block.type as any,
          label: block.type.toUpperCase(),
          instanceId: `univ_block_${Date.now()}_${pIdx}_${bIdx}`,
          isVisible: true,
          pageIndex: pos.page,
          style: {
            x: pos.x,
            y: pos.y,
            w,
            h,
            zIndex: 1,
            padding: 10,
            backgroundColor: block.style?.backgroundColor || 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: block.style?.borderRadius || 0,
            textAlign: block.style?.textAlign || 'left',
            color: block.style?.color || '#000000',
            fontSize: block.style?.fontSize || 16,
            opacity: 1,
            boxShadow: 'none',
            fontFamily: 'Lexend',
            lineHeight: 1.5,
            rotation: 0,
          },
          specificData: { content: block.content },
        });
      });
    } else {
      // Legacy Architecture - Deep Extraction Engine
      if (pageData.instruction && settings?.showInstruction !== false) {
        const w = contentWidth;
        const h = 40; // Reduced from 60
        const pos = engine.findSpace(w, h);
        layout.push({
          id: 'text',
          label: 'Yönerge',
          instanceId: `univ_inst_${Date.now()}_${pIdx}`,
          isVisible: true,
          pageIndex: pos.page,
          style: {
            x: pos.x,
            y: pos.y,
            w,
            h,
            zIndex: 1,
            padding: 10,
            textAlign: 'left',
            fontWeight: 'normal',
            fontSize: 14,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 0,
            opacity: 1,
            boxShadow: 'none',
            color: '#666666',
            fontFamily: 'Lexend',
            lineHeight: 1.5,
            rotation: 0,
          },
          specificData: { content: pageData.instruction },
        });
      }

      if (pageData.imagePrompt) {
        const w = contentWidth / 2 - 10;
        const h = 250;
        const pos = engine.findSpace(w, h);
        layout.push({
          id: 'image',
          label: 'Görsel',
          instanceId: `univ_img_${Date.now()}_${pIdx}`,
          isVisible: true,
          pageIndex: pos.page,
          style: {
            x: pos.x,
            y: pos.y,
            w,
            h,
            zIndex: 1,
            padding: 10,
            textAlign: 'center',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 0,
            opacity: 1,
            boxShadow: 'none',
            color: '#000000',
            fontFamily: 'Lexend',
            lineHeight: 1.5,
            rotation: 0,
          },
          specificData: { content: { prompt: pageData.imagePrompt } },
        });
      }

      // Find main data array to split (e.g. puzzles, questions, words)
      const arrayKeys = Object.keys(pageData).filter(
        (k) =>
          Array.isArray(pageData[k]) &&
          k !== 'targetedErrors' &&
          k !== 'blocks' &&
          typeof pageData[k][0] === 'object'
      );

      // Kullanıcının "Etkinlikler parçalanmadan tam takır olmalı" talebi doğrultusunda,
      // UniversalAdapter'in etkinlik dizilerini zorla bölüp dar kutulara sıkıştırma (chunking)
      // işlemi tüm standart etkinlikler için devre dışı bırakılmıştır.
      // Sadece OCR gibi ham veriler parçalanarak Canvas'a dağıtılabilir.
      const shouldSplitArray = activityType === ActivityType.OCR_CONTENT;

      if (shouldSplitArray && arrayKeys.length > 0) {
        const mainKey = arrayKeys[0];
        const items = pageData[mainKey];

        items.forEach((item: any, i: number) => {
          const groupId = `group_${Date.now()}_${pIdx}_${i}`;

          // Alt elemanlar için mantıklı genişlik/yükseklik
          const w = contentWidth / 2 - 10; // 2 sütunlu dizecek şekilde 360px
          const h = 250;

          // Grup için tek bir yer ara
          const pos = engine.findSpace(w + 50, h); // 50px numaratör payı

          // Numaratör
          layout.push({
            id: 'text',
            label: 'Numaratör',
            instanceId: `univ_num_${Date.now()}_${pIdx}_${i}`,
            isVisible: true,
            pageIndex: pos.page,
            groupId: groupId,
            style: {
              x: pos.x,
              y: pos.y,
              w: 40,
              h: 40,
              zIndex: 1,
              padding: 5,
              textAlign: 'center',
              fontWeight: 'black',
              fontSize: 18,
              backgroundColor: '#18181b',
              borderColor: 'transparent',
              borderWidth: 0,
              borderStyle: 'solid',
              borderRadius: 8,
              opacity: 1,
              boxShadow: 'none',
              color: '#ffffff',
              fontFamily: 'Lexend',
              lineHeight: 1.5,
              rotation: 0,
            },
            specificData: { content: `${i + 1}` },
          });

          const singleItemData = {
            ...pageData,
            [mainKey]: [item],
            title: undefined,
            instruction: undefined,
            pedagogicalNote: undefined,
            imagePrompt: undefined,
          };

          layout.push({
            id: 'activity_component',
            label: `${mainKey.toUpperCase()} #${i + 1}`,
            instanceId: `univ_act_split_${Date.now()}_${pIdx}_${i}`,
            isVisible: true,
            pageIndex: pos.page,
            groupId: groupId,
            style: {
              x: pos.x + 50,
              y: pos.y,
              w,
              h,
              zIndex: 1,
              padding: 10,
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
              borderStyle: 'solid',
              borderRadius: 0,
              textAlign: 'left',
              color: '#000000',
              fontSize: 16,
              opacity: 1,
              boxShadow: 'none',
              fontFamily: 'Lexend',
              lineHeight: 1.5,
              rotation: 0,
            },
            specificData: { activityType, data: singleItemData },
          });
        });
      } else {
        // Absolute fallback
        const w = contentWidth;
        const h = contentHeight;
        const pos = engine.findSpace(w, h);
        layout.push({
          id: 'activity_component',
          label: 'Etkinlik Gövdesi',
          instanceId: `univ_act_full_${Date.now()}_${pIdx}`,
          isVisible: true,
          pageIndex: pos.page,
          style: {
            x: pos.x,
            y: pos.y,
            w,
            h,
            zIndex: 1,
            padding: 10,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 0,
            textAlign: 'left',
            color: '#000000',
            fontSize: 16,
            opacity: 1,
            boxShadow: 'none',
            fontFamily: 'Lexend',
            lineHeight: 1.5,
            rotation: 0,
          },
          specificData: {
            activityType,
            data: { ...pageData, title: undefined, instruction: undefined },
          },
        });
      }
    }
  });

  return layout;
};

  return layout;
};
