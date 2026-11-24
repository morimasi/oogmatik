/**
 * Yönetim Paneli — İçerik Motoru, Aktivite Yöneticisi ve Prompt Stüdyosu Testleri
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminContentEngine } from '../src/components/AdminDashboard/AdminContentEngine';
import { AdminActivityManager } from '../src/components/AdminDashboard/AdminActivityManager';
import { AdminPromptStudio } from '../src/components/AdminDashboard/AdminPromptStudio';
import { PromptSimulator } from '../src/components/AdminDashboard/PromptSimulator';
import type { PromptTemplate } from '../src/types/admin';

vi.mock('../src/services/adminService', () => ({
  adminService: {
    getAllActivities: vi.fn().mockResolvedValue([]),
    getAllPrompts: vi.fn().mockResolvedValue([]),
    getAllDrafts: vi.fn().mockResolvedValue([]),
    getAllSnippets: vi.fn().mockResolvedValue([]),
    getAdminMetrics: vi.fn().mockResolvedValue({
      totalUsers: 10,
      activeUsers: 8,
      totalWorksheets: 42,
      exportsToday: 5,
    }),
    getInitialPromptForActivity: vi.fn((id: string) => `[GÖREV: ${id}]\n{{blueprint}}`),
  },
}));

vi.mock('../src/services/statsService', () => ({
  statsService: {
    getAllStats: vi.fn().mockResolvedValue([]),
  },
}));

describe('Yönetim Paneli 3 Ana Modül Doğrulaması', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AdminContentEngine: tema değişkenleriyle render edilir ve sahte mock logları içermez', () => {
    const html = renderToStaticMarkup(<AdminContentEngine onNavigateTab={() => {}} />);
    expect(html).toContain('İçerik Motoru');
    expect(html).toContain('var(--bg-secondary)');
    expect(html).not.toContain('gen_001');
    expect(html).not.toContain('temsilî');
    expect(html).toContain('JSON Rapor');
    expect(html).toContain('Yazdır');
  });

  it('AdminActivityManager: filtreler, Yeni ve AI Denetim butonlarıyla tema uyumlu render edilir', () => {
    const html = renderToStaticMarkup(<AdminActivityManager onOpenPrompt={() => {}} />);
    expect(html).toContain('Aktivite adı, ID veya açıklama ara...');
    expect(html).toContain('AI Denetim');
    expect(html).toContain('Yeni');
    expect(html).toContain('var(--bg-secondary)');
  });

  it('AdminPromptStudio: tema uyumlu ve Sinir Ağları gezgini ile render edilir', () => {
    const html = renderToStaticMarkup(<AdminPromptStudio initialActivityId={null} />);
    expect(html).toContain('Sinir Ağları');
    expect(html).toContain('Kognitif Mimari Laboratuvarı');
    expect(html).toContain('var(--bg-paper)');
  });

  it('PromptSimulator: klinik ön-doldurma ve 3x kararlılık testi butonlarını render eder', () => {
    const mockPrompt: PromptTemplate = {
      id: 'prompt_math_puzzle',
      name: 'Matematik Bulmaca',
      description: '',
      category: 'math',
      systemInstruction: 'Özel eğitim uzmanı',
      template: 'Konu: {{topic}}, Yaş: {{ageGroup}}, Zorluk: {{difficulty}}',
      variables: ['topic', 'ageGroup', 'difficulty'],
      tags: [],
      updatedAt: new Date().toISOString(),
      version: 1,
      history: [],
      modelConfig: { temperature: 0.1, modelName: 'gemini-3.8-flash', thinkingBudget: 0 },
    };

    const html = renderToStaticMarkup(<PromptSimulator prompt={mockPrompt} />);
    expect(html).toContain('Simülasyonu Başlat');
    expect(html).toContain('3x Kararlılık (Stress) Testi');
    expect(html).toContain('Canlı Önizleme');
  });
});
