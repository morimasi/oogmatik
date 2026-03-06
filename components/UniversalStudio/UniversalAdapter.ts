import { ActivityType, SingleWorksheetData, LayoutItem, WorksheetBlock } from '../../types';

export const convertToLayoutItems = (activityType: ActivityType | null, worksheetData: SingleWorksheetData[]): LayoutItem[] => {
    let layout: LayoutItem[] = [];
    let currentY = 20;
    let pageIndex = 0;
    
    if (!worksheetData || worksheetData.length === 0) return layout;

    worksheetData.forEach((pageData, pIdx) => {
        const blocks = pageData.layoutArchitecture?.blocks || pageData.blocks;

        // Common Header for the page
        if (pageData.title) {
            layout.push({
                id: 'header',
                label: 'Başlık',
                instanceId: `univ_header_${Date.now()}_${pIdx}`,
                isVisible: true,
                pageIndex: pageIndex,
                style: { x: 20, y: currentY, w: 754, h: 60, zIndex: 1, padding: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 24, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1, boxShadow: 'none', color: '#000000', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                specificData: { title: pageData.title }
            });
            currentY += 80;
        }

        if (blocks && blocks.length > 0) {
            // New Architecture (Atomized)
            blocks.forEach((block: WorksheetBlock, bIdx: number) => {
                let h = 100; // estimated
                if (block.type === 'text' || block.type === 'instruction') h = 60;
                if (block.type === 'image') h = 250;
                if (block.type === 'grid') h = 200;
                if (block.type === 'table') h = 300;
                if (block.type === 'logic_card') h = 250;
                if (block.type === 'categorical_sorting') h = 300;
                
                if (currentY + h > 1100) {
                    pageIndex++;
                    currentY = 20;
                }

                layout.push({
                    id: block.type as any,
                    label: block.type.toUpperCase(),
                    instanceId: `univ_block_${Date.now()}_${pIdx}_${bIdx}`,
                    isVisible: true,
                    pageIndex: pageIndex,
                    style: {
                        x: 20, y: currentY, w: 754, h, zIndex: 1, padding: 10,
                        backgroundColor: block.style?.backgroundColor || 'transparent',
                        borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: block.style?.borderRadius || 0,
                        textAlign: block.style?.textAlign || 'left', color: block.style?.color || '#000000',
                        fontSize: block.style?.fontSize || 16, opacity: 1, boxShadow: 'none', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0
                    },
                    specificData: { content: block.content }
                });
                currentY += h + 20;
            });
        } else {
            // Legacy Architecture (Wrap whole component)
            let h = 800;
            if (currentY + h > 1100) {
                pageIndex++;
                currentY = 20;
            }
            
            layout.push({
                id: 'activity_component',
                label: 'Etkinlik Gövdesi',
                instanceId: `univ_act_${Date.now()}_${pIdx}`,
                isVisible: true,
                pageIndex: pageIndex,
                style: { x: 20, y: currentY, w: 754, h, zIndex: 1, padding: 10, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, textAlign: 'left', color: '#000000', fontSize: 16, opacity: 1, boxShadow: 'none', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                specificData: { activityType, data: pageData }
            });
            currentY += h + 20;
        }

        // New page for next array item
        pageIndex++;
        currentY = 20;
    });

    return layout;
};