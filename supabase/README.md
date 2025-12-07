# NFP Compass Database Schema

This document describes the Supabase database schema for NFP Compass, designed to track nonprofit progress across all four sections: **Incorporate**, **Promote**, **Manage**, and **Measure**.

## Overview

The database eliminates repetitive questions by persisting all organization data, progress tracking, and conversation history. Gemma can now access previous answers and only ask new questions.

## Core Tables

### 1. Organizations
**Primary table** - One record per nonprofit organization

```typescript
{
  id: UUID
  name: string              // "Wear it Forward"
  mission_statement: string
  state_code: string        // "TX"
  ein: string              // Tax ID
  incorporation_date: date
  status: string           // active, inactive, dissolved
  plan: string            // free, pro, enterprise
  user_id: UUID           // Links to auth.users
}
```

## INCORPORATE Section Tables

### 2. incorporate_progress
**Tracks all 7 steps** in the incorporation process

```typescript
{
  org_id: UUID

  // Step 1: Mission & Name
  mission_completed: boolean
  name_search_completed: boolean
  name_available: boolean

  // Step 2: Board Formation
  board_formation_completed: boolean

  // Step 3: Incorporation (Form 202)
  form_202_filed: boolean
  form_202_confirmation: string
  supplemental_provisions: string  // IRS language

  // Step 4: EIN
  ein_obtained: boolean
  ein_confirmation: string

  // Step 5: Bylaws
  bylaws_completed: boolean
  bylaws_document_url: string

  // Step 6: Federal Tax Exemption (1023-EZ)
  form_1023_filed: boolean
  form_1023_approved: boolean
  determination_letter_url: string

  // Step 7: State Tax Exemption (AP-204)
  form_ap204_filed: boolean
  form_ap204_approved: boolean
}
```

### 3. board_members
**Tracks all directors and officers**

```typescript
{
  org_id: UUID
  name: string
  title: string  // President, Secretary, Treasurer, Director
  email: string
  phone: string
  linkedin_url: string
  photo_url: string       // From LinkedIn scraping
  headline: string
  appointed_date: date
  term_end_date: date
  is_active: boolean
}
```

## PROMOTE Section Tables

### 4. branding
**Stores all brand identity elements**

```typescript
{
  org_id: UUID

  // Color Palette
  palette_name: string
  primary_color: string    // hex
  secondary_color: string
  accent_color: string
  background_color: string
  palette_mood: string

  // Logo & Typography
  logo_url: string
  logo_style: string       // Modern Minimal, Classic Serif, etc.
  font_primary: string
  font_secondary: string

  // Generated Assets
  branded_letter_url: string
  business_card_url: string
  letterhead_url: string
}
```

### 5. campaigns
**Fundraising campaigns**

```typescript
{
  org_id: UUID
  name: string
  description: string
  goal_amount: decimal
  raised_amount: decimal
  source_document_url: string  // Uploaded PDF
  status: string               // draft, active, completed
  start_date: date
  end_date: date
}
```

### 6. campaign_quotes
**4 quotes extracted from PDFs** (one campaign = 4 quotes)

```typescript
{
  campaign_id: UUID
  quote_text: string
  quote_order: int          // 1, 2, 3, 4
  generated_image_url: string  // AI-generated social post
}
```

## MANAGE Section Tables

### 7. compliance_tracking
**Tracks ongoing compliance requirements**

```typescript
{
  org_id: UUID

  // Federal Filing (990-N) - Annual
  last_990n_filed_date: date
  next_990n_due_date: date

  // State Report (Form 802) - Every 4 years
  last_form802_filed_date: date
  next_form802_due_date: date

  // Board Meetings - Annual
  last_board_meeting_date: date
  last_board_meeting_minutes_url: string

  // Good Standing
  is_in_good_standing: boolean
  good_standing_last_checked: date
}
```

### 8. financial_transactions
**Bookkeeping - All income and expenses**

```typescript
{
  org_id: UUID
  transaction_date: date
  description: string
  amount: decimal
  type: string           // income, expense
  category: string       // donations, grants, program-expenses, etc.
  receipt_url: string
  notes: string
}
```

## MEASURE Section Tables

### 9. impact_metrics
**Program outcomes and impact tracking**

```typescript
{
  org_id: UUID
  metric_name: string     // "People Served", "Meals Distributed"
  metric_value: decimal
  metric_unit: string     // "people", "meals", "hours"
  period_start: date
  period_end: date
  notes: string
}
```

### 10. donors
**Donor database for analytics**

```typescript
{
  org_id: UUID
  name: string
  email: string
  phone: string
  first_donation_date: date
  last_donation_date: date
  total_donated: decimal
  donation_count: int
  is_recurring: boolean
  status: string          // active, lapsed, inactive
}
```

### 11. donations
**Individual donation transactions**

```typescript
{
  org_id: UUID
  donor_id: UUID
  campaign_id: UUID
  amount: decimal
  donation_date: date
  payment_method: string
  transaction_id: string
  receipt_sent: boolean
  receipt_url: string
}
```

## Conversation Persistence

### 12. conversation_messages
**Stores all chat history with Gemma**

```typescript
{
  org_id: UUID
  role: string           // 'user' | 'model'
  message_text: string
  section: string        // incorporate, promote, manage, measure
  step_number: int
  created_at: timestamp
}
```

## Security

All tables use **Row Level Security (RLS)**:
- Users can only access data for organizations they own
- `user_id` field in `organizations` table links to `auth.users`
- Helper function `user_owns_org(org_uuid)` validates ownership

## How Gemma Uses This Data

### Eliminating Repetitive Questions

**Before Database:**
```
User: Let's work on campaigns
Gemma: What's your organization name?
User: Wear it Forward
Gemma: What's your mission?
User: (repeats everything again)
```

**After Database:**
```sql
-- Gemma queries on load:
SELECT * FROM organizations WHERE user_id = auth.uid();
SELECT * FROM incorporate_progress WHERE org_id = :org_id;
SELECT * FROM branding WHERE org_id = :org_id;
SELECT * FROM board_members WHERE org_id = :org_id;

-- Gemma's context now includes:
- Org name: "Wear it Forward"
- Mission: "Providing quality clothing for the unhoused"
- Board: 3 members (President, Secretary, Treasurer)
- Brand colors: #FF6B6B (Soft Coral), #2D3436 (Slate Navy)
- EIN: Obtained ✓
- Form 202: Filed ✓
```

### Section-Specific Context

**INCORPORATE:**
```typescript
// Gemma checks what's already done:
if (incorporate_progress.mission_completed) {
  // Skip mission questions
}
if (incorporate_progress.board_formation_completed) {
  // Skip board questions
}
// Only ask about incomplete steps
```

**PROMOTE:**
```typescript
// Gemma loads existing brand:
const branding = await getBranding(org_id);
if (branding.primary_color) {
  // Use existing colors, don't ask again
}
```

**MANAGE:**
```typescript
// Gemma checks compliance status:
const compliance = await getCompliance(org_id);
if (isOverdue(compliance.next_990n_due_date)) {
  // Proactively remind about filing
}
```

**MEASURE:**
```typescript
// Gemma provides insights:
const metrics = await getImpactMetrics(org_id);
const donations = await getDonations(org_id);
// "You've served 150 people and raised $5,000 this quarter!"
```

## Setup Instructions

1. **Create Supabase Project** at https://supabase.com

2. **Run Schema**:
   ```bash
   # Copy the SQL from schema.sql
   # Paste into Supabase SQL Editor
   # Run all migrations
   ```

3. **Get Credentials**:
   ```bash
   # Add to .env.local:
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   ```

4. **Enable Authentication**:
   - Enable Email auth in Supabase Dashboard
   - Or use Magic Links / OAuth providers

## Data Flow

```
User Action → App State → Supabase Insert/Update → Database
                                                       ↓
                                                   RLS Check
                                                       ↓
                                                   Committed
                                                       ↓
Gemma Context ← Query on Load ←──────────────────── Database
```

## Benefits

✅ **No Repetitive Questions** - Gemma remembers everything
✅ **Progress Tracking** - Visual indicators for each step
✅ **Multi-Session** - Continue where you left off
✅ **Analytics** - Dashboard shows completion rates
✅ **Compliance Reminders** - Automatic due date tracking
✅ **Data Persistence** - Never lose progress
✅ **Secure** - Row-level security ensures data privacy

## Example Queries

```typescript
// Get organization with all progress
const { data: org } = await supabase
  .from('organizations')
  .select(`
    *,
    incorporate_progress(*),
    branding(*),
    board_members(*),
    compliance_tracking(*)
  `)
  .eq('id', orgId)
  .single();

// Save branding after user selects palette
await supabase
  .from('branding')
  .upsert({
    org_id: orgId,
    primary_color: '#FF6B6B',
    palette_name: 'Dignity & Warmth'
  });

// Track campaign quote generation
await supabase
  .from('campaign_quotes')
  .insert([
    { campaign_id, quote_text: 'Quote 1', quote_order: 1, generated_image_url },
    { campaign_id, quote_text: 'Quote 2', quote_order: 2, generated_image_url },
    { campaign_id, quote_text: 'Quote 3', quote_order: 3, generated_image_url },
    { campaign_id, quote_text: 'Quote 4', quote_order: 4, generated_image_url }
  ]);
```
