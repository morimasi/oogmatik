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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ComponentPalette onAdd={handleAdd} />
      <DropZone components={components} onRemove={handleRemove} />
    </div>
  );
};
