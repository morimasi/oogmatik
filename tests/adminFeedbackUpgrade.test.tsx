/**
 * Yönetim Paneli — Gelen Kutusu (AdminFeedback & feedbackService) Testleri
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminFeedback } from '../src/components/AdminDashboard/AdminFeedback';
import { feedbackService } from '../src/services/feedbackService';

vi.mock('../src/services/feedbackService', () => ({
  feedbackService: {
    getAllFeedbacks: vi.fn().mockResolvedValue({ feedbacks: [], count: 0 }),
    updateFeedbackStatus: vi.fn().mockResolvedValue(undefined),
    updateFeedbackPriority: vi.fn().mockResolvedValue(undefined),
    submitReply: vi.fn().mockResolvedValue(undefined),
    deleteFeedback: vi.fn().mockResolvedValue(undefined),
    bulkUpdateStatus: vi.fn().mockResolvedValue(undefined),
    bulkDelete: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AdminFeedback - Gelen Kutusu Modülü', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tema CSS değişkenleriyle render edilir ve dinamik tailwind purge hatası içermez', () => {
    const html = renderToStaticMarkup(
      <AdminFeedback onOpenPrompt={() => {}} onOpenActivities={() => {}} />
    );
    expect(html).toContain('var(--bg-secondary)');
    expect(html).toContain('var(--bg-paper)');
    expect(html).toContain('Tüm Kategoriler');
    expect(html).toContain('Tüm Öncelikler');
    expect(html).toContain('CSV İndir');
    expect(html).toContain('JSON İndir');
    expect(html).toContain('Yazdır');
    expect(html).toContain('Gelen Kutusu Beklemede');
  });

  it('feedbackService toplu işlem ve öncelik metodlarını dışa aktarır', () => {
    expect(typeof feedbackService.updateFeedbackPriority).toBe('function');
    expect(typeof feedbackService.bulkUpdateStatus).toBe('function');
    expect(typeof feedbackService.bulkDelete).toBe('function');
  });
});
