import { Handle, Position } from "@xyflow/react";
import { Trash2, Heart, Baby } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStore, type PersonData } from "../lib/store";

export function PersonNode({ id, data, selected }: { id: string; data: PersonData; selected: boolean }) {
  const updatePerson = useStore((state) => state.updatePerson);
  const deletePerson = useStore((state) => state.deletePerson);
  const addChild = useStore((state) => state.addChild);
  const addPartner = useStore((state) => state.addPartner);

  const [isEditing, setIsEditing] = useState<keyof PersonData | null>(null);
  const [localData, setLocalData] = useState(data);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(null);
    updatePerson(id, localData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof PersonData) => {
    setLocalData({ ...localData, [field]: e.target.value });
  };

  const renderEditableField = (field: keyof PersonData, placeholder: string, className: string) => {
    if (isEditing === field) {
      return (
        <input
          ref={inputRef}
          className={`bg-transparent outline-none w-full text-center border-b border-indigo-200 ${className}`}
          value={localData[field] || ""}
          onChange={(e) => handleChange(e, field)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      );
    }

    return (
      <div
        className={`cursor-text min-h-[1.5em] w-full text-center hover:bg-slate-50 transition-colors ${className}`}
        onClick={() => setIsEditing(field)}
      >
        {localData[field] || <span className="text-slate-300 italic">{placeholder}</span>}
      </div>
    );
  };

  return (
    <div 
      className={`relative w-48 bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 group ${selected ? 'ring-2 ring-indigo-400 border-indigo-400 shadow-md' : 'hover:border-slate-300 hover:shadow'}`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-300 w-3 h-3 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 w-3 h-3 border-2 border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-slate-300 w-3 h-3 border-2 border-white" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-slate-300 w-3 h-3 border-2 border-white" />

      <div className="p-4 flex flex-col items-center justify-center gap-2">
        {renderEditableField("name", "Name", "font-semibold text-slate-800")}
        
        <div className="flex flex-col items-center text-xs text-slate-500 w-full">
          <div className="flex items-center gap-1 w-full">
            <span className="opacity-50 w-4">*</span>
            {renderEditableField("birth", "Birth", "")}
          </div>
          <div className="flex items-center gap-1 w-full">
            <span className="opacity-50 w-4">†</span>
            {renderEditableField("death", "Death", "")}
          </div>
        </div>
      </div>

      {/* Action Menu overlay */}
      <div 
        className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-200 p-1 flex gap-1 transition-opacity duration-200 z-10 ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors tooltip"
          title="Add Child"
          onClick={() => addChild(id)}
        >
          <Baby size={16} />
        </button>
        <button 
          className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
          title="Add Partner"
          onClick={() => addPartner(id)}
        >
          <Heart size={16} />
        </button>
        <div className="w-px bg-slate-200 my-1"></div>
        <button 
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete"
          onClick={() => deletePerson(id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
