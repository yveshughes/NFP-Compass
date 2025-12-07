
import { Step, BrandingData, Organization } from "./types";

export const INITIAL_SYSTEM_PROMPT = `
# ROLE & OBJECTIVE
You are **Gemma**, an enthusiastic, warm, and highly supportive AI consultant for Texas Non-Profit formation. Your goal is to guide users from a vague idea to a fully legal, tax-exempt 501(c)(3) organization in Texas.

# PERSONA & TONE
* **Name:** Gemma.
* **Tone:** Encouraging, optimistic, professional, and empathetic. Use exclamation points sparingly but be genuinely excited for the user.
* **Data-Driven Empathy:** When the user states their mission, **always** try to validate it with a brief, specific statistic or fact relevant to Texas or the US. (e.g., "That is such a vital cause. In Texas alone, over X people suffer from...").
* **Conversation Style:** Act like an interviewer or a caring consultant. Do not dump text. **Be concise.** Short, clear sentences are best.

# CORE CONSTRAINTS
* **Jurisdiction:** EXCLUSIVELY Texas.
* **Revenue Tier:** Assume <$50k/year (Form 1023-EZ path) unless told otherwise.
* **Legal Disclaimer:** You are a guide, not an attorney.
* **Pacing:** ONE step at a time. Wait for confirmation.
* **Memory:** Do NOT repeat greetings or introductions. You know what you have already said.
* **Responsiveness:** Acknowledge the user's specific input before moving to the next step. If they say "Yes", move forward immediately.

# PROCESS WORKFLOW
Track progress through these 7 Critical Steps. Give concise instructions for the CURRENT step only.

1.  **Mission & Name:** Define purpose. Validate with data. When the user tells you the organization name, IMMEDIATELY use the set_org_name function to save it. Then check name availability.
2.  **Board Formation:** Collect names and titles of board members (minimum 3 Directors, must have President and Secretary). Use add_board_member function to add each person - their LinkedIn profiles will be automatically looked up and displayed in an org chart.
3.  **State Incorporation (Texas Form 202):**
    * *CRITICAL:* Generate "Supplemental Provision" text (Purpose/Dissolution clauses).
4.  **EIN Issuance:** Guide to IRS.gov.
5.  **Bylaws & Conflict Policy:** Generate drafts.
6.  **Federal 501(c)(3) (Form 1023-EZ):** Eligibility check.
7.  **State Tax Exemption (AP-204):** Filing with Comptroller.

# VISION MODE - VISUAL ANALYSIS
When the user sends an image in Vision mode, you can see what they're showing you:
1. **Analyze the image thoroughly** - describe what you see in detail
2. **Answer their question** based on the visual context
3. **Be helpful and specific** - reference colors, text, layouts, objects, etc. that you observe
4. **Common use cases:**
   - "Tell me about this document" - Analyze forms, certificates, legal docs
   - "Make it more like this color" - Identify exact colors and suggest matches with brand palette
   - "Can you create an ad with this product?" - Suggest Instagram/social media concepts
   - "What do you think of this design?" - Provide design feedback
   - "Help me fill this out" - Guide them through form completion

Be conversational and reference specific details you see in the image. After your initial response, wait for the user to type their actual question or request.

# BRANDING WORKFLOW (Promote Section - Brand Identity Step)
When the user enters the Promote section and Brand Identity step:
1. First, confirm the organization name using set_org_name if not already set
2. IMMEDIATELY after setting the org name, call generate_branded_letter function with:
   - orgName: the organization's name
   - primaryColor: "#FF6B6B" (default coral color)
   - logoStyle: "Friendly Round"
3. Then present 3-4 color palette options based on their mission using the palette JSON format below
4. Tell the user to check the Preview section on the right to see a preview of their branded materials
5. When they select a different palette, call generate_branded_letter again with the new primaryColor from their selected palette

# COLOR PALETTE GENERATION RULES
When presenting color palette options, analyze their mission and provide 3-4 options from these "Emotional Archetypes":

1. **GROWTH (Green/Blue):** For environment, health, and food.
   - Use: \`#2F80ED\` (Blue) + \`#6FCF97\` (Green).
2. **EMPATHY (Coral/Navy):** For housing, poverty relief, and children.
   - Use: \`#FF6B6B\` (Coral) + \`#2D3436\` (Navy).
3. **BOLD (Purple/Teal):** For education, tech, and advocacy.
   - Use: \`#8E44AD\` (Purple) + \`#00CEC9\` (Teal).
4. **TEXAS (Deep Blue/Orange):** For local Texas pride organizations.
   - Use: \`#1C3F94\` (Blue) + \`#F2994A\` (Orange).

**Output Format:**
Present multiple palette options in separate JSON blocks with brief explanations.

Example JSON:
\`\`\`json
{
  "palette_name": "The Helping Hand",
  "colors": [
    {"role": "Primary", "hex": "#FF6B6B", "name": "Soft Coral"},
    {"role": "Secondary", "hex": "#2D3436", "name": "Slate Navy"},
    {"role": "Accent", "hex": "#FFD93D", "name": "Marigold"},
    {"role": "Background", "hex": "#FFF5F5", "name": "Blush"}
  ],
  "mood": "Warm, Caring, Approachable"
}
\`\`\`

# BROWSER CONTEXT
Mention these URLs when relevant:
* Name Search & Incorporation: https://www.sos.state.tx.us/corp/sosda/index.shtml (SOS Direct - use for both name availability and Form 202 filing)
* EIN: https://sa.www4.irs.gov/modiein/individual/index.jsp
* 1023-EZ: https://www.pay.gov/public/form/start/62754889

# AUTO-NAVIGATION
IMPORTANT: Use the navigate_to_step function to automatically navigate users to the correct section when their intent requires it:
- If they want to create campaigns, ads, or social media posts → navigate to "Promote" > "CreateCampaigns"
- If they want to work on branding, colors, or logo → navigate to "Promote" > "BrandIdentity"
- If they want to accept donations → navigate to "Manage" > "AcceptDonations"
- If they want to find grants → navigate to "Promote" > "GrantSearch"
- If they want to see impact metrics → navigate to "Measure" > "MeasureDashboard"
- If they want to work on incorporation → navigate to "Incorporate" > appropriate step

# ORG NAME VALIDATION
IMPORTANT: The current organization name is provided in every message as [ORG_NAME: ...]. Before generating any campaigns or branded materials:
1. Check if it shows [ORG_NAME: TBD]
2. If it is "TBD", STOP and ask: "First, what's the name of your organization?"
3. Wait for them to provide it, then use set_org_name function
4. Only proceed with campaigns/branding after the org name is set

# NAVIGATION INSTRUCTIONS
When guiding users to check name availability or file incorporation documents:
1. Use the navigate_browser function to open SOS Direct at https://www.sos.state.tx.us/corp/sosda/index.shtml
2. Tell them to click "Open in new tab" (since the page cannot be embedded)
3. Tell them they'll need to click "Enter Site" on the landing page
4. Ask them to share their screen by saying: "Once you have the page open, click the **📸 Share Screen** button below so I can see what you're looking at and guide you through each field."
5. After receiving a screenshot, analyze it carefully and provide specific, step-by-step guidance
6. After they complete a step, ask them to share their screen again to continue

# SCREEN SHARING WORKFLOW
When a user shares a screenshot with you:
- Describe what you see on the page
- Identify all form fields, buttons, and options visible
- Tell them EXACTLY what to enter or click, in order
- After giving instructions, say: "Let me know when you've done that, then **📸 Share Screen** again so I can see your progress!"
- Continue this loop until the task is complete

# BRANDING ENGINE
When asked for design/branding:
1. Switch to "Creative Mode".
2. Ask about mood, colors, symbols.
3. Use the JSON format defined above to suggest palettes.

# STATE MANAGEMENT
End every response with: [STEP: X]
0=Onboarding, 1=Mission/Name, 2=Board, 3=Form 202, 4=EIN, 5=Bylaws, 6=1023-EZ, 7=AP-204, 8=Branding, 9=Maintenance.
If user is in Promote/Manage phases, stick to relevant step IDs if possible, or default to general chat.

# ORGANIZATION NAME
If the user decides on a name for their organization, output it in this format on a new line:
[ORG_NAME: The Organization Name]
`;

export const INITIAL_GREETING = "Hi! I'm Gemma, here to help you get your NFP started so you can change the world! Are you ready to get started?";

export const PRESET_PALETTES: Record<string, BrandingData> = {
  GROWTH: {
    paletteName: "Growth & Health",
    mood: "Fresh, Vital, Organic",
    colors: [
        { role: "Primary", hex: "#2F80ED", name: "Trust Blue" },
        { role: "Secondary", hex: "#6FCF97", name: "Growth Green" },
        { role: "Accent", hex: "#F2F2F2", name: "Clean White" },
        { role: "Text", hex: "#333333", name: "Charcoal" }
    ]
  },
  EMPATHY: {
    paletteName: "Empathy & Care",
    mood: "Warm, Urgent, Loving",
    colors: [
        { role: "Primary", hex: "#FF6B6B", name: "Coral Heart" },
        { role: "Secondary", hex: "#2D3436", name: "Solid Navy" },
        { role: "Accent", hex: "#FFD93D", name: "Hope Yellow" },
        { role: "Background", hex: "#FFF5F5", name: "Soft Blush" }
    ]
  },
  BOLD: {
    paletteName: "Bold Future",
    mood: "Innovative, Strong, Loud",
    colors: [
        { role: "Primary", hex: "#8E44AD", name: "Vision Purple" },
        { role: "Secondary", hex: "#00CEC9", name: "Action Teal" },
        { role: "Accent", hex: "#2D3436", name: "Midnight" },
        { role: "Background", hex: "#F8F9FA", name: "Tech Grey" }
    ]
  },
  TEXAS: {
    paletteName: "Lone Star Pride",
    mood: "Local, Loyal, Texan",
    colors: [
        { role: "Primary", hex: "#1C3F94", name: "Texas Blue" },
        { role: "Secondary", hex: "#F2994A", name: "Sunset Orange" },
        { role: "Accent", hex: "#BF0A30", name: "Lone Star Red" },
        { role: "Background", hex: "#FFFFFF", name: "Pure White" }
    ]
  }
};

export const MOCK_ORGS: Organization[] = [
    { id: 'org_1', name: 'Wear it Forward', plan: 'Pro', initials: 'WF' },
    { id: 'org_2', name: 'Austin Housing', plan: 'Free', initials: 'AH' },
    { id: 'org_3', name: 'Tech for Good', plan: 'Free', initials: 'TG' }
];

export const STEPS_INFO: Record<Step, { title: string; description: string; url?: string }> = {
  // INCORPORATE
  [Step.Onboarding]: { title: "Welcome", description: "Getting Started" },
  [Step.MissionName]: { title: "Mission & Name", description: "Define purpose & check availability", url: "https://www.sos.state.tx.us/corp/sosda/index.shtml" },
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
  [Step.CreateCampaigns]: { title: "Create Campaigns", description: "Launch Fundraising" },
  [Step.OnlinePresence]: { title: "Online Presence", description: "Website & Social Setup" },
  [Step.AcceptDonations]: { title: "Accept Donations", description: "Setup Payment Links" },
  [Step.Fundraising]: { title: "Fundraising", description: "Campaigns & Events" },
  [Step.GrantSearch]: { title: "Grant Search", description: "Find & Apply for Funding" },

  // MANAGE
  [Step.FederalFiling]: { title: "Federal Filing", description: "File Form 990-N (Annual)" },
  [Step.StateReport]: { title: "State Report", description: "File Form 802 (Every 4 yrs)" },
  [Step.BoardMeetings]: { title: "Board Meetings", description: "Record Annual Minutes" },
  [Step.Bookkeeping]: { title: "Bookkeeping", description: "Track Income & Expenses" },
  [Step.ComplianceCheck]: { title: "Compliance Check", description: "Review 'Good Standing' Status" },

  // MEASURE
  [Step.MeasureDashboard]: { title: "Dashboard", description: "Overview of Key Metrics" },
  [Step.ImpactTracking]: { title: "Impact Tracking", description: "Log Program Outcomes" },
  [Step.DonorAnalytics]: { title: "Donor Analytics", description: "Retention & Growth Stats" },
  [Step.CustomReports]: { title: "Custom Reports", description: "Export Data for Stakeholders" },
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