
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
  groupId?: string; 
  name?: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  
  // Fill & Stroke
  backgroundColor?: string; // Hex or Gradient string
  color?: string; // Text color
  
  // Border & Corners
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  
  // Text specific
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'none';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  
  // Transform
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  
  zIndex: number;
  opacity?: number;
  locked?: boolean;
  filters?: ElementFilters;
  
  // Legacy
  border?: string; 
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  background?: string;
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
  mode: 'move' | 'select' | 'pan';
  startX: number;
  startY: number;
  initialPositions: Record<string, { x: number; y: number }>;
  selectionRect?: { x: number; y: number; width: number; height: number };
}

export interface ResizeState {
  isResizing: boolean;
  startX: number;
  startY: number;
  initialBounds: { x: number; y: number; width: number; height: number };
  initialElements: Record<string, { x: number; y: number; width: number; height: number; fontSize?: number }>;
  handle: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | 'rot'; 
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  elementId: string | null;
  groupId: string | null;
}

export interface SnapGuide {
    type: 'vertical' | 'horizontal';
    position: number;
    start?: number; // Optional start coordinate for the line
    end?: number;   // Optional end coordinate for the line
}

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg' | 'json';

export interface ResizePreset {
    id: string;
    name: string;
    width: number;
    height: number;
    unit: 'px' | 'cm' | 'mm' | 'in';
    category: string;
}

export type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeType = 'horizontal' | 'vertical';
export type LayerOrderType = 'front' | 'back' | 'forward' | 'backward';
