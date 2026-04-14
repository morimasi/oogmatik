import React from 'react';
import type { FactoryBlockType, FactoryComponent } from '@/types/activityStudio';
import { ComponentPalette } from './ComponentPalette';
import { DropZone } from './DropZone';

interface ComponentFactoryProps {
  components: FactoryComponent[];
  onChange: (components: FactoryComponent[]) => void;
}

export const ComponentFactory: React.FC<ComponentFactoryProps> = ({ components, onChange }) => {
  const handleAdd = (type: FactoryBlockType) => {
    const next: FactoryComponent = {
      id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      order: components.length,
      content: {},
      style: {},
      isLocked: false,
    };
    onChange([...components, next]);
  };

  const handleRemove = (id: string) => {
    onChange(components.filter((component) => component.id !== id));
  };

    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="h-1 w-4 rounded-full bg-amber-500"></div>
        <h4 className="text-sm font-black font-['Lexend'] text-zinc-400 uppercase tracking-widest">Bileşen Fabrikası</h4>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ComponentPalette onAdd={handleAdd} />
        <DropZone components={components} onRemove={handleRemove} />
      </div>
    </div>
};
