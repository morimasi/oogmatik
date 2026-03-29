/**
 * Zorluk Göstergesi - Badge component for difficulty level
 */

import React from 'react';
import { Zorluk } from '../../../src/types/sinav';

interface ZorlukGostergesiProps {
  zorluk: Zorluk;
  className?: string;
}

export const ZorlukGostergesi: React.FC<ZorlukGostergesiProps> = ({ zorluk, className = '' }) => {
  const getBadgeStyles = (): string => {
    switch (zorluk) {
      case 'Kolay':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Zor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()} ${className}`}
    >
      {zorluk}
    </span>
  );
};
