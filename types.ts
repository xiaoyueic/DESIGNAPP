export type ElementType = 'text' | 'image' | 'rectangle' | 'circle';

export interface ElementFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  blur: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // For text or image URL
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string; // italic
  textDecoration?: string; // underline, line-through
  textAlign?: 'left' | 'center' | 'right';
  rotation: number;
  zIndex: number;
  opacity?: number;
  border?: string;
  locked?: boolean;
  filters?: ElementFilters;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementId: string | null;
  initialElementX: number;
  initialElementY: number;
}

export interface ResizeState {
  isResizing: boolean;
  startX: number;
  startY: number;
  elementId: string | null;
  initialWidth: number;
  initialHeight: number;
  initialRotation: number;
  handle: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | 'rot' | null; 
  centerX?: number;
  centerY?: number;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  elementId: string | null;
}