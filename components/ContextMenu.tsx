import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, Layers, ArrowUp, ArrowDown, CopyPlus, ClipboardPaste } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  hasSelection: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, onClose, onCopy, onPaste, onDuplicate, onDelete, onBringForward, onSendBackward, hasSelection
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!hasSelection) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed w-56 bg-white rounded-lg shadow-2xl border border-slate-100 z-50 py-1.5 flex flex-col text-[13px] text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <button onClick={onCopy} className="group flex items-center justify-between px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-1 rounded-md">
        <div className="flex items-center gap-2.5">
            <Copy size={14} className="text-slate-400 group-hover:text-indigo-500"/> <span>Copy</span>
        </div>
        <span className="text-slate-400 text-[10px] font-medium tracking-wide">⌘C</span>
      </button>
      
      <button onClick={onPaste} className="group flex items-center justify-between px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-1 rounded-md">
        <div className="flex items-center gap-2.5">
            <ClipboardPaste size={14} className="text-slate-400 group-hover:text-indigo-500"/> <span>Paste</span>
        </div>
        <span className="text-slate-400 text-[10px] font-medium tracking-wide">⌘V</span>
      </button>
      
      <button onClick={onDuplicate} className="group flex items-center justify-between px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-1 rounded-md">
         <div className="flex items-center gap-2.5">
            <CopyPlus size={14} className="text-slate-400 group-hover:text-indigo-500"/> <span>Duplicate</span>
         </div>
      </button>
      
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      <button onClick={onBringForward} className="group flex items-center justify-between px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-1 rounded-md">
        <div className="flex items-center gap-2.5">
            <ArrowUp size={14} className="text-slate-400 group-hover:text-indigo-500"/> <span>Bring Forward</span>
        </div>
        <span className="text-slate-400 text-[10px] font-medium tracking-wide">]</span>
      </button>
      
      <button onClick={onSendBackward} className="group flex items-center justify-between px-3 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-1 rounded-md">
        <div className="flex items-center gap-2.5">
            <ArrowDown size={14} className="text-slate-400 group-hover:text-indigo-500"/> <span>Send Backward</span>
        </div>
        <span className="text-slate-400 text-[10px] font-medium tracking-wide">[</span>
      </button>
      
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      <button onClick={onDelete} className="group flex items-center justify-between px-3 py-2 hover:bg-red-50 hover:text-red-600 text-red-500 transition-colors mx-1 rounded-md">
        <div className="flex items-center gap-2.5">
            <Trash2 size={14} className="group-hover:text-red-600"/> <span>Delete</span>
        </div>
        <span className="text-red-300 group-hover:text-red-500 text-[10px] font-medium tracking-wide">DEL</span>
      </button>
    </div>
  );
};

export default ContextMenu;