
// ═══════════════════════════════════════════════════════════════
// ULTRA PRINT ENGINE v4.0 — A4 Kompakt Çoklu Sayfa Yazdırma
// Bursa Disleksi AI — Nöro-Mimari Basım Motoru
// ═══════════════════════════════════════════════════════════════

export interface PrintOptions {
    action: 'print' | 'download';
    selectedPages?: number[];
    grayscale?: boolean;
    includeAnswerKey?: boolean;
    worksheetData?: any[];
    /** @default false Kompakt mod: font + padding küçültür, sayfaya daha fazla içerik sığdırır */
    compact?: boolean;
    /** @default 1 Sütun sayısı: 2 seçilince içerik yan yana 2 sütunda dizilir */
    columnsPerPage?: 1 | 2;
    /** @default 11 Yazı boyutu (pt) */
    fontSize?: 10 | 11 | 12;
}

/**
 * Aktivite verilerinden cevap anahtarı HTML'i üretir.
 * Block tabanlı etkinliklerde answer/key alanlarını, cloze_test'te boşlukları,
 * match_columns'ta eşleşmeleri otomatik çıkarır.
 */
const generateAnswerKeyHtml = (worksheetData: any[]): string => {
    let allAnswers: { page: number; question: string; answer: string }[] = [];

    worksheetData.forEach((sheet: any, pageIdx: number) => {
        const data = sheet.data || sheet;
        const blocks: any[] = data?.layoutArchitecture?.blocks || data?.blocks || [];
        let questionCounter = 1;

        blocks.forEach((block: any) => {
            const c = block.content;
            if (!c) return;

            switch (block.type) {
                case 'cloze_test': {
                    const text: string = typeof c.text === 'string' ? c.text : JSON.stringify(c.text || '');
                    const matches = text.match(/\[([^\]]+)\]/g) || [];
                    matches.forEach((m, i) => {
                        allAnswers.push({
                            page: pageIdx + 1,
                            question: `Sayfa ${pageIdx + 1} - Boşluk ${i + 1}`,
                            answer: m.replace('[', '').replace(']', '')
                        });
                    });
                    break;
                }
                case 'match_columns': {
                    const left: any[] = c.leftColumn || c.left || [];
                    const right: any[] = c.rightColumn || c.right || [];
                    left.forEach((item: any, i: number) => {
                        if (right[i]) {
                            allAnswers.push({
                                page: pageIdx + 1,
                                question: `${questionCounter++}. ${typeof item === 'string' ? item : item?.text || JSON.stringify(item)}`,
                                answer: typeof right[i] === 'string' ? right[i] : right[i]?.text || JSON.stringify(right[i])
                            });
                        }
                    });
                    break;
                }
                case 'logic_card': {
                    if (c.answer !== undefined && c.answer !== null) {
                        allAnswers.push({
                            page: pageIdx + 1,
                            question: `${questionCounter++}. ${typeof c.text === 'string' ? c.text.slice(0, 60) + '...' : 'Mantık Sorusu'}`,
                            answer: String(c.answer)
                        });
                    }
                    break;
                }
                default: {
                    // Genel: answer / correctAnswer / key alanlarını tara
                    const answerVal = c.answer ?? c.correctAnswer ?? c.key ?? c.solution ?? c.result;
                    if (answerVal !== undefined && answerVal !== null) {
                        const label = c.question || c.text || c.title || c.label;
                        const questionText = typeof label === 'string'
                            ? label.slice(0, 70)
                            : `Soru ${questionCounter}`;
                        allAnswers.push({
                            page: pageIdx + 1,
                            question: `${questionCounter++}. ${questionText}`,
                            answer: typeof answerVal === 'object' ? JSON.stringify(answerVal) : String(answerVal)
                        });
                    }
                    break;
                }
            }
        });

        // Üst düzey cevap alanları (bazı special modüller)
        const topLevelAnswer = data?.answer || data?.answers || data?.answerKey || data?.solution;
        if (topLevelAnswer) {
            const answerText = Array.isArray(topLevelAnswer)
                ? topLevelAnswer.join(', ')
                : typeof topLevelAnswer === 'object'
                    ? Object.entries(topLevelAnswer).map(([k, v]) => `${k}: ${v}`).join(' | ')
                    : String(topLevelAnswer);
            allAnswers.push({ page: pageIdx + 1, question: `Sayfa ${pageIdx + 1} - Genel Cevap`, answer: answerText });
        }
    });

    if (allAnswers.length === 0) {
        return `<div class="answer-key-page ultra-print-page" style="width:210mm;min-height:297mm;padding:15mm;box-sizing:border-box;background:white;display:flex;flex-direction:column;">
            <div style="border-bottom:3px solid black;padding-bottom:8mm;margin-bottom:8mm;">
                <span style="font-size:7pt;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:#71717a;">Cevap Anahtarı</span>
                <h2 style="font-size:18pt;font-weight:900;text-transform:uppercase;margin:4px 0 0 0;color:black;">Cevap Anahtarı</h2>
            </div>
            <p style="color:#71717a;font-size:10pt;">Bu etkinlik için otomatik cevap anahtarı üretilemedi. Lütfen etkinlik içeriğini kontrol edin.</p>
        </div>`;
    }

    const groupedByPage: Record<number, typeof allAnswers> = {};
    allAnswers.forEach(a => {
        if (!groupedByPage[a.page]) groupedByPage[a.page] = [];
        groupedByPage[a.page].push(a);
    });

    let rows = '';
    let rowNum = 1;
    allAnswers.forEach(a => {
        const bg = rowNum % 2 === 0 ? '#f9f9fb' : '#ffffff';
        rows += `<tr style="background:${bg};">
            <td style="padding:4px 6px;border:1px solid #e4e4e7;font-size:9pt;width:32px;text-align:center;font-weight:900;color:#71717a;">${rowNum++}</td>
            <td style="padding:4px 8px;border:1px solid #e4e4e7;font-size:9pt;color:#27272a;">${a.question}</td>
            <td style="padding:4px 8px;border:1px solid #e4e4e7;font-size:9pt;font-weight:900;color:#18181b;">${a.answer}</td>
        </tr>`;
    });

    return `<div class="answer-key-page ultra-print-page" style="width:210mm;min-height:297mm;padding:15mm 15mm 12mm 15mm;box-sizing:border-box;background:white;display:flex;flex-direction:column;page-break-before:always;break-before:page;">
        <div style="border-bottom:3px solid black;padding-bottom:8mm;margin-bottom:8mm;display:flex;align-items:flex-end;justify-content:space-between;">
            <div>
                <span style="font-size:7pt;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:#71717a;display:block;margin-bottom:2px;">Bursa Disleksi AI • Nöro-Mimari Motoru</span>
                <h2 style="font-size:20pt;font-weight:900;text-transform:uppercase;margin:0;letter-spacing:-0.03em;color:black;">🔑 Cevap Anahtarı</h2>
            </div>
            <span style="font-size:8pt;color:#71717a;font-weight:700;">${new Date().toLocaleDateString('tr-TR')}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8mm;">
            <thead>
                <tr style="background:#18181b;color:white;">
                    <th style="padding:6px;font-size:8pt;font-weight:900;text-align:center;border:1px solid #3f3f46;">#</th>
                    <th style="padding:6px 8px;font-size:8pt;font-weight:900;text-align:left;border:1px solid #3f3f46;">Soru / Boşluk</th>
                    <th style="padding:6px 8px;font-size:8pt;font-weight:900;text-align:left;border:1px solid #3f3f46;">Doğru Cevap</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:auto;padding-top:6mm;border-top:2px solid black;display:flex;justify-content:space-between;font-size:7pt;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:#71717a;">
            <div><span style="background:black;color:white;padding:1px 4px;border-radius:2px;margin-right:4px;">AI</span>Bursa Disleksi AI • Nöro-Mimari Motoru v4.0</div>
            <span>Cevap Anahtarı • ${allAnswers.length} madde</span>
        </div>
    </div>`;
};

export const printService = {
    /**
     * Ultra Print Engine v4.0
     * A4 Kompakt Çoklu Sayfa Yazdırma Motoru.
     * DOM klonlama, UI temizleme, kompakt/2-sütun modu ve cevap anahtarı destekler.
     */
    generatePdf: async (
        elementSelector: string,
        title: string = "Bursa_Disleksi_AI_Etkinlik",
        options: PrintOptions
    ) => {
        // 1. Hedef elementleri bul
        let elements = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];

        if (options.selectedPages && options.selectedPages.length > 0) {
            elements = elements.filter((_, idx) => options.selectedPages!.includes(idx));
        }

        if (!elements.length) {
            console.warn(`[PrintEngine] Yazdırılacak içerik bulunamadı. Selector: "${elementSelector}"`);
            return;
        }

        // 2. Mevcut print container'ı temizle
        const existingContainer = document.getElementById('print-container');
        if (existingContainer) existingContainer.remove();

        // 3. Print container oluştur
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';

        // Temel stiller
        printContainer.style.setProperty('position', 'absolute', 'important');
        printContainer.style.setProperty('top', '0', 'important');
        printContainer.style.setProperty('left', '0', 'important');
        printContainer.style.setProperty('width', '210mm', 'important');
        printContainer.style.setProperty('margin', '0', 'important');
        printContainer.style.setProperty('padding', '0', 'important');
        printContainer.style.setProperty('background', 'white', 'important');
        printContainer.style.setProperty('z-index', '9999999', 'important');

        // Mod sınıfları ekle (CSS tarafından işlenir)
        if (options.grayscale) printContainer.classList.add('grayscale-print');
        if (options.compact) printContainer.classList.add('compact-print');
        if (options.columnsPerPage === 2) printContainer.classList.add('two-column-print');
        if (options.fontSize) printContainer.setAttribute('data-font-size', String(options.fontSize));

        // 4. Elementleri klonla ve temizle
        elements.forEach((el) => {
            const clone = el.cloneNode(true) as HTMLElement;

            // Input/textarea değerlerini senkronize et
            const originalInputs = el.querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');
            originalInputs.forEach((input, i) => {
                const clonedInput = clonedInputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                const originalInput = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                if (!clonedInput || !originalInput) return;

                if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
                    if ((originalInput as HTMLInputElement).checked) clonedInput.setAttribute('checked', 'checked');
                } else if (originalInput.tagName === 'TEXTAREA') {
                    clonedInput.innerHTML = originalInput.value;
                    clonedInput.value = originalInput.value;
                } else {
                    clonedInput.setAttribute('value', originalInput.value);
                }
            });

            // UI gürültüsünü temizle (sadece kesin UI elementleri)
            const uiGarbage = clone.querySelectorAll(
                '.edit-handle, .page-navigator, .no-print, .overlay-ui, ' +
                '[data-testid="edit-btn"], .page-label-container, ' +
                '.print-toolbar, .print-controls, [class*="backdrop-blur"]'
            );
            uiGarbage.forEach(e => e.remove());

            // Butonları gizle (ama print-keep olarak işaretlenenler korunur)
            clone.querySelectorAll('button:not(.print-keep)').forEach(btn => {
                (btn as HTMLElement).style.setProperty('display', 'none', 'important');
            });

            // A4 için transform ve boyut sıfırlama
            clone.style.setProperty('transform', 'none', 'important');
            clone.style.setProperty('margin', '0 auto', 'important');
            clone.style.setProperty('box-shadow', 'none', 'important');
            clone.style.setProperty('position', 'relative', 'important');
            clone.style.setProperty('width', '210mm', 'important');
            clone.style.setProperty('min-height', '297mm', 'important');
            clone.style.setProperty('box-sizing', 'border-box', 'important');
            clone.style.setProperty('display', 'flex', 'important');
            clone.style.setProperty('flex-direction', 'column', 'important');
            clone.style.setProperty('overflow', 'visible', 'important');
            clone.style.setProperty('page-break-after', 'always', 'important');
            clone.style.setProperty('break-after', 'page', 'important');
            clone.style.setProperty('background', 'white', 'important');
            clone.style.setProperty('color', 'black', 'important');

            clone.classList.add('ultra-print-page');

            printContainer.appendChild(clone);
        });

        // 5. Cevap anahtarı ekle (implement edildi!)
        if (options.includeAnswerKey && options.worksheetData && options.worksheetData.length > 0) {
            const answerKeyHtml = generateAnswerKeyHtml(options.worksheetData);
            const answerKeyWrapper = document.createElement('div');
            answerKeyWrapper.innerHTML = answerKeyHtml;
            // Wrapper'ın içindeki ilk çocuğu al
            const answerKeyPage = answerKeyWrapper.firstElementChild as HTMLElement;
            if (answerKeyPage) {
                answerKeyPage.style.setProperty('page-break-before', 'always', 'important');
                answerKeyPage.style.setProperty('break-before', 'page', 'important');
                printContainer.appendChild(answerKeyPage);
            }
        }

        document.body.appendChild(printContainer);

        // 6. Görsellerin yüklenmesini bekle
        const images = printContainer.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
            return new Promise<void>(resolve => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                // 4 saniye timeout: takılı kalan görselleri beklemeden devam et
                setTimeout(resolve, 4000);
            });
        });
        await Promise.all(imagePromises);

        // 7. Tarayıcı düzen motorunun yerleşmesini bekle
        const layoutDelay = options.compact ? 600 : 900;
        await new Promise(resolve => setTimeout(resolve, layoutDelay));

        // 8. Yazdır
        const originalTitle = document.title;
        document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');

        window.print();

        // 9. Temizlik (print dialog kapatıldıktan sonra)
        document.title = originalTitle;

        // afterprint eventi ya da timeout ile güvenli cleanup
        const cleanup = () => {
            const container = document.getElementById('print-container');
            if (container?.parentNode) {
                document.body.removeChild(container);
            }
        };

        const afterPrintHandler = () => {
            cleanup();
            window.removeEventListener('afterprint', afterPrintHandler);
        };
        window.addEventListener('afterprint', afterPrintHandler);

        // Fallback: 3 saniye sonra yine de temizle
        setTimeout(cleanup, 3000);
    }
};
