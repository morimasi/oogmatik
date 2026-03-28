// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ExamStudio from '../src/components/ExamStudio';

describe('ExamStudio Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders ExamStudio title correctly', () => {
    render(<ExamStudio />);
    expect(screen.getByText('Türkçe Sınav Stüdyosu (Bilgi Macerası)')).toBeDefined();
  });

  it('renders configuration panel inputs', () => {
    render(<ExamStudio />);
    expect(screen.getByText('Sınav Yapılandırması')).toBeDefined();
    expect(screen.getByText('Sınıf Seviyesi (4-9)')).toBeDefined();
    expect(screen.getByText('Soru Sayısı')).toBeDefined();
    expect(screen.getByText('Çoktan Seçmeli')).toBeDefined();
  });

  it('renders layout settings panel', () => {
    render(<ExamStudio />);
    expect(screen.getByText('Sayfa ve Tablo Ayarları')).toBeDefined();
    expect(screen.getByText('Title Göster')).toBeDefined();
    expect(screen.getByText('Sütun Sayısı (Cols)')).toBeDefined();
  });

  it('updates state when toggling a question type', () => {
    render(<ExamStudio />);
    const tfCheckbox = screen.getByLabelText('Doğru-Yanlış') as HTMLInputElement;

    // Initially false because default is only 'multiple-choice'
    expect(tfCheckbox.checked).toBe(false);

    fireEvent.click(tfCheckbox);
    expect(tfCheckbox.checked).toBe(true);
  });
});
