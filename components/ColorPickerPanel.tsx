
import React, { useState } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';

interface ColorPickerPanelProps {
  color: string;
  onChange: (color: string) => void;
  documentColors?: string[];
}

const DEFAULT_COLORS = [
  '#000000', '#545454', '#737373', '#A6A6A6', '#D9D9D9', '#FFFFFF',
  '#FF5757', '#FF66C4', '#CB6CE6', '#8C52FF', '#5E17EB', '#039855',
  '#00C2CB', '#5CE1E6', '#FFBD59', '#FF914D', '#5271FF', '#004AAD'
];

const GRADIENT_PRESETS = [
  'linear-gradient(90deg, #FF5757 0%, #8C52FF 100%)',
  'linear-gradient(180deg, #00C2CB 0%, #5E17EB 100%)',
  'linear-gradient(45deg, #FFBD59 0%, #FF914D 100%)',
  'linear-gradient(135deg, #5271FF 0%, #CB6CE6 100%)',
  'radial-gradient(circle, #5CE1E6 0%, #004AAD 100%)',
  'linear-gradient(to right, #000000, #434343)',
];

const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({ color, onChange, documentColors = [] }) => {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>(color?.includes('gradient') ? 'gradient' : 'solid');
  const [hexInput, setHexInput] = useState(color?.includes('gradient') ? '#000000' : color);

  // Simple gradient state for the builder
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientDirection, setGradientDirection] = useState('90deg');
  const [stops, setStops] = useState(['#FF5757', '#8C52FF']);

  const handleSolidChange = (newColor: string) => {
    setHexInput(newColor);
    onChange(newColor);
  };

  const constructGradient = (dir: string, currentStops: string[]) => {
      const typeStr = gradientType === 'radial' ? 'radial-gradient(circle' : `linear-gradient(${dir}`;
      const stopsStr = currentStops.map((c, i) => `${c} ${Math.round((i / (currentStops.length - 1)) * 100)}%`).join(', ');
      return `${typeStr}, ${stopsStr})`;
  };

  const handleGradientUpdate = (newDir: string, newStops: string[]) => {
      setGradientDirection(newDir);
      setStops(newStops);
      onChange(constructGradient(newDir, newStops));
  };

  return (
    <div className="w-[280px] flex flex-col h-full select-none">
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-3">
        <button 
          onClick={() => setActiveTab('solid')}
          className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${activeTab === 'solid' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
        >
          Solid
        </button>
        <button 
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${activeTab === 'gradient' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
        >
          Gradient
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        
        {/* SOLID COLOR TAB */}
        {activeTab === 'solid' && (
          <div className="space-y-4">
             {/* Custom Picker */}
             <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden relative cursor-pointer">
                        <input 
                            type="color" 
                            value={hexInput.includes('gradient') ? '#000000' : hexInput}
                            onChange={(e) => handleSolidChange(e.target.value)}
                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 m-0 opacity-0"
                        />
                         <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: hexInput }}></div>
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white mix-blend-difference">
                             <Plus size={14} />
                         </div>
                    </div>
                    <div className="flex-1 bg-[#2a2a2a] rounded border border-white/10 px-2 py-1.5 flex items-center">
                        <span className="text-gray-500 text-xs mr-1">#</span>
                        <input 
                            type="text" 
                            value={hexInput.replace('#', '')}
                            onChange={(e) => handleSolidChange(`#${e.target.value}`)}
                            className="bg-transparent border-none outline-none text-xs text-white w-full uppercase font-mono"
                        />
                    </div>
                </div>
             </div>

             {/* Document Colors */}
             {documentColors.length > 0 && (
                 <div>
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Document Colors</h4>
                     <div className="grid grid-cols-6 gap-2">
                         {documentColors.map((c, i) => (
                             <button 
                                key={i}
                                onClick={() => handleSolidChange(c)}
                                className={`w-8 h-8 rounded-full border border-white/10 transition-transform hover:scale-110 relative ${c === color ? 'ring-2 ring-white' : ''}`}
                                style={{ background: c }}
                             >
                             </button>
                         ))}
                     </div>
                 </div>
             )}

             {/* Default Colors */}
             <div>
                 <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Default Colors</h4>
                 <div className="grid grid-cols-6 gap-2">
                     {DEFAULT_COLORS.map((c) => (
                         <button 
                            key={c}
                            onClick={() => handleSolidChange(c)}
                            className={`w-8 h-8 rounded-full border border-white/10 transition-transform hover:scale-110 relative ${c === color ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: c }}
                         >
                         </button>
                     ))}
                 </div>
             </div>
          </div>
        )}

        {/* GRADIENT TAB */}
        {activeTab === 'gradient' && (
            <div className="space-y-4">
                {/* Gradient Preview & Stops */}
                <div className="bg-[#2a2a2a] p-3 rounded-lg border border-white/5">
                    <div className="h-12 w-full rounded mb-3 border border-white/10" style={{ background: color.includes('gradient') ? color : constructGradient(gradientDirection, stops) }}></div>
                    
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Gradient Colors</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {stops.map((stop, index) => (
                             <div key={index} className="w-8 h-8 rounded-full border border-white/20 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                                <input 
                                    type="color" 
                                    value={stop}
                                    onChange={(e) => {
                                        const newStops = [...stops];
                                        newStops[index] = e.target.value;
                                        handleGradientUpdate(gradientDirection, newStops);
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: stop }}></div>
                             </div>
                        ))}
                        {stops.length < 5 && (
                             <button 
                                onClick={() => handleGradientUpdate(gradientDirection, [...stops, '#ffffff'])}
                                className="w-8 h-8 rounded-full border border-dashed border-gray-500 flex items-center justify-center text-gray-500 hover:text-white hover:border-white transition-colors"
                             >
                                 <Plus size={14} />
                             </button>
                        )}
                    </div>
                </div>

                {/* Style Presets */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
                    <div className="grid grid-cols-5 gap-2">
                        {/* Directions */}
                        <button onClick={() => { setGradientType('linear'); handleGradientUpdate('90deg', stops); }} className={`aspect-square rounded border border-white/10 bg-[#333] hover:bg-[#444] ${gradientDirection === '90deg' && gradientType === 'linear' ? 'ring-1 ring-white' : ''} flex items-center justify-center`}>
                            <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-gray-500 to-white"></div>
                        </button>
                        <button onClick={() => { setGradientType('linear'); handleGradientUpdate('180deg', stops); }} className={`aspect-square rounded border border-white/10 bg-[#333] hover:bg-[#444] ${gradientDirection === '180deg' && gradientType === 'linear' ? 'ring-1 ring-white' : ''} flex items-center justify-center`}>
                            <div className="w-4 h-4 rounded-sm bg-gradient-to-b from-gray-500 to-white"></div>
                        </button>
                        <button onClick={() => { setGradientType('linear'); handleGradientUpdate('135deg', stops); }} className={`aspect-square rounded border border-white/10 bg-[#333] hover:bg-[#444] ${gradientDirection === '135deg' && gradientType === 'linear' ? 'ring-1 ring-white' : ''} flex items-center justify-center`}>
                            <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-gray-500 to-white"></div>
                        </button>
                         <button onClick={() => { setGradientType('radial'); handleGradientUpdate('circle', stops); }} className={`aspect-square rounded border border-white/10 bg-[#333] hover:bg-[#444] ${gradientType === 'radial' ? 'ring-1 ring-white' : ''} flex items-center justify-center`}>
                            <div className="w-4 h-4 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-gray-500 to-white"></div>
                        </button>
                    </div>
                </div>

                {/* Presets */}
                <div>
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gradient Presets</h4>
                     <div className="grid grid-cols-6 gap-2">
                         {GRADIENT_PRESETS.map((g, i) => (
                             <button 
                                key={i}
                                onClick={() => onChange(g)}
                                className="w-8 h-8 rounded-full border border-white/10 hover:scale-110 transition-transform"
                                style={{ background: g }}
                             >
                             </button>
                         ))}
                     </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default ColorPickerPanel;
