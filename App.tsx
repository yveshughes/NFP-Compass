
import React, { useState, useEffect } from 'react';
import { Step, Message, AppState, AppSection, BrandingData, Organization } from './types';
import { sendMessageToGemini, initializeChat } from './services/geminiService';
import ProgressBar from './components/ProgressBar';
import ChatInterface from './components/ChatInterface';
import BrowserWindow from './components/BrowserWindow';
import LandingPage from './components/LandingPage';
import TopNavigation from './components/TopNavigation';
import { INITIAL_GREETING, MOCK_ORGS } from './constants';

const App: React.FC = () => {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [state, setState] = useState<AppState>({
    currentSection: AppSection.Incorporate,
    currentStep: Step.Onboarding,
    messages: [],
    isLoading: false,
    browserUrl: null,
    brandingData: null,
    supplementalProvisionText: null,
    activeOrg: MOCK_ORGS[0] // Default to first mock org
  });

  // --- COLOR UTILITIES ---
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const getLuminance = (r: number, g: number, b: number) => {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const lightenColor = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex);
    const amt = Math.round(2.55 * percent);
    const R = (r + amt < 255) ? r + amt : 255;
    const G = (g + amt < 255) ? g + amt : 255;
    const B = (b + amt < 255) ? b + amt : 255;
    
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
  };

  // --- DYNAMIC THEME INJECTION ---
  useEffect(() => {
    // Determine primary color (Default to Blue-600 if no palette)
    const primaryHex = state.brandingData?.colors.find(c => c.role === 'Primary')?.hex || '#3b82f6';
    
    // Calculate brightness to ensure visibility on dark backgrounds
    const { r, g, b } = hexToRgb(primaryHex);
    const luminance = getLuminance(r, g, b);
    
    // If color is dark (luminance < 0.6), lighten it significantly for text/icons on dark backgrounds
    // Otherwise use the color as is
    let brightHex = primaryHex;
    if (luminance < 0.2) {
        brightHex = lightenColor(primaryHex, 60); // Very dark -> make much lighter
    } else if (luminance < 0.5) {
        brightHex = lightenColor(primaryHex, 30); // Dark -> make lighter
    }

    // Inject into CSS variables
    document.documentElement.style.setProperty('--theme-primary', primaryHex); // Original brand color (for buttons, etc)
    document.documentElement.style.setProperty('--theme-primary-bright', brightHex); // High contrast version for dark mode text
    document.documentElement.style.setProperty('--theme-primary-dim', primaryHex + '20'); // Hex alpha for faint backgrounds

  }, [state.brandingData]);


  // Handle Launch Transition
  const handleLaunch = (selectedState: string) => {
      setHasLaunched(true);
      // Initialize Chat only after launch
      try {
        initializeChat();
        setState(prev => ({
            ...prev,
            messages: [{
                id: 'init',
                role: 'model',
                text: INITIAL_GREETING,
                timestamp: Date.now()
            }]
        }));
      } catch (e) {
        console.error("Failed to init chat", e);
      }
  };

  const handleSectionChange = (section: AppSection) => {
      // When changing sections, optionally reset step or pick first one
      let defaultStep = Step.Onboarding;
      if (section === AppSection.Promote) defaultStep = Step.BrandIdentity;
      if (section === AppSection.Manage) defaultStep = Step.FederalFiling;
      if (section === AppSection.Measure) defaultStep = Step.MeasureDashboard;
      if (section === AppSection.Incorporate) defaultStep = Step.MissionName; // Skip onboarding if revisiting

      setState(prev => ({
          ...prev,
          currentSection: section,
          currentStep: defaultStep
      }));
  };

  const parseStepFromResponse = (text: string): Step | null => {
    const match = text.match(/\[STEP:\s*(\d+)\]/);
    if (match && match[1]) {
      const stepNum = parseInt(match[1], 10);
      return stepNum in Step ? stepNum : null;
    }
    return null;
  };

  const parsePaletteFromResponse = (text: string): BrandingData | null => {
    // Look for JSON block
    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            const data = JSON.parse(jsonMatch[1]);
            // Validate basic structure
            if (data.colors && Array.isArray(data.colors)) {
                return {
                    paletteName: data.palette_name || "Custom Palette",
                    colors: data.colors, // Expecting {role, hex, name}
                    mood: "Generated by Gemma"
                };
            }
        } catch (e) {
            console.error("Failed to parse palette JSON", e);
        }
    }
    return null;
  };

  const parseProvisionText = (text: string): string | null => {
      // Heuristic: If we are in Step 3, and there is a markdown code block, assume it's the provision.
      if (state.currentStep === Step.Incorporation || text.includes("Supplemental Provisions")) {
          // If a JSON block exists (for palette), ignore it here to prevent confusing provision text with JSON
          if (text.includes("```json")) return null; 
          
          const codeBlockMatch = text.match(/```([\s\S]*?)```/);
          if (codeBlockMatch) {
              return codeBlockMatch[1].trim();
          }
      }
      return null;
  };

  const handleSendMessage = async (text: string) => {
    // Add User Message
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: Date.now()
    };

    setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMsg],
        isLoading: true
    }));

    try {
        const responseText = await sendMessageToGemini(text);
        
        // Parse State Updates
        const newStep = parseStepFromResponse(responseText);
        const newPalette = parsePaletteFromResponse(responseText);
        const provision = parseProvisionText(responseText);

        // Remove hidden tags and JSON blocks from display text to keep chat clean
        let cleanText = responseText.replace(/\[STEP:\s*\d+\]/g, '').trim();
        cleanText = cleanText.replace(/```json[\s\S]*?```/, '(I have updated the visual brand panel for you!)');

        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: cleanText,
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, botMsg],
            isLoading: false,
            currentStep: newStep !== null ? newStep : prev.currentStep,
            brandingData: newPalette || prev.brandingData,
            supplementalProvisionText: provision || prev.supplementalProvisionText
        }));

    } catch (error) {
        setState(prev => ({
            ...prev,
            isLoading: false,
            messages: [...prev.messages, {
                id: Date.now().toString(),
                role: 'model',
                text: "Sorry, I encountered an error. Please try again.",
                timestamp: Date.now()
            }]
        }));
    }
  };

  const handleStepSelect = (step: Step) => {
      setState(prev => ({...prev, currentStep: step}));
  }

  const handlePaletteChange = (palette: BrandingData) => {
      setState(prev => ({
          ...prev,
          brandingData: palette,
          currentStep: prev.currentSection === AppSection.Promote ? Step.BrandIdentity : prev.currentStep
      }));
  }

  const handleOrgChange = (org: Organization) => {
    // In a real app, this would probably switch contexts/DBs
    setState(prev => ({
        ...prev,
        activeOrg: org
    }));
  }

  if (!hasLaunched) {
      return <LandingPage onLaunch={handleLaunch} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-900 font-sans overflow-hidden">
      
      {/* Top Navigation */}
      <TopNavigation 
        currentSection={state.currentSection} 
        onSectionChange={handleSectionChange}
        currentPalette={state.brandingData}
        onPaletteChange={handlePaletteChange}
      />
      
      {/* Main Content Area (Sidebar + Chat + Browser) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white relative">
        
        {/* Sidebar Navigation */}
        <ProgressBar 
            currentStep={state.currentStep} 
            currentSection={state.currentSection}
            onStepSelect={handleStepSelect}
            activeOrg={state.activeOrg}
            onOrgChange={handleOrgChange}
        />

        {/* Left Pane: Chat */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-r border-slate-200">
            <ChatInterface 
                messages={state.messages} 
                isLoading={state.isLoading} 
                onSendMessage={handleSendMessage} 
            />
        </div>

        {/* Right Pane: Browser/Context */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
            <BrowserWindow 
                currentStep={state.currentStep} 
                browserUrl={state.browserUrl}
                brandingData={state.brandingData}
                supplementalText={state.supplementalProvisionText}
            />
        </div>

      </div>
    </div>
  );
};

export default App;
