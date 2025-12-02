
import React from 'react';
import { SnapGuide } from '../types';

interface SmartGuidesProps {
  guides: SnapGuide[];
  zoom: number;
}

const SmartGuides: React.FC<SmartGuidesProps> = ({ guides, zoom }) => {
  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[100]">
      {guides.map((guide, index) => {
        const style: React.CSSProperties = {
            position: 'absolute',
            backgroundColor: '#ec4899', // Pink/Magenta color often used in design tools
            opacity: 0.8,
            boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
        };

        if (guide.type === 'vertical') {
            style.left = guide.position;
            style.top = guide.start ?? 0;
            style.bottom = guide.end !== undefined ? 'auto' : 0;
            style.height = guide.end !== undefined ? (guide.end - (guide.start ?? 0)) : '100%';
            style.width = Math.max(1, 1 / zoom);
        } else {
            style.top = guide.position;
            style.left = guide.start ?? 0;
            style.right = guide.end !== undefined ? 'auto' : 0;
            style.width = guide.end !== undefined ? (guide.end - (guide.start ?? 0)) : '100%';
            style.height = Math.max(1, 1 / zoom);
        }

        return <div key={index} style={style} />;
      })}
    </div>
  );
};

export default SmartGuides;
