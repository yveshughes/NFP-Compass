export enum AppSection {
  Incorporate = 'Incorporate',
  Promote = 'Promote',
  Manage = 'Manage'
}

export enum Step {
  // --- INCORPORATE (0-9) ---
  Onboarding = 0,
  MissionName = 1,
  BoardFormation = 2,
  Incorporation = 3,
  EIN = 4,
  Bylaws = 5,
  FederalTaxExemption = 6,
  StateTaxExemption = 7,
  // Legacy aliases to keep types safe, though UI might hide them
  Branding = 8, 
  Maintenance = 9,

  // --- PROMOTE (100-199) ---
  BrandIdentity = 100,
  OnlinePresence = 101,
  AcceptDonations = 102,
  Fundraising = 103,
  GrantSearch = 104,

  // --- MANAGE (200-299) ---
  FederalFiling = 200, // 990-N
  StateReport = 201,   // Form 802
  BoardMeetings = 202,
  Bookkeeping = 203,
  ComplianceCheck = 204
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface BrandingData {
  colors: string[];
  mood: string;
}

export interface AppState {
  currentSection: AppSection;
  currentStep: Step;
  messages: Message[];
  isLoading: boolean;
  browserUrl: string | null;
  brandingData: BrandingData | null;
  supplementalProvisionText: string | null;
}