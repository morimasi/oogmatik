import { useState } from 'react';
import type { FactoryComponent } from '@/types/activityStudio';

export function useComponentFactory(initial: FactoryComponent[] = []) {
  const [components, setComponents] = useState<FactoryComponent[]>(initial);

  const add = (component: FactoryComponent) => setComponents((prev) => [...prev, component]);
  const remove = (id: string) => setComponents((prev) => prev.filter((component) => component.id !== id));
  const clear = () => setComponents([]);

  return {
    components,
    setComponents,
    add,
    remove,
    clear,
  };
}
