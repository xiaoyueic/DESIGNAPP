import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, ElementFilters } from '../types';
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Layers, Trash2, Copy, Lock, Unlock,
  Image as ImageIcon, SlidersVertical,
  LayoutGrid, ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine,
  ChevronDown, Type, Droplet, Sun
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null;
  canvasConfig: { width: number; height: number };
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

// Helper component for tool buttons
const ToolButton = ({ onClick, isActive, icon: Icon, label, disabled }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
            isActive 
            ? 'bg-indigo-50 text-indigo-600' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
        <Icon size={18} />
    </button>
);

// Helper for divider
const Divider = () => <div className="w-px h-6 bg-slate-200 mx-2"></div>;

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedElement, 
  canvasConfig,
  onUpdateElement,
  onDelete,
  onDuplicate
}) => {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedElement) {
    return (
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm z-20 relative">
          <span className="text-xs font-medium text-slate-400 select-none">Select an element to edit properties</span>
      </div>
    );
  }

  const updateFilter = (key: keyof ElementFilters, value: number) => {
    const currentFilters = selectedElement.filters || { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, blur: 0 };
    onUpdateElement(selectedElement.id, {
        filters: { ...currentFilters, [key]: value }
    });
  };

  const handleAlign = (type: 'h-center' | 'v-center' | 'top' | 'bottom' | 'left' | 'right') => {
      const updates: Partial<CanvasElement> = {};
      switch(type) {
          case 'h-center': updates.x = (canvasConfig.width - selectedElement.width) / 2; break;
          case 'v-center': updates.y = (canvasConfig.height - selectedElement.height) / 2; break;
          case 'top': updates.y = 0; break;
          case 'bottom': updates.y = canvasConfig.height - selectedElement.height; break;
          case 'left': updates.x = 0; break;
          case 'right': updates.x = canvasConfig.width - selectedElement.width; break;
      }
      onUpdateElement(selectedElement.id, updates);
      setActivePopover(null);
  };

  const togglePopover = (name: string) => {
      setActivePopover(activePopover === name ? null : name);
  };

  return (
    <div ref={panelRef} className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between animate-in slide-in-from-top-1 duration-200 z-30 relative shadow-sm">
      
      {/* Left: Element Specific Tools */}
      <div className="flex items-center h-full">
        
        {/* COLOR PICKER */}
        {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'text') && (
            <>
                <div className="flex items-center gap-2 relative">
                    <button 
                        className="w-8 h-8 rounded border border-slate-300 shadow-sm relative overflow-hidden transition-all hover:ring-2 hover:ring-indigo-100 group"
                        title="Color"
                    >
                        <input
                            type="color"
                            value={selectedElement.type === 'text' ? selectedElement.color : selectedElement.backgroundColor}
                            onChange={(e) => onUpdateElement(selectedElement.id, 
                                selectedElement.type === 'text' 
                                    ? { color: e.target.value } 
                                    : { backgroundColor: e.target.value }
                            )}
                            className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 p-0 border-0 cursor-pointer opacity-0"
                        />
                        <div 
                            className="w-full h-full"
                            style={{ backgroundColor: selectedElement.type === 'text' ? selectedElement.color : selectedElement.backgroundColor }}
                        />
                    </button>
                </div>
                <Divider />
            </>
        )}

        {/* TEXT TOOLS */}
        {selectedElement.type === 'text' && (
            <>
                {/* Font Family */}
                <div className="relative group">
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md text-slate-700 text-sm font-medium">
                        <Type size={14} className="text-slate-400"/>
                        <select 
                            className="bg-transparent border-none outline-none cursor-pointer w-28 text-sm appearance-none"
                            value={selectedElement.fontFamily || 'Inter'}
                            onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                        >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Playfair Display">Playfair</option>
                            <option value="Merriweather">Merriweather</option>
                            <option value="Arial">Arial</option>
                            <option value="Courier New">Courier</option>
                        </select>
                        <ChevronDown size={12} className="text-slate-400" />
                    </div>
                </div>
                
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                
                {/* Font Size */}
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden h-8">
                    <button onClick={() => onUpdateElement(selectedElement.id, { fontSize: Math.max(8, (selectedElement.fontSize || 16) - 1) })} className="hover:bg-slate-50 px-2 h-full text-slate-500 border-r border-slate-100">-</button>
                    <input className="w-10 text-center text-sm border-none bg-transparent outline-none font-medium text-slate-700" value={selectedElement.fontSize} onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}/>
                    <button onClick={() => onUpdateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 16) + 1 })} className="hover:bg-slate-50 px-2 h-full text-slate-500 border-l border-slate-100">+</button>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-2"></div>

                {/* Styling */}
                <div className="flex items-center gap-1">
                     <ToolButton icon={Bold} isActive={selectedElement.fontWeight === 'bold'} onClick={() => onUpdateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })} />
                     <ToolButton icon={Italic} isActive={selectedElement.fontStyle === 'italic'} onClick={() => onUpdateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })} />
                     <ToolButton icon={Underline} isActive={selectedElement.textDecoration === 'underline'} onClick={() => onUpdateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' })} />
                </div>

                <div className="w-px h-6 bg-slate-200 mx-2"></div>

                 {/* Alignment */}
                 <div className="flex items-center gap-1">
                     <ToolButton icon={AlignLeft} isActive={selectedElement.textAlign === 'left' || !selectedElement.textAlign} onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'left' })} />
                     <ToolButton icon={AlignCenter} isActive={selectedElement.textAlign === 'center'} onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'center' })} />
                     <ToolButton icon={AlignRight} isActive={selectedElement.textAlign === 'right'} onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'right' })} />
                </div>
                
                <Divider />
            </>
        )}

        {/* IMAGE FILTERS */}
        {selectedElement.type === 'image' && (
             <>
                 <div className="relative">
                     <button 
                        onClick={() => togglePopover('filters')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePopover === 'filters' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-700'}`}
                     >
                        <SlidersVertical size={16} /> Edit Image
                     </button>

                     {activePopover === 'filters' && (
                         <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-100">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image Adjustments</h4>
                             </div>
                             <div className="space-y-5">
                                 {['Brightness', 'Contrast', 'Saturation'].map((filter) => {
                                     const key = filter.toLowerCase() as keyof ElementFilters;
                                     return (
                                        <div key={key} className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-600 font-medium">
                                                <span>{filter}</span>
                                                <span className="text-slate-400">{selectedElement.filters?.[key] ?? 100}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="200" 
                                                value={selectedElement.filters?.[key] ?? 100} 
                                                onChange={(e) => updateFilter(key, parseInt(e.target.value))} 
                                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                                            />
                                        </div>
                                     )
                                 })}
                                  <div className="pt-2 border-t border-slate-100">
                                      <div className="flex justify-between text-xs text-slate-600 font-medium mb-2">
                                          <span>Grayscale</span>
                                          <span className="text-slate-400">{selectedElement.filters?.grayscale ?? 0}%</span>
                                      </div>
                                      <input type="range" min="0" max="100" value={selectedElement.filters?.grayscale ?? 0} onChange={(e) => updateFilter('grayscale', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"/>
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>
                 <Divider />
             </>
        )}

        {/* OPACITY POPUP */}
        <div className="relative">
             <button 
                onClick={() => togglePopover('opacity')}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${activePopover === 'opacity' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Transparency"
             >
                <Droplet size={18} />
             </button>

             {activePopover === 'opacity' && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Transparency</div>
                    <div className="flex items-center gap-3">
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={selectedElement.opacity ?? 1} 
                            onChange={(e) => onUpdateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs font-medium text-slate-600 w-8 text-right">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                    </div>
                </div>
             )}
        </div>

        {/* POSITION POPUP */}
        <div className="relative ml-1">
             <button 
                onClick={() => togglePopover('position')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePopover === 'position' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-700'}`}
             >
                 Position <ChevronDown size={14} className={`transition-transform duration-200 ${activePopover === 'position' ? 'rotate-180' : ''}`}/>
             </button>

             {activePopover === 'position' && (
                 <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 grid grid-cols-2 gap-1">
                     <div className="col-span-2 px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Align to Page</div>
                     <button onClick={() => handleAlign('left')} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><ArrowLeftToLine size={14}/> Left</button>
                     <button onClick={() => handleAlign('h-center')} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><AlignCenter size={14}/> Center</button>
                     <button onClick={() => handleAlign('right')} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><ArrowRightToLine size={14}/> Right</button>
                     <button onClick={() => handleAlign('top')} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><ArrowUpToLine size={14}/> Top</button>
                     <button onClick={() => handleAlign('v-center')} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><LayoutGrid size={14}/> Middle</button>
                     <button onClick={() => handleAlign('bottom')} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><ArrowDownToLine size={14}/> Bottom</button>
                     
                     <div className="col-span-2 h-px bg-slate-100 my-1"></div>
                     
                     <div className="col-span-2 px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Layering</div>
                     <button onClick={() => {onUpdateElement(selectedElement.id, { zIndex: (selectedElement.zIndex || 1) + 1 }); }} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><Layers size={14} className="rotate-180"/> Bring Forward</button>
                     <button onClick={() => {onUpdateElement(selectedElement.id, { zIndex: Math.max(0, (selectedElement.zIndex || 1) - 1) }); }} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded text-xs text-slate-600 transition-colors"><Layers size={14}/> Send Backward</button>
                 </div>
             )}
        </div>

      </div>

      {/* Right: General Actions */}
      <div className="flex items-center gap-2 pl-4 border-l border-slate-200 h-8">
         <ToolButton 
            onClick={() => onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })} 
            isActive={selectedElement.locked}
            icon={selectedElement.locked ? Lock : Unlock} 
            label={selectedElement.locked ? "Unlock" : "Lock"}
        />
         <ToolButton onClick={() => onDuplicate(selectedElement.id)} icon={Copy} label="Duplicate" />
         <button onClick={() => onDelete(selectedElement.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={18} />
         </button>
      </div>

    </div>
  );
};

export default PropertiesPanel;