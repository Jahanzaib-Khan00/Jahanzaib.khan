
import React from 'react';
import { Experience } from '../types';
import { EditableText } from './EditableText';

interface ExperienceItemProps {
  item: Experience;
  isEditing: boolean;
  onUpdate: (updated: Experience) => void;
  onRemove: () => void;
}

export const ExperienceItem: React.FC<ExperienceItemProps> = ({ item, isEditing, onUpdate, onRemove }) => {
  const handleBulletChange = (index: number, val: string) => {
    const newBullets = [...item.bullets];
    newBullets[index] = val;
    onUpdate({ ...item, bullets: newBullets });
  };

  const addBullet = () => {
    onUpdate({ ...item, bullets: [...item.bullets, ""] });
  };

  const removeBullet = (index: number) => {
    onUpdate({ ...item, bullets: item.bullets.filter((_, i) => i !== index) });
  };

  return (
    <div className="mb-8 md:mb-10 relative border-l-4 border-blue-600 pl-4 md:pl-6 py-2 transition-all hover:bg-blue-50/30 rounded-r-xl">
      {isEditing && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-100 text-red-600 w-8 h-8 rounded-full hover:bg-red-200 flex items-center justify-center shadow-sm z-10"
        >
          <i className="fas fa-trash text-xs"></i>
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
        <div className="shrink-0 flex items-center justify-center md:block">
          {isEditing ? (
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 flex items-center justify-center rounded border overflow-hidden">
              <input 
                type="text" 
                placeholder="Logo URL" 
                className="text-[8px] w-full p-1" 
                value={item.logo} 
                onChange={(e) => onUpdate({...item, logo: e.target.value})} 
              />
            </div>
          ) : (
            <img src={item.logo} alt={item.company} className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-lg shadow-sm bg-white p-1" />
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <EditableText
              isEditing={isEditing}
              value={item.title}
              onSave={(v) => onUpdate({ ...item, title: v })}
              className="text-lg md:text-xl font-black text-blue-900 leading-tight"
              placeholder="Job Title"
            />
            <div className="inline-block self-start text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
              <EditableText
                isEditing={isEditing}
                value={item.period}
                onSave={(v) => onUpdate({ ...item, period: v })}
                placeholder="Time Period"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm md:text-base mb-3">
            <EditableText
              isEditing={isEditing}
              value={item.company}
              onSave={(v) => onUpdate({ ...item, company: v })}
              className="font-bold text-slate-700"
              placeholder="Company Name"
            />
            <span className="text-gray-300 hidden sm:inline">|</span>
            <EditableText
              isEditing={isEditing}
              value={item.duration}
              onSave={(v) => onUpdate({ ...item, duration: v })}
              className="text-slate-500 italic text-xs md:text-sm"
              placeholder="Duration"
            />
          </div>
        </div>
      </div>

      <ul className="list-disc text-slate-700 space-y-2.5 ml-4 text-sm md:text-base">
        {item.bullets.map((bullet, idx) => (
          <li key={idx} className="group relative pl-1">
            <EditableText
              isEditing={isEditing}
              value={bullet}
              onSave={(v) => handleBulletChange(idx, v)}
              aiContext={`${item.title} at ${item.company}`}
              placeholder="Key achievement or responsibility"
              className="leading-relaxed"
            />
            {isEditing && (
              <button
                onClick={() => removeBullet(idx)}
                className="absolute -left-8 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
              >
                <i className="fas fa-minus-circle"></i>
              </button>
            )}
          </li>
        ))}
        {isEditing && (
          <button onClick={addBullet} className="text-blue-500 hover:text-blue-700 text-xs font-bold mt-2 flex items-center gap-1">
            <i className="fas fa-plus-circle"></i> Add Point
          </button>
        )}
      </ul>
    </div>
  );
};
