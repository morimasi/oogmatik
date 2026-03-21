
/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedStudentManager } from './AdvancedStudentManager';
import { StudentContext } from '../../context/StudentContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Student Data
const mockStudent = {
    id: '1',
    name: 'Test Öğrenci',
    grade: '2. Sınıf',
    avatar: 'avatar.png',
    age: 8,
    diagnosis: ['Disleksi'],
    interests: [],
    strengths: [],
    weaknesses: [],
    learningStyle: 'Görsel',
    createdAt: new Date().toISOString(),
    iep: { goals: [], status: 'draft' },
    academic: { metrics: { gpa: 85, homeworkCompletionRate: 90 }, grades: [] },
    financial: { balance: 100, transactions: [] }
};

const mockContextValue = {
    students: [mockStudent],
    activeStudent: mockStudent,
    setActiveStudent: vi.fn(),
    addStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
    isLoading: false,
};

describe('AdvancedStudentManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <StudentContext.Provider value={mockContextValue as any}>
                <AdvancedStudentManager onBack={vi.fn()} />
            </StudentContext.Provider>
        );
    };

    it('renders the student name and grade in sidebar', () => {
        renderComponent();
        expect(screen.getByText('Test Öğrenci')).toBeTruthy();
        expect(screen.getByText('2. Sınıf')).toBeTruthy();
    });

    it('switches to IEP module when clicked', () => {
        renderComponent();
        const iepButtons = screen.getAllByText('BEP / IEP');
        fireEvent.click(iepButtons[0]);

        expect(screen.getByText('Genel BEP Performansı')).toBeTruthy();
    });

    it('switches to Financial module when clicked', () => {
        renderComponent();
        const financialButtons = screen.getAllByText('Finans');
        fireEvent.click(financialButtons[0]);

        expect(screen.getByText('İşlem Geçmişi')).toBeTruthy();
        expect(screen.getByText('Toplam Bakiye')).toBeTruthy();
    });

    it('renders the Academic module when clicked', () => {
        renderComponent();
        const academicButtons = screen.getAllByText('Akademik');
        fireEvent.click(academicButtons[0]);

        expect(screen.getByText('Akademik Gelişim')).toBeTruthy();
        expect(screen.getByText('Genel Ortalama')).toBeTruthy();
    });
});
