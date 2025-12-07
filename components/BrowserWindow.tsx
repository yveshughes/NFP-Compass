
import React from 'react';
import { Step, BrandingData, BoardMember, CampaignData } from '../types';
import { STEPS_INFO } from '../constants';
import { Globe, ArrowRight, ExternalLink, Copy, Check, Palette, Info, Construction, TrendingUp, Users, DollarSign, Download, BarChart3, Upload } from 'lucide-react';
import OrgChart from './OrgChart';
import stationaryImage from '/src/assets/stationary.jpeg';

interface BrowserWindowProps {
  currentStep: Step;
  browserUrl: string | null;
  brandingData: BrandingData | null;
  supplementalText: string | null;
  screenshot: string | null;
  boardMembers: BoardMember[];
  onContinue?: () => void;
  orgName?: string;
  generatedLogo?: string | null;
  onGenerateLogo?: (style: string) => void;
  campaignData?: CampaignData;
  onFileUpload?: (file: File) => void;
  onGenerateSocialPost?: (quote: string) => void;
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({ currentStep, browserUrl, brandingData, supplementalText, screenshot, boardMembers, onContinue, orgName, generatedLogo, onGenerateLogo, campaignData, onFileUpload, onGenerateSocialPost }) => {
  const [copied, setCopied] = React.useState(false);
  const [selectedLogo, setSelectedLogo] = React.useState<number | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

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
        <div className="flex flex-col items-center justify-center h-full p-8">
          <img
            src={stationaryImage}
            alt="Branded Stationary Preview"
            className="w-full max-w-2xl rounded-lg shadow-2xl"
          />
          <p className="mt-6 text-sm text-slate-500 text-center max-w-md">
            Gemma will guide you through creating your nonprofit's brand identity with custom colors and typography.
          </p>
        </div>
      );
    }

    const primaryColor = brandingData.colors.find(c => c.role === "Primary")?.hex || '#3b82f6';
    const secondaryColor = brandingData.colors.find(c => c.role === "Secondary")?.hex || '#1e293b';
    const backgroundColor = brandingData.colors.find(c => c.role === "Background")?.hex || '#f8fafc';

    // Mock Logo Styles
    const logoStyles = [
        { id: 1, name: "Modern Minimal", font: "sans-serif", weight: "700", tracking: "tight", transform: "uppercase" },
        { id: 2, name: "Classic Serif", font: "serif", weight: "600", tracking: "normal", transform: "capitalize" },
        { id: 3, name: "Friendly Round", font: "sans-serif", weight: "800", tracking: "wide", transform: "lowercase", rounded: true },
        { id: 4, name: "Tech Mono", font: "monospace", weight: "500", tracking: "tighter", transform: "uppercase" }
    ];

    const displayOrgName = orgName !== 'TBD' ? orgName : "Wear it Forward";

    return (
      <div className="space-y-8 pb-10">
        {/* 1. Logo Selection */}
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">1. Select Logo Style</h3>
                {onGenerateLogo && (
                    <button 
                        onClick={() => {
                            if (selectedLogo && onGenerateLogo) {
                                setIsGenerating(true);
                                const style = logoStyles.find(s => s.id === selectedLogo)?.name || "Modern";
                                onGenerateLogo(style).finally(() => setIsGenerating(false));
                            }
                        }}
                        disabled={!selectedLogo || isGenerating}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                        {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {logoStyles.map((style) => (
                    <div 
                        key={style.id}
                        onClick={() => setSelectedLogo(style.id)}
                        className={`aspect-[3/2] bg-white rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center p-6 relative group ${selectedLogo === style.id ? 'border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)] ring-opacity-20' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                        <div 
                            className="text-2xl text-center leading-tight transition-colors"
                            style={{ 
                                color: selectedLogo === style.id ? primaryColor : '#334155',
                                fontFamily: style.font,
                                fontWeight: style.weight,
                                letterSpacing: style.tracking === 'tight' ? '-0.05em' : style.tracking === 'wide' ? '0.1em' : '0',
                                textTransform: style.transform as any
                            }}
                        >
                            {displayOrgName}
                        </div>
                        <div className="absolute bottom-3 text-[10px] text-slate-400 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            {style.name}
                        </div>
                        {selectedLogo === style.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center text-white">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* 2. Color Palette Display */}
        <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">2. Active Color Theme</h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{brandingData.paletteName}</h2>
                        <div className="text-xs text-slate-500 mt-1">{brandingData.mood}</div>
                    </div>
                </div>

                {/* Swatches */}
                <div className="grid grid-cols-4 gap-3 relative z-10">
                    {brandingData.colors.map((color, idx) => (
                        <div key={idx} className="group">
                            <div className="h-16 rounded-lg shadow-sm mb-2 ring-1 ring-black/5" style={{backgroundColor: color.hex}}></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-700 truncate">{color.name}</span>
                                <span className="text-[9px] font-mono text-slate-400">{color.hex}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 3. Preview & Continue */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Preview</h3>

            {/* Branded Letter Image Preview */}
            <div className="aspect-[16/9] bg-white rounded-lg shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden max-w-2xl mx-auto mb-6 relative">
                {generatedLogo ? (
                    <img src={generatedLogo} alt="Person receiving branded letter" className="w-full h-full object-cover" />
                ) : (
                    <div className="relative w-full h-full group bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
                        <div className="text-center text-slate-400">
                            <div className="text-sm mb-2">Select your branding preferences above</div>
                            <div className="text-xs">Gemma will generate a preview image of your branded materials</div>
                        </div>
                    </div>
                )}
           </div>

           <div className="flex justify-end">
                <button 
                    onClick={onContinue}
                    disabled={!selectedLogo}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${selectedLogo ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                    Continue to Campaigns
                    <ArrowRight className="w-4 h-4" />
                </button>
           </div>
        </div>
      </div>
    );
  };

  const renderCreateCampaigns = () => {
      if (!campaignData) return null;

      return (
          <div className="space-y-8 pb-10">
              {/* File Status */}
              {campaignData.uploadedFileName && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900">{campaignData.uploadedFileName}</h4>
                          <p className="text-xs text-blue-700">
                              {campaignData.isAnalyzing ? "Analyzing with Gemini 3 Pro..." : "Analysis complete"}
                          </p>
                      </div>
                  </div>
              )}

              {/* Quotes Selection */}
              {campaignData.extractedQuotes.length > 0 && (
                  <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select a Quote to Visualize</h3>
                      <div className="space-y-3">
                          {campaignData.extractedQuotes.map((quote, idx) => (
                              <div 
                                  key={idx} 
                                  onClick={() => onGenerateSocialPost?.(quote)}
                                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                              >
                                  <p className="text-slate-700 italic mb-2">"{quote}"</p>
                                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Palette className="w-3 h-3" />
                                      Generate Social Post
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Generated Campaign Images with Quote Overlays */}
              {campaignData.generatedImages.length > 0 && (
                  <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                          {campaignData.isGenerating ? `Generating Campaign Posts (${campaignData.generatedImages.length}/4)...` : 'Campaign Posts Ready to Share'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                          {campaignData.generatedImages.map((img, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm group hover:shadow-lg transition-shadow">
                                  <div className="aspect-square relative overflow-hidden rounded-lg mb-3">
                                      <img src={img} alt={`Campaign Post ${idx + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-400">Post {idx + 1}/4</span>
                                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Download className="w-3 h-3" />
                                          Download
                                      </button>
                                  </div>
                              </div>
                          ))}
                          {/* Placeholder slots for remaining images */}
                          {campaignData.isGenerating && Array.from({ length: 4 - campaignData.generatedImages.length }).map((_, idx) => (
                              <div key={`placeholder-${idx}`} className="bg-slate-50 p-3 rounded-xl border border-slate-200 border-dashed">
                                  <div className="aspect-square relative overflow-hidden rounded-lg mb-3 bg-slate-100 flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                  </div>
                                  <div className="text-center text-[10px] text-slate-400">Generating...</div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {campaignData.isGenerating && campaignData.generatedImages.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="text-sm font-medium">Creating 4 stunning campaign posts with quote overlays...</p>
                      <p className="text-xs text-slate-400">Using Gemini 3 Pro Image Preview</p>
                  </div>
              )}
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

  const renderDefaultResource = () => {
    // Priority 1: Show screenshot if available
    if (screenshot) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 w-full h-full overflow-auto rounded-lg shadow-sm bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
                        📸 Screen Share - What Gemma Sees
                    </div>
                    <img
                        src={screenshot}
                        alt="Shared screenshot"
                        className="w-full rounded-lg shadow-md border border-slate-200"
                    />
                </div>
            </div>
        );
    }

    // Priority 2: Show iframe if browserUrl is set
    if (browserUrl) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 w-full h-full overflow-hidden rounded-lg shadow-sm relative bg-white">
                    <iframe
                        src={browserUrl}
                        className="absolute top-0 left-0 border-0"
                        style={{
                            width: '153.8%', // 100 / 0.65
                            height: '153.8%',
                            transform: 'scale(0.65)',
                            transformOrigin: '0 0'
                        }}
                        title="Browser View"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                </div>
                <div className="mt-2 text-center">
                    <a
                        href={browserUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center justify-center gap-1"
                    >
                        Open in new tab <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        );
    }

    return (
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
  };

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
        {currentStep === Step.BoardFormation ? <OrgChart boardMembers={boardMembers} /> :
         currentStep === Step.Branding || currentStep === Step.BrandIdentity ? renderBranding() :
         currentStep === Step.CreateCampaigns ? renderCreateCampaigns() :
         currentStep === Step.Incorporation ? renderIncorporationHelp() :
         (currentStep >= Step.MeasureDashboard && currentStep <= Step.CustomReports) ? renderMeasureDashboard() :
         renderDefaultResource()}
      </div>
    </div>
  );
};

export default BrowserWindow;