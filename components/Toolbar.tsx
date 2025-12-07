
import React, { useState, useEffect, useRef } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { printService } from '../utils/printService';
import { StickerPicker } from './StickerPicker';
import { PrintPreviewModal } from './PrintPreviewModal';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: () => void;
  onFeedback?: () => void;
  onShare?: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  onAddToWorkbook?: () => void;
  workbookItemCount?: number;
  onViewWorkbook?: () => void;
  onToggleEdit?: () => void;
  isEditMode?: boolean;
  onSnapshot?: () => void; 
  onAddText?: () => void;
  onAddSticker?: (url: string) => void;
  isDrawMode?: boolean;
  onToggleDraw?: () => void;
  onSpeak?: () => void;
  isSpeaking?: boolean;
  onStopSpeak?: () => void;
  showQR?: boolean;
  onToggleQR?: () => void;
  worksheetData?: WorksheetData;
}

// --- MICRO COMPONENTS FOR STABILITY ---

const Divider = () => <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1 self-center opacity-50"></div>;

const IconButton = ({ icon, onClick, active, title, disabled, badge }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
            active 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800' 
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
        <i className={`fa-solid ${icon}`}></i>
        {badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                {badge}
            </span>
        )}
    </button>
);

const MenuButton = ({ icon, label, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            active
            ? 'bg-zinc-800 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 shadow-md transform scale-105'
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700'
        }`}
    >
        <i className={`fa-solid ${icon}`}></i>
        <span className="hidden xl:inline">{label}</span>
    </button>
);

const CompactSlider = ({ icon, value, min, max, step, onChange, title, displayValue, unit }: any) => (
    <div className="flex items-center gap-2 group relative px-2 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors" title={title}>
        <i className={`fa-solid ${icon} text-[10px] text-zinc-400 group-hover:text-indigo-500 transition-colors w-3 text-center`}></i>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step || 1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-600 dark:accent-zinc-400 hover:accent-indigo-600"
        />
        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 w-8 text-right tabular-nums">
            {displayValue || value}{unit}
        </span>
    </div>
);

const DropdownPanel = ({ title, children, onClose }: any) => {
    // Click outside handler
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 origin-top-left">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
                <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y