-- NFP Compass Database Schema
-- Tracks all progress across Incorporate, Promote, Manage, and Measure sections

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mission_statement TEXT,
  state_code TEXT DEFAULT 'TX',
  ein TEXT, -- Employer Identification Number
  incorporation_date DATE,
  status TEXT DEFAULT 'active', -- active, inactive, dissolved
  plan TEXT DEFAULT 'free', -- free, pro, enterprise

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL -- Link to auth.users
);

-- ============================================================================
-- INCORPORATE SECTION - Progress Tracking
-- ============================================================================
CREATE TABLE incorporate_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Step 1: Mission & Name
  mission_completed BOOLEAN DEFAULT FALSE,
  name_search_completed BOOLEAN DEFAULT FALSE,
  name_available BOOLEAN,

  -- Step 2: Board Formation
  board_formation_completed BOOLEAN DEFAULT FALSE,

  -- Step 3: Incorporation (Form 202)
  form_202_filed BOOLEAN DEFAULT FALSE,
  form_202_confirmation TEXT,
  supplemental_provisions TEXT, -- The IRS language for 501(c)(3)

  -- Step 4: EIN
  ein_obtained BOOLEAN DEFAULT FALSE,
  ein_confirmation TEXT,

  -- Step 5: Bylaws
  bylaws_completed BOOLEAN DEFAULT FALSE,
  bylaws_document_url TEXT,

  -- Step 6: Federal Tax Exemption (1023-EZ)
  form_1023_filed BOOLEAN DEFAULT FALSE,
  form_1023_approved BOOLEAN DEFAULT FALSE,
  determination_letter_url TEXT,

  -- Step 7: State Tax Exemption (AP-204)
  form_ap204_filed BOOLEAN DEFAULT FALSE,
  form_ap204_approved BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id)
);

-- ============================================================================
-- BOARD MEMBERS
-- ============================================================================
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  title TEXT NOT NULL CHECK (title IN ('President', 'Secretary', 'Treasurer', 'Director')),
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  photo_url TEXT,
  headline TEXT,

  -- Metadata
  appointed_date DATE DEFAULT CURRENT_DATE,
  term_end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_board_members_org ON board_members(org_id);

-- ============================================================================
-- PROMOTE SECTION - Branding & Campaigns
-- ============================================================================
CREATE TABLE branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Color Palette
  palette_name TEXT,
  primary_color TEXT, -- hex
  secondary_color TEXT, -- hex
  accent_color TEXT, -- hex
  background_color TEXT, -- hex
  palette_mood TEXT,

  -- Logo & Typography
  logo_url TEXT,
  logo_style TEXT, -- Modern Minimal, Classic Serif, Friendly Round, Tech Mono
  font_primary TEXT,
  font_secondary TEXT,

  -- Generated Assets
  branded_letter_url TEXT, -- The person receiving letter image
  business_card_url TEXT,
  letterhead_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id)
);

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10, 2),
  raised_amount DECIMAL(10, 2) DEFAULT 0,

  -- Campaign Assets
  source_document_url TEXT, -- Uploaded PDF

  -- Status
  status TEXT DEFAULT 'draft', -- draft, active, completed, archived
  start_date DATE,
  end_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org ON campaigns(org_id);

-- ============================================================================
-- CAMPAIGN QUOTES (Extracted from PDFs)
-- ============================================================================
CREATE TABLE campaign_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  quote_text TEXT NOT NULL,
  quote_order INTEGER, -- 1, 2, 3, 4

  -- Generated Social Post
  generated_image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_quotes_campaign ON campaign_quotes(campaign_id);

-- ============================================================================
-- MANAGE SECTION - Compliance & Operations
-- ============================================================================
CREATE TABLE compliance_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Federal Filing (990-N) - Annual
  last_990n_filed_date DATE,
  next_990n_due_date DATE,

  -- State Report (Form 802) - Every 4 years
  last_form802_filed_date DATE,
  next_form802_due_date DATE,

  -- Board Meetings - Annual requirement
  last_board_meeting_date DATE,
  last_board_meeting_minutes_url TEXT,

  -- Good Standing Status
  is_in_good_standing BOOLEAN DEFAULT TRUE,
  good_standing_last_checked DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id)
);

-- ============================================================================
-- FINANCIAL RECORDS (Bookkeeping)
-- ============================================================================
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT, -- donations, grants, program-expenses, admin-expenses, etc.

  -- Receipt/Documentation
  receipt_url TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_org_date ON financial_transactions(org_id, transaction_date DESC);

-- ============================================================================
-- MEASURE SECTION - Impact & Analytics
-- ============================================================================
CREATE TABLE impact_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  metric_name TEXT NOT NULL, -- e.g., "People Served", "Meals Distributed"
  metric_value DECIMAL(10, 2) NOT NULL,
  metric_unit TEXT, -- e.g., "people", "meals", "hours"

  period_start DATE,
  period_end DATE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impact_metrics_org ON impact_metrics(org_id, period_start DESC);

-- ============================================================================
-- DONOR ANALYTICS
-- ============================================================================
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Donation Stats
  first_donation_date DATE,
  last_donation_date DATE,
  total_donated DECIMAL(10, 2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,

  -- Engagement
  is_recurring BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active', -- active, lapsed, inactive

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donors_org ON donors(org_id);

-- ============================================================================
-- DONATIONS
-- ============================================================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  amount DECIMAL(10, 2) NOT NULL,
  donation_date DATE NOT NULL,

  -- Payment Info
  payment_method TEXT, -- card, bank, check, cash
  transaction_id TEXT,

  -- Tax Receipt
  receipt_sent BOOLEAN DEFAULT FALSE,
  receipt_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_org_date ON donations(org_id, donation_date DESC);
CREATE INDEX idx_donations_donor ON donations(donor_id);

-- ============================================================================
-- CONVERSATION HISTORY (Gemini Chat)
-- ============================================================================
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  message_text TEXT NOT NULL,

  -- Context
  section TEXT, -- incorporate, promote, manage, measure
  step_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_org_time ON conversation_messages(org_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE incorporate_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only access their own organizations
CREATE POLICY "Users can view their own organizations"
  ON organizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Helper function to check org ownership
CREATE OR REPLACE FUNCTION user_owns_org(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Apply similar policies to all related tables
CREATE POLICY "Users can view their own data" ON incorporate_progress
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON incorporate_progress
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON board_members
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON board_members
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON branding
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON branding
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON campaigns
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON campaigns
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON compliance_tracking
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON compliance_tracking
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON financial_transactions
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON financial_transactions
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON impact_metrics
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON impact_metrics
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON donors
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON donors
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON donations
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON donations
  FOR ALL USING (user_owns_org(org_id));

CREATE POLICY "Users can view their own data" ON conversation_messages
  FOR SELECT USING (user_owns_org(org_id));

CREATE POLICY "Users can modify their own data" ON conversation_messages
  FOR ALL USING (user_owns_org(org_id));

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incorporate_progress_updated_at BEFORE UPDATE ON incorporate_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_members_updated_at BEFORE UPDATE ON board_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_updated_at BEFORE UPDATE ON branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_tracking_updated_at BEFORE UPDATE ON compliance_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
