
import React from 'react';
import { Step, AppSection, Organization } from '../types';
import { STEPS_INFO } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';
import OrgSwitcher from './OrgSwitcher';

interface ProgressBarProps {
  currentStep: Step;
  currentSection: AppSection;
  onStepSelect?: (step: Step) => void;
  activeOrg: Organization | null;
  onOrgChange: (org: Organization) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, currentSection, onStepSelect, activeOrg, onOrgChange }) => {
  
  // Define steps for each section
  const getSectionSteps = (section: AppSection): Step[] => {
    switch (section) {
        case AppSection.Incorporate:
            // Steps 1 through 7
            return [1, 2, 3, 4, 5, 6, 7];
        case AppSection.Promote:
            return [100, 101, 102, 103, 104];
        case AppSection.Manage:
            return [200, 201, 202, 203, 204];
        case AppSection.Measure:
            return [300, 301, 302, 303];
        default:
            return [];
    }
  };

  const stepsToRender = getSectionSteps(currentSection);

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 shrink-0 z-20">
      
      {/* Scrollable Steps Area */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
            {currentSection === AppSection.Incorporate ? 'Formation Steps' : 
             currentSection === AppSection.Promote ? 'Growth Tools' : 
             currentSection === AppSection.Measure ? 'Impact Data' : 'Compliance'}
        </div>
        
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-2 bottom-4 w-px bg-slate-800 -z-10"></div>

            {stepsToRender.map((step) => {
                const isActive = step === currentStep;
                // For non-linear sections (Promote/Manage/Measure), just show as regular unless active
                // For Incorporate, we track progress.
                const isCompleted = currentSection === AppSection.Incorporate && step < currentStep;
                const info = STEPS_INFO[step];

                return (
                <div 
                    key={step} 
                    className="group flex gap-3 mb-6 relative last:mb-0 cursor-pointer"
                    onClick={() => onStepSelect && onStepSelect(step)}
                >
                    <div className="relative pt-1 shrink-0">
                        {isCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-green-500/50 flex items-center justify-center text-green-400 z-10">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        ) : isActive ? (
                            <div 
                                className="w-8 h-8 rounded-full bg-slate-900 border-2 flex items-center justify-center z-10"
                                style={{ borderColor: 'var(--theme-primary-bright)', color: 'var(--theme-primary-bright)', boxShadow: '0 0 15px var(--theme-primary-dim)' }}
                            >
                                <Circle className="w-3 h-3 fill-current" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-600 z-10 group-hover:border-slate-600 transition-colors">
                                <Circle className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    
                    <div className={`flex flex-col pt-0.5 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                        <span 
                            className={`text-sm font-medium ${isActive ? '' : 'text-slate-300'}`}
                            style={isActive ? { color: 'var(--theme-primary-bright)' } : {}} 
                        >
                            {info.title}
                        </span>
                        <span className="text-xs text-slate-500 leading-tight mt-0.5">
                            {info.description}
                        </span>
                    </div>
                </div>
                );
            })}
        </div>
      </div>

      {/* Footer: Organization Switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
         <OrgSwitcher currentOrg={activeOrg} onSwitch={onOrgChange} />
      </div>
    </div>
  );
};

export default ProgressBar;
