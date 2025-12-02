import React, { useState } from 'react';
import { Type, Square, Circle, LayoutTemplate, Upload, Search, X, Shapes, Hexagon, Triangle } from 'lucide-react';
import { ElementType, CanvasElement } from '../types';

interface ToolbarProps {
  onAddElement: (type: ElementType, content?: string, style?: any) => void;
  onApplyTemplate: (elements: CanvasElement[]) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddElement, onApplyTemplate }) => {
  const [activeTab, setActiveTab] = useState<string>('design');
  
  const [uploads, setUploads] = useState<string[]>([
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=300&auto=format&fit=crop',
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploads([url, ...uploads]);
      onAddElement('image', url);
    }
  };

  const templates = [
      {
          id: 'modern-sales',
          name: 'Summer Sale',
          previewColor: '#1e293b',
          elements: [
              { id: 't1_bg', type: 'rectangle', x: 0, y: 0, width: 800, height: 600, backgroundColor: '#1e293b', zIndex: 0, rotation: 0 },
              { id: 't1_c1', type: 'circle', x: 500, y: -100, width: 400, height: 400, backgroundColor: '#334155', zIndex: 1, rotation: 0 },
              { id: 't1_h1', type: 'text', x: 50, y: 100, width: 400, height: 80, fontSize: 64, fontWeight: 'bold', content: 'SUMMER', color: '#ffffff', zIndex: 2, rotation: 0 },
              { id: 't1_h2', type: 'text', x: 50, y: 180, width: 400, height: 60, fontSize: 48, fontWeight: 'bold', content: 'SALE', color: '#facc15', zIndex: 2, rotation: 0 },
              { id: 't1_btn', type: 'rectangle', x: 50, y: 300, width: 200, height: 60, backgroundColor: '#facc15', zIndex: 2, rotation: 0 },
              { id: 't1_btntxt', type: 'text', x: 80, y: 315, width: 140, height: 30, fontSize: 20, fontWeight: 'bold', content: 'SHOP NOW', color: '#000000', zIndex: 3, rotation: 0 },
          ]
      },
      {
          id: 'minimalist',
          name: 'Minimalist Quote',
          previewColor: '#f8fafc',
          elements: [
               { id: 't2_bg', type: 'rectangle', x: 0, y: 0, width: 800, height: 600, backgroundColor: '#f8fafc', zIndex: 0, rotation: 0 },
               { id: 't2_border', type: 'rectangle', x: 40, y: 40, width: 720, height: 520, backgroundColor: 'transparent', border: '2px solid #000', zIndex: 1, rotation: 0 },
               { id: 't2_txt', type: 'text', x: 100, y: 200, width: 600, height: 200, fontSize: 36, fontWeight: 'normal', fontFamily: 'Georgia', content: '"Design is the silent ambassador of your brand."', color: '#0f172a', zIndex: 2, rotation: 0 },
               { id: 't2_auth', type: 'text', x: 100, y: 400, width: 300, height: 40, fontSize: 18, fontWeight: 'bold', content: '- Paul Rand', color: '#64748b', zIndex: 2, rotation: 0 },
          ]
      }
  ]

  const navItems = [
    { id: 'design', icon: LayoutTemplate, label: 'Design' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
  ];

  return (
    <div className="flex h-full z-20 shadow-[1px_0_10px_rgba(0,0,0,0.05)]">
      {/* Sidebar Navigation */}
      <div className="w-[72px] bg-white h-full flex flex-col items-center py-6 gap-2 border-r border-slate-100 z-30">
         {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setActiveTab(item.id)}
             className={`flex flex-col items-center justify-center w-full py-3 gap-1.5 transition-all relative group ${
               activeTab === item.id 
               ? 'text-indigo-600' 
               : 'text-slate-500 hover:text-slate-900'
             }`}
           >
             <div className={`p-2.5 rounded-xl transition-colors ${activeTab === item.id ? 'bg-indigo-50' : 'group-hover:bg-slate-100'}`}>
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
             </div>
             <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
             
             {activeTab === item.id && (
                 <div className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full top-1/2 -translate-y-1/2"></div>
             )}
           </button>
         ))}
      </div>

      {/* Drawer Panel */}
      <div className="w-[340px] bg-white h-full flex flex-col border-r border-slate-200 transition-all duration-300 relative z-20">
        
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-slate-800 text-lg capitalize tracking-tight">{activeTab}</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
            
            {/* DESIGN TAB */}
            {activeTab === 'design' && (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search templates" 
                            className="w-full bg-slate-50 text-slate-800 pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Featured</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map((template, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => onApplyTemplate(template.elements as CanvasElement[])}
                                    className="aspect-[3/4] bg-slate-100 rounded-xl hover:ring-2 hover:ring-indigo-600 transition-all overflow-hidden group flex flex-col shadow-sm hover:shadow-md"
                                >
                                    <div className="flex-1 w-full relative" style={{ backgroundColor: template.previewColor }}>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    </div>
                                    <div className="p-3 text-left w-full bg-white border-t border-slate-100">
                                        <span className="text-xs text-slate-700 font-semibold truncate block">{template.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ELEMENTS TAB */}
            {activeTab === 'elements' && (
                <div className="space-y-8">
                     <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search elements" 
                            className="w-full bg-slate-50 text-slate-800 pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-800">Shapes</h3>
                            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">See all</button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => onAddElement('rectangle')} className="aspect-square bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all">
                                <Square size={24} fill="currentColor" className="opacity-20"/>
                            </button>
                            <button onClick={() => onAddElement('circle')} className="aspect-square bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all">
                                <Circle size={24} fill="currentColor" className="opacity-20"/>
                            </button>
                             <button onClick={() => onAddElement('rectangle', '', { width: 100, height: 100, borderRadius: '10%' })} className="aspect-square bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all">
                                <div className="w-6 h-6 rounded bg-current opacity-20"></div>
                            </button>
                             <button onClick={() => onAddElement('rectangle', '', { width: 100, height: 2, backgroundColor: '#000' })} className="aspect-square bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all">
                                <div className="w-6 h-0.5 bg-current opacity-50"></div>
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-800">Graphics</h3>
                            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">See all</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                             {['4712109', '1165674', '2660525', '4193246', '864685', '1687729'].map((id) => (
                                 <button key={id} onClick={() => onAddElement('image', `https://cdn-icons-png.flaticon.com/512/${id.slice(0,4)}/${id}.png`)} className="bg-slate-50 p-2 rounded-xl hover:bg-slate-100 border border-transparent hover:border-indigo-200 transition-all aspect-square flex items-center justify-center">
                                    <img src={`https://cdn-icons-png.flaticon.com/512/${id.slice(0,4)}/${id}.png`} className="w-12 h-12 object-contain" alt="sticker"/>
                                 </button>
                             ))}
                        </div>
                    </section>
                </div>
            )}

            {/* TEXT TAB */}
            {activeTab === 'text' && (
                <div className="space-y-6">
                    <button 
                        onClick={() => onAddElement('text', 'Add a heading', { fontSize: 32, fontWeight: 'bold' })}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg text-center transition-colors shadow-sm hover:shadow font-medium"
                    >
                        Add a text box
                    </button>

                    <div className="space-y-3">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Styles</h3>
                         <button 
                            onClick={() => onAddElement('text', 'Add a heading', { fontSize: 32, fontWeight: 'bold' })}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-4 rounded-lg text-left transition-colors group"
                        >
                            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-black">Add a heading</h3>
                        </button>
                        <button 
                            onClick={() => onAddElement('text', 'Add a subheading', { fontSize: 24, fontWeight: '600' })}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-lg text-left transition-colors group"
                        >
                            <h4 className="text-lg font-semibold text-slate-700 group-hover:text-black">Add a subheading</h4>
                        </button>
                        <button 
                            onClick={() => onAddElement('text', 'Add a little bit of body text', { fontSize: 16 })}
                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-lg text-left transition-colors group"
                        >
                            <p className="text-sm text-slate-600 group-hover:text-black">Add a little bit of body text</p>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Font Combinations</h3>
                        <div className="space-y-3">
                             <button onClick={() => {
                                 onAddElement('text', 'Sale', { fontSize: 48, fontWeight: '900', color: '#fbbf24' });
                                 onAddElement('text', '50% OFF', { fontSize: 24, y: 160, color: '#ffffff' });
                             }} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-xl text-center transform hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md">
                                 <span className="block text-3xl font-black text-yellow-300 drop-shadow-md">Sale</span>
                                 <span className="text-white font-medium">50% OFF</span>
                             </button>

                             <button onClick={() => {
                                 onAddElement('text', 'Coffee', { fontSize: 48, fontWeight: 'bold', fontFamily: 'Courier New', color: '#e2e8f0' });
                                 onAddElement('text', 'SHOP', { fontSize: 18, y: 160, letterSpacing: '4px', color: '#94a3b8' });
                             }} className="w-full bg-slate-900 border border-slate-700 p-6 rounded-xl text-center transform hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md">
                                 <span className="block text-3xl font-bold text-white font-mono">Coffee</span>
                                 <span className="text-slate-400 text-xs tracking-[0.3em]">SHOP</span>
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPLOADS TAB */}
            {activeTab === 'uploads' && (
                <div className="space-y-5">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-sm text-slate-500 font-medium">Upload Media</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        {uploads.map((url, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onAddElement('image', url)}
                                className="relative aspect-square rounded-lg overflow-hidden group shadow-sm hover:shadow-md border border-slate-100"
                            >
                                <img src={url} alt="upload" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Toolbar;