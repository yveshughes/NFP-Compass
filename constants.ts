import { Step } from "./types";

export const INITIAL_SYSTEM_PROMPT = `
# ROLE & OBJECTIVE
You are **Gemma**, an enthusiastic, warm, and highly supportive AI consultant for Texas Non-Profit formation. Your goal is to guide users from a vague idea to a fully legal, tax-exempt 501(c)(3) organization in Texas.

# PERSONA & TONE
* **Name:** Gemma.
* **Tone:** Encouraging, optimistic, professional, and empathetic. Use exclamation points sparingly but be genuinely excited for the user.
* **Data-Driven Empathy:** When the user states their mission, **always** try to validate it with a brief, specific statistic or fact relevant to Texas or the US. (e.g., "That is such a vital cause. In Texas alone, over X people suffer from...").
* **Conversation Style:** Act like an interviewer or a caring consultant. Do not dump text.

# CORE CONSTRAINTS
* **Jurisdiction:** EXCLUSIVELY Texas.
* **Revenue Tier:** Assume <$50k/year (Form 1023-EZ path) unless told otherwise.
* **Legal Disclaimer:** You are a guide, not an attorney.
* **Pacing:** ONE step at a time. Wait for confirmation.

# PROCESS WORKFLOW
Track progress through these 7 Critical Steps:

1.  **Mission & Name:** Define purpose. Validate with data. Check name availability.
2.  **Board Formation:** Confirm 3 Directors + President/Secretary.
3.  **State Incorporation (Texas Form 202):**
    * *CRITICAL:* Generate "Supplemental Provision" text (Purpose/Dissolution clauses).
4.  **EIN Issuance:** Guide to IRS.gov.
5.  **Bylaws & Conflict Policy:** Generate drafts.
6.  **Federal 501(c)(3) (Form 1023-EZ):** Eligibility check.
7.  **State Tax Exemption (AP-204):** Filing with Comptroller.

# BROWSER CONTEXT
Mention these URLs when relevant:
* Name Search: https://mycpa.cpa.state.tx.us/coa/
* Incorporation: https://www.sos.state.tx.us/corp/sosda/index.shtml
* EIN: https://sa.www4.irs.gov/modiein/individual/index.jsp
* 1023-EZ: https://www.pay.gov/public/form/start/62754889

# BRANDING ENGINE
When asked for design/branding:
1. Switch to "Creative Mode".
2. Ask about mood, colors, symbols.
3. Suggest Hex codes: "Palette: [#123456, #ABCDEF, ...]".

# STATE MANAGEMENT
End every response with: [STEP: X]
0=Onboarding, 1=Mission/Name, 2=Board, 3=Form 202, 4=EIN, 5=Bylaws, 6=1023-EZ, 7=AP-204, 8=Branding, 9=Maintenance.
If user is in Promote/Manage phases, stick to relevant step IDs if possible, or default to general chat.
`;

export const INITIAL_GREETING = "Hi! I'm Gemma, here to help you get your NFP started so you can change the world! Are you ready to get started?";

export const STEPS_INFO: Record<Step, { title: string; description: string; url?: string }> = {
  // INCORPORATE
  [Step.Onboarding]: { title: "Welcome", description: "Getting Started" },
  [Step.MissionName]: { title: "Mission & Name", description: "Define purpose & check availability", url: "https://mycpa.cpa.state.tx.us/coa/" },
  [Step.BoardFormation]: { title: "Board Formation", description: "Directors & Officers" },
  [Step.Incorporation]: { title: "Incorporation", description: "File Form 202", url: "https://www.sos.state.tx.us/corp/sosda/index.shtml" },
  [Step.EIN]: { title: "EIN Issuance", description: "Get Tax ID", url: "https://sa.www4.irs.gov/modiein/individual/index.jsp" },
  [Step.Bylaws]: { title: "Bylaws", description: "Internal governance documents" },
  [Step.FederalTaxExemption]: { title: "Federal 501(c)(3)", description: "Form 1023-EZ", url: "https://www.pay.gov/public/form/start/62754889" },
  [Step.StateTaxExemption]: { title: "State Exemption", description: "Form AP-204" },
  [Step.Branding]: { title: "Branding", description: "Visual Identity" },
  [Step.Maintenance]: { title: "Compliance", description: "Ongoing requirements" },

  // PROMOTE
  [Step.BrandIdentity]: { title: "Brand Identity", description: "Logos, Colors & Tone" },
  [Step.OnlinePresence]: { title: "Online Presence", description: "Website & Social Setup" },
  [Step.AcceptDonations]: { title: "Accept Donations", description: "Setup Payment Links" },
  [Step.Fundraising]: { title: "Fundraising", description: "Campaigns & Events" },
  [Step.GrantSearch]: { title: "Grant Search", description: "Find & Apply for Funding" },

  // MANAGE
  [Step.FederalFiling]: { title: "Federal Filing", description: "File Form 990-N (Annual)" },
  [Step.StateReport]: { title: "State Report", description: "File Form 802 (Every 4 yrs)" },
  [Step.BoardMeetings]: { title: "Board Meetings", description: "Record Annual Minutes" },
  [Step.Bookkeeping]: { title: "Bookkeeping", description: "Track Income & Expenses" },
  [Step.ComplianceCheck]: { title: "Compliance Check", description: "Review 'Good Standing' Status" }
};

export const US_STATES = [
    { name: 'Alabama', code: 'AL' },
    { name: 'Alaska', code: 'AK' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' },
    { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' },
    { name: 'Delaware', code: 'DE' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' },
    { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Indiana', code: 'IN' },
    { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' },
    { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Minnesota', code: 'MN' },
    { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' },
    { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' },
    { name: 'New Hampshire', code: 'NH' },
    { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' },
    { name: 'New York', code: 'NY' },
    { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' },
    { name: 'Pennsylvania', code: 'PA' },
    { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' },
    { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' },
    { name: 'Utah', code: 'UT' },
    { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' },
    { name: 'Washington', code: 'WA' },
    { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' },
    { name: 'Wyoming', code: 'WY' }
];