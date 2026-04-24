export interface PageData {
  id: string;
  canvasInstance: any | null; // fabric.Canvas
}

export type ToolType = 'select' | 'arrow' | 'rect' | 'text';

export interface AppState {
  headerColor: string;
  headerTitle: string;
  strokeColor: string;
  strokeWidth: number;
  selectedTool: ToolType;
}

export interface HeaderProps {
  color: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  logoBase64: string;
}

export interface CanvasProps {
  pageId: string;
  width: number;
  height: number;
  isActive: boolean;
  onCanvasReady: (id: string, canvas: any) => void;
  selectedTool: ToolType;
  strokeColor: string;
  strokeWidth: number;
  onActivate: () => void;
}
