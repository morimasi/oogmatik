import { useEffect, useState } from 'react';
import { CompactLayoutConfig } from '../services/layout/CompactLayoutEngine';

export function useDebouncedLayoutUpdate(
  config: CompactLayoutConfig,
  delay: number = 300
): CompactLayoutConfig {
  const [debouncedConfig, setDebouncedConfig] = useState(config);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedConfig(config);
    }, delay);

    return () => clearTimeout(timeout);
  }, [config, delay]);

  return debouncedConfig;
}
