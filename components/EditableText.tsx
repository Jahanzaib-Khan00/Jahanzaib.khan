
import React, { useState } from 'react';
import { polishResumeText } from '../services/geminiService';

interface EditableTextProps {
  value: string;
  isEditing: boolean;
  onSave: (newValue: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  aiContext?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  isEditing,
  onSave,
  multiline = false,
  className = "",
  placeholder = "",
  aiContext = ""
}) => {
  const [isPolishing, setIsPolishing] = useState(false);

  if (!isEditing) {
    return <div className={`${className} ${!value ? 'text-gray-400 italic' : ''}`}>{value || placeholder}</div>;
  }

  const handleAiPolish = async () => {
    setIsPolishing(true);
    const polished = await polishResumeText(value, aiContext);
    onSave(polished);
    setIsPolishing(false);
  };

  return (
    <div className="relative group w-full">
      {multiline ? (
        <textarea
          className={`w-full border-2 border-blue-400 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 bg-white min-h-[100px] text-gray-800 ${className}`}
          value={value}
          onChange={(e) => onSave(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={`w-full border-2 border-blue-400 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 ${className}`}
          value={value}
          onChange={(e) => onSave(e.target.value)}
          placeholder={placeholder}
        />
      )}
      <button
        onClick={handleAiPolish}
        disabled={isPolishing}
        className="absolute top-0 -right-8 p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
        title="AI Polish"
      >
        {isPolishing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
      </button>
    </div>
  );
};
