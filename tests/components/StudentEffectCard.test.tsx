/**
 * @vitest-environment jsdom
 */
import { test, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentEffectCard } from '../../src/components/Student/StudentEffectCard';
import { Student } from '../../src/types';

const mockStudent: Student = {
  id: 'test-id',
  name: 'Ayşe Yılmaz',
  age: 9,
  grade: '3. Sınıf',
  diagnosis: ['Disleksi'],
  avatar: '',
  interests: [],
  notes: '',
  learningStyle: 'Görsel',
  parentName: '',
  contactPhone: '',
  contactEmail: '',
  strengths: [],
  weaknesses: [],
};

test('renders student name and details', () => {
  render(<StudentEffectCard student={mockStudent} />);
  expect(screen.getByText(/Ayşe Yılmaz/)).toBeInTheDocument();
  expect(screen.getByText('3. Sınıf')).toBeInTheDocument();
});

test('opens edit modal on edit button click', () => {
  render(<StudentEffectCard student={mockStudent} />);
  const editBtn = screen.getByRole('button', { name: /edit|düzenle/i });
  fireEvent.click(editBtn);
  expect(screen.getByText('Öğrenci Düzenle')).toBeInTheDocument();
});
