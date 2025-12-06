import React from 'react';
import { Step, BrandingData } from '../types';
import { STEPS_INFO } from '../constants';
import { Globe, ArrowRight, ExternalLink, Copy, Check, Palette, Info, Construction } from 'lucide-react';

interface BrowserWindowProps {
  currentStep: Step;
  browserUrl: string | null;
  brandingData: BrandingData | null;
  supplementalText: string | null;
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({ currentStep, browserUrl, brandingData, supplementalText }) => {
  const [copied, setCopied] = React.useState(false);

  const stepInfo = STEPS_INFO[currentStep];
  const displayUrl = browserUrl || stepInfo?.url || 'https://nfpcompass.app/dashboard';

  const handleCopy = () => {
    if (supplementalText) {
      navigator.clipboard.writeText(supplementalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- RENDERERS ---

  const renderBranding = () => {
    if (!brandingData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
          <Palette className="w-16 h-16 mb-6 opacity-30 text-blue-500" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Brand Identity Design</h3>
          <p className="max-w-xs mx-auto">
            Ask Gemma to generate a color palette, mood, and logo concepts for your non-profit.
          </p>
          <div className="mt-6 text-sm bg-slate-100 px-4 py-2 rounded-lg text-slate-500">
            Try: "Design a hopeful, nature-inspired brand for my environmental charity."
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Generated Palette</h3>
          <div className="flex h-32 rounded-lg overflow-hidden ring-1 ring-slate-200">
            {brandingData.colors.map((color, idx) => (
              <div
                key={idx}
                className="flex-1 flex items-end justify-center pb-4 transition-all hover:flex-[1.5] group relative"
                style={{ backgroundColor: color }}
              >
                <span className="bg-white/90 text-slate-800 text-xs font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {/* Mock Business Card */}
           <div className="aspect-[1.75/1] bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-current opacity-10 rounded-bl-full" style={{color: brandingData.colors[0]}}></div>
                <div className="z-10">
                    <div className="w-8 h-8 rounded mb-2" style={{backgroundColor: brandingData.colors[0]}}></div>
                    <div className="h-3 w-32 bg-slate-800 rounded mb-1"></div>
                    <div className="h-2 w-20 bg-slate-400 rounded"></div>
                </div>
                <div className="z-10 text-[10px] text-slate-400">
                    501(c)(3) Non-Profit Organization
                </div>
           </div>

           {/* Mock Mobile App Header */}
           <div className="aspect-[9/16] bg-slate-50 rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col mx-auto w-1/2">
                <div className="h-14 flex items-center justify-center text-white font-medium" style={{backgroundColor: brandingData.colors[0]}}>
                    App Header
                </div>
                <div className="flex-1 p-4 space-y-2">
                     <div className="h-24 rounded-lg bg-white shadow-sm mb-2"></div>
                     <div className="h-24 rounded-lg bg-white shadow-sm mb-2"></div>
                </div>
           </div>
        </div>
      </div>
    );
  };

  const renderIncorporationHelp = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-amber-800 font-semibold flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Critical Requirement
        </h3>
        <p className="text-sm text-amber-700">
            Texas Form 202 (Certificate of Formation) does <strong>not</strong> include the required IRS language by default. 
            You must add the text below to the "Supplemental Provisions" section of the form to qualify for 501(c)(3) status later.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplemental Provision / Article</span>
          <button 
            onClick={handleCopy}
            className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy to Clipboard'}
          </button>
        </div>
        <div className="p-4 bg-slate-50/50">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed bg-white border border-slate-200 p-3 rounded">
                {supplementalText || "Waiting for legal text generation..."}
            </pre>
        </div>
      </div>
      
      <div className="flex justify-end">
        <a 
            href="https://www.sos.state.tx.us/corp/sosda/index.shtml" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
            Go to SOSDirect <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );

  const renderDefaultResource = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Globe className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {stepInfo?.title}
        </h3>
        <p className="text-slate-500 max-w-sm mb-8 text-sm">
            {stepInfo?.description}
        </p>
        
        {stepInfo?.url ? (
            <a 
                href={stepInfo.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
            >
                Open Official Portal
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
        ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-medium rounded-xl cursor-not-allowed">
                <Construction className="w-4 h-4" />
                Work in Progress
            </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Browser Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shadow-sm z-10 shrink-0">
        <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
        </div>
        <div className="flex-1 bg-slate-100 h-9 rounded-md flex items-center px-3 text-xs text-slate-500 font-mono truncate">
            <span className="text-slate-400 mr-2">https://</span>
            {displayUrl.replace('https://', '')}
        </div>
        <Globe className="w-4 h-4 text-slate-400" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentStep === Step.Branding || currentStep === Step.BrandIdentity ? renderBranding() :
         currentStep === Step.Incorporation ? renderIncorporationHelp() :
         renderDefaultResource()}
      </div>
    </div>
  );
};

export default BrowserWindow;