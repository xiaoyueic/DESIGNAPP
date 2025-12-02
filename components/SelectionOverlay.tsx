
import React from 'react';
import { RotateCw, Lock, Copy, Trash2, Group, Ungroup } from 'lucide-react';

interface SelectionOverlayProps {
  bounds: { x: number; y: number; width: number; height: number; rotation: number };
  zoom: number;
  isLocked: boolean;
  hasMultipleSelection: boolean;
  isGrouped: boolean;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  bounds,
  zoom,
  isLocked,
  hasMultipleSelection,
  isGrouped,
  onResizeStart,
  onRotateStart,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup
}) => {
  const borderStyle = isLocked ? '2px solid #ef4444' : '2px solid #6366f1';
  const handleColor = isLocked ? '#ef4444' : '#6366f1';
  
  // Floating toolbar offset - unused but kept for ref
  // const toolbarOffset = 50 / zoom;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-none"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        transform: `rotate(${bounds.rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Border Box */}
      <div 
        className="w-full h-full absolute top-0 left-0"
        style={{ border: borderStyle }}
      ></div>

      {/* Floating Action Bar (Above Selection) */}
      {!isLocked && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white shadow-lg rounded-lg px-2 py-1 pointer-events-auto border border-slate-100"
          style={{ bottom: `calc(100% + 12px)` }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
        >
          <button onClick={onDuplicate} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600" title="Duplicate">
            <Copy size={14} />
          </button>
          <div className="w-px h-3 bg-slate-200"></div>
          {hasMultipleSelection && !isGrouped && onGroup && (
             <button onClick={onGroup} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600" title="Group">
                <Group size={14} />
             </button>
          )}
          {isGrouped && onUngroup && (
             <button onClick={onUngroup} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600" title="Ungroup">
                <Ungroup size={14} />
             </button>
          )}
          <div className="w-px h-3 bg-slate-200"></div>
          <button onClick={onDelete} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-red-500" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Resize Handles (Only if not locked) */}
      {!isLocked && (
        <>
           {/* All Handles: Corners (nw, ne, se, sw) + Edges (n, e, s, w) */}
           {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => {
             const isCorner = h.length === 2;
             const isVerticalEdge = h === 'e' || h === 'w';
             
             // Base Style
             let style: React.CSSProperties = {
                position: 'absolute',
                backgroundColor: 'white',
                border: '1px solid #cbd5e1', // slate-300
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                pointerEvents: 'auto',
                zIndex: 50,
                borderColor: handleColor,
                cursor: `${h}-resize`
             };

             if (isCorner) {
                 style.width = 12;
                 style.height = 12;
                 style.borderRadius = '50%';
                 // Corner positions
                 if (h.includes('n')) style.top = -6; else style.bottom = -6;
                 if (h.includes('w')) style.left = -6; else style.right = -6;
             } else {
                 // Edge positions (Pill shape)
                 style.borderRadius = 4;
                 
                 if (isVerticalEdge) {
                     style.width = 6;
                     style.height = 14;
                     style.top = '50%';
                     style.marginTop = -7; // Center vertically
                     if (h === 'w') style.left = -3; else style.right = -3;
                 } else { // Horizontal edge (n, s)
                     style.width = 14;
                     style.height = 6;
                     style.left = '50%';
                     style.marginLeft = -7; // Center horizontally
                     if (h === 'n') style.top = -3; else style.bottom = -3;
                 }
             }

             return (
                 <div
                    key={h}
                    className="hover:scale-125 transition-transform"
                    style={style}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onResizeStart(e, h);
                    }}
                 />
             );
           })}

           {/* Rotation Handle (Only single selection or group) */}
           {(!hasMultipleSelection || isGrouped) && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing pointer-events-auto group"
                style={{ bottom: -30 }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onRotateStart(e);
                }}
              >
                  <div className="w-px h-3" style={{ backgroundColor: handleColor }}></div>
                  <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 border border-slate-200" style={{ color: handleColor }}>
                      <RotateCw size={12} />
                  </div>
              </div>
           )}
        </>
      )}

      {isLocked && (
          <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow border border-slate-100 text-red-500">
              <Lock size={12} />
          </div>
      )}

    </div>
  );
};

export default SelectionOverlay;
