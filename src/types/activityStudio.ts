// Compatibility types for InfographicRenderer and A4Editor
export interface ContentBlock {
  id: string;
  type: string;
  content: unknown;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  style?: Record<string, unknown>;
}

export interface ThemeConfig {
  textColor?: string;
  accentColor?: string;
  bgColor?: string;
  fontFamily?: string;
}

export interface CompactA4Config {
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
}
