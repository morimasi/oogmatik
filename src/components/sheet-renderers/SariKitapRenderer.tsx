import React from 'react';
import { getModule } from '../SariKitapStudio/registry';
import { ErrorBoundary } from '../ErrorBoundary';
import { ActivityType } from '../../types/activity';
import { TeacherNoteCard } from '../sheets/common';

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
  const pedagogicalNote = item.pedagogicalNote || item.content?.pedagogicalNote || 'Sarı Kitap özel eğitim modülü: Bilişsel ve motor odaklı öğrenme materyali.';
  const targetSkills = item.targetSkills || item.content?.targetSkills || ['Görsel Algı', 'Dikkat'];

  return (
    <div className="sari-kitap-render-container w-full flex flex-col justify-between" style={{ minHeight: '200px' }}>
      <ErrorBoundary>
        <Renderer config={config} content={content} />
      </ErrorBoundary>
      {pedagogicalNote && (
        <div className="mt-4 pt-2">
          <TeacherNoteCard note={pedagogicalNote} />
        </div>
      )}
    </div>
  );
};
