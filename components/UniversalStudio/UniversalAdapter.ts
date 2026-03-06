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
            // Deep Extraction Engine for Legacy Monolithic Activities
            if (pageData.instruction) {
                layout.push({
                    id: 'text',
                    label: 'Yönerge',
                    instanceId: `univ_inst_${Date.now()}_${pIdx}`,
                    isVisible: true,
                    pageIndex: pageIndex,
                    style: { x: 20, y: currentY, w: 754, h: 60, zIndex: 1, padding: 10, textAlign: 'left', fontWeight: 'normal', fontSize: 14, fontStyle: 'italic', backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1, boxShadow: 'none', color: '#666666', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                    specificData: { content: pageData.instruction }
                });
                currentY += 80;
            }

            if (pageData.imagePrompt) {
                layout.push({
                    id: 'image',
                    label: 'Görsel',
                    instanceId: `univ_img_${Date.now()}_${pIdx}`,
                    isVisible: true,
                    pageIndex: pageIndex,
                    style: { x: 20, y: currentY, w: 754, h: 250, zIndex: 1, padding: 10, textAlign: 'center', backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1, boxShadow: 'none', color: '#000000', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                    specificData: { content: { prompt: pageData.imagePrompt } }
                });
                currentY += 270;
            }

            // Find main data array to split (e.g. puzzles, questions, words)
            const arrayKeys = Object.keys(pageData).filter(k => Array.isArray(pageData[k]) && k !== 'targetedErrors' && k !== 'blocks' && typeof pageData[k][0] === 'object');
            
            if (arrayKeys.length > 0) {
                const mainKey = arrayKeys[0];
                const items = pageData[mainKey];
                
                items.forEach((item: any, i: number) => {
                    if (currentY + 250 > 1100) {
                        pageIndex++;
                        currentY = 20;
                    }

                    const groupId = `group_${Date.now()}_${pIdx}_${i}`;

                    // Etkinliğe bağlı ek başlık veya numara
                    layout.push({
                        id: 'text',
                        label: 'Numaratör',
                        instanceId: `univ_num_${Date.now()}_${pIdx}_${i}`,
                        isVisible: true,
                        pageIndex: pageIndex,
                        groupId: groupId,
                        style: { x: 20, y: currentY, w: 40, h: 40, zIndex: 1, padding: 5, textAlign: 'center', fontWeight: 'black', fontSize: 18, backgroundColor: '#18181b', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 8, opacity: 1, boxShadow: 'none', color: '#ffffff', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                        specificData: { content: `${i + 1}` }
                    });

                    // Create a pseudo pageData containing only this specific item
                    const singleItemData = { ...pageData, [mainKey]: [item], title: undefined, instruction: undefined, pedagogicalNote: undefined, imagePrompt: undefined };
                    
                    layout.push({
                        id: 'activity_component',
                        label: `${mainKey.toUpperCase()} #${i + 1}`,
                        instanceId: `univ_act_split_${Date.now()}_${pIdx}_${i}`,
                        isVisible: true,
                        pageIndex: pageIndex,
                        groupId: groupId,
                        style: { x: 70, y: currentY, w: 704, h: 250, zIndex: 1, padding: 10, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, textAlign: 'left', color: '#000000', fontSize: 16, opacity: 1, boxShadow: 'none', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                        specificData: { activityType, data: singleItemData }
                    });
                    currentY += 270;
                });
            } else {
                // Absolute fallback if no array could be extracted
                let h = 800;
                if (currentY + h > 1100) {
                    pageIndex++;
                    currentY = 20;
                }
                layout.push({
                    id: 'activity_component',
                    label: 'Etkinlik Gövdesi',
                    instanceId: `univ_act_full_${Date.now()}_${pIdx}`,
                    isVisible: true,
                    pageIndex: pageIndex,
                    style: { x: 20, y: currentY, w: 754, h, zIndex: 1, padding: 10, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, textAlign: 'left', color: '#000000', fontSize: 16, opacity: 1, boxShadow: 'none', fontFamily: 'Lexend', lineHeight: 1.5, rotation: 0 },
                    specificData: { activityType, data: { ...pageData, title: undefined, instruction: undefined } }
                });
                currentY += h + 20;
            }
        }

        // New page for next array item
        pageIndex++;
        currentY = 20;
    });

    return layout;
};