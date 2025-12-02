import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import ChatInterface from './components/ChatInterface';
import ElementNode from './components/ElementNode';
import ContextMenu from './components/ContextMenu';
import { CanvasElement, ElementType, DragState, ResizeState, CanvasConfig, ContextMenuState } from './types';
import { MousePointer2, ZoomIn, ZoomOut, Download, Undo2, Redo2, Layout, Monitor, Smartphone, FileImage, Menu, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  // State
  const [history, setHistory] = useState<{ elements: CanvasElement[] }[]>([{ elements: [] }]);
  const [historyStep, setHistoryStep] = useState(0);
  
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      name: 'Untitled Design'
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, elementId: null });
  const [isExporting, setIsExporting] = useState(false);
  const [showResizeMenu, setShowResizeMenu] = useState(false);

  // Derived state
  const currentElements = history[historyStep].elements;
  const selectedElement = currentElements.find(el => el.id === selectedId) || null;
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>({ isDragging: false, startX: 0, startY: 0, elementId: null, initialElementX: 0, initialElementY: 0 });
  const resizeRef = useRef<ResizeState>({ isResizing: false, startX: 0, startY: 0, elementId: null, initialWidth: 0, initialHeight: 0, initialRotation: 0, handle: null, centerX: 0, centerY: 0 });
  const clipboardRef = useRef<CanvasElement | null>(null);

  // --- HISTORY & STATE MANAGEMENT ---

  const pushToHistory = useCallback((newElements: CanvasElement[]) => {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push({ elements: newElements });
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  const undo = useCallback(() => {
      if (historyStep > 0) {
          setHistoryStep(prev => prev - 1);
          setSelectedId(null);
      }
  }, [historyStep]);

  const redo = useCallback(() => {
      if (historyStep < history.length - 1) {
          setHistoryStep(prev => prev + 1);
          setSelectedId(null);
      }
  }, [historyStep, history.length]);

  // --- ACTIONS ---

  const addElement = (type: ElementType, content: string = '', styleOverrides: any = {}) => {
    const id = Date.now().toString();
    const defaults = {
        text: { width: 300, height: 60, fontSize: 32, content: content || 'Add text' },
        rectangle: { width: 200, height: 200, backgroundColor: '#3b82f6' },
        circle: { width: 200, height: 200, backgroundColor: '#8b5cf6' },
        image: { width: 300, height: 300, content: content || 'https://picsum.photos/300/300' }
    };
    const base = defaults[type];
    const newElement: CanvasElement = {
      id, type,
      x: canvasConfig.width / 2 - (base.width / 2),
      y: canvasConfig.height / 2 - (base.height / 2),
      rotation: 0, zIndex: currentElements.length + 1,
      color: '#000000', opacity: 1,
      ...base, ...styleOverrides
    };
    pushToHistory([...currentElements, newElement]);
    setSelectedId(id);
  };

  const applyTemplate = (templateElements: CanvasElement[]) => {
      const newElements = templateElements.map(el => ({
          ...el,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));
      pushToHistory(newElements);
      setSelectedId(null);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = currentElements.map(el => el.id === id ? { ...el, ...updates } : el);
    pushToHistory(updated);
  };

  const updateElementImmediate = (id: string, updates: Partial<CanvasElement>) => {
      const newHistory = [...history];
      newHistory[historyStep] = { 
          elements: currentElements.map(el => el.id === id ? { ...el, ...updates } : el)
      };
      setHistory(newHistory);
  };

  const deleteElement = useCallback((id: string) => {
    pushToHistory(currentElements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [currentElements, selectedId, pushToHistory]);

  const duplicateElement = useCallback((id: string) => {
      const el = currentElements.find(e => e.id === id);
      if(el) {
          const newId = Date.now().toString();
          const newEl = {...el, id: newId, x: el.x + 20, y: el.y + 20, zIndex: currentElements.length + 1};
          pushToHistory([...currentElements, newEl]);
          setSelectedId(newId);
      }
  }, [currentElements, pushToHistory]);

  const handleCopy = useCallback(() => {
    if (selectedElement) {
      clipboardRef.current = selectedElement;
    }
  }, [selectedElement]);

  const handlePaste = useCallback(() => {
    if (clipboardRef.current) {
        const newId = Date.now().toString();
        const newEl = {
            ...clipboardRef.current, 
            id: newId, 
            x: clipboardRef.current.x + 30, 
            y: clipboardRef.current.y + 30,
            zIndex: currentElements.length + 1
        };
        pushToHistory([...currentElements, newEl]);
        setSelectedId(newId);
    }
  }, [currentElements, pushToHistory]);

  const handleResizeCanvas = (width: number, height: number, name: string) => {
      setCanvasConfig(prev => ({ ...prev, width, height, name }));
      setShowResizeMenu(false);
  };

  const handleExport = async () => {
      if (!canvasRef.current) return;
      setIsExporting(true);
      setSelectedId(null);
      setTimeout(async () => {
          try {
              const canvas = await html2canvas(canvasRef.current!, {
                  useCORS: true, scale: 2, backgroundColor: canvasConfig.backgroundColor
              });
              const link = document.createElement('a');
              link.download = `${canvasConfig.name}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
          } catch (e) {
              console.error("Export failed", e);
              alert("Export failed. Note: External images without CORS headers cannot be exported.");
          } finally {
              setIsExporting(false);
          }
      }, 100);
  };

  // --- INTERACTION HANDLERS ---

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string | null, action: 'drag' | 'resize' | 'rotate' | 'select', handle?: string) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    if (action === 'select' && id === null) {
      setSelectedId(null);
      return;
    }

    if (!id) return;
    
    e.stopPropagation();
    setSelectedId(id);

    const element = currentElements.find(el => el.id === id);
    if (!element || element.locked) return; // Prevent drag/resize if locked

    if (action === 'drag') {
      dragRef.current = {
        isDragging: true, startX: e.clientX, startY: e.clientY, elementId: id,
        initialElementX: element.x, initialElementY: element.y
      };
    } else if (action === 'resize' && handle) {
      resizeRef.current = {
        isResizing: true, startX: e.clientX, startY: e.clientY, elementId: id,
        initialWidth: element.width, initialHeight: element.height, initialRotation: element.rotation,
        handle: handle as any
      };
    } else if (action === 'rotate') {
       resizeRef.current = {
           isResizing: true, startX: e.clientX, startY: e.clientY, elementId: id,
           initialWidth: 0, initialHeight: 0, initialRotation: element.rotation, handle: 'rot',
           centerX: element.x + element.width / 2, centerY: element.y + element.height / 2
       }
    }
  }, [currentElements, contextMenu]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // DRAG
    if (dragRef.current.isDragging && dragRef.current.elementId) {
      const dx = (e.clientX - dragRef.current.startX) / zoom;
      const dy = (e.clientY - dragRef.current.startY) / zoom;
      updateElementImmediate(dragRef.current.elementId, {
        x: dragRef.current.initialElementX + dx,
        y: dragRef.current.initialElementY + dy
      });
    }
    // RESIZE & ROTATE
    if (resizeRef.current.isResizing && resizeRef.current.elementId) {
      const el = currentElements.find(item => item.id === resizeRef.current.elementId);
      if(!el) return;
      const handle = resizeRef.current.handle;

      if (handle === 'rot') {
          if(canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              const centerX = rect.left + (el.x + el.width/2) * zoom;
              const centerY = rect.top + (el.y + el.height/2) * zoom;
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
              updateElementImmediate(el.id, { rotation: angle + 90 }); 
          }
      } else {
        const dx = (e.clientX - resizeRef.current.startX) / zoom;
        const dy = (e.clientY - resizeRef.current.startY) / zoom;
        let newWidth = resizeRef.current.initialWidth;
        let newHeight = resizeRef.current.initialHeight;
        let newX = el.x;
        let newY = el.y;

        if (handle?.includes('e')) newWidth += dx;
        if (handle?.includes('w')) { newWidth -= dx; newX += dx; }
        if (handle?.includes('s')) newHeight += dy;
        if (handle?.includes('n')) { newHeight -= dy; newY += dy; }

        updateElementImmediate(el.id, {
            width: Math.max(10, newWidth),
            height: Math.max(10, newHeight),
            x: newX, y: newY
        });
      }
    }
  }, [zoom, currentElements, historyStep]);

  const handleMouseUp = useCallback(() => {
    if (dragRef.current.isDragging || resizeRef.current.isResizing) {
        pushToHistory([...history[historyStep].elements]); 
    }
    dragRef.current.isDragging = false;
    resizeRef.current.isResizing = false;
  }, [history, historyStep, pushToHistory]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, elementId: selectedId });
  };

  // --- KEYBOARD SHORTCUTS ---

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Ignore shortcuts if user is typing in an input
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
              deleteElement(selectedId);
          }
          else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
              e.preventDefault();
              if (e.shiftKey) redo(); else undo();
          }
          else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
              e.preventDefault();
              redo();
          }
          else if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
              e.preventDefault();
              handleCopy();
          }
          else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
              e.preventDefault();
              handlePaste();
          }
          else if (selectedId) {
             const step = e.shiftKey ? 10 : 1;
             if (e.key === 'ArrowUp') { e.preventDefault(); updateElement(selectedId, { y: selectedElement!.y - step }); }
             if (e.key === 'ArrowDown') { e.preventDefault(); updateElement(selectedId, { y: selectedElement!.y + step }); }
             if (e.key === 'ArrowLeft') { e.preventDefault(); updateElement(selectedId, { x: selectedElement!.x - step }); }
             if (e.key === 'ArrowRight') { e.preventDefault(); updateElement(selectedId, { x: selectedElement!.x + step }); }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedElement, deleteElement, undo, redo, handleCopy, handlePaste]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* TOP HEADER - Professional White Theme */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shrink-0">
        <div className="flex items-center gap-4">
           {/* Logo Area */}
           <div className="flex items-center gap-2 text-indigo-600 mr-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Layout size={18} />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-800">DesignGenius</span>
           </div>

           <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

           {/* File Menu / Undo Redo */}
           <div className="flex items-center gap-1">
                <button onClick={undo} disabled={historyStep === 0} className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-30"><Undo2 size={18}/></button>
                <button onClick={redo} disabled={historyStep === history.length - 1} className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-30"><Redo2 size={18}/></button>
           </div>
           
           <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* Resize Dropdown */}
           <div className="relative">
              <button 
                onClick={() => setShowResizeMenu(!showResizeMenu)} 
                className="text-sm font-medium text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                {canvasConfig.name} 
                <span className="text-slate-400 text-xs px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 hidden lg:inline-block">{canvasConfig.width} × {canvasConfig.height}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showResizeMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                   <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Resize Canvas</div>
                   <button onClick={() => handleResizeCanvas(800, 600, 'Standard 4:3')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"><Monitor size={16} className="text-slate-400"/> Standard (800x600)</button>
                   <button onClick={() => handleResizeCanvas(1080, 1080, 'Instagram Post')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"><FileImage size={16} className="text-slate-400"/> Instagram Post (1080x1080)</button>
                   <button onClick={() => handleResizeCanvas(1080, 1920, 'TikTok Story')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"><Smartphone size={16} className="text-slate-400"/> TikTok Story (1080x1920)</button>
                   <button onClick={() => handleResizeCanvas(1920, 1080, 'Presentation')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"><Monitor size={16} className="text-slate-400"/> Presentation (1920x1080)</button>
                </div>
              )}
           </div>
        </div>
        
        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
           <div className="flex -space-x-2 items-center mr-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm cursor-help" title="John Doe">JD</div>
           </div>
          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:shadow-none">
             {isExporting ? 'Exporting...' : <><Download size={16} /> Download</>}
          </button>
        </div>
      </header>

      {/* SUB HEADER / CONTEXT BAR */}
      <div className="shrink-0 relative z-30">
          <PropertiesPanel 
            selectedElement={selectedElement}
            canvasConfig={canvasConfig}
            onUpdateElement={updateElement}
            onDelete={deleteElement}
            onDuplicate={duplicateElement}
          />
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar onAddElement={addElement} onApplyTemplate={applyTemplate} />

        {/* Canvas Area with Dot Grid */}
        <div 
            className="flex-1 bg-[#F3F4F6] overflow-auto relative flex items-center justify-center p-12 custom-scrollbar"
            style={{
                backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
            onMouseDown={(e) => handleMouseDown(e, null, 'select')}
            onContextMenu={handleContextMenu}
        >
          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-6 bg-white shadow-lg border border-slate-100 rounded-full px-4 py-2 flex items-center gap-3 z-30 transition-all hover:scale-105">
             <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-slate-500 hover:text-indigo-600 transition-colors"><ZoomOut size={16} /></button>
             <span className="text-xs font-medium w-8 text-center text-slate-700 select-none">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-slate-500 hover:text-indigo-600 transition-colors"><ZoomIn size={16} /></button>
          </div>

          {/* THE CANVAS */}
          <div 
             ref={canvasRef}
             style={{ 
                 width: canvasConfig.width, 
                 height: canvasConfig.height, 
                 transform: `scale(${zoom})`,
                 transformOrigin: 'center center',
                 backgroundColor: canvasConfig.backgroundColor
             }}
             className="shadow-xl relative shrink-0 transition-all duration-200 ease-out bg-white ring-1 ring-slate-900/5"
          >
             {currentElements.map(el => (
               <ElementNode
                 key={el.id}
                 element={el}
                 isSelected={selectedId === el.id}
                 onMouseDown={handleMouseDown}
                 onUpdate={updateElement}
               />
             ))}
             
             {currentElements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none select-none">
                    <div className="flex flex-col items-center gap-4 bg-white/50 p-8 rounded-2xl backdrop-blur-sm border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <MousePointer2 size={32} className="opacity-40 text-indigo-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Drag items from the sidebar to start designing</p>
                    </div>
                </div>
             )}
          </div>
        </div>
        
        <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onOpen={() => setIsChatOpen(true)} />

        {/* Right Click Context Menu */}
        {contextMenu.visible && (
          <ContextMenu 
            x={contextMenu.x} y={contextMenu.y}
            onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            onCopy={() => { handleCopy(); setContextMenu({ ...contextMenu, visible: false }); }}
            onPaste={() => { handlePaste(); setContextMenu({ ...contextMenu, visible: false }); }}
            onDuplicate={() => { if(contextMenu.elementId) duplicateElement(contextMenu.elementId); setContextMenu({ ...contextMenu, visible: false }); }}
            onDelete={() => { if(contextMenu.elementId) deleteElement(contextMenu.elementId); setContextMenu({ ...contextMenu, visible: false }); }}
            onBringForward={() => { if(contextMenu.elementId) updateElement(contextMenu.elementId, { zIndex: (currentElements.find(e => e.id === contextMenu.elementId)?.zIndex || 1) + 1 }); setContextMenu({ ...contextMenu, visible: false }); }}
            onSendBackward={() => { if(contextMenu.elementId) updateElement(contextMenu.elementId, { zIndex: Math.max(0, (currentElements.find(e => e.id === contextMenu.elementId)?.zIndex || 1) - 1) }); setContextMenu({ ...contextMenu, visible: false }); }}
            hasSelection={!!contextMenu.elementId}
          />
        )}
      </div>
    </div>
  );
};

export default App;