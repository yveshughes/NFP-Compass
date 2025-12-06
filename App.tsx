import React, { useState, useEffect } from 'react';
import { Step, Message, AppState, AppSection } from './types';
import { sendMessageToGemini, initializeChat } from './services/geminiService';
import ProgressBar from './components/ProgressBar';
import ChatInterface from './components/ChatInterface';
import BrowserWindow from './components/BrowserWindow';
import LandingPage from './components/LandingPage';
import TopNavigation from './components/TopNavigation';
import { INITIAL_GREETING } from './constants';

const App: React.FC = () => {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [state, setState] = useState<AppState>({
    currentSection: AppSection.Incorporate,
    currentStep: Step.Onboarding,
    messages: [],
    isLoading: false,
    browserUrl: null,
    brandingData: null,
    supplementalProvisionText: null
  });

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

  const parseColorsFromResponse = (text: string): string[] => {
    // Look for patterns like "Palette: [#123456, #ABCDEF]"
    const match = text.match(/Palette:\s*\[(.*?)\]/);
    if (match && match[1]) {
        return match[1].split(',').map(c => c.trim().replace(/['"]/g, ''));
    }
    return [];
  };

  const parseProvisionText = (text: string): string | null => {
      // Heuristic: If we are in Step 3, and there is a markdown code block, assume it's the provision.
      if (state.currentStep === Step.Incorporation || text.includes("Supplemental Provisions")) {
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
        const colors = parseColorsFromResponse(responseText);
        const provision = parseProvisionText(responseText);

        // Remove the hidden tag from display text
        const cleanText = responseText.replace(/\[STEP:\s*\d+\]/g, '').trim();

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
            brandingData: colors.length > 0 ? { mood: 'Generated', colors } : prev.brandingData,
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

  if (!hasLaunched) {
      return <LandingPage onLaunch={handleLaunch} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-900 font-sans overflow-hidden">
      
      {/* Top Navigation */}
      <TopNavigation 
        currentSection={state.currentSection} 
        onSectionChange={handleSectionChange} 
      />
      
      {/* Main Content Area (Sidebar + Chat + Browser) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white relative">
        
        {/* Sidebar Navigation */}
        <ProgressBar 
            currentStep={state.currentStep} 
            currentSection={state.currentSection}
            onStepSelect={handleStepSelect}
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