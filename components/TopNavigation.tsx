import React, { useState } from 'react';
import { AppSection } from '../types';
import { Briefcase, Megaphone, Settings, Wallet } from 'lucide-react';

interface TopNavigationProps {
  currentSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentSection, onSectionChange }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const tabs = [
    { id: AppSection.Incorporate, label: 'Incorporate', icon: Briefcase },
    { id: AppSection.Promote, label: 'Promote', icon: Megaphone },
    { id: AppSection.Manage, label: 'Manage', icon: Settings },
  ];

  const handleConnect = () => {
    if (walletAddress) {
        if (window.confirm("Disconnect wallet?")) {
            setWalletAddress(null);
        }
    } else {
        // Simulate a connection delay
        setTimeout(() => {
            setWalletAddress("0x71...9A21");
        }, 300);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 shrink-0 z-30">
      <div className="flex h-16 items-center max-w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 md:mr-8 shrink-0">
             <span className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-900/50">N</span>
             <span className="text-white font-bold tracking-tight text-lg hidden sm:inline">NFP<span className="text-blue-400">compass</span></span>
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
                    ? 'border-blue-500 text-blue-400 bg-slate-800/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
                >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                </button>
            );
            })}
        </div>

        {/* Wallet Connection (Right Aligned) */}
        <div className="ml-auto pl-4">
            <button
                onClick={handleConnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                    walletAddress 
                    ? 'bg-slate-800 border-blue-500/30 text-blue-400 hover:border-blue-400 hover:bg-slate-700' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
                }`}
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