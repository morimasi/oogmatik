
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedStudentManager } from './AdvancedStudentManager';
import { StudentContext } from '../../context/StudentContext';
import { describe, it, expect, vi } from 'vitest';

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
    createdAt: new Date().toISOString()
};

const mockContextValue = {
    students: [mockStudent],
    activeStudent: mockStudent,
    setActiveStudent: vi.fn(),
    addStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
    isLoading: false,
    error: null
};

describe('AdvancedStudentManager', () => {
    const renderComponent = () => {
        return render(
            <StudentContext.Provider value={mockContextValue as any}>
                <AdvancedStudentManager onBack={vi.fn()} />
            </StudentContext.Provider>
        );
    };

    it('renders the student name and grade in sidebar', () => {
        renderComponent();
        expect(screen.getByText('Test Öğrenci')).toBeInTheDocument();
        expect(screen.getByText('2. Sınıf')).toBeInTheDocument();
    });

    it('switches to IEP module when clicked', () => {
        renderComponent();
        const iepButton = screen.getByText('BEP / IEP');
        fireEvent.click(iepButton);
        expect(screen.getByText('Bireyselleştirilmiş Eğitim Programı')).toBeInTheDocument();
        expect(screen.getByText('Aktif Hedefler')).toBeInTheDocument();
    });

    it('switches to Financial module when clicked', () => {
        renderComponent();
        const financialButton = screen.getByText('Finans');
        fireEvent.click(financialButton);
        expect(screen.getByText('Finansal Durum')).toBeInTheDocument();
        expect(screen.getByText('Toplam Bakiye')).toBeInTheDocument();
    });

    it('shows placeholder for unimplemented modules', () => {
        renderComponent();
        const gradesButton = screen.getByText('Akademik');
        fireEvent.click(gradesButton);
        expect(screen.getByText('Geliştirme Aşamasında')).toBeInTheDocument();
    });
});
