import React from 'react'
import { render, screen } from '@testing-library/react'
import { FindTheDifferenceSheet } from '../src/components/sheets/visual/FindTheDifferenceSheet'

describe('FindTheDifferenceSheet fallback', () => {
  test('shows informative message on invalid data', () => {
    const data: any = { gridA: [], gridB: [], rows: [] };
    render(<FindTheDifferenceSheet data={data as any} />)
    expect(screen.getByText(/Geçersiz infografik verisi veya boş içerik./)).toBeInTheDocument()
  })
})
