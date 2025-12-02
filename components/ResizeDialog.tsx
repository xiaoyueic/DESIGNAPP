
import React, { useState } from 'react';
import { Search, Monitor, Smartphone, Layout, File, ChevronRight, Lock } from 'lucide-react';
import { ResizePreset } from '../types';

interface ResizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResize: (width: number, height: number, name: string) => void;
  currentWidth: number;
  currentHeight: number;
}

const presets: ResizePreset[] = [
    { id: 'insta_post', name: 'Instagram Post', width: 1080, height: 1080, unit: 'px', category: 'Social Media' },
    { id: 'insta_story', name: 'Instagram Story', width: 1080, height: 1920, unit: 'px', category: 'Social Media' },
    { id: 'fb_post', name: 'Facebook Post', width: 940, height: 788, unit: 'px', category: 'Social Media' },
    { id: 'presentation', name: 'Presentation (16:9)', width: 1920, height: 1080, unit: 'px', category: 'Business' },
    { id: 'a4', name: 'A4 Document', width: 595, height: 842, unit: 'px', category: 'Print' }, // Approx for screen
    { id: 'poster', name: 'Poster', width: 420, height: 594, unit: 'px', category: 'Print' },
    { id: 'logo', name: 'Logo', width: 500, height: 500, unit: 'px', category: 'Marketing' },
    { id: 'card', name: 'Business Card', width: 350, height: 200, unit: 'px', category: 'Marketing' },
];

const ResizeDialog: React.FC<ResizeDialogProps> = ({ isOpen, onClose, onResize, currentWidth, currentHeight }) => {
  const [search, setSearch] = useState('');
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [unit, setUnit] = useState('px');

  if (!isOpen) return null;

  const filteredPresets = presets.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="absolute top-[60px] left-[260px] z-[100] w-[320px] bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 text-white animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[80vh]">
        {/* Search */}
        <div className="p-3 border-b border-white/10">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search size options"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-transparent focus:border-indigo-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none placeholder:text-gray-500 transition-all"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {/* Custom Size Section */}
            <div className="mb-4">
                 <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg group text-left">
                     <span className="text-sm font-semibold">Custom Size</span>
                     <ChevronRight size={16} className="text-gray-500 group-hover:text-white" />
                 </button>
                 
                 {/* Expanded Custom Inputs */}
                 <div className="px-3 py-2 grid grid-cols-3 gap-2">
                     <div className="space-y-1">
                         <label className="text-[10px] text-gray-400 font-bold uppercase">Width</label>
                         <input 
                            type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value))}
                            className="w-full bg-[#2a2a2a] border border-white/10 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
                         />
                     </div>
                     <div className="space-y-1">
                         <label className="text-[10px] text-gray-400 font-bold uppercase">Height</label>
                         <input 
                            type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value))}
                            className="w-full bg-[#2a2a2a] border border-white/10 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none"
                         />
                     </div>
                      <div className="space-y-1">
                         <label className="text-[10px] text-gray-400 font-bold uppercase">Unit</label>
                         <select 
                            value={unit} onChange={(e) => setUnit(e.target.value)}
                            className="w-full bg-[#2a2a2a] border border-white/10 rounded px-2 py-1.5 text-sm focus:border-indigo-500 outline-none appearance-none"
                         >
                             <option value="px">px</option>
                             <option value="cm">cm</option>
                             <option value="mm">mm</option>
                         </select>
                     </div>
                 </div>
            </div>

            {/* Presets List */}
            <div className="space-y-1">
                <div className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">Suggested</div>
                {filteredPresets.map(preset => (
                    <button 
                        key={preset.id}
                        onClick={() => { onResize(preset.width, preset.height, preset.name); onClose(); }}
                        className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-left group transition-colors"
                    >
                         <div className="mt-0.5 text-gray-400 group-hover:text-white">
                            {preset.category === 'Social Media' ? <Smartphone size={16} /> : 
                             preset.category === 'Business' ? <Monitor size={16} /> : 
                             <File size={16} />}
                         </div>
                         <div className="flex-1">
                             <div className="text-sm font-medium text-gray-200 group-hover:text-white">{preset.name}</div>
                             <div className="text-xs text-gray-500">{preset.width} x {preset.height} {preset.unit}</div>
                         </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-[#2a2a2a] space-y-2">
            <button 
                onClick={() => { onResize(width, height, 'Custom Design'); onClose(); }}
                className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
                Copy & Resize
            </button>
             <button 
                onClick={() => { onResize(width, height, 'Custom Design'); onClose(); }}
                className="w-full border border-white/10 hover:bg-white/5 text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                Resize Current Design
            </button>
        </div>
    </div>
  );
};

export default ResizeDialog;
