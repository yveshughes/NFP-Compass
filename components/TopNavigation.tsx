
import React, { useState, useRef, useEffect } from 'react';
import { AppSection, BrandingData } from '../types';
import { PRESET_PALETTES } from '../constants';
import { Briefcase, Megaphone, Settings, Wallet, Palette, ChevronDown, BarChart3 } from 'lucide-react';

interface TopNavigationProps {
  currentSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  currentPalette: BrandingData | null;
  onPaletteChange: (palette: BrandingData) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentSection, onSectionChange, currentPalette, onPaletteChange }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: AppSection.Incorporate, label: 'Incorporate', icon: Briefcase },
    { id: AppSection.Promote, label: 'Promote', icon: Megaphone },
    { id: AppSection.Manage, label: 'Manage', icon: Settings },
    { id: AppSection.Measure, label: 'Measure', icon: BarChart3 },
  ];

  const handleConnect = () => {
    if (walletAddress) {
        if (window.confirm("Disconnect wallet?")) {
            setWalletAddress(null);
        }
    } else {
        setTimeout(() => {
            setWalletAddress("0x71...9A21");
        }, 300);
    }
  };

  // Close palette dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 shrink-0 z-30">
      <div className="flex h-16 items-center max-w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 md:mr-8 shrink-0">
             <span className="w-7 h-7 bg-[var(--theme-primary)] rounded-md flex items-center justify-center text-xs font-bold text-white shadow-lg">N</span>
             <span className="text-white font-bold tracking-tight text-lg hidden sm:inline">NFP<span className="text-[var(--theme-primary-bright)]">compass</span></span>
             <span className="text-white font-bold tracking-tight text-lg sm:hidden">NFP</span>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-800 mr-2 shrink-0 hidden md:block"></div>

        {/* Tabs */}
        <div className="flex h-full overflow-x-auto scrollbar-hide mask-fade-right">
            {tabs.map((tab) => {
            const isActive = currentSection === tab.id;
            const Icon = tab.icon;
            return (
                <button
                key={tab.id}
                onClick={() => onSectionChange(tab.id)}
                className={`relative flex items-center gap-2 px-3 md:px-5 h-full transition-all text-sm font-medium border-b-2 whitespace-nowrap ${
                    isActive
                    ? 'border-[var(--theme-primary-bright)] text-[var(--theme-primary-bright)] bg-slate-800/30'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/20'
                }`}
                >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                </button>
            );
            })}
        </div>

        {/* Right Actions */}
        <div className="ml-auto pl-4 flex items-center gap-3">
            
            {/* Palette Selector */}
            <div className="relative" ref={paletteRef}>
                <button
                    onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-slate-200 text-xs font-medium hover:border-slate-600"
                >
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span className="hidden sm:inline">Theme</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {/* Dropdown */}
                {isPaletteOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Select Brand Archetype
                        </div>
                        <div className="p-1">
                            {Object.entries(PRESET_PALETTES).map(([key, data]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        onPaletteChange(data);
                                        setIsPaletteOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                                >
                                    {/* Preview Circles */}
                                    <div className="flex -space-x-1">
                                        {data.colors.slice(0, 2).map((c, i) => (
                                            <div 
                                                key={i} 
                                                className="w-4 h-4 rounded-full border border-slate-800" 
                                                style={{ backgroundColor: c.hex }} 
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium text-slate-200 group-hover:text-white">{data.paletteName}</div>
                                        <div className="text-[10px] text-slate-500 truncate">{data.mood}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Wallet Button */}
            <button
                onClick={handleConnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                    walletAddress 
                    ? 'bg-slate-800 border-[var(--theme-primary-bright)] text-[var(--theme-primary-bright)] hover:bg-slate-700' 
                    : 'border-transparent text-white hover:shadow-lg active:scale-95'
                }`}
                style={!walletAddress ? { background: 'linear-gradient(to right, var(--theme-primary), #4f46e5)' } : {}}
            >
                <Wallet className="w-3.5 h-3.5" />
                {walletAddress ? walletAddress : "Connect Wallet"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
