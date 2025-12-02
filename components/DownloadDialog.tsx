
import React, { useState } from 'react';
import { X, ChevronDown, Download, Image as ImageIcon, FileText, FileCode, Video, Check } from 'lucide-react';
import { ExportFormat } from '../types';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (config: { format: ExportFormat; scale: number; transparent: boolean }) => void;
  canvasName: string;
}

const DownloadDialog: React.FC<DownloadDialogProps> = ({ isOpen, onClose, onDownload, canvasName }) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  if (!isOpen) return null;

  const formats = [
    { id: 'jpg', label: 'JPG', sub: 'Best for sharing', icon: ImageIcon },
    { id: 'png', label: 'PNG', sub: 'Best for complex images', icon: ImageIcon, recommended: true },
    { id: 'pdf', label: 'PDF Standard', sub: 'Best for documents', icon: FileText },
    { id: 'svg', label: 'SVG', sub: 'Best for vector editing', icon: FileCode, premium: true },
    { id: 'mp4', label: 'MP4 Video', sub: 'High quality video', icon: Video },
  ];

  const currentFormat = formats.find(f => f.id === format) || formats[1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[360px] bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 text-white overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-sm">Download</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* File Type Selector */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-gray-400">File Type</label>
            <button 
                onClick={() => setShowFormats(!showFormats)}
                className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333] border border-white/10 rounded-lg px-3 py-3 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <currentFormat.icon size={18} className="text-gray-300"/>
                    <div className="text-left">
                         <span className="text-sm font-medium block">{currentFormat.label}</span>
                    </div>
                    {currentFormat.recommended && (
                         <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-medium">Suggested</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showFormats ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showFormats && (
                <div className="absolute top-full left-0 w-full mt-1 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
                    {formats.map(f => (
                        <button
                            key={f.id}
                            onClick={() => { setFormat(f.id as ExportFormat); setShowFormats(false); }}
                            className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/5 transition-colors text-left"
                        >
                             <div className="flex items-center gap-3">
                                <f.icon size={18} className="text-gray-400"/>
                                <div>
                                    <div className="text-sm font-medium flex items-center gap-2">
                                        {f.label} 
                                        {f.recommended && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded">Suggested</span>}
                                        {f.premium && <span className="text-[10px] text-yellow-500">👑</span>}
                                    </div>
                                    <div className="text-xs text-gray-500">{f.sub}</div>
                                </div>
                             </div>
                             {format === f.id && <Check size={16} className="text-indigo-400" />}
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Size Slider (Only for Image types) */}
          {(format === 'png' || format === 'jpg') && (
              <div className="space-y-3">
                  <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400">Size <span className="font-normal normal-case ml-1 text-gray-500">x {scale}</span></label>
                      <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 px-2 py-1 bg-[#2a2a2a] rounded border border-white/5">{Math.round(800 * scale)} x {Math.round(600 * scale)} px</span>
                          <span className="text-yellow-500 text-xs">👑</span>
                      </div>
                  </div>
                  <div className="relative h-6 flex items-center">
                      <input 
                        type="range" min="0.5" max="3" step="0.125"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                  </div>
              </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2">
             <label className="flex items-center gap-3 cursor-pointer group">
                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${transparent ? 'bg-indigo-600 border-indigo-600' : 'border-gray-500 group-hover:border-gray-400'}`}>
                     {transparent && <Check size={12} />}
                 </div>
                 <input type="checkbox" className="hidden" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
                 <span className="text-sm text-gray-300">Transparent background</span>
                 <span className="text-yellow-500 text-xs ml-auto">👑</span>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="w-5 h-5 rounded border border-gray-500 group-hover:border-gray-400 flex items-center justify-center transition-colors"></div>
                 <span className="text-sm text-gray-300">Compress file (lower quality)</span>
                 <span className="text-yellow-500 text-xs ml-auto">👑</span>
             </label>
          </div>
          
           {/* Page Select */}
           <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-gray-400">Select Pages</label>
                <div className="bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-sm flex justify-between items-center cursor-pointer hover:bg-[#333]">
                    <span>Current Page (Page 1)</span>
                    <ChevronDown size={14} className="text-gray-400"/>
                </div>
           </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#2a2a2a]">
             <button 
                onClick={() => onDownload({ format, scale, transparent })}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
             >
                 Download
             </button>
        </div>

      </div>
    </div>
  );
};

export default DownloadDialog;
