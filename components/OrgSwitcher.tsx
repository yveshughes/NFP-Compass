
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check, Plus, Settings, LogOut, Building2 } from 'lucide-react';
import { Organization } from '../types';
import { MOCK_ORGS } from '../constants';

interface OrgSwitcherProps {
  currentOrg: Organization | null;
  onSwitch: (org: Organization) => void;
}

const OrgSwitcher: React.FC<OrgSwitcherProps> = ({ currentOrg, onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentOrg) return null;

  return (
    <div className="relative">
      {/* Popover Menu - Positioned Upwards */}
      {isOpen && (
        <div 
            ref={menuRef}
            className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50"
        >
            <div className="p-2">
                <div className="text-[10px] font-semibold text-slate-500 px-2 py-1.5 uppercase tracking-wider">
                    My Organizations
                </div>
                {MOCK_ORGS.map((org) => (
                    <button
                        key={org.id}
                        onClick={() => {
                            onSwitch(org);
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300 group"
                    >
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:border-slate-600 group-hover:text-slate-300">
                                {org.initials}
                             </div>
                             <span className={currentOrg.id === org.id ? 'text-white font-medium' : ''}>{org.name}</span>
                        </div>
                        {currentOrg.id === org.id && <Check className="w-4 h-4 text-[var(--theme-primary)]" />}
                    </button>
                ))}
            </div>
            
            <div className="h-px bg-slate-800 my-1"></div>
            
            <div className="p-2">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300">
                    <Plus className="w-4 h-4 text-slate-500" />
                    Create Organization
                </button>
            </div>

            <div className="h-px bg-slate-800 my-1"></div>

            <div className="p-2">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300">
                    <Settings className="w-4 h-4 text-slate-500" />
                    Settings
                </button>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300">
                    <LogOut className="w-4 h-4 text-slate-500" />
                    Log out
                </button>
            </div>
        </div>
      )}

      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${isOpen ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-transparent hover:bg-slate-800'}`}
      >
        <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
            style={{ backgroundColor: 'var(--theme-primary)' }}
        >
            {currentOrg.initials}
        </div>
        
        <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-semibold text-slate-200 truncate w-full text-left">
                {currentOrg.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
                {currentOrg.plan} Plan
            </span>
        </div>
        
        <ChevronsUpDown className="w-4 h-4 text-slate-500 ml-auto shrink-0" />
      </button>
    </div>
  );
};

export default OrgSwitcher;
