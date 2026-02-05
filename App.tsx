import React, { useState, useRef, useCallback } from 'react';
import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Plus, 
  Download, 
  FileImage, 
  MousePointer2, 
  MoveUpRight, 
  Square, 
  Type, 
  Palette,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';

import Header from './components/Header';
import FabricCanvas from './components/FabricCanvas';
import { PageData, ToolType } from './types';
import { A4_WIDTH, A4_HEIGHT, LOGO_BASE64_CLEAN, DEFAULT_HEADER_COLOR, DEFAULT_STROKE_COLOR, DEFAULT_STROKE_WIDTH } from './constants';
import { addTextZone } from './utils/canvasUtils';

const App: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([{ id: 'page-1', canvasInstance: null }]);
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [headerTitle, setHeaderTitle] = useState("TITRE DU DOCUMENT");
  const [headerColor, setHeaderColor] = useState(DEFAULT_HEADER_COLOR);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [strokeColor, setStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [zoom, setZoom] = useState(0.8); // 80% par défaut pour voir la page entière

  const handleAddPage = () => {
    const newId = `page-${Date.now()}`;
    setPages(prev => [...prev, { id: newId, canvasInstance: null }]);
    setActivePageId(newId);
  };

  const handleCanvasReady = useCallback((id: string, canvas: fabric.Canvas) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, canvasInstance: canvas } : p));
  }, []);

  const handleToolClick = (tool: ToolType) => {
    setSelectedTool(tool);
    
    if (tool === 'text') {
        const activePage = pages.find(p => p.id === activePageId);
        if (activePage && activePage.canvasInstance) {
            addTextZone(activePage.canvasInstance as fabric.Canvas, strokeColor);
            setSelectedTool('select');
        }
    }
  };

  const deleteSelectedObject = () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage || !activePage.canvasInstance) return;
    const canvas = activePage.canvasInstance as fabric.Canvas;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.requestRenderAll();
    }
  };

  const generateFilename = (ext: string) => {
    const sanitizedTitle = headerTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitizedTitle || 'document'}.${ext}`;
  };

  const handleExportJPG = async () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage || !activePage.canvasInstance) return;
    const element = document.getElementById(`print-container-${activePage.id}`);
    if (element) {
        // Pour l'export, on s'assure que l'élément est capturé à son échelle réelle (1:1)
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff', 
            logging: false,
            onclone: (clonedDoc) => {
                const clonedEl = clonedDoc.getElementById(`print-container-${activePage.id}`);
                if (clonedEl) {
                    clonedEl.style.transform = 'none';
                }
            }
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = generateFilename('jpg');
        link.click();
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (i > 0) doc.addPage();
        const element = document.getElementById(`print-container-${page.id}`);
        if (element) {
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true, 
                logging: false, 
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.getElementById(`print-container-${page.id}`);
                    if (clonedEl) {
                        clonedEl.style.transform = 'none';
                    }
                }
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
    }
    doc.save(generateFilename('pdf'));
  };

  const handleZoom = (factor: number) => {
    if (factor === 1) {
        setZoom(1);
    } else {
        setZoom(prev => Math.min(Math.max(0.25, prev + factor), 2));
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        const activePage = pages.find(p => p.id === activePageId);
        const canvas = activePage?.canvasInstance;
        const activeObj = canvas?.getActiveObject();
        if(activeObj && (activeObj as any).isEditing) return;
        if (!isInput) deleteSelectedObject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageId, pages]);

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      <div className="h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-700 hidden lg:block uppercase tracking-tight">MOASI Achats</h1>
            <div className="h-8 w-px bg-gray-300 mx-1"></div>
            
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => handleToolClick('select')} className={`p-2 rounded ${selectedTool === 'select' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`} title="Sélectionner"><MousePointer2 size={18} /></button>
                <button onClick={() => handleToolClick('arrow')} className={`p-2 rounded ${selectedTool === 'arrow' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`} title="Tracer Flèche"><MoveUpRight size={18} /></button>
                <button onClick={() => handleToolClick('rect')} className={`p-2 rounded ${selectedTool === 'rect' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`} title="Tracer Cadre"><Square size={18} /></button>
                <button onClick={() => handleToolClick('text')} className={`p-2 rounded ${selectedTool === 'text' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`} title="Ajouter Texte"><Type size={18} /></button>
            </div>

            <div className="h-8 w-px bg-gray-300 mx-1"></div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => handleZoom(-0.1)} className="p-2 rounded text-gray-500 hover:bg-gray-200" title="Dézoomer"><ZoomOut size={18} /></button>
                <span className="text-[10px] font-bold w-10 text-center text-gray-600">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-2 rounded text-gray-500 hover:bg-gray-200" title="Zoomer"><ZoomIn size={18} /></button>
                <button onClick={() => handleZoom(1)} className="p-2 rounded text-gray-500 hover:bg-gray-200 border-l border-gray-200 ml-1 pl-3" title="Zoom 100%"><Maximize size={16} /></button>
            </div>

            <div className="h-8 w-px bg-gray-300 mx-1"></div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0" title="Couleur de trait" />
                </div>
                <div className="flex flex-col w-20 hidden md:flex">
                     <input type="range" min="1" max="10" value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} className="h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                </div>
            </div>
            <button onClick={deleteSelectedObject} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Supprimer la sélection"><Trash2 size={18} /></button>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2 border-r pr-3">
                 <Palette size={16} className="text-gray-400" />
                 <input type="color" value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0" title="Couleur du bandeau" />
            </div>
            <button onClick={handleExportJPG} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"><FileImage size={14} /> JPG</button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-900 rounded hover:bg-opacity-90"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="flex-1 bg-gray-300 overflow-auto p-12 relative scroll-smooth">
         <div className="flex flex-col items-center gap-12 pb-32">
            {pages.map((page, index) => {
                const isPageOne = index === 0;
                const canvasHeight = isPageOne ? A4_HEIGHT - 140 : A4_HEIGHT;
                
                return (
                    <div 
                      key={page.id}
                      style={{ 
                          width: A4_WIDTH * zoom, 
                          height: A4_HEIGHT * zoom,
                          transition: 'width 0.2s ease-out, height 0.2s ease-out'
                      }}
                      className="relative shrink-0"
                    >
                        <div 
                          id={`print-container-${page.id}`} 
                          className={`bg-white shadow-2xl flex flex-col absolute top-0 left-0 origin-top-left transition-transform duration-200 ${activePageId === page.id ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-gray-300' : ''}`} 
                          style={{ 
                            width: A4_WIDTH, 
                            height: A4_HEIGHT,
                            transform: `scale(${zoom})`,
                          }} 
                          onClick={() => setActivePageId(page.id)}
                        >
                            {isPageOne && <Header id={`header-${page.id}`} color={headerColor} title={headerTitle} onTitleChange={setHeaderTitle} />}
                            <FabricCanvas 
                                id={page.id} 
                                width={A4_WIDTH} 
                                height={canvasHeight} 
                                isActive={activePageId === page.id} 
                                selectedTool={selectedTool}
                                strokeColor={strokeColor}
                                strokeWidth={strokeWidth}
                                onReady={(canvas) => handleCanvasReady(page.id, canvas)} 
                                onActivate={() => setActivePageId(page.id)} 
                                onToolFinished={() => setSelectedTool('select')}
                            />
                        </div>
                    </div>
                );
            })}
            <button onClick={handleAddPage} className="flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-full shadow-xl hover:text-blue-700 hover:scale-105 transition-all mb-10 font-bold border border-gray-100"><Plus size={24} /> Ajouter une page A4</button>
         </div>
      </div>
    </div>
  );
};

export default App;