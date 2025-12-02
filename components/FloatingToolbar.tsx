
import React from 'react';
import { Copy, Trash2, Lock, Unlock, MoreHorizontal, CopyPlus, MessageSquare } from 'lucide-react';

interface FloatingToolbarProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onLock: () => void;
  isLocked: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ x, y, onDuplicate, onDelete, onLock, isLocked }) => {
  return (
    <div 
        className="fixed z-50 flex items-center bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200"
        style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}
        onMouseDown={(e) => e.stopPropagation()} 
    >
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-700 hover:text-indigo-600 transition-colors" title="Duplicate" onClick={onDuplicate}>
            <CopyPlus size={18} />
        </button>
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-700 hover:text-red-500 transition-colors" title="Delete" onClick={onDelete}>
            <Trash2 size={18} />
        </button>
         <button className="p-2 hover:bg-slate-100 rounded-full text-slate-700 hover:text-indigo-600 transition-colors" title={isLocked ? "Unlock" : "Lock"} onClick={onLock}>
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
        </button>
        
        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-700 hover:text-indigo-600 transition-colors" title="Comment">
            <MessageSquare size={18} />
        </button>
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-700 hover:text-indigo-600 transition-colors" title="More">
            <MoreHorizontal size={18} />
        </button>
    </div>
  );
};

export default FloatingToolbar;
