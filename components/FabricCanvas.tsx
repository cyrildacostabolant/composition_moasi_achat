import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { styleImportedImage } from '../utils/canvasUtils';
import { ToolType } from '../types';

interface FabricCanvasProps {
  id: string;
  width: number;
  height: number;
  isActive: boolean;
  selectedTool: ToolType;
  strokeColor: string;
  strokeWidth: number;
  onReady: (canvas: fabric.Canvas) => void;
  onActivate: () => void;
  onToolFinished: () => void;
}

const FabricCanvas: React.FC<FabricCanvasProps> = ({ 
  width, 
  height, 
  isActive, 
  selectedTool,
  strokeColor,
  strokeWidth,
  onReady,
  onActivate,
  onToolFinished
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  
  const isDrawingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });
  const activeObjRef = useRef<any>(null);
  const arrowHeadRef = useRef<fabric.Triangle | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: 'white',
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;
    onReady(canvas);

    canvas.on('mouse:down', (options) => {
      onActivate();
      
      if (selectedTool === 'select') return;

      isDrawingRef.current = true;
      // Utilisation de getScenePoint pour Fabric.js v6+
      const pointer = canvas.getScenePoint(options.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      if (selectedTool === 'rect') {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          selectable: false
        });
        activeObjRef.current = rect;
        canvas.add(rect);
      } else if (selectedTool === 'arrow') {
        const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          selectable: false
        });
        
        const triangle = new fabric.Triangle({
          width: 15 + strokeWidth * 2,
          height: 15 + strokeWidth * 2,
          fill: strokeColor,
          originX: 'center',
          originY: 'center',
          selectable: false,
          visible: false
        });

        activeObjRef.current = line;
        arrowHeadRef.current = triangle;
        canvas.add(line, triangle);
      }
    });

    canvas.on('mouse:move', (options) => {
      if (!isDrawingRef.current || !activeObjRef.current) return;
      
      const pointer = canvas.getScenePoint(options.e);
      const startX = startPointRef.current.x;
      const startY = startPointRef.current.y;

      if (selectedTool === 'rect') {
        const rect = activeObjRef.current as fabric.Rect;
        rect.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(startX - pointer.x),
          height: Math.abs(startY - pointer.y)
        });
      } else if (selectedTool === 'arrow') {
        const line = activeObjRef.current as fabric.Line;
        line.set({ x2: pointer.x, y2: pointer.y });

        const triangle = arrowHeadRef.current;
        if (triangle) {
          const dx = pointer.x - startX;
          const dy = pointer.y - startY;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          
          triangle.set({
            left: pointer.x,
            top: pointer.y,
            angle: angle + 90,
            visible: true
          });
        }
      }
      
      canvas.requestRenderAll();
    });

    canvas.on('mouse:up', () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (selectedTool === 'arrow' && activeObjRef.current && arrowHeadRef.current) {
        const line = activeObjRef.current;
        const triangle = arrowHeadRef.current;
        canvas.remove(line, triangle);
        
        const group = new fabric.Group([line, triangle], {
          selectable: true,
          hasControls: true
        });
        canvas.add(group);
        canvas.setActiveObject(group);
      } else if (activeObjRef.current) {
        activeObjRef.current.set({ selectable: true });
        canvas.setActiveObject(activeObjRef.current);
      }

      activeObjRef.current = null;
      arrowHeadRef.current = null;
      canvas.requestRenderAll();
      onToolFinished(); // Repasse l'outil sur 'select'
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTool, strokeColor, strokeWidth, width, height]);

  // Gestion du curseur et de la sélection selon l'outil
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    if (selectedTool !== 'select') {
      canvas.defaultCursor = 'crosshair';
      canvas.selection = false;
      canvas.getObjects().forEach(obj => { obj.selectable = false; });
    } else {
      canvas.defaultCursor = 'default';
      canvas.selection = true;
      canvas.getObjects().forEach(obj => { obj.selectable = true; });
    }
  }, [selectedTool]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isActive || !fabricRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (!blob) continue;
          const reader = new FileReader();
          reader.onload = (event) => {
            const imgObj = new Image();
            imgObj.src = event.target?.result as string;
            imgObj.onload = async () => {
              const image = new fabric.Image(imgObj);
              styleImportedImage(image);
              if (image.width! > width / 2) image.scaleToWidth(width / 2);
              image.set({ left: width / 2, top: height / 2, originX: 'center', originY: 'center' });
              fabricRef.current?.add(image);
              fabricRef.current?.setActiveObject(image);
            };
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isActive, width, height]);

  return (
    <div 
      className={`relative shadow-lg mb-8 transition-all duration-200 ${isActive ? 'ring-4 ring-blue-400' : 'ring-1 ring-gray-300'}`}
      style={{ width, height }}
      onClick={onActivate}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default FabricCanvas;