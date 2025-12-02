import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import ChatInterface from './components/ChatInterface';
import ElementNode from './components/ElementNode';
import ContextMenu from './components/ContextMenu';
import SmartGuides from './components/SmartGuides';
import SelectionOverlay from './components/SelectionOverlay';
import DownloadDialog from './components/DownloadDialog';
import ResizeDialog from './components/ResizeDialog';
import FloatingToolbar from './components/FloatingToolbar';
import { CanvasElement, ElementType, DragState, ResizeState, CanvasConfig, ContextMenuState, SnapGuide, ExportFormat, AlignType, DistributeType, LayerOrderType } from './types';
import { MousePointer2, ZoomIn, ZoomOut, Download, Undo2, Redo2, Layout, Monitor, Smartphone, FileImage, ChevronDown, Hand } from 'lucide-react';
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // View State (Zoom & Pan)
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, elementId: null, groupId: null });
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showResizeDialog, setShowResizeDialog] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

  // Derived state
  const currentElements = history[historyStep].elements;
  const selectedElements = useMemo(() => currentElements.filter(el => selectedIds.includes(el.id)), [currentElements, selectedIds]);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dragRef = useRef<DragState>({ 
      isDragging: false, 
      mode: 'move', 
      startX: 0, 
      startY: 0, 
      initialPositions: {} 
  });
  
  const resizeRef = useRef<ResizeState>({ 
      isResizing: false, 
      startX: 0, 
      startY: 0, 
      initialBounds: { x: 0, y: 0, width: 0, height: 0 },
      initialElements: {},
      handle: 'se'
  });
  const clipboardRef = useRef<CanvasElement[]>([]);
  const isSpacePressed = useRef(false);

  // Selection Box State (Drag to select)
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  // --- CALC SELECTION BOUNDS ---
  const getSelectionBounds = () => {
      if (selectedElements.length === 0) return null;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      selectedElements.forEach(el => {
          minX = Math.min(minX, el.x);
          minY = Math.min(minY, el.y);
          maxX = Math.max(maxX, el.x + el.width);
          maxY = Math.max(maxY, el.y + el.height);
      });

      const rotation = selectedElements.length === 1 ? selectedElements[0].rotation : 0;

      return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          rotation
      };
  };

  const selectionBounds = getSelectionBounds();

  // Floating Toolbar Position
  const floatingToolbarPos = useMemo(() => {
      if (!selectionBounds || !canvasRef.current || isPanning || dragRef.current.isDragging) return null;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = rect.left + (selectionBounds.x + selectionBounds.width / 2) * zoom;
      const screenY = rect.top + selectionBounds.y * zoom;
      
      return { x: screenX, y: screenY - 20 };
  }, [selectionBounds, zoom, pan, isPanning, dragRef.current.isDragging]);

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
          setSelectedIds([]);
      }
  }, [historyStep]);

  const redo = useCallback(() => {
      if (historyStep < history.length - 1) {
          setHistoryStep(prev => prev + 1);
          setSelectedIds([]);
      }
  }, [historyStep, history.length]);

  // --- CLEANUP OUT OF BOUNDS ELEMENTS ---
  useEffect(() => {
      // Logic: If an element is NOT selected, and is FULLY outside the canvas, delete it.
      // This mimics Canva's behavior where you can drag out, but if you deselect, it's gone.
      const itemsToDelete = currentElements.filter(el => {
          const isSelected = selectedIds.includes(el.id);
          if (isSelected) return false; // Keep selected items even if out of bounds

          const isFullyOutside = (
              el.x + el.width < 0 ||
              el.x > canvasConfig.width ||
              el.y + el.height < 0 ||
              el.y > canvasConfig.height
          );
          return isFullyOutside;
      });

      if (itemsToDelete.length > 0) {
          const idsToDelete = itemsToDelete.map(e => e.id);
          const newElements = currentElements.filter(el => !idsToDelete.includes(el.id));
          
          // We update history directly to remove "garbage" without creating a separate user undo step if possible, 
          // or we just treat it as a deletion event. Treating as deletion event is safer for undo flow.
          // However, to prevent infinite loops if we used pushToHistory in a way that triggers this effect again,
          // we rely on selectedIds changing as the trigger.
          pushToHistory(newElements);
      }
  }, [selectedIds]); // Only run when selection changes (i.e. on Deselect)

  // --- ACTIONS ---

  const addElement = (type: ElementType, content: string = '', styleOverrides: any = {}) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);

    // Helper to finalize adding element to state
    const commitElement = (w: number, h: number, finalContent: string) => {
        const defaults = {
            text: { width: 300, height: 50, fontSize: 32, content: finalContent || 'Add text' },
            rectangle: { width: 200, height: 200, backgroundColor: '#3b82f6' },
            circle: { width: 200, height: 200, backgroundColor: '#8b5cf6' },
            image: { width: w || 300, height: h || 300, content: finalContent || 'https://picsum.photos/300/300' }
        };

        const base = defaults[type];
        
        // Merge calculated dims with potential overrides
        // If styleOverrides has width/height (e.g. from template), they take precedence
        const finalWidth = styleOverrides.width || base.width;
        const finalHeight = styleOverrides.height || base.height;

        const newElement: CanvasElement = {
            id, type,
            x: canvasConfig.width / 2 - (finalWidth / 2),
            y: canvasConfig.height / 2 - (finalHeight / 2),
            rotation: 0, zIndex: currentElements.length + 1,
            color: '#000000', opacity: 1,
            ...base, 
            ...styleOverrides,
            width: finalWidth,
            height: finalHeight
        };
        
        // Use callback form to ensure we have latest history if called from async context (Chat/Image Load)
        setHistory(prev => {
            const current = prev[prev.length - 1].elements;
            newElement.zIndex = current.length + 1;
            const newHistory = [...prev, { elements: [...current, newElement] }];
            setHistoryStep(newHistory.length - 1);
            return newHistory;
        });
        
        setSelectedIds([id]);
    };

    if (type === 'image') {
        // If explicit size is provided (e.g. via AI tool calling), use it immediately
        if (styleOverrides.width && styleOverrides.height) {
            commitElement(styleOverrides.width, styleOverrides.height, content);
            return;
        }

        // Otherwise load image to get natural dimensions
        const imgUrl = content || 'https://picsum.photos/300/300';
        const img = new Image();
        img.src = imgUrl;
        img.onload = () => {
             let w = img.naturalWidth;
             let h = img.naturalHeight;
             const MAX_DIM = 500;
             
             // Scale down if image is huge
             if (w > MAX_DIM || h > MAX_DIM) {
                 const ratio = w / h;
                 if (w > h) {
                     w = MAX_DIM;
                     h = MAX_DIM / ratio;
                 } else {
                     h = MAX_DIM;
                     w = MAX_DIM * ratio;
                 }
             }
             commitElement(w, h, imgUrl);
        };
        img.onerror = () => {
            // Fallback if load fails
            commitElement(300, 300, imgUrl);
        };
    } else {
        // Shapes/Text
        commitElement(0, 0, content);
    }
  };

  const applyTemplate = (templateElements: CanvasElement[]) => {
      const newElements = templateElements.map(el => ({
          ...el,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));
      pushToHistory(newElements);
      setSelectedIds([]);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = currentElements.map(el => el.id === id ? { ...el, ...updates } : el);
    pushToHistory(updated);
  };

  const updateElements = (ids: string[], updates: Partial<CanvasElement>) => {
      const updated = currentElements.map(el => ids.includes(el.id) ? { ...el, ...updates } : el);
      pushToHistory(updated);
  };

  const updateElementsImmediate = (ids: string[], updatesFn: (el: CanvasElement) => Partial<CanvasElement>) => {
      const newHistory = [...history];
      newHistory[historyStep] = { 
          elements: currentElements.map(el => ids.includes(el.id) ? { ...el, ...updatesFn(el) } : el)
      };
      setHistory(newHistory);
  };

  const deleteElement = useCallback((ids: string | string[]) => {
    const idsToDelete = Array.isArray(ids) ? ids : [ids];
    if (idsToDelete.length === 0) return;
    pushToHistory(currentElements.filter(el => !idsToDelete.includes(el.id)));
    setSelectedIds([]);
  }, [currentElements, pushToHistory]);

  const duplicateElement = useCallback((ids: string | string[]) => {
      const idsToDup = Array.isArray(ids) ? ids : [ids];
      if (idsToDup.length === 0) return;
      const elsToDup = currentElements.filter(el => idsToDup.includes(el.id));
      const newElements = [...currentElements];
      const newSelectedIds: string[] = [];
      const groupMapping: Record<string, string> = {};

      elsToDup.forEach(el => {
          const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
          let newGroupId = undefined;
          if (el.groupId) {
              if (!groupMapping[el.groupId]) groupMapping[el.groupId] = Date.now().toString() + '_grp';
              newGroupId = groupMapping[el.groupId];
          }
          const newEl = {
              ...el, 
              id: newId, 
              x: el.x + 20, 
              y: el.y + 20, 
              zIndex: currentElements.length + 1,
              groupId: newGroupId
          };
          newElements.push(newEl);
          newSelectedIds.push(newId);
      });
      
      pushToHistory(newElements);
      setSelectedIds(newSelectedIds);
  }, [currentElements, pushToHistory]);

  // --- REORDER LAYERS (DRAG & DROP) ---
  const handleReorderLayers = (dragIndex: number, hoverIndex: number) => {
      // Create a copy of elements sorted by zIndex descending (same as display)
      const sortedElements = [...currentElements].sort((a, b) => b.zIndex - a.zIndex);
      
      // Remove dragged item
      const [draggedItem] = sortedElements.splice(dragIndex, 1);
      // Insert at new position
      sortedElements.splice(hoverIndex, 0, draggedItem);
      
      // Re-assign z-indices based on new order (reverse because index 0 is top)
      const maxZ = sortedElements.length;
      const updatedElements = sortedElements.map((el, index) => ({
          ...el,
          zIndex: maxZ - index
      }));
      
      pushToHistory(updatedElements);
  };

  // --- LAYOUT & POSITIONING LOGIC ---

  const handleAlign = (type: AlignType) => {
    if (selectedElements.length === 0) return;
    const bounds = getSelectionBounds();
    if (!bounds) return;

    let targetValue = 0;
    
    // For single element, align to Canvas. For multiple, align to Selection Bounds.
    const isSingle = selectedElements.length === 1;

    switch (type) {
        case 'left': targetValue = isSingle ? 0 : bounds.x; break;
        case 'center': targetValue = isSingle ? canvasConfig.width / 2 : bounds.x + bounds.width / 2; break;
        case 'right': targetValue = isSingle ? canvasConfig.width : bounds.x + bounds.width; break;
        case 'top': targetValue = isSingle ? 0 : bounds.y; break;
        case 'middle': targetValue = isSingle ? canvasConfig.height / 2 : bounds.y + bounds.height / 2; break;
        case 'bottom': targetValue = isSingle ? canvasConfig.height : bounds.y + bounds.height; break;
    }

    const updates = selectedElements.map(el => {
        let newX = el.x;
        let newY = el.y;

        switch (type) {
            case 'left': newX = targetValue; break;
            case 'center': newX = targetValue - el.width / 2; break;
            case 'right': newX = targetValue - el.width; break;
            case 'top': newY = targetValue; break;
            case 'middle': newY = targetValue - el.height / 2; break;
            case 'bottom': newY = targetValue - el.height; break;
        }
        return { ...el, x: newX, y: newY };
    });

    const newElements = currentElements.map(el => {
        const updated = updates.find(u => u.id === el.id);
        return updated || el;
    });
    pushToHistory(newElements);
  };

  const handleDistribute = (type: DistributeType) => {
      if (selectedElements.length < 3) return;
      
      const sorted = [...selectedElements].sort((a, b) => type === 'horizontal' ? a.x - b.x : a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      
      const minVal = type === 'horizontal' ? first.x : first.y;
      const maxVal = type === 'horizontal' ? last.x : last.y;
      const span = maxVal - minVal;
      const step = span / (sorted.length - 1);

      const updates = sorted.map((el, i) => {
          if (i === 0 || i === sorted.length - 1) return el;
          if (type === 'horizontal') return { ...el, x: minVal + (step * i) };
          return { ...el, y: minVal + (step * i) };
      });

      const newElements = currentElements.map(el => {
          const updated = updates.find(u => u.id === el.id);
          return updated || el;
      });
      pushToHistory(newElements);
  };

  const handleLayerOrder = (type: LayerOrderType) => {
      if (selectedIds.length === 0) return;
      
      let newElements = [...currentElements];
      const sortedSelection = newElements.filter(el => selectedIds.includes(el.id)).sort((a, b) => a.zIndex - b.zIndex);
      
      if (type === 'front') {
          const maxZ = Math.max(...newElements.map(e => e.zIndex));
          sortedSelection.forEach((el, i) => {
              el.zIndex = maxZ + 1 + i;
          });
      } else if (type === 'back') {
          const minZ = Math.min(...newElements.map(e => e.zIndex));
          sortedSelection.forEach((el, i) => {
              el.zIndex = minZ - 1 - (sortedSelection.length - 1 - i); // Keep relative order
          });
      } else if (type === 'forward') {
          sortedSelection.forEach(el => el.zIndex += 1);
      } else if (type === 'backward') {
          sortedSelection.forEach(el => el.zIndex -= 1);
      }
      
      newElements.sort((a, b) => a.zIndex - b.zIndex);
      newElements = newElements.map((el, i) => ({ ...el, zIndex: i + 1 }));

      pushToHistory(newElements);
  };

  const handleGroup = useCallback(() => {
      if (selectedIds.length < 2) return;
      const groupId = Date.now().toString() + '_grp';
      updateElements(selectedIds, { groupId });
  }, [selectedIds, updateElements]);

  const handleUngroup = useCallback(() => {
     if (selectedIds.length === 0) return;
     const newElements = currentElements.map(el => 
         selectedIds.includes(el.id) ? { ...el, groupId: undefined } : el
     );
     pushToHistory(newElements);
  }, [selectedIds, currentElements, pushToHistory]);

  const handleCopy = useCallback(() => {
    if (selectedElements.length > 0) {
      clipboardRef.current = selectedElements;
    }
  }, [selectedElements]);

  const handlePaste = useCallback(() => {
    if (clipboardRef.current.length > 0) {
        const newElements = [...currentElements];
        const newSelectedIds: string[] = [];
        const groupMapping: Record<string, string> = {};

        clipboardRef.current.forEach(clipEl => {
            const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            let newGroupId = undefined;
            if (clipEl.groupId) {
                 if (!groupMapping[clipEl.groupId]) groupMapping[clipEl.groupId] = Date.now().toString() + '_grp_paste';
                 newGroupId = groupMapping[clipEl.groupId];
            }
            const newEl = {
                ...clipEl, 
                id: newId, 
                x: clipEl.x + 30, 
                y: clipEl.y + 30,
                zIndex: currentElements.length + 1,
                groupId: newGroupId
            };
            newElements.push(newEl);
            newSelectedIds.push(newId);
        });
        
        pushToHistory(newElements);
        setSelectedIds(newSelectedIds);
    }
  }, [currentElements, pushToHistory]);

  const handleResizeCanvas = (width: number, height: number, name: string) => {
      setCanvasConfig(prev => ({ ...prev, width, height, name }));
  };

  const handleDownload = async (config: { format: ExportFormat; scale: number; transparent: boolean }) => {
      if (!canvasRef.current) return;
      setSelectedIds([]);
      setSnapGuides([]); 
      setShowDownloadDialog(false);

      setTimeout(async () => {
          try {
              const canvas = await html2canvas(canvasRef.current!, {
                  useCORS: true, 
                  scale: config.scale,
                  backgroundColor: config.transparent ? null : (canvasConfig.background || canvasConfig.backgroundColor),
                  ignoreElements: (element) => element.classList.contains('selection-overlay')
              });
              
              const link = document.createElement('a');
              link.download = `${canvasConfig.name}.${config.format}`;
              link.href = canvas.toDataURL(`image/${config.format === 'jpg' ? 'jpeg' : 'png'}`);
              link.click();
          } catch (e) {
              console.error("Export failed", e);
              alert("Export failed.");
          }
      }, 200);
  };

  // --- INTERACTION HANDLERS ---

  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = -e.deltaY * 0.001;
          setZoom(z => Math.min(5, Math.max(0.1, z + delta)));
      }
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
      setContextMenu({ ...contextMenu, visible: false });

      if (e.button === 1 || (e.button === 0 && isSpacePressed.current)) {
          setIsPanning(true);
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          e.preventDefault();
          return;
      }

      // Deselect if clicking outside specific elements
      // But we need to make sure we aren't clicking the selection overlay itself or a tool
      const target = e.target as HTMLElement;
      const isCanvasOrContainer = target === containerRef.current || target === canvasRef.current || target.classList.contains('relative'); // relative wrapper

      if (isCanvasOrContainer) {
          if (!e.shiftKey) setSelectedIds([]);
          
          // Drag selection logic...
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
             const startX = (e.clientX - rect.left) / zoom;
             const startY = (e.clientY - rect.top) / zoom;
             dragRef.current = {
                 isDragging: true, mode: 'select', startX: e.clientX, startY: e.clientY, initialPositions: {},
                 selectionRect: { x: startX, y: startY, width: 0, height: 0 }
             };
          }
      }
  };

  const handleElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    setContextMenu({ ...contextMenu, visible: false });
    e.stopPropagation();
    const element = currentElements.find(el => el.id === id);
    if (!element) return;
    let targetIds = [id];
    if (element.groupId) targetIds = currentElements.filter(el => el.groupId === element.groupId).map(el => el.id);

    let newSelectedIds = [...selectedIds];
    if (e.shiftKey) {
        if (targetIds.every(tid => selectedIds.includes(tid))) newSelectedIds = selectedIds.filter(sid => !targetIds.includes(sid));
        else newSelectedIds = [...selectedIds, ...targetIds.filter(tid => !selectedIds.includes(tid))];
    } else {
        const isAlreadySelected = targetIds.every(tid => selectedIds.includes(tid));
        if (!isAlreadySelected) newSelectedIds = targetIds;
    }
    setSelectedIds(newSelectedIds);

    if (!element.locked) {
        const initialPositions: Record<string, {x: number, y: number}> = {};
        newSelectedIds.forEach(pid => {
            const el = currentElements.find(e => e.id === pid);
            if (el) initialPositions[pid] = { x: el.x, y: el.y };
        });
        dragRef.current = { isDragging: true, mode: 'move', startX: e.clientX, startY: e.clientY, initialPositions };
    }
  }, [currentElements, selectedIds]);

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
      e.stopPropagation(); e.preventDefault();
      const bounds = getSelectionBounds();
      if (!bounds) return;
      const initialElements: Record<string, any> = {};
      selectedElements.forEach(el => { initialElements[el.id] = { x: el.x, y: el.y, width: el.width, height: el.height, fontSize: el.fontSize }; });
      resizeRef.current = { isResizing: true, startX: e.clientX, startY: e.clientY, initialBounds: bounds, initialElements, handle: handle as any };
  };

  const handleRotateStart = (e: React.MouseEvent) => {
      e.stopPropagation(); e.preventDefault();
      const bounds = getSelectionBounds();
      if (!bounds) return;
      resizeRef.current = { isResizing: true, startX: e.clientX, startY: e.clientY, initialBounds: bounds, initialElements: {}, handle: 'rot' };
  };

  // --- MAIN DRAG LOGIC WITH SNAPPING ---
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) { setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); return; }

    if (dragRef.current.isDragging && dragRef.current.mode === 'select' && dragRef.current.selectionRect && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / zoom;
        const currentY = (e.clientY - rect.top) / zoom;
        const startX = dragRef.current.selectionRect.x;
        const startY = dragRef.current.selectionRect.y;
        const newRect = { x: Math.min(startX, currentX), y: Math.min(startY, currentY), w: Math.abs(currentX - startX), h: Math.abs(currentY - startY) };
        setSelectionBox(newRect);
        const insideIds = currentElements.filter(el => (el.x < newRect.x + newRect.w && el.x + el.width > newRect.x && el.y < newRect.y + newRect.h && el.y + el.height > newRect.y)).map(el => el.id);
        setSelectedIds(insideIds);
    }

    if (dragRef.current.isDragging && dragRef.current.mode === 'move') {
      const dx = (e.clientX - dragRef.current.startX) / zoom;
      const dy = (e.clientY - dragRef.current.startY) / zoom;
      const idsToUpdate = Object.keys(dragRef.current.initialPositions);
      
      let finalDx = dx;
      let finalDy = dy;
      let guides: SnapGuide[] = [];

      // Only perform advanced snapping if we are dragging a single selection or a grouped block (conceptually easier to snap bounding box)
      // For simplicity, we snap the first element in the selection OR the bounding box of selection.
      // Let's snap based on the primary selected element (idsToUpdate[0]) if single, otherwise skip or do bounds.
      if (idsToUpdate.length >= 1) {
          const primaryId = idsToUpdate[0];
          const initPos = dragRef.current.initialPositions[primaryId];
          const primaryEl = currentElements.find(el => el.id === primaryId);
          
          if (primaryEl) {
              const currentX = initPos.x + dx;
              const currentY = initPos.y + dy;
              const width = primaryEl.width;
              const height = primaryEl.height;

              // Edges to check: Left, Center, Right, Top, Middle, Bottom
              const edgesX = [
                  { val: currentX, type: 'left' },
                  { val: currentX + width / 2, type: 'center' },
                  { val: currentX + width, type: 'right' }
              ];
              const edgesY = [
                  { val: currentY, type: 'top' },
                  { val: currentY + height / 2, type: 'middle' },
                  { val: currentY + height, type: 'bottom' }
              ];

              const threshold = 6 / zoom;
              let snappedX = false;
              let snappedY = false;

              // Targets: All other elements + Canvas Center
              const targets = currentElements.filter(el => !idsToUpdate.includes(el.id));
              const canvasCenter = { x: canvasConfig.width / 2, y: canvasConfig.height / 2 };

              // Check X Snapping
              // 1. Canvas Center
              if (Math.abs((currentX + width / 2) - canvasCenter.x) < threshold) {
                  finalDx = (canvasCenter.x - width / 2) - initPos.x;
                  guides.push({ type: 'vertical', position: canvasCenter.x, start: 0, end: canvasConfig.height });
                  snappedX = true;
              }

              // 2. Other Elements (Left, Center, Right)
              if (!snappedX) {
                  for (const target of targets) {
                      const tEdges = [
                          target.x,
                          target.x + target.width / 2,
                          target.x + target.width
                      ];
                      
                      for (const edge of edgesX) {
                          for (const tEdge of tEdges) {
                              if (Math.abs(edge.val - tEdge) < threshold) {
                                  // Calculate offset needed to align edge.val to tEdge
                                  // edge.val depends on dx. 
                                  // e.g. if Left: currentX = initPos.x + dx. We want currentX = tEdge. -> dx = tEdge - initPos.x
                                  const requiredVal = tEdge - (edge.val - currentX); // get back to Left X
                                  finalDx = requiredVal - initPos.x;
                                  
                                  // Guide visualization
                                  const startY = Math.min(currentY, target.y);
                                  const endY = Math.max(currentY + height, target.y + target.height);
                                  guides.push({ type: 'vertical', position: tEdge, start: startY, end: endY });
                                  
                                  snappedX = true;
                                  break;
                              }
                          }
                          if (snappedX) break;
                      }
                      if (snappedX) break;
                  }
              }

              // Check Y Snapping
              // 1. Canvas Center
              if (Math.abs((currentY + height / 2) - canvasCenter.y) < threshold) {
                  finalDy = (canvasCenter.y - height / 2) - initPos.y;
                  guides.push({ type: 'horizontal', position: canvasCenter.y, start: 0, end: canvasConfig.width });
                  snappedY = true;
              }

              // 2. Other Elements
              if (!snappedY) {
                  for (const target of targets) {
                      const tEdges = [
                          target.y,
                          target.y + target.height / 2,
                          target.y + target.height
                      ];
                      
                      for (const edge of edgesY) {
                          for (const tEdge of tEdges) {
                              if (Math.abs(edge.val - tEdge) < threshold) {
                                  const requiredVal = tEdge - (edge.val - currentY);
                                  finalDy = requiredVal - initPos.y;
                                  
                                  const startX = Math.min(currentX, target.x);
                                  const endX = Math.max(currentX + width, target.x + target.width);
                                  guides.push({ type: 'horizontal', position: tEdge, start: startX, end: endX });
                                  
                                  snappedY = true;
                                  break;
                              }
                          }
                          if (snappedY) break;
                      }
                      if (snappedY) break;
                  }
              }
          }
      }

      setSnapGuides(guides);
      updateElementsImmediate(idsToUpdate, (el) => { 
          const init = dragRef.current.initialPositions[el.id]; 
          return { x: init.x + finalDx, y: init.y + finalDy }; 
      });
    }
    
    if (resizeRef.current.isResizing) {
      const { startX, startY, initialBounds, initialElements, handle } = resizeRef.current;
      const dx = (e.clientX - startX) / zoom; const dy = (e.clientY - startY) / zoom;
      if (handle === 'rot') {
          if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              const centerX = rect.left + (initialBounds.x + initialBounds.width / 2) * zoom;
              const centerY = rect.top + (initialBounds.y + initialBounds.height / 2) * zoom;
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
              const snappedAngle = e.shiftKey ? Math.round((angle + 90) / 45) * 45 : angle + 90;
              if (selectedIds.length > 0) updateElementsImmediate(selectedIds, (el) => ({ rotation: snappedAngle }));
          }
          return;
      }
      let newBounds = { ...initialBounds };
      if (handle.includes('e')) newBounds.width += dx; if (handle.includes('w')) { newBounds.width -= dx; newBounds.x += dx; }
      if (handle.includes('s')) newBounds.height += dy; if (handle.includes('n')) { newBounds.height -= dy; newBounds.y += dy; }
      if (newBounds.width < 10) newBounds.width = 10; if (newBounds.height < 10) newBounds.height = 10;
      const scaleX = newBounds.width / initialBounds.width; const scaleY = newBounds.height / initialBounds.height;
      updateElementsImmediate(Object.keys(initialElements), (el) => {
          const initEl = initialElements[el.id];
          const newX = newBounds.x + ((initEl.x - initialBounds.x) * scaleX);
          const newY = newBounds.y + ((initEl.y - initialBounds.y) * scaleY);
          const updates: Partial<CanvasElement> = { x: newX, y: newY, width: initEl.width * scaleX, height: initEl.height * scaleY };
          
          if (el.type === 'text' && initEl.fontSize) {
               // Only scale font if dragging corner
               const isCorner = ['nw', 'ne', 'sw', 'se'].includes(handle);
               if (isCorner) {
                   updates.fontSize = initEl.fontSize * Math.min(scaleX, scaleY);
               }
          }
          return updates;
      });
    }
  }, [zoom, currentElements, historyStep, canvasConfig, isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    if (dragRef.current.isDragging || resizeRef.current.isResizing) {
        if (dragRef.current.mode !== 'select') pushToHistory([...history[historyStep].elements]); 
        setSnapGuides([]); 
    }
    dragRef.current.isDragging = false; resizeRef.current.isResizing = false; setIsPanning(false); setSelectionBox(null);
  }, [history, historyStep, pushToHistory]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const clickedId = selectedIds.length > 0 ? selectedIds[0] : null;
    const clickedEl = currentElements.find(el => el.id === clickedId);
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, elementId: clickedId, groupId: clickedEl?.groupId || null });
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if editing text
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.key === ' ' && !e.repeat) {
          isSpacePressed.current = true;
          document.body.style.cursor = 'grab';
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'd':
            e.preventDefault();
            duplicateElement(selectedIds);
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) handleUngroup(); else handleGroup();
            break;
          case 'a':
            e.preventDefault();
            setSelectedIds(currentElements.map(el => el.id));
            break;
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteElement(selectedIds);
      }

      if (selectedIds.length > 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          const moveAmount = 1;
          const updates: Partial<CanvasElement> = {};
          let handled = false;
          if (e.key === 'ArrowUp') { updates.y = selectedElements[0].y - moveAmount; handled = true; }
          if (e.key === 'ArrowDown') { updates.y = selectedElements[0].y + moveAmount; handled = true; }
          if (e.key === 'ArrowLeft') { updates.x = selectedElements[0].x - moveAmount; handled = true; }
          if (e.key === 'ArrowRight') { updates.x = selectedElements[0].x + moveAmount; handled = true; }
          
          if (handled) {
              e.preventDefault();
              updateElementsImmediate(selectedIds, (el) => {
                  if (e.key === 'ArrowUp') return { y: el.y - moveAmount };
                  if (e.key === 'ArrowDown') return { y: el.y + moveAmount };
                  if (e.key === 'ArrowLeft') return { x: el.x - moveAmount };
                  if (e.key === 'ArrowRight') return { x: el.x + moveAmount };
                  return {};
              });
          }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            isSpacePressed.current = false;
            document.body.style.cursor = 'default';
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedIds, currentElements, undo, redo, handleCopy, handlePaste, duplicateElement, handleGroup, handleUngroup, deleteElement]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e1318] text-white font-sans overflow-hidden">
      
      {/* TOP HEADER - DARK THEME */}
      <header className="h-14 bg-[#0e1318] flex items-center justify-between px-4 z-40 shrink-0 shadow-sm relative border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-white mr-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#00c4cc] to-[#7d2ae8] rounded-full flex items-center justify-center text-white shadow-sm">
                    <Layout size={18} />
                </div>
                <button 
                  onClick={() => setShowResizeDialog(!showResizeDialog)} 
                  className="font-bold text-lg tracking-tight hover:bg-white/10 px-2 py-1 rounded transition-colors"
                >
                    File
                </button>
                <ResizeDialog 
                    isOpen={showResizeDialog} 
                    onClose={() => setShowResizeDialog(false)} 
                    onResize={handleResizeCanvas}
                    currentWidth={canvasConfig.width}
                    currentHeight={canvasConfig.height}
                />
           </div>

           <div className="flex items-center gap-1">
                <button onClick={undo} disabled={historyStep === 0} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"><Undo2 size={18}/></button>
                <button onClick={redo} disabled={historyStep === history.length - 1} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-30"><Redo2 size={18}/></button>
           </div>
           
           <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

           <div className="text-sm font-medium text-gray-300">
               {canvasConfig.name} - {canvasConfig.width}x{canvasConfig.height}
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0e1318] bg-gray-500 flex items-center justify-center text-xs">U{i}</div>)}
              <button className="w-8 h-8 rounded-full border-2 border-[#0e1318] bg-gray-700 flex items-center justify-center text-xs hover:bg-gray-600">+</button>
          </div>
          <button onClick={() => setShowDownloadDialog(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-lg transition-all shadow-sm">
             Share
          </button>
        </div>
      </header>

      {/* SUB HEADER / CONTEXT BAR (Properties Panel) */}
      <div className="shrink-0 relative z-30">
          <PropertiesPanel 
            selectedElements={selectedElements}
            canvasConfig={canvasConfig}
            onUpdateElement={updateElement}
            onUpdateElements={updateElements}
            onUpdateCanvas={(updates) => setCanvasConfig(prev => ({...prev, ...updates}))}
            onDelete={deleteElement}
            onDuplicate={duplicateElement}
            onAlign={handleAlign}
            onDistribute={handleDistribute}
            onLayerOrder={handleLayerOrder}
          />
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar 
            onAddElement={addElement} 
            onApplyTemplate={applyTemplate} 
            elements={currentElements}
            selectedIds={selectedIds}
            onSelectLayer={(id, multi) => setSelectedIds(multi ? [...selectedIds, id] : [id])}
            onUpdateElement={updateElement}
            onReorderLayers={handleReorderLayers}
        />

        {/* Canvas Area Container */}
        <div 
            ref={containerRef}
            className="flex-1 bg-[#1e1e1e] overflow-hidden relative flex items-center justify-center cursor-default"
            onWheel={handleWheel}
            onMouseDown={handleContainerMouseDown}
            onContextMenu={handleContextMenu}
        >
          {/* Zoom Controls Overlay - Moved to BOTTOM LEFT */}
          <div className="absolute bottom-6 left-6 bg-[#2a2a2a] shadow-lg border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 z-30 transition-all text-white">
             <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-gray-400 hover:text-white transition-colors"><ZoomOut size={16} /></button>
             <span className="text-xs font-medium w-8 text-center text-gray-300 select-none">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-gray-400 hover:text-white transition-colors"><ZoomIn size={16} /></button>
          </div>

          {/* THE CANVAS */}
          <div 
             style={{ 
                 transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                 transformOrigin: 'center center',
                 transition: isPanning ? 'none' : 'transform 0.1s ease-out',
             }}
             className="relative"
          >
             {/* Wrapper for Clipping Logic: Content is clipped, Overlay is not */}
             <div className="relative" style={{ width: canvasConfig.width, height: canvasConfig.height }}>
                 
                 {/* 1. The Actual Canvas Content (Clipped) */}
                 <div 
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: canvasConfig.backgroundColor,
                        backgroundImage: canvasConfig.background
                    }}
                    className="absolute inset-0 bg-white shadow-2xl transition-colors duration-200 overflow-hidden"
                 >
                     {currentElements.map(el => (
                       <ElementNode
                         key={el.id}
                         element={el}
                         isSelected={selectedIds.includes(el.id)}
                         onMouseDown={handleElementMouseDown}
                         onUpdate={updateElement}
                       />
                     ))}
                 </div>

                 {/* 2. Overlays (Not Clipped, but share coordinate space) */}
                 {selectionBounds && (
                     <SelectionOverlay 
                        bounds={selectionBounds}
                        zoom={zoom}
                        isLocked={selectedElements.some(e => e.locked)}
                        hasMultipleSelection={selectedElements.length > 1}
                        isGrouped={selectedElements.length > 1 && new Set(selectedElements.map(e => e.groupId)).size === 1 && !!selectedElements[0].groupId}
                        onResizeStart={handleResizeStart}
                        onRotateStart={handleRotateStart}
                        onDuplicate={() => duplicateElement(selectedIds)}
                        onDelete={() => deleteElement(selectedIds)}
                        onGroup={handleGroup}
                        onUngroup={handleUngroup}
                     />
                 )}
                 
                 {selectionBox && (
                     <div 
                        className="absolute border border-indigo-500 bg-indigo-500/10 z-[100] selection-overlay"
                        style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.w, height: selectionBox.h }}
                     />
                 )}

                 <SmartGuides guides={snapGuides} zoom={zoom} />
             </div>
          </div>
          
           {/* Floating Toolbar (Rendered outside canvas to stay scale-independent but positioned absolutely) */}
           {floatingToolbarPos && selectedIds.length > 0 && (
               <FloatingToolbar 
                   x={floatingToolbarPos.x} 
                   y={floatingToolbarPos.y} 
                   onDuplicate={() => duplicateElement(selectedIds)}
                   onDelete={() => deleteElement(selectedIds)}
                   onLock={() => updateElements(selectedIds, { locked: !selectedElements[0].locked })}
                   isLocked={!!selectedElements[0].locked}
               />
           )}

        </div>
        
        <ChatInterface 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            onOpen={() => setIsChatOpen(true)}
            onAddElement={addElement}
            onUpdateBackground={(color) => setCanvasConfig(prev => ({ ...prev, backgroundColor: color }))}
        />

        <DownloadDialog 
            isOpen={showDownloadDialog}
            onClose={() => setShowDownloadDialog(false)}
            onDownload={handleDownload}
            canvasName={canvasConfig.name}
        />

        {contextMenu.visible && (
          <ContextMenu 
            x={contextMenu.x} y={contextMenu.y}
            onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            onCopy={() => { handleCopy(); setContextMenu({ ...contextMenu, visible: false }); }}
            onPaste={() => { handlePaste(); setContextMenu({ ...contextMenu, visible: false }); }}
            onDuplicate={() => { if(contextMenu.elementId) duplicateElement(selectedIds.length > 0 ? selectedIds : contextMenu.elementId); setContextMenu({ ...contextMenu, visible: false }); }}
            onDelete={() => { if(contextMenu.elementId) deleteElement(selectedIds.length > 0 ? selectedIds : contextMenu.elementId); setContextMenu({ ...contextMenu, visible: false }); }}
            onBringForward={() => { if(selectedIds.length > 0) handleLayerOrder('forward'); setContextMenu({ ...contextMenu, visible: false }); }}
            onSendBackward={() => { if(selectedIds.length > 0) handleLayerOrder('backward'); setContextMenu({ ...contextMenu, visible: false }); }}
            onGroup={() => { handleGroup(); setContextMenu({ ...contextMenu, visible: false }); }}
            onUngroup={() => { handleUngroup(); setContextMenu({ ...contextMenu, visible: false }); }}
            hasSelection={!!contextMenu.elementId}
            isGrouped={!!contextMenu.groupId}
          />
        )}
      </div>
    </div>
  );
};

export default App;