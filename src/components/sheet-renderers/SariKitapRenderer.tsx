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
  const content = item.content || item._originalContent || item;
  const config = item.config || (item.typography ? item : {});
  
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
      
      {/* Optional: Add pedagogical note if available in wrapper */}
      {content.pedagogicalNote && (
         <div className="mt-8 pt-4 border-l-4 border-indigo-500 pl-4 bg-indigo-50/50 py-2 rounded-r-lg">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Pedagojik Not</span>
            <p className="text-xs text-gray-600 italic leading-relaxed">{content.pedagogicalNote}</p>
         </div>
      )}
    </div>
  );
};
