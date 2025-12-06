
import React from 'react';
import { Step, BrandingData } from '../types';
import { STEPS_INFO } from '../constants';
import { Globe, ArrowRight, ExternalLink, Copy, Check, Palette, Info, Construction, TrendingUp, Users, DollarSign, Download, BarChart3 } from 'lucide-react';

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

  const renderMeasureDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <DollarSign className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">YTD Donations</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">$24,500</div>
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% vs last month
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Lives Impacted</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">1,240</div>
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8% this quarter
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Program ROI</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">4.2x</div>
                <div className="text-xs text-slate-400">Impact per dollar spent</div>
            </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800">Donation Trends</h3>
                <div className="flex gap-2 text-xs">
                    <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium hover:bg-slate-200">Weekly</button>
                    <button className="px-3 py-1 rounded-full bg-[var(--theme-primary)] text-white font-medium">Monthly</button>
                </div>
             </div>
             
             {/* Mock CSS Bar Chart */}
             <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[30, 45, 35, 60, 50, 75, 55, 65, 80, 70, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
                        <div className="w-full bg-[var(--theme-primary)] opacity-80 group-hover:opacity-100 rounded-t-sm transition-all" style={{height: `${h}%`}}></div>
                        <div className="text-[10px] text-center text-slate-400">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</div>
                    </div>
                ))}
             </div>
        </div>

        {/* Impact List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Recent Impact Logs</h3>
                <button className="text-xs text-[var(--theme-primary)] hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Export CSV
                </button>
             </div>
             <div className="overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Program</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Metric</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        <tr className="border-b border-slate-50">
                            <td className="px-4 py-3 font-medium">Community Meals</td>
                            <td className="px-4 py-3 text-slate-400">Oct 24, 2024</td>
                            <td className="px-4 py-3">Meals Served</td>
                            <td className="px-4 py-3 text-right font-bold">150</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                            <td className="px-4 py-3 font-medium">Education Initiative</td>
                            <td className="px-4 py-3 text-slate-400">Oct 22, 2024</td>
                            <td className="px-4 py-3">Students Tutored</td>
                            <td className="px-4 py-3 text-right font-bold">45</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                            <td className="px-4 py-3 font-medium">Winter Coat Drive</td>
                            <td className="px-4 py-3 text-slate-400">Oct 20, 2024</td>
                            <td className="px-4 py-3">Coats Distributed</td>
                            <td className="px-4 py-3 text-right font-bold">320</td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </div>
      </div>
    );
  };

  const renderBranding = () => {
    if (!brandingData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
          <Palette className="w-16 h-16 mb-6 opacity-30 text-blue-500" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Brand Identity Design</h3>
          <p className="max-w-xs mx-auto">
            Ask Gemma to generate a color palette for your non-profit, or use the <strong>Theme</strong> selector in the top bar.
          </p>
          <div className="mt-6 text-sm bg-slate-100 px-4 py-2 rounded-lg text-slate-500">
            Try: "Design a hopeful, nature-inspired brand for my environmental charity."
          </div>
        </div>
      );
    }

    const primaryColor = brandingData.colors.find(c => c.role === "Primary")?.hex || '#3b82f6';
    const secondaryColor = brandingData.colors.find(c => c.role === "Secondary")?.hex || '#1e293b';
    const backgroundColor = brandingData.colors.find(c => c.role === "Background")?.hex || '#f8fafc';

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Active Palette</h3>
                    <h2 className="text-2xl font-bold text-slate-900">{brandingData.paletteName}</h2>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    {brandingData.mood}
                </div>
            </div>

            {/* Swatches */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                {brandingData.colors.map((color, idx) => (
                    <div key={idx} className="group cursor-pointer">
                        <div className="h-24 rounded-lg shadow-sm mb-2 transition-transform group-hover:scale-[1.02] ring-1 ring-black/5" style={{backgroundColor: color.hex}}></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{color.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase">{color.role}</span>
                            <span className="text-[10px] font-mono text-slate-500">{color.hex}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 -z-0 pointer-events-none"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {/* Mock Business Card */}
           <div className="aspect-[1.75/1] bg-white rounded-lg shadow-lg shadow-slate-200/50 border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-current opacity-10 rounded-bl-full" style={{color: primaryColor}}></div>
                <div className="z-10">
                    <div className="w-8 h-8 rounded mb-2 shadow-sm" style={{backgroundColor: primaryColor}}></div>
                    <div className="h-3 w-32 bg-slate-800 rounded mb-1"></div>
                    <div className="h-2 w-20 bg-slate-400 rounded"></div>
                </div>
                <div className="z-10 text-[10px] text-slate-400 flex justify-between items-end">
                    <span>501(c)(3) Organization</span>
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent to-current opacity-50" style={{color: secondaryColor}}></div>
                </div>
           </div>

           {/* Mock Mobile App Header */}
           <div className="aspect-[9/16] bg-slate-50 rounded-lg shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col mx-auto w-1/2 relative">
                <div className="h-16 flex items-end justify-center pb-3 text-white font-medium text-sm shadow-md z-10" style={{backgroundColor: primaryColor}}>
                    Dashboard
                </div>
                <div className="flex-1 p-3 space-y-2" style={{backgroundColor: backgroundColor}}>
                     <div className="h-20 rounded-lg bg-white shadow-sm mb-2 flex items-center p-3 gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100" style={{backgroundColor: secondaryColor, opacity: 0.1}}></div>
                        <div className="flex-1 space-y-1">
                            <div className="h-2 w-16 bg-slate-200 rounded"></div>
                            <div className="h-1.5 w-10 bg-slate-100 rounded"></div>
                        </div>
                     </div>
                     <div className="h-32 rounded-lg bg-white shadow-sm p-3">
                        <div className="h-2 w-24 bg-slate-200 rounded mb-4"></div>
                        <div className="flex gap-1 items-end h-16">
                            <div className="flex-1 bg-slate-100 rounded-t" style={{height: '40%'}}></div>
                            <div className="flex-1 bg-slate-100 rounded-t" style={{height: '70%', backgroundColor: secondaryColor}}></div>
                            <div className="flex-1 bg-slate-100 rounded-t" style={{height: '50%'}}></div>
                        </div>
                     </div>
                </div>
                {/* Floating Action Button */}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white" style={{backgroundColor: secondaryColor}}>
                    +
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
         (currentStep >= Step.MeasureDashboard && currentStep <= Step.CustomReports) ? renderMeasureDashboard() :
         renderDefaultResource()}
      </div>
    </div>
  );
};

export default BrowserWindow;