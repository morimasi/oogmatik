import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SheetRenderer } from '../components/SheetRenderer';
import { ActivityType } from '../types';

describe('Print Layout & Sheet Distribution', () => {
    const mockData = {
        title: "TEST AKTİVİTE",
        instruction: "Bu bir test talimatıdır.",
        pedagogicalNote: "Test notu.",
        layoutArchitecture: {
            cols: 1,
            blocks: [
                { id: '1', type: 'header', content: { text: "Blok 1" } },
                { id: '2', type: 'text', content: { text: "Bu bir test içeriğidir." } },
                { id: '3', type: 'image', content: { prompt: "test pencil" } }
            ]
        }
    };

    it('should apply A4 print classes to the worksheet page', () => {
        const { container } = render(
            <SheetRenderer 
                activityType={ActivityType.ALGORITHM_GENERATOR} 
                data={mockData as any} 
                settings={{ orientation: 'portrait' } as any} 
            />
        );

        const page = container.querySelector('.worksheet-page');
        expect(page).not.toBeNull();
        expect(page?.classList.contains('ultra-print-page')).toBe(true);
        expect(page?.classList.contains('print-page')).toBe(true);
    });

    it('should render pedagogical header on the first page', () => {
        render(
            <SheetRenderer 
                activityType={ActivityType.ALGORITHM_GENERATOR} 
                data={mockData as any} 
            />
        );
        
        expect(screen.getByText('TEST AKTİVİTE')).toBeDefined();
        expect(screen.getByText('Bu bir test talimatıdır.')).toBeDefined();
    });

    it('should include the professional footer with AI branding', () => {
        const { container } = render(
            <SheetRenderer 
                activityType={ActivityType.ALGORITHM_GENERATOR} 
                data={mockData as any} 
            />
        );
        
        expect(screen.getByText(/Bursa Disleksi AI/i)).toBeDefined();
        expect(screen.getByText(/Nöro-Mimari Motoru/i)).toBeDefined();
    });

    it('should distribute blocks correctly into pages', () => {
        // We simulate a large amount of content
        const largeData = {
            ...mockData,
            layoutArchitecture: {
                cols: 1,
                blocks: Array.from({ length: 20 }, (_, i) => ({
                    id: String(i),
                    type: 'text',
                    content: { text: "Çok uzun bir metin bloğu ".repeat(20) }
                }))
            }
        };

        const { container } = render(
            <SheetRenderer 
                activityType={ActivityType.ALGORITHM_GENERATOR} 
                data={largeData as any} 
            />
        );

        const pages = container.querySelectorAll('.worksheet-page');
        // Based on getBlockWeight in SheetRenderer, 20 large text blocks should definitely split into multiple pages
        expect(pages.length).toBeGreaterThan(1);
    });
});
