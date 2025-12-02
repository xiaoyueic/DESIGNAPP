import React, { useState, useEffect, useRef } from 'react';
import { CanvasElement } from '../types';
import { RotateCw, Lock } from 'lucide-react';

interface ElementNodeProps {
  element: CanvasElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string, type: 'drag' | 'resize' | 'rotate', handle?: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

const ElementNode: React.FC<ElementNodeProps> = ({
  element,
  isSelected,
  onMouseDown,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (element.type === 'text' && !element.locked) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(element.id, { content: e.target.value });
  };

  const getFilterString = () => {
    if (!element.filters) return 'none';
    const { brightness, contrast, saturation, grayscale, blur } = element.filters;
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
    opacity: element.opacity ?? 1,
    cursor: element.locked ? 'default' : (isSelected ? 'move' : 'default'),
    fontFamily: element.fontFamily || 'Inter, sans-serif',
    pointerEvents: 'auto'
  };

  const renderContent = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <div
            className="w-full h-full border-box transition-all"
            style={{ 
                backgroundColor: element.backgroundColor || '#cbd5e1',
                borderRadius: '4px',
                border: element.border || 'none'
            }}
          />
        );
      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full transition-all"
            style={{ 
                backgroundColor: element.backgroundColor || '#cbd5e1',
                border: element.border || 'none'
            }}
          />
        );
      case 'image':
        return (
          <img
            src={element.content}
            alt="element"
            className="w-full h-full object-cover pointer-events-none select-none transition-all"
            style={{ filter: getFilterString() }}
            draggable={false}
          />
        );
      case 'text':
        if (isEditing) {
            return (
                <textarea
                    ref={textAreaRef}
                    value={element.content}
                    onChange={handleTextChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => { if(e.key === 'Escape') setIsEditing(false); e.stopPropagation(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full bg-transparent resize-none outline-none overflow-hidden"
                    style={{
                        fontSize: `${element.fontSize || 16}px`,
                        color: element.color || '#000',
                        lineHeight: 1.2,
                        fontWeight: element.fontWeight || 'normal',
                        fontStyle: element.fontStyle || 'normal',
                        textDecoration: element.textDecoration || 'none',
                        textAlign: element.textAlign || 'left',
                        fontFamily: element.fontFamily || 'Inter, sans-serif'
                    }}
                />
            );
        }
        return (
            <div 
                className="w-full h-full flex items-center p-0 whitespace-pre-wrap break-words select-none"
                style={{
                    fontSize: `${element.fontSize || 16}px`,
                    color: element.color || '#000',
                    lineHeight: 1.2,
                    fontWeight: element.fontWeight || 'normal',
                    fontStyle: element.fontStyle || 'normal',
                    textDecoration: element.textDecoration || 'none',
                    textAlign: element.textAlign || 'left',
                    alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                }}
            >
                {element.content}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={style}
      className="absolute group select-none"
      onMouseDown={(e) => !element.locked && onMouseDown(e, element.id, 'drag')}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`w-full h-full relative transition-shadow duration-200 ${
          isSelected ? 'outline outline-2 outline-indigo-500' : 'hover:outline hover:outline-2 hover:outline-indigo-300'
      } ${element.locked && isSelected ? 'outline-red-400' : ''}`}>
          {renderContent()}
          
          {element.locked && isSelected && (
              <div className="absolute -top-3 -right-3 text-red-500 bg-white rounded-full p-1.5 shadow-md z-50 border border-slate-100">
                  <Lock size={12} />
              </div>
          )}
      </div>

      {isSelected && !element.locked && !isEditing && (
        <>
          {/* Corner Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full cursor-nw-resize z-50 shadow-sm transition-transform hover:scale-125"
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'nw'); }} />
            
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full cursor-ne-resize z-50 shadow-sm transition-transform hover:scale-125"
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'ne'); }} />
            
          <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full cursor-sw-resize z-50 shadow-sm transition-transform hover:scale-125"
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'sw'); }} />
            
          <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 shadow-sm transition-transform hover:scale-125"
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'se'); }} />

          {/* Side Pills */}
          <div className="absolute top-1/2 -left-1 w-1.5 h-6 -mt-3 bg-white border border-indigo-500 rounded-full cursor-w-resize z-40 hidden md:block shadow-sm hover:scale-x-150 transition-transform"
             onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'w'); }}/>
          <div className="absolute top-1/2 -right-1 w-1.5 h-6 -mt-3 bg-white border border-indigo-500 rounded-full cursor-e-resize z-40 hidden md:block shadow-sm hover:scale-x-150 transition-transform"
             onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'e'); }}/>
          <div className="absolute left-1/2 -top-1 w-6 h-1.5 -ml-3 bg-white border border-indigo-500 rounded-full cursor-n-resize z-40 hidden md:block shadow-sm hover:scale-y-150 transition-transform"
             onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 'n'); }}/>
          <div className="absolute left-1/2 -bottom-1 w-6 h-1.5 -ml-3 bg-white border border-indigo-500 rounded-full cursor-s-resize z-40 hidden md:block shadow-sm hover:scale-y-150 transition-transform"
             onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'resize', 's'); }}/>

          {/* Rotation Handle */}
          <div 
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, element.id, 'rotate', 'rot'); }}
          >
             <div className="w-px h-4 bg-indigo-500"></div>
             <div className="w-6 h-6 bg-white border border-indigo-500 rounded-full shadow-md flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-colors">
                <RotateCw size={12} />
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ElementNode;