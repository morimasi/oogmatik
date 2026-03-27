import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

/**
 * Süper Stüdyo Premium Markdown ve SVG İşleyici
 * AI tarafından üretilen ham markdown ve SVG bloklarını tarayıcıda render eder.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
    
    // SVG bloklarını ayıkla ve render et
    const renderContent = (text: string) => {
        if (!text) return null;

        // 1. SVG Kod Bloklarını Bul: ```svg ... ```
        const svgRegex = /```svg([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = svgRegex.exec(text)) !== null) {
            // SVG'den önceki metni ekle
            const textBefore = text.slice(lastIndex, match.index);
            if (textBefore) parts.push({ type: 'text', value: textBefore });

            // SVG içeriğini temizle ve ekle
            const svgContent = match[1].trim();
            parts.push({ type: 'svg', value: svgContent });

            lastIndex = match.index + match[0].length;
        }

        // Kalan metni ekle
        const remainingText = text.slice(lastIndex);
        if (remainingText) parts.push({ type: 'text', value: remainingText });

        return parts.map((part, index) => {
            if (part.type === 'svg') {
                return (
                    <div 
                        key={`svg-${index}`}
                        className="my-4 flex justify-center bg-slate-50/50 p-6 rounded-3xl border border-slate-200/50 shadow-sm transition-all hover:shadow-md"
                    >
                        <div 
                            className="max-h-[120px] max-w-[120px] w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[120px]"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part.value) }}
                        />
                    </div>
                );
            }

            // Metin kısmını basit markdown kurallarıyla işle
            const processedText = part.value
                .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-900 mt-8 mb-4 border-b-2 border-slate-200 pb-2">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-slate-800 mt-6 mb-3">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-slate-700 mt-4 mb-2">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/^\- (.*$)/gm, '<li class="ml-6 list-disc mb-2">$1</li>')
                .replace(/^\d\. (.*$)/gm, '<li class="ml-6 list-decimal mb-2">$1</li>')
                .replace(/\n\n/g, '<div class="h-4"></div>')
                .replace(/\n/g, '<br />');

            return (
                <div 
                    key={`text-${index}`}
                    className="markdown-body leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedText) }}
                />
            );
        });
    };

    return (
        <div className={`prose prose-slate max-w-none font-lexend ${className}`}>
            {renderContent(content)}
        </div>
    );
};
