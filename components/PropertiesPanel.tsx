
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, CanvasConfig, AlignType, DistributeType, LayerOrderType } from '../types';
import { 
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Trash2, Copy, Lock, Unlock,
  ChevronDown, Droplet, List,
  Group, Ungroup, 
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  ArrowUpToLine, ArrowDownToLine, MoveUp, MoveDown,
  Type, CaseSensitive, FlipHorizontal, FlipVertical,
  Layout, Layers as LayersIcon
} from 'lucide-react';
import ColorPickerPanel from './ColorPickerPanel';

interface PropertiesPanelProps {
  selectedElements: CanvasElement[];
  canvasConfig: CanvasConfig;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateElements: (ids: string[], updates: Partial<CanvasElement>) => void;
  onUpdateCanvas: (updates: Partial<CanvasConfig>) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
  onAlign: (type: AlignType) => void;
  onDistribute: (type: DistributeType) => void;
  onLayerOrder: (type: LayerOrderType) => void;
}

const ToolButton = ({ onClick, isActive, icon: Icon, label, disabled }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={`p-1.5 rounded transition-all flex items-center justify-center mx-0.5 ${
            isActive 
            ? 'bg-white/20 text-white shadow-sm' 
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        } ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
    >
        <Icon size={18} strokeWidth={2} />
    </button>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedElements, 
  canvasConfig,
  onUpdateElement,
  onUpdateElements,
  onUpdateCanvas,
  onDelete,
  onDuplicate,
  onAlign,
  onDistribute,
  onLayerOrder
}) => {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [activeSubPopover, setActiveSubPopover] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [positionTab, setPositionTab] = useState<'align' | 'layers'>('align');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Ignore if clicking inside any popover content
        if (target.closest('.popover-content')) return;

        if (panelRef.current && !panelRef.current.contains(target)) {
            setActivePopover(null);
            setActiveSubPopover(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopover = (name: string) => {
      setActivePopover(activePopover === name ? null : name);
      setActiveSubPopover(null);
  };

  const selectedIds = selectedElements.map(el => el.id);
  const singleSelection = selectedElements.length === 1 ? selectedElements[0] : null;
  const isGrouped = selectedElements.length > 1 && new Set(selectedElements.map(e => e.groupId)).size === 1 && !!selectedElements[0].groupId;

  // --- FILTER CHANGE HANDLER ---
  const handleFilterChange = (key: keyof NonNullable<CanvasElement['filters']>, value: number) => {
      if (!singleSelection) return;
      const currentFilters = singleSelection.filters || { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, blur: 0 };
      onUpdateElement(singleSelection.id, { 
          filters: { ...currentFilters, [key]: value } 
      });
  };

  const extractDocumentColors = () => {
      const colors = new Set<string>();
      if (canvasConfig.backgroundColor) colors.add(canvasConfig.backgroundColor);
      return Array.from(colors);
  };

  const renderPositionPopover = () => (
      <div className="popover-content absolute top-full right-0 mt-2 w-[340px] bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-white cursor-default origin-top-right">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button onClick={() => setPositionTab('align')} className={`flex-1 py-3 text-sm font-medium transition-colors ${positionTab === 'align' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}>Align</button>
                <button onClick={() => setPositionTab('layers')} className={`flex-1 py-3 text-sm font-medium transition-colors ${positionTab === 'layers' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}>Layers</button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {positionTab === 'align' && (
                    <>
                        {/* Layer Order */}
                        <div className="mb-6 grid grid-cols-2 gap-3">
                             <button onClick={() => onLayerOrder('forward')} className="flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded border border-white/5 text-xs text-gray-300 transition-colors"><MoveUp size={14}/> Forward</button>
                             <button onClick={() => onLayerOrder('backward')} className="flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded border border-white/5 text-xs text-gray-300 transition-colors"><MoveDown size={14}/> Backward</button>
                             <button onClick={() => onLayerOrder('front')} className="flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded border border-white/5 text-xs text-gray-300 transition-colors"><ArrowUpToLine size={14}/> To Front</button>
                             <button onClick={() => onLayerOrder('back')} className="flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded border border-white/5 text-xs text-gray-300 transition-colors"><ArrowDownToLine size={14}/> To Back</button>
                        </div>

                        {/* Alignment */}
                        <div className="mb-6">
                            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Align to page</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => onAlign('top')} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded text-xs text-gray-300 transition-colors"><AlignStartHorizontal size={14} className="rotate-180"/> Top</button>
                                <button onClick={() => onAlign('left')} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded text-xs text-gray-300 transition-colors"><AlignStartVertical size={14}/> Left</button>
                                <button onClick={() => onAlign('middle')} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded text-xs text-gray-300 transition-colors"><AlignCenterHorizontal size={14}/> Middle</button>
                                <button onClick={() => onAlign('center')} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded text-xs text-gray-300 transition-colors"><AlignCenterVertical size={14}/> Center</button>
                                <button onClick={() => onAlign('bottom')} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded text-xs text-gray-300 transition-colors"><AlignEndHorizontal size={14}/> Bottom</button>
                                <button onClick={() => onAlign('right')} className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded text-xs text-gray-300 transition-colors"><AlignEndVertical size={14}/> Right</button>
                            </div>
                        </div>

                        {/* Advanced (Dimensions) */}
                        {singleSelection && (
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Advanced</h4>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-[#2a2a2a] rounded border border-white/5 px-2 py-1">
                                        <label className="text-[10px] text-gray-500 block">Width</label>
                                        <div className="flex items-center">
                                            <input 
                                                type="number" 
                                                value={Math.round(singleSelection.width)} 
                                                onChange={(e) => onUpdateElement(singleSelection.id, { width: parseInt(e.target.value) })}
                                                className="w-full bg-transparent text-xs text-white outline-none" 
                                            />
                                            <span className="text-[10px] text-gray-500">px</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#2a2a2a] rounded border border-white/5 px-2 py-1">
                                        <label className="text-[10px] text-gray-500 block">Height</label>
                                        <div className="flex items-center">
                                            <input 
                                                type="number" 
                                                value={Math.round(singleSelection.height)} 
                                                onChange={(e) => onUpdateElement(singleSelection.id, { height: parseInt(e.target.value) })}
                                                className="w-full bg-transparent text-xs text-white outline-none" 
                                            />
                                            <span className="text-[10px] text-gray-500">px</span>
                                        </div>
                                    </div>
                                     <div className="bg-[#2a2a2a] rounded border border-white/5 px-2 py-1">
                                        <label className="text-[10px] text-gray-500 block">X</label>
                                        <input 
                                            type="number" 
                                            value={Math.round(singleSelection.x)} 
                                            onChange={(e) => onUpdateElement(singleSelection.id, { x: parseInt(e.target.value) })}
                                            className="w-full bg-transparent text-xs text-white outline-none" 
                                        />
                                    </div>
                                     <div className="bg-[#2a2a2a] rounded border border-white/5 px-2 py-1">
                                        <label className="text-[10px] text-gray-500 block">Y</label>
                                        <input 
                                            type="number" 
                                            value={Math.round(singleSelection.y)} 
                                            onChange={(e) => onUpdateElement(singleSelection.id, { y: parseInt(e.target.value) })}
                                            className="w-full bg-transparent text-xs text-white outline-none" 
                                        />
                                    </div>
                                     <div className="bg-[#2a2a2a] rounded border border-white/5 px-2 py-1">
                                        <label className="text-[10px] text-gray-500 block">Rotate</label>
                                        <div className="flex items-center">
                                            <input 
                                                type="number" 
                                                value={Math.round(singleSelection.rotation)} 
                                                onChange={(e) => onUpdateElement(singleSelection.id, { rotation: parseInt(e.target.value) })}
                                                className="w-full bg-transparent text-xs text-white outline-none" 
                                            />
                                            <span className="text-[10px] text-gray-500">°</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {positionTab === 'layers' && (
                    <div className="text-sm text-gray-400 text-center py-4">
                        Use the Layers panel in the sidebar for drag-and-drop reordering.
                    </div>
                )}
            </div>
      </div>
  );

  const renderColorPopover = (targetProp: 'color' | 'backgroundColor' | 'borderColor', initialColor: string = '#000000') => (
      <div className="popover-content absolute top-full left-0 mt-2 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 p-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
           <ColorPickerPanel 
                color={initialColor} 
                onChange={(c) => onUpdateElements(selectedIds, { [targetProp]: c })}
                documentColors={extractDocumentColors()}
           />
      </div>
  );

  // Background Color Logic (No Selection)
  if (selectedElements.length === 0) {
    return (
      <div ref={panelRef} className="h-12 bg-[#18191b] border-b border-[#2a2a2a] flex items-center px-4 shadow-sm z-20 relative text-white">
         <div className="flex items-center gap-3 relative">
             <button 
                onClick={() => togglePopover('bgColor')}
                className={`flex items-center gap-2 px-1 py-1 rounded hover:bg-white/10 transition-colors relative border border-transparent ${activePopover === 'bgColor' ? 'bg-white/10' : ''}`}
                title="Background Color"
             >
                 <div className="w-6 h-6 rounded shadow-sm border border-white/20" style={{ background: canvasConfig.backgroundColor }}></div>
             </button>
             <span className="text-xs font-medium text-gray-400">Page Background</span>
             
             {activePopover === 'bgColor' && (
                <div className="popover-content absolute top-full left-0 mt-2 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 p-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <ColorPickerPanel 
                        color={canvasConfig.backgroundColor} 
                        onChange={(c) => onUpdateCanvas({ backgroundColor: c, background: undefined })}
                    />
                </div>
             )}
         </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="h-12 bg-[#18191b] border-b border-[#2a2a2a] flex items-center px-3 justify-between text-white z-30 relative select-none">
      
      {/* Left: Element Specific Tools */}
      <div className="flex items-center h-full gap-1">
        
        {singleSelection && singleSelection.type === 'text' && (
            <>
                {/* ... Font Select ... */}
                <div className="relative group mr-1">
                    <button className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1.5 rounded text-white text-sm font-normal min-w-[120px] justify-between border border-transparent hover:border-white/20 transition-all">
                        <span className="truncate max-w-[100px]">{singleSelection.fontFamily || 'Inter'}</span>
                        <ChevronDown size={12} className="text-gray-400" />
                    </button>
                     {/* Simplified select for demo */}
                    <select 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={singleSelection.fontFamily || 'Inter'}
                        onChange={(e) => onUpdateElement(singleSelection.id, { fontFamily: e.target.value })}
                    >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Open Sans">Open Sans</option>
                    </select>
                </div>
                
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                
                {/* Font Size */}
                <div className="flex items-center border border-white/20 rounded overflow-hidden h-7 mx-1 group hover:border-white/40 transition-colors">
                    <button onClick={() => onUpdateElement(singleSelection.id, { fontSize: Math.max(6, (singleSelection.fontSize || 16) - 1) })} className="hover:bg-white/10 px-2 h-full text-white">-</button>
                    <input className="w-10 text-center text-sm border-none bg-transparent outline-none text-white font-medium" value={singleSelection.fontSize} onChange={(e) => onUpdateElement(singleSelection.id, { fontSize: parseInt(e.target.value) || 16 })}/>
                    <button onClick={() => onUpdateElement(singleSelection.id, { fontSize: (singleSelection.fontSize || 16) + 1 })} className="hover:bg-white/10 px-2 h-full text-white">+</button>
                </div>

                <div className="w-px h-5 bg-white/10 mx-1"></div>

                 {/* Text Color */}
                 <div className="relative">
                     <button 
                        onClick={() => togglePopover('textColor')}
                        className={`w-7 h-7 rounded border border-white/20 relative overflow-hidden mx-1 hover:border-white/50 transition-colors ${activePopover === 'textColor' ? 'ring-2 ring-indigo-500' : ''}`}
                        title="Text Color"
                     >
                         <div className="w-full h-full" style={{ backgroundColor: singleSelection.color }}></div>
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference">
                             <span className="text-[10px] font-bold text-white">A</span>
                         </div>
                     </button>
                     {activePopover === 'textColor' && renderColorPopover('color', singleSelection.color)}
                 </div>

                 <div className="w-px h-5 bg-white/10 mx-1"></div>

                <ToolButton icon={Bold} isActive={singleSelection.fontWeight === 'bold'} onClick={() => onUpdateElement(singleSelection.id, { fontWeight: singleSelection.fontWeight === 'bold' ? 'normal' : 'bold' })} />
                <ToolButton icon={Italic} isActive={singleSelection.fontStyle === 'italic'} onClick={() => onUpdateElement(singleSelection.id, { fontStyle: singleSelection.fontStyle === 'italic' ? 'normal' : 'italic' })} />
                <ToolButton icon={Underline} isActive={singleSelection.textDecoration === 'underline'} onClick={() => onUpdateElement(singleSelection.id, { textDecoration: singleSelection.textDecoration === 'underline' ? 'none' : 'underline' })} />
                <ToolButton icon={Type} isActive={singleSelection.textTransform === 'uppercase'} onClick={() => onUpdateElement(singleSelection.id, { textTransform: singleSelection.textTransform === 'uppercase' ? 'none' : 'uppercase' })} label="Uppercase" />

                <div className="w-px h-5 bg-white/10 mx-1"></div>

                 <ToolButton icon={AlignLeft} isActive={singleSelection.textAlign === 'left' || !singleSelection.textAlign} onClick={() => onUpdateElement(singleSelection.id, { textAlign: 'left' })} />
                 <ToolButton icon={AlignCenter} isActive={singleSelection.textAlign === 'center'} onClick={() => onUpdateElement(singleSelection.id, { textAlign: 'center' })} />
                 <ToolButton icon={AlignRight} isActive={singleSelection.textAlign === 'right'} onClick={() => onUpdateElement(singleSelection.id, { textAlign: 'right' })} />
                 
                 <div className="w-px h-5 bg-white/10 mx-1"></div>

                 <button className="text-xs font-medium px-3 py-1.5 hover:bg-white/10 rounded text-white mx-1">Effects</button>
            </>
        )}

        {/* IMAGE TOOLS */}
        {singleSelection && singleSelection.type === 'image' && (
             <>
                <div className="relative">
                    <button 
                        onClick={() => togglePopover('filters')}
                        className={`text-xs font-medium px-3 py-1.5 rounded text-white border border-white/20 mx-1 transition-colors ${activePopover === 'filters' ? 'bg-indigo-600 border-indigo-600' : 'hover:bg-white/10'}`}
                    >
                        Edit photo
                    </button>
                    {activePopover === 'filters' && (
                        <div className="popover-content absolute top-full left-0 mt-2 w-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-white">
                             <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-4">Adjustments</div>
                             <div className="space-y-4">
                                 {[
                                     { label: 'Brightness', key: 'brightness', min: 0, max: 200, def: 100 },
                                     { label: 'Contrast', key: 'contrast', min: 0, max: 200, def: 100 },
                                     { label: 'Saturation', key: 'saturation', min: 0, max: 200, def: 100 },
                                     { label: 'Blur', key: 'blur', min: 0, max: 20, def: 0 },
                                     { label: 'Grayscale', key: 'grayscale', min: 0, max: 100, def: 0 },
                                 ].map(filter => (
                                     <div key={filter.key} className="space-y-1">
                                         <div className="flex justify-between text-xs text-gray-300">
                                             <span>{filter.label}</span>
                                             <span>{singleSelection.filters?.[filter.key as keyof NonNullable<CanvasElement['filters']>] ?? filter.def}</span>
                                         </div>
                                         <input 
                                            type="range" min={filter.min} max={filter.max}
                                            value={singleSelection.filters?.[filter.key as keyof NonNullable<CanvasElement['filters']>] ?? filter.def}
                                            onChange={(e) => handleFilterChange(filter.key as any, parseInt(e.target.value))}
                                            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                         />
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-white/10 mx-1"></div>

                 {/* Flip */}
                <div className="relative">
                    <button onClick={() => togglePopover('flip')} className={`text-xs font-medium px-3 py-1.5 rounded text-white mx-1 transition-colors ${activePopover === 'flip' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Flip</button>
                    {activePopover === 'flip' && (
                        <div className="popover-content absolute top-full left-0 mt-2 w-36 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-white">
                            <button onClick={() => onUpdateElement(singleSelection.id, { flipX: !singleSelection.flipX })} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] rounded text-xs text-gray-300 transition-colors"><FlipHorizontal size={14} /> Horizontal</button>
                             <button onClick={() => onUpdateElement(singleSelection.id, { flipY: !singleSelection.flipY })} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] rounded text-xs text-gray-300 transition-colors"><FlipVertical size={14} /> Vertical</button>
                        </div>
                    )}
                </div>

                {/* Corner Rounding for Images */}
                 <div className="w-px h-5 bg-white/10 mx-1"></div>
                 <div className="relative">
                     <button 
                         onClick={() => togglePopover('border')} 
                         className={`text-xs font-medium px-3 py-1.5 hover:bg-white/10 rounded text-white mx-1 ${activePopover === 'border' ? 'bg-white/10' : ''}`}
                     >
                         Border
                     </button>
                     {activePopover === 'border' && (
                         <div className="popover-content absolute top-full left-0 mt-2 w-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-white">
                             <div className="space-y-4">
                                 {/* Corner Rounding */}
                                 <div>
                                    <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Corner Rounding</span><span>{singleSelection.borderRadius || 0}</span></div>
                                    <input type="range" min="0" max="100" value={singleSelection.borderRadius || 0} onChange={(e) => onUpdateElement(singleSelection.id, { borderRadius: parseInt(e.target.value) })} className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                 </div>
                                 {/* Border Style */}
                                 <div>
                                     <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Border Style</span></div>
                                     <div className="grid grid-cols-4 gap-2">
                                         {['none', 'solid', 'dashed', 'dotted'].map(s => (
                                             <button key={s} onClick={() => onUpdateElement(singleSelection.id, { borderStyle: s as any })} className={`h-8 border border-gray-600 rounded hover:bg-white/10 ${singleSelection.borderStyle === s ? 'border-indigo-500 bg-indigo-500/20' : ''}`}>
                                                 {s === 'none' ? <span className="text-[10px]">None</span> : <div className="w-full h-0.5 bg-current mx-1" style={{ borderStyle: s as any, borderWidth: 1 }}></div>}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                                 {/* Border Width */}
                                 {(singleSelection.borderStyle && singleSelection.borderStyle !== 'none') && (
                                     <>
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Weight</span><span>{singleSelection.borderWidth || 0}</span></div>
                                            <input type="range" min="0" max="20" value={singleSelection.borderWidth || 0} onChange={(e) => onUpdateElement(singleSelection.id, { borderWidth: parseInt(e.target.value) })} className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                        </div>
                                        <div>
                                             <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Color</span></div>
                                             <div className="w-8 h-8 rounded border border-white/20 relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveSubPopover(activeSubPopover === 'borderColor' ? null : 'borderColor'); }}>
                                                  <div className="w-full h-full rounded" style={{ backgroundColor: singleSelection.borderColor || '#000' }}></div>
                                             </div>
                                             {activeSubPopover === 'borderColor' && (
                                                 <div className="popover-content absolute top-full left-0 mt-2 z-50 bg-[#1e1e1e] border border-white/10 rounded-xl p-2 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                     <ColorPickerPanel color={singleSelection.borderColor || '#000'} onChange={(c) => { onUpdateElement(singleSelection.id, { borderColor: c }); }} />
                                                 </div>
                                             )}
                                        </div>
                                     </>
                                 )}
                             </div>
                         </div>
                     )}
                 </div>
             </>
        )}

        {/* SHAPE TOOLS */}
        {singleSelection && (singleSelection.type === 'rectangle' || singleSelection.type === 'circle') && (
            <>
                <div className="relative">
                    <button 
                        onClick={() => togglePopover('fillColor')}
                        className={`w-7 h-7 rounded border border-white/20 relative overflow-hidden mx-1 ${activePopover === 'fillColor' ? 'ring-2 ring-indigo-500' : ''}`}
                        title="Color"
                    >
                        <div className="w-full h-full" style={{ background: singleSelection.backgroundColor }}></div>
                    </button>
                    {activePopover === 'fillColor' && renderColorPopover('backgroundColor', singleSelection.backgroundColor)}
                </div>

                 <div className="w-px h-5 bg-white/10 mx-1"></div>
                 
                 {/* Border & Corners */}
                 <div className="relative">
                     <button 
                        onClick={() => togglePopover('border')} 
                        className={`text-xs font-medium px-3 py-1.5 hover:bg-white/10 rounded text-white mx-1 ${activePopover === 'border' ? 'bg-white/10' : ''}`}
                     >
                         Border
                     </button>
                     {activePopover === 'border' && (
                         <div className="popover-content absolute top-full left-0 mt-2 w-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-white">
                             <div className="space-y-4">
                                 {/* Corner Rounding */}
                                 {singleSelection.type === 'rectangle' && (
                                     <div>
                                        <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Corner Rounding</span><span>{singleSelection.borderRadius || 0}</span></div>
                                        <input type="range" min="0" max="100" value={singleSelection.borderRadius || 0} onChange={(e) => onUpdateElement(singleSelection.id, { borderRadius: parseInt(e.target.value) })} className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                     </div>
                                 )}
                                 
                                 {/* Border Style */}
                                 <div>
                                     <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Border Style</span></div>
                                     <div className="grid grid-cols-4 gap-2">
                                         {['none', 'solid', 'dashed', 'dotted'].map(s => (
                                             <button key={s} onClick={() => onUpdateElement(singleSelection.id, { borderStyle: s as any })} className={`h-8 border border-gray-600 rounded hover:bg-white/10 ${singleSelection.borderStyle === s ? 'border-indigo-500 bg-indigo-500/20' : ''}`}>
                                                 {s === 'none' ? <span className="text-[10px]">None</span> : <div className="w-full h-0.5 bg-current mx-1" style={{ borderStyle: s as any, borderWidth: 1 }}></div>}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                                 
                                 {/* Border Width & Color */}
                                 {(singleSelection.borderStyle && singleSelection.borderStyle !== 'none') && (
                                     <>
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Weight</span><span>{singleSelection.borderWidth || 1}</span></div>
                                            <input type="range" min="1" max="20" value={singleSelection.borderWidth || 1} onChange={(e) => onUpdateElement(singleSelection.id, { borderWidth: parseInt(e.target.value) })} className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                                        </div>
                                         <div className="relative">
                                             <div className="flex justify-between text-xs text-gray-300 mb-2"><span>Border Color</span></div>
                                             <div className="w-8 h-8 rounded border border-white/20 relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveSubPopover(activeSubPopover === 'borderColor' ? null : 'borderColor'); }}>
                                                  <div className="w-full h-full rounded" style={{ backgroundColor: singleSelection.borderColor || '#000' }}></div>
                                             </div>
                                             {activeSubPopover === 'borderColor' && (
                                                 <div className="popover-content absolute top-full left-0 mt-2 z-[60] bg-[#1e1e1e] border border-white/10 rounded-xl p-2 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                     <ColorPickerPanel color={singleSelection.borderColor || '#000'} onChange={(c) => { onUpdateElement(singleSelection.id, { borderColor: c }); }} />
                                                 </div>
                                             )}
                                        </div>
                                     </>
                                 )}
                             </div>
                         </div>
                     )}
                 </div>
            </>
        )}

        {selectedElements.length > 1 && (
            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => isGrouped ? onUpdateElements(selectedIds, { groupId: undefined }) : onUpdateElements(selectedIds, { groupId: Date.now().toString() })} 
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded text-xs font-medium transition-colors"
                 >
                     {isGrouped ? <Ungroup size={14} /> : <Group size={14} />}
                     {isGrouped ? "Ungroup" : "Group"}
                 </button>
                 <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-0.5 rounded ml-2">{selectedElements.length} items</span>
            </div>
        )}

      </div>

      <div className="flex items-center gap-1 pl-4 border-l border-white/10 ml-2 h-6">
         
         {/* Position Button (Correctly Anchored) */}
         <div className="relative">
             <button 
                onClick={() => togglePopover('position')}
                className={`text-xs font-medium px-3 py-1.5 rounded text-white mx-1 transition-colors ${activePopover === 'position' ? 'bg-white/20' : 'hover:bg-white/10'}`}
             >
                 Position
             </button>
             {activePopover === 'position' && renderPositionPopover()}
         </div>

         <ToolButton 
            onClick={() => togglePopover('opacity')} 
            icon={Droplet} 
            label="Transparency" 
            isActive={activePopover === 'opacity'}
        />
         {activePopover === 'opacity' && (
                <div className="popover-content absolute top-full right-0 mt-2 w-56 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-white">
                    <div className="flex justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-3">Transparency</div>
                    <div className="flex items-center gap-3">
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={singleSelection?.opacity ?? 1} 
                            onChange={(e) => onUpdateElements(selectedIds, { opacity: parseFloat(e.target.value) })} 
                            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                        <span className="text-xs font-medium w-8 text-right">{Math.round((singleSelection?.opacity ?? 1) * 100)}%</span>
                    </div>
                </div>
         )}
         
         <div className="w-px h-5 bg-white/10 mx-1"></div>

         <ToolButton 
            onClick={() => onDuplicate(selectedIds)} 
            icon={Copy} 
            label="Duplicate" 
         />

         <ToolButton 
            onClick={() => onDelete(selectedIds)} 
            icon={Trash2} 
            label="Delete" 
         />
         
         <ToolButton 
            onClick={() => onUpdateElements(selectedIds, { locked: !selectedElements[0]?.locked })} 
            isActive={selectedElements[0]?.locked}
            icon={selectedElements[0]?.locked ? Lock : Unlock} 
            label={selectedElements[0]?.locked ? "Unlock" : "Lock"}
         />
      </div>

    </div>
  );
};

export default PropertiesPanel;
