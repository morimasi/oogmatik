import React, { useRef, useEffect } from 'react';

// Divider: Modülleri ayıran dikey çizgi
export const Divider = () => <div className="h-8 w-px bg-[var(--border-color)] mx-1 md:mx-2 self-center opacity-50"></div>;

// IconButton: Standart aksiyon butonu
export const IconButton = ({
  icon,
  onClick,
  active,
  title,
  disabled,
  badge,
  colorClass,
  isLoading,
  className = ""
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    title={title}
    className={`relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${active
        ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-md transform scale-105'
        : `text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] ${colorClass || 'hover:text-[var(--text-primary)]'}`
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {isLoading ? (
      <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
    ) : (
      <i className={`fa-solid ${icon} text-sm md:text-base`}></i>
    )}
    {badge > 0 && !isLoading && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-[var(--bg-paper)] shadow-sm">
        {badge}
      </span>
    )}
  </button>
);

// MenuButton: Dropdown tetikleyici
export const MenuButton = ({ icon, label, onClick, active, isOpen, className = "" }: any) => (
  <button
    onClick={onClick}
    data-dropdown-trigger
    className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl text-[10px] md:text-[11px] font-bold transition-all border select-none ${active || isOpen
        ? 'bg-[var(--accent-muted)] border-[var(--accent-color)]/30 text-[var(--accent-color)] shadow-sm'
        : 'bg-[var(--bg-paper)] border-transparent text-[var(--text-secondary)] hover:bg-white hover:border-[var(--border-color)]'
      } ${className}`}
  >
    <i
      className={`fa-solid ${icon} ${active || isOpen ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'} text-[10px] md:text-[11px]`}
    ></i>
    <span className="hidden sm:inline">{label}</span>
    <i
      className={`fa-solid fa-chevron-down text-[8px] md:text-[9px] ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    ></i>
  </button>
);

// NumberControl: Sayısal ayar kontrolü
export const NumberControl = ({ label, value, onChange, min, max, step = 1, unit = "", icon }: any) => (
  <div className="flex items-center justify-between py-1.5 px-1 group">
    <div className="flex items-center gap-2">
      {icon && <i className={`fa-solid ${icon} text-[10px] text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors`}></i>}
      <span className="text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] uppercase tracking-tight transition-colors">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg p-0.5 border border-[var(--border-color)] focus-within:border-[var(--accent-color)]/50 transition-all shadow-inner">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white hover:text-[var(--accent-color)] rounded-md shadow-sm transition-all"
        disabled={value <= min}
      >
        <i className="fa-solid fa-minus text-[9px]"></i>
      </button>
      <span className="text-[11px] font-mono font-black w-10 text-center text-[var(--text-primary)]">
        {Math.round(value * 100) / 100}
        {unit}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white hover:text-[var(--accent-color)] rounded-md shadow-sm transition-all"
        disabled={value >= max}
      >
        <i className="fa-solid fa-plus text-[9px]"></i>
      </button>
    </div>
  </div>
);

// Toggle: Switch kontrolü
export const Toggle = ({ label, checked, onChange, icon }: any) => (
  <div
    className="flex items-center justify-between py-1.5 px-1 cursor-pointer group hover:bg-[var(--surface-glass)]/5 rounded-lg transition-all"
    onClick={() => onChange(!checked)}
  >
    <div className="flex items-center gap-2">
      {icon && <i className={`fa-solid ${icon} text-[10px] ${checked ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'} transition-colors`}></i>}
      <span className="text-[11px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        {label}
      </span>
    </div>
    <div
      className={`w-8 h-4.5 rounded-full relative transition-all duration-300 ${checked ? 'bg-[var(--accent-color)] shadow-lg shadow-indigo-500/20' : 'bg-[var(--border-color)]'}`}
    >
      <div
        className={`absolute top-0.75 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'left-4.25' : 'left-0.75'}`}
      ></div>
    </div>
  </div>
);

// DropdownPanel: Modül paneli
export const DropdownPanel = ({ title, icon, children, onClose, className = "" }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[data-dropdown-trigger]')) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-3 left-0 border rounded-2xl shadow-2xl z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-300 origin-top-left backdrop-blur-xl bg-[var(--bg-paper)]/95 border-[var(--border-color)] ring-1 ring-black/5 ${className}`}
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          {icon && <i className={`fa-solid ${icon} text-[var(--accent-color)] text-xs`}></i>}
          <h4 className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em]">
            {title}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-red-500 transition-all text-xs"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
      <div className="space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
        {children}
      </div>
    </div>
  );
};
