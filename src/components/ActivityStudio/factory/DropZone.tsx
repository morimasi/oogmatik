import React from 'react';
import type { FactoryComponent } from '@/types/activityStudio';

interface DropZoneProps {
  components: FactoryComponent[];
  onRemove: (id: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ components, onRemove }) => {
  return (
    <div className="min-h-40 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-paper)] p-3">
      {components.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Bilesen eklemek icin soldaki paleti kullanin.</p>
      ) : (
        <ul className="space-y-2">
          {components.map((component) => (
            <li key={component.id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-white px-3 py-2">
              <span className="text-sm text-[var(--text-primary)]">{component.type}</span>
              <button type="button" onClick={() => onRemove(component.id)} className="text-xs text-red-600">
                Kaldir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
