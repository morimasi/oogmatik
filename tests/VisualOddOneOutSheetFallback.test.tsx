import React from 'react'
import { render, screen } from '@testing-library/react'
import { VisualOddOneOutSheet } from '../src/components/sheets/visual/VisualOddOneOutSheet'

const data: any = { rows: [], settings: {}};

describe('VisualOddOneOutSheet fallback', () => {
  test('shows informative message on invalid data', () => {
    render(<VisualOddOneOutSheet data={data} />)
    expect(screen.getByText(/Geçersiz infografik verisi/)).toBeInTheDocument()
  })
})
