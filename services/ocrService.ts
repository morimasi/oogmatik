
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    /**
     * Görseli analiz eder ve "Vektörel Mimari Blueprint" çıkarır.
     * Artık sadece metin değil, tablo yapıları ve SVG koordinatlarını da yakalar.
     */
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [GÖREV: MİMARİ KLONLAYICI - GRAFİK ANALİZ VE RE-DESIGN]
        Görüntüdeki materyali bir yazılım mimarı ve grafik tasarımcı gözüyle analiz et.
        
        ANALİZ ADIMLARI (THINKING):
        1. Uzamsal Düzen: Kağıtta kaç ana blok var? (Başlık, Tablo, Yan Sütun, Görsel Alan vb.)
        2. Veri Yapısı: Eğer bir bulmaca (Futoshiki, Sudoku) varsa, tam grid boyutunu (3x3, 4x4) ve hücre içeriğini tespit et.
        3. Vektörel Öğeler: Şekiller (üçgen, kare) veya özel grafikler varsa, bunları <path> d parametrelerine veya temel geometrik objelere dönüştür.
        4. Varyasyon Stratejisi: Yapıyı (iskeleti) koruyarak, içindeki sayıları/kelimeleri nasıl değiştirebileceğini planla.

        ÇIKTI (JSON BLOCKS):
        Yanıtın içindeki 'blocks' dizisi şu yapıları içerebilir:
        - { "type": "header", "content": "..." }
        - { "type": "grid", "content": { "rows": 4, "cols": 4, "cells": [...] } }
        - { "type": "table", "content": { "headers": [], "data": [][] } }
        - { "type": "svg_shape", "content": { "paths": ["d=..."], "viewBox": "..." } }
        - { "type": "dual_column", "content": { "left": [], "right": [] } }

        DİKKAT: Sadece açıklama üretme. Görseldeki tabloyu bir 'grid' veya 'table' objesi olarak KODLA.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                layoutArchitecture: {
                    type: Type.OBJECT,
                    properties: {
                        blocks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column'] },
                                    content: { type: Type.OBJECT },
                                    style: { type: Type.OBJECT }
                                },
                                required: ['type', 'content']
                            }
                        }
                    }
                },
                variationBlueprint: { type: Type.STRING, description: "Yeni verilerle üretim için AI yönergesi" }
            },
            required: ['detectedType', 'title', 'layoutArchitecture', 'variationBlueprint']
        };

        try {
            // Gemini 3 Pro Image (yoksa Flash) ile 16K Thinking Budget
            const result = await analyzeImage(base64Image, prompt, schema);
            
            return {
                rawText: result.description,
                detectedType: result.detectedType,
                title: result.title,
                description: result.description,
                generatedTemplate: result.variationBlueprint,
                structuredData: result, // Mimari burada saklanıyor
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Advanced Vision OCR Error:", error);
            throw error;
        }
    }
};
