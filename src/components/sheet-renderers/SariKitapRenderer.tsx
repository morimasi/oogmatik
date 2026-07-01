import React from 'react';
import { getModule } from '../SariKitapStudio/registry';
import { ErrorBoundary } from '../ErrorBoundary';
import { ActivityType } from '../../types/activity';

interface SariKitapRendererProps {
  data: any;
  settings?: any;
}

/**
 * SariKitapRenderer - Handles all modules from Sari Kitap Studio
 * Expects data to be the object saved from SariKitapStudio (containing content, config, etc.)
 */
export const SariKitapRenderer: React.FC<SariKitapRendererProps> = ({ data, settings }) => {
  // data might be wrapped in an array or direct object depending on how it was loaded
  const item = Array.isArray(data) ? data[0] : data;
  
  if (!item || !item.content) {
    return (
      <div className="p-8 text-center text-gray-400 italic">
        Sarı Kitap içeriği yüklenemedi.
      </div>
    );
  }

  const activeType = item.type || item.activeType;
  const content = item.content;
  const config = item.config || {};
  
  const activeModule = getModule(activeType);
  
  if (!activeModule) {
    return (
      <div className="p-8 text-center text-red-400 italic">
        Bilinmeyen Sarı Kitap Modülü: {activeType}
      </div>
    );
  }

  const Renderer = activeModule.Renderer;

  return (
    <div className="sari-kitap-render-container w-full" style={{ minHeight: '200px' }}>
      <ErrorBoundary>
        <Renderer config={config} content={content} />
      </ErrorBoundary>
      
    </div>
  );
};
