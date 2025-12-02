
import React, { useState, useRef } from 'react';
import { Type, Square, Circle, LayoutTemplate, Upload, Search, Shapes, Hexagon, Triangle, Layers as LayersIcon, FolderOpen, Grid, PenTool, Star, Heart, Cloud, Music, Video, Image as ImageIcon, Plus, Palette, Type as TypeIcon, Minus, MessageCircle, ArrowRight, CheckCircle, Smile, Sun, Moon, Zap, MapPin, Tag, Bookmark, Flag } from 'lucide-react';
import { ElementType, CanvasElement } from '../types';
import LayersPanel from './LayersPanel';

interface ToolbarProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onAddElement: (type: ElementType, content?: string, style?: any) => void;
  onApplyTemplate: (elements: CanvasElement[]) => void;
  onSelectLayer: (id: string, multi: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onReorderLayers: (dragIndex: number, hoverIndex: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    onAddElement, 
    onApplyTemplate, 
    elements, 
    selectedIds, 
    onSelectLayer, 
    onUpdateElement,
    onReorderLayers
}) => {
  const [activeTab, setActiveTab] = useState<string>('elements');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploads, setUploads] = useState<string[]>([
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=300&auto=format&fit=crop',
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                  setUploads(prev => [result, ...prev]);
                  onAddElement('image', result);
              }
          };
          reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navItems = [
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'design', icon: LayoutTemplate, label: 'Design' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'brand', icon: PenTool, label: 'Brand' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'layers', icon: LayersIcon, label: 'Layers' },
  ];

  // --- ASSET DATA ---

  const PHOTO_LIBRARIES = {
      'Nature': [
          'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
          'https://images.unsplash.com/photo-1501854140884-074cf2b2c3af?w=400&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
      ],
      'Abstract': [
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
          'https://images.unsplash.com/photo-1506102383123-c8ef1e872756?w=400&q=80',
          'https://images.unsplash.com/photo-1550059155-22e70a2408b1?w=400&q=80',
      ],
      'Business': [
          'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80',
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80',
      ],
      'Tech': [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
          'https://images.unsplash.com/photo-1531297461136-82lw9z0u7e?w=400&q=80',
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
      ]
  };

  const GRAPHICS = [
      { char: '★', name: 'Star', color: '#FFD700', type: 'text' },
      { char: '♥', name: 'Heart', color: '#FF5757', type: 'text' },
      { char: '☁', name: 'Cloud', color: '#A0D8EF', type: 'text' },
      { char: '☀', name: 'Sun', color: '#FDB813', type: 'text' },
      { char: '⚡', name: 'Bolt', color: '#FFD700', type: 'text' },
      { char: '➜', name: 'Arrow', color: '#333333', type: 'text' },
      { char: '✓', name: 'Check', color: '#22c55e', type: 'text' },
      { char: '✿', name: 'Flower', color: '#ec4899', type: 'text' },
      { char: '☾', name: 'Moon', color: '#64748b', type: 'text' },
      { char: '☺', name: 'Smile', color: '#eab308', type: 'text' },
  ];

  return (
    <div className="flex h-full z-20 shadow-[1px_0_10px_rgba(0,0,0,0.2)]">
      {/* Sidebar Navigation */}
      <div className="w-[72px] bg-[#0e1318] h-full flex flex-col items-center py-4 gap-1 border-r border-white/5 z-30 text-gray-400 select-none">
         {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setActiveTab(item.id)}
             className={`flex flex-col items-center justify-center w-full py-3 gap-1.5 transition-all relative group ${
               activeTab === item.id 
               ? 'text-white' 
               : 'hover:text-gray-200'
             }`}
           >
             <div className={`p-1 rounded-lg transition-colors`}>
                <item.icon size={24} strokeWidth={1.5} />
             </div>
             <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
             
             {/* Active Indicator */}
             {activeTab === item.id && (
                 <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-[#00c4cc] to-[#7d2ae8] rounded-r-full top-1/2 -translate-y-1/2"></div>
             )}
           </button>
         ))}
      </div>

      {/* Drawer Panel */}
      <div className="w-[340px] bg-[#1e1e1e] h-full flex flex-col border-r border-white/5 transition-all duration-300 relative z-20 text-white shadow-2xl">
        
        {activeTab !== 'layers' && (
            <div className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-white/5 bg-[#1e1e1e]">
                <h2 className="font-bold text-white text-lg capitalize tracking-tight">{activeTab}</h2>
            </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            
            {/* DESIGN TAB */}
            {activeTab === 'design' && (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search templates" 
                            className="w-full bg-[#2a2a2a] text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 border border-transparent transition-all placeholder:text-gray-500"
                        />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Templates</h3>
                        <div className="grid grid-cols-2 gap-4">
                             {['Modern Biz', 'Creative', 'Minimal', 'Bold Sale', 'Tech Startup', 'Organic'].map((name, i) => (
                                <div key={i} onClick={() => onApplyTemplate([])} className="group cursor-pointer">
                                     <div className="aspect-[3/4] bg-[#2a2a2a] rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-[#333] transition-colors border border-transparent group-hover:border-gray-600 overflow-hidden relative">
                                         <div className="absolute inset-x-2 top-2 h-1/2 bg-white/5 rounded"></div>
                                         <div className="absolute inset-x-4 bottom-4 h-4 bg-white/5 rounded-full"></div>
                                     </div>
                                     <div className="mt-2 text-xs font-medium text-gray-400 group-hover:text-white truncate">{name}</div>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ELEMENTS TAB - EXPANDED */}
            {activeTab === 'elements' && (
                <div className="space-y-8 pb-10">
                     <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search elements" 
                            className="w-full bg-[#2a2a2a] text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 border border-transparent transition-all placeholder:text-gray-500"
                        />
                    </div>

                    {/* Shapes */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-200">Lines & Shapes</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => onAddElement('rectangle')} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Rectangle">
                                <Square size={24} fill="currentColor" className="opacity-20"/>
                            </button>
                            <button onClick={() => onAddElement('circle')} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Circle">
                                <Circle size={24} fill="currentColor" className="opacity-20"/>
                            </button>
                             <button onClick={() => onAddElement('rectangle', '', { width: 100, height: 100, borderRadius: 20 })} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Rounded Rect">
                                <div className="w-6 h-6 rounded-lg bg-current opacity-20"></div>
                            </button>
                            <button onClick={() => onAddElement('rectangle', '', { width: 100, height: 2 })} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Line">
                                <Minus size={24} />
                            </button>
                            
                            {/* New Shapes */}
                            <button onClick={() => onAddElement('rectangle', '', { width: 150, height: 50, borderRadius: 100, backgroundColor: '#3b82f6' })} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Button / Pill">
                                <div className="w-8 h-3 rounded-full bg-current opacity-40"></div>
                            </button>
                            <button onClick={() => onAddElement('text', '▲', { fontSize: 100, color: '#333' })} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Triangle">
                                <Triangle size={24} fill="currentColor" className="opacity-20"/>
                            </button>
                            <button onClick={() => onAddElement('text', '⬡', { fontSize: 100, color: '#333' })} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Hexagon">
                                <Hexagon size={24} />
                            </button>
                            <button onClick={() => onAddElement('text', '➜', { fontSize: 80, color: '#333' })} className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all border border-transparent hover:border-gray-600" title="Arrow">
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </section>
                    
                    {/* Graphics / Icons */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-200">Graphics</h3>
                        </div>
                         <div className="grid grid-cols-5 gap-2">
                             {GRAPHICS.map((g, i) => (
                                 <button 
                                    key={i} 
                                    onClick={() => onAddElement('text', g.char, { fontSize: 120, color: g.color })}
                                    className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#333] flex items-center justify-center text-xl transition-all border border-transparent hover:border-gray-600 group"
                                    title={g.name}
                                 >
                                    <span className="transform group-hover:scale-125 transition-transform" style={{ color: g.color }}>{g.char}</span>
                                 </button>
                             ))}
                        </div>
                    </section>

                    {/* Stock Photos */}
                    {Object.entries(PHOTO_LIBRARIES).map(([category, urls]) => (
                        <section key={category}>
                             <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-200">{category}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {urls.map((url, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => onAddElement('image', url)}
                                        className="relative aspect-video rounded-lg overflow-hidden group border border-transparent hover:border-white/20 transition-all"
                                    >
                                        <img src={url} alt={category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* TEXT TAB */}
            {activeTab === 'text' && (
                <div className="space-y-6">
                    <button 
                        onClick={() => onAddElement('text', 'Add a text box', { fontSize: 24 })}
                        className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white py-3 px-4 rounded-lg text-center transition-colors shadow-lg font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <Type size={16} />
                        Add a text box
                    </button>

                    <div className="space-y-3 pt-2">
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Default Styles</h3>
                         <button 
                            onClick={() => onAddElement('text', 'Add a heading', { fontSize: 32, fontWeight: 'bold' })}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333] p-4 rounded-lg text-left transition-colors group border border-transparent hover:border-gray-600"
                        >
                            <h3 className="text-2xl font-bold text-white">Add a heading</h3>
                        </button>
                        <button 
                            onClick={() => onAddElement('text', 'Add a subheading', { fontSize: 24, fontWeight: '600' })}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333] p-3 rounded-lg text-left transition-colors group border border-transparent hover:border-gray-600"
                        >
                            <h4 className="text-lg font-semibold text-gray-300">Add a subheading</h4>
                        </button>
                        <button 
                            onClick={() => onAddElement('text', 'Add a little bit of body text', { fontSize: 16 })}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333] p-3 rounded-lg text-left transition-colors group border border-transparent hover:border-gray-600"
                        >
                            <p className="text-sm text-gray-400">Add a little bit of body text</p>
                        </button>
                    </div>

                    <div className="space-y-3 pt-2">
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Font Combinations</h3>
                         <button 
                            onClick={() => {
                                onAddElement('text', 'SALE', { fontSize: 60, fontWeight: '900', color: '#ef4444' });
                                setTimeout(() => onAddElement('text', 'UP TO 50% OFF', { fontSize: 24, fontWeight: 'bold', y: 360 }), 100);
                            }}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333] p-4 rounded-lg text-center transition-colors group border border-transparent hover:border-gray-600"
                        >
                            <h3 className="text-3xl font-black text-red-500">SALE</h3>
                            <p className="text-sm font-bold text-white tracking-widest mt-1">UP TO 50% OFF</p>
                        </button>
                        
                         <button 
                            onClick={() => {
                                onAddElement('text', 'Good Vibes', { fontSize: 48, fontStyle: 'italic', fontFamily: 'Playfair Display' });
                            }}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333] p-4 rounded-lg text-center transition-colors group border border-transparent hover:border-gray-600"
                        >
                            <h3 className="text-2xl text-yellow-300 italic font-serif">Good Vibes</h3>
                        </button>
                    </div>
                </div>
            )}

             {/* LAYERS TAB */}
             {activeTab === 'layers' && (
                 <LayersPanel 
                    elements={elements} 
                    selectedIds={selectedIds} 
                    onSelect={onSelectLayer}
                    onReorder={onReorderLayers} 
                    onUpdate={onUpdateElement}
                 />
            )}
            
            {/* BRAND TAB */}
             {activeTab === 'brand' && (
                 <div className="space-y-6">
                     <div className="p-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl mb-4 text-center">
                         <h3 className="font-bold text-white mb-1">DesignGenius Brand Kit</h3>
                         <p className="text-xs text-indigo-200">Manage your logos, colors & fonts</p>
                     </div>

                     <section>
                         <div className="flex items-center justify-between mb-3">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logos</h4>
                             <button className="p-1 hover:bg-white/10 rounded"><Plus size={14}/></button>
                         </div>
                         <div className="grid grid-cols-3 gap-3">
                             <div className="aspect-square bg-[#2a2a2a] border border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-400 cursor-pointer">
                                 <Upload size={16} />
                             </div>
                         </div>
                     </section>

                     <section>
                         <div className="flex items-center justify-between mb-3">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Colors</h4>
                             <button className="p-1 hover:bg-white/10 rounded"><Palette size={14}/></button>
                         </div>
                         <div className="flex gap-2 flex-wrap">
                             {['#FF5757', '#8C52FF', '#5E17EB', '#00C2CB'].map(c => (
                                 <div key={c} className="w-8 h-8 rounded-full shadow-sm ring-1 ring-white/10" style={{background: c}}></div>
                             ))}
                             <button className="w-8 h-8 rounded-full border border-dashed border-gray-500 flex items-center justify-center text-gray-500 hover:text-white hover:border-white">
                                 <Plus size={14} />
                             </button>
                         </div>
                     </section>
                 </div>
             )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
                <div className="space-y-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input type="text" placeholder="Search your projects" className="w-full bg-[#2a2a2a] text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 border border-transparent" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {['Q3 Report', 'Insta Post', 'Logo V1', 'Banner'].map((p, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-square bg-white rounded-lg overflow-hidden relative">
                                    <div className={`absolute inset-0 opacity-80 ${i % 2 === 0 ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gradient-to-tr from-yellow-100 to-orange-100'}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                        <FolderOpen className="text-white" />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white">{p}</div>
                                <div className="text-[10px] text-gray-500">Edited 2h ago</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* UPLOADS TAB */}
            {activeTab === 'uploads' && (
                <div className="space-y-5">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#2a2a2a] hover:bg-[#333] text-white py-3 rounded-lg font-medium transition-colors border border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center gap-2"
                    >
                        <Upload size={18} /> Upload files
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        {uploads.map((url, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onAddElement('image', url)}
                                className="relative aspect-square rounded-lg overflow-hidden group border border-white/5 hover:border-white/20 transition-all"
                            >
                                <img src={url} alt="upload" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
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
