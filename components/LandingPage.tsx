import React, { useState } from 'react';
import { US_STATES } from '../constants';
import { ArrowRight, MapPin } from 'lucide-react';
import USMap from '../src/assets/US_Map.svg';

interface LandingPageProps {
  onLaunch: (state: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = () => {
    if (!selectedState) return;
    
    if (selectedState !== 'TX') {
      setError(`NFPcompass is currently only available for Texas formations. Support for ${selectedState} is coming soon.`);
      return;
    }

    onLaunch(selectedState);
  };

  const handleStateSelect = (code: string) => {
      setSelectedState(code);
      setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-4xl w-full z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Side: Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            AI-Powered Non-Profit Formation
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Build your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Non-Profit</span> <br/>
            with confidence.
          </h1>
          
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto md:mx-0">
            Navigate the complexities of state incorporation, IRS tax exemption, and branding with an intelligent guide tailored for your jurisdiction.
          </p>

          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 backdrop-blur-sm inline-flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                    className="w-full bg-slate-900/50 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none outline-none transition-all"
                    value={selectedState}
                    onChange={(e) => handleStateSelect(e.target.value)}
                >
                    <option value="" disabled>Select your jurisdiction</option>
                    {US_STATES.map(state => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            <button 
                onClick={handleLaunch}
                disabled={!selectedState}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-blue-900/20"
            >
                Start Journey
                <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {error && (
             <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-sm animate-in fade-in slide-in-from-top-1">
                {error}
             </div>
          )}
        </div>

        {/* Right Side: Visual Map */}
        <div className="flex-1 w-full max-w-md md:max-w-none relative">
            <div className="relative aspect-[1.5] w-full">
                <img 
                  src={USMap} 
                  alt="US Map" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                />

                {/* Floating Badges */}
                <div className="absolute top-10 right-10 bg-slate-800/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl animate-bounce-slow hidden md:block">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-xs font-bold text-slate-200">System Online</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Updated Regulations: 2024</div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-slate-600 text-xs text-center">
        NFPcompass © 2024. Not a law firm.
      </div>
    </div>
  );
};

export default LandingPage;
