
import React, { useState, useEffect, useRef } from 'react';
import { CanvasElement } from '../types';
import { ImageOff } from 'lucide-react';

interface ElementNodeProps {
  element: CanvasElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

const ElementNode: React.FC<ElementNodeProps> = ({
  element,
  isSelected,
  onMouseDown,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
      if (!isSelected) setIsEditing(false);
  }, [isSelected]);

  // Reset error state if content (URL) changes
  useEffect(() => {
      if (element.type === 'image') {
          setImgError(false);
      }
  }, [element.content, element.type]);

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
    transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
    zIndex: element.zIndex,
    opacity: element.opacity ?? 1,
    cursor: element.locked ? 'default' : 'move',
    fontFamily: element.fontFamily || 'Inter, sans-serif',
    pointerEvents: 'auto',
    willChange: 'transform, left, top',
  };

  const renderContent = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <div
            className="w-full h-full transition-all"
            style={{ 
                background: element.backgroundColor || '#cbd5e1',
                borderRadius: `${element.borderRadius || 0}px`,
                borderWidth: `${element.borderWidth || 0}px`,
                borderColor: element.borderColor || 'transparent',
                borderStyle: element.borderStyle || 'solid',
            }}
          />
        );
      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full transition-all"
            style={{ 
                background: element.backgroundColor || '#cbd5e1',
                borderWidth: `${element.borderWidth || 0}px`,
                borderColor: element.borderColor || 'transparent',
                borderStyle: element.borderStyle || 'solid',
            }}
          />
        );
      case 'image':
        if (imgError) {
             return (
                 <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-300 rounded overflow-hidden select-none">
                     <ImageOff size={24} strokeWidth={1.5} />
                     <span className="text-[10px] mt-1 font-medium">Image failed</span>
                 </div>
             );
        }
        return (
          <div className="w-full h-full overflow-hidden" 
               style={{ 
                   borderRadius: `${element.borderRadius || 0}px`,
                   borderWidth: `${element.borderWidth || 0}px`,
                   borderColor: element.borderColor || 'transparent',
                   borderStyle: element.borderStyle || 'solid',
                }}>
             <img
                src={element.content}
                alt="element"
                className="w-full h-full object-cover pointer-events-none select-none transition-all"
                style={{ filter: getFilterString() }}
                draggable={false}
                onError={() => setImgError(true)}
             />
          </div>
        );
      case 'text':
        const textStyle: React.CSSProperties = {
            fontSize: `${element.fontSize || 16}px`,
            color: element.color || '#000',
            lineHeight: element.lineHeight || 1.4,
            letterSpacing: `${element.letterSpacing || 0}em`,
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            textDecoration: element.textDecoration || 'none',
            textTransform: element.textTransform || 'none',
            textAlign: element.textAlign || 'left',
            fontFamily: element.fontFamily || 'Inter, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            width: '100%',
            height: '100%',
        };

        const alignStyle = {
             alignItems: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
             justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
             textAlign: element.textAlign || 'left'
        };

        if (isEditing) {
            return (
                <textarea
                    ref={textAreaRef}
                    value={element.content}
                    onChange={handleTextChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => { if(e.key === 'Escape') setIsEditing(false); e.stopPropagation(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full bg-transparent resize-none outline-none overflow-hidden p-0 m-0 border-none"
                    style={{
                        ...textStyle,
                    }}
                />
            );
        }
        return (
            <div 
                className="w-full h-full p-0 m-0 select-none"
                style={{
                    ...textStyle,
                    ...alignStyle,
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
      onMouseDown={(e) => !element.locked && !isEditing && onMouseDown(e, element.id)}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`w-full h-full relative transition-shadow duration-200 ${
          isSelected 
          ? '' 
          : 'hover:outline hover:outline-1 hover:outline-indigo-400/50'
      }`}>
          {renderContent()}
      </div>
    </div>
  );
};

export default ElementNode;
