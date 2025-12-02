
import React, { useRef } from 'react';
import { CanvasElement } from '../types';
import { Type, Image as ImageIcon, Square, Circle, Lock, ArrowUp, ArrowDown, GripVertical, Eye, EyeOff } from 'lucide-react';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelect: (id: string, multi: boolean) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ elements, selectedIds, onSelect, onReorder, onUpdate }) => {
  // Sort elements by zIndex (highest first for display list)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={14} />;
      case 'image': return <ImageIcon size={14} />;
      case 'circle': return <Circle size={14} />;
      default: return <Square size={14} />;
    }
  };

  const getLabel = (el: CanvasElement) => {
      if (el.name) return el.name;
      if (el.type === 'text') return el.content || 'Text';
      return el.type.charAt(0).toUpperCase() + el.type.slice(1);
  };

  const handleDragStart = (e: React.DragEvent, position: number) => {
      dragItem.current = position;
      e.dataTransfer.effectAllowed = 'move';
      // Make the drag image invisible or custom if needed, default is fine usually
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
      dragOverItem.current = position;
  };

  const handleDragEnd = () => {
      if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
          onReorder(dragItem.current, dragOverItem.current);
      }
      dragItem.current = null;
      dragOverItem.current = null;
  };

  const handleMove = (e: React.MouseEvent, id: string, direction: 'up' | 'down') => {
      e.stopPropagation();
      const currentEl = elements.find(el => el.id === id);
      if (!currentEl) return;
      
      // Simple Move logic (zIndex swap handled by App parent ideally, but here simple increment)
      const newZ = direction === 'up' ? currentEl.zIndex + 1 : currentEl.zIndex - 1;
      onUpdate(id, { zIndex: newZ });
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
      <div className="p-4 border-b border-white/5 bg-[#1e1e1e]">
        <h3 className="font-semibold text-sm text-gray-200">Layers</h3>
        <p className="text-xs text-gray-500 mt-1">Drag and drop to reorder layers</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {sortedElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-xs">
                <p>No layers yet</p>
            </div>
        ) : (
            sortedElements.map((el, index) => (
            <div
                key={el.id}
                draggable={!el.locked}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={(e) => onSelect(el.id, e.shiftKey || e.ctrlKey)}
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border border-transparent select-none relative ${
                selectedIds.includes(el.id)
                    ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                    : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                }`}
            >
                <div className={`text-gray-600 ${el.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}>
                    <GripVertical size={12} />
                </div>
                
                <div className={`p-1.5 rounded-md flex items-center justify-center ${selectedIds.includes(el.id) ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5'}`}>
                    {getIcon(el.type)}
                </div>

                <span className="text-xs font-medium truncate flex-1">
                    {getLabel(el)}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { locked: !el.locked }); }}
                        className={`p-1 rounded hover:bg-white/10 ${el.locked ? 'text-red-400 opacity-100' : 'text-gray-400'}`}
                    >
                        <Lock size={12} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { opacity: el.opacity === 0 ? 1 : 0 }); }}
                        className={`p-1 rounded hover:bg-white/10 ${el.opacity === 0 ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                         {el.opacity === 0 ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
