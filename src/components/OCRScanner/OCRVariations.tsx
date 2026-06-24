import React from 'react';
import { VariationResultsView } from '../VariationResultsView';

interface OCRVariationsProps {
  variationResults: any;
  onBack: () => void;
  onAddToWorksheet: (variation: any) => void;
}

export const OCRVariations = ({ variationResults, onBack, onAddToWorksheet }: OCRVariationsProps) => {
  return (
    <VariationResultsView
      variations={variationResults.variations}
      metadata={variationResults.metadata}
      onBack={onBack}
      onAddToWorksheet={onAddToWorksheet}
    />
  );
};
