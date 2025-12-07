export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          mission_statement: string | null
          state_code: string
          ein: string | null
          incorporation_date: string | null
          status: string
          plan: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          mission_statement?: string | null
          state_code?: string
          ein?: string | null
          incorporation_date?: string | null
          status?: string
          plan?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          mission_statement?: string | null
          state_code?: string
          ein?: string | null
          incorporation_date?: string | null
          status?: string
          plan?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      incorporate_progress: {
        Row: {
          id: string
          org_id: string
          mission_completed: boolean
          name_search_completed: boolean
          name_available: boolean | null
          board_formation_completed: boolean
          form_202_filed: boolean
          form_202_confirmation: string | null
          supplemental_provisions: string | null
          ein_obtained: boolean
          ein_confirmation: string | null
          bylaws_completed: boolean
          bylaws_document_url: string | null
          form_1023_filed: boolean
          form_1023_approved: boolean
          determination_letter_url: string | null
          form_ap204_filed: boolean
          form_ap204_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          mission_completed?: boolean
          name_search_completed?: boolean
          name_available?: boolean | null
          board_formation_completed?: boolean
          form_202_filed?: boolean
          form_202_confirmation?: string | null
          supplemental_provisions?: string | null
          ein_obtained?: boolean
          ein_confirmation?: string | null
          bylaws_completed?: boolean
          bylaws_document_url?: string | null
          form_1023_filed?: boolean
          form_1023_approved?: boolean
          determination_letter_url?: string | null
          form_ap204_filed?: boolean
          form_ap204_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          mission_completed?: boolean
          name_search_completed?: boolean
          name_available?: boolean | null
          board_formation_completed?: boolean
          form_202_filed?: boolean
          form_202_confirmation?: string | null
          supplemental_provisions?: string | null
          ein_obtained?: boolean
          ein_confirmation?: string | null
          bylaws_completed?: boolean
          bylaws_document_url?: string | null
          form_1023_filed?: boolean
          form_1023_approved?: boolean
          determination_letter_url?: string | null
          form_ap204_filed?: boolean
          form_ap204_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      board_members: {
        Row: {
          id: string
          org_id: string
          name: string
          title: string
          email: string | null
          phone: string | null
          linkedin_url: string | null
          photo_url: string | null
          headline: string | null
          appointed_date: string
          term_end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          title: string
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          photo_url?: string | null
          headline?: string | null
          appointed_date?: string
          term_end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          title?: string
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          photo_url?: string | null
          headline?: string | null
          appointed_date?: string
          term_end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      branding: {
        Row: {
          id: string
          org_id: string
          palette_name: string | null
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
          background_color: string | null
          palette_mood: string | null
          logo_url: string | null
          logo_style: string | null
          font_primary: string | null
          font_secondary: string | null
          branded_letter_url: string | null
          business_card_url: string | null
          letterhead_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          palette_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          background_color?: string | null
          palette_mood?: string | null
          logo_url?: string | null
          logo_style?: string | null
          font_primary?: string | null
          font_secondary?: string | null
          branded_letter_url?: string | null
          business_card_url?: string | null
          letterhead_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          palette_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          background_color?: string | null
          palette_mood?: string | null
          logo_url?: string | null
          logo_style?: string | null
          font_primary?: string | null
          font_secondary?: string | null
          branded_letter_url?: string | null
          business_card_url?: string | null
          letterhead_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          goal_amount: number | null
          raised_amount: number
          source_document_url: string | null
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          goal_amount?: number | null
          raised_amount?: number
          source_document_url?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          goal_amount?: number | null
          raised_amount?: number
          source_document_url?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_quotes: {
        Row: {
          id: string
          campaign_id: string
          quote_text: string
          quote_order: number | null
          generated_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          quote_text: string
          quote_order?: number | null
          generated_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          quote_text?: string
          quote_order?: number | null
          generated_image_url?: string | null
          created_at?: string
        }
      }
      compliance_tracking: {
        Row: {
          id: string
          org_id: string
          last_990n_filed_date: string | null
          next_990n_due_date: string | null
          last_form802_filed_date: string | null
          next_form802_due_date: string | null
          last_board_meeting_date: string | null
          last_board_meeting_minutes_url: string | null
          is_in_good_standing: boolean
          good_standing_last_checked: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          last_990n_filed_date?: string | null
          next_990n_due_date?: string | null
          last_form802_filed_date?: string | null
          next_form802_due_date?: string | null
          last_board_meeting_date?: string | null
          last_board_meeting_minutes_url?: string | null
          is_in_good_standing?: boolean
          good_standing_last_checked?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          last_990n_filed_date?: string | null
          next_990n_due_date?: string | null
          last_form802_filed_date?: string | null
          next_form802_due_date?: string | null
          last_board_meeting_date?: string | null
          last_board_meeting_minutes_url?: string | null
          is_in_good_standing?: boolean
          good_standing_last_checked?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      financial_transactions: {
        Row: {
          id: string
          org_id: string
          transaction_date: string
          description: string
          amount: number
          type: string
          category: string | null
          receipt_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          transaction_date: string
          description: string
          amount: number
          type: string
          category?: string | null
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          transaction_date?: string
          description?: string
          amount?: number
          type?: string
          category?: string | null
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      impact_metrics: {
        Row: {
          id: string
          org_id: string
          metric_name: string
          metric_value: number
          metric_unit: string | null
          period_start: string | null
          period_end: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          metric_name: string
          metric_value: number
          metric_unit?: string | null
          period_start?: string | null
          period_end?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          metric_name?: string
          metric_value?: number
          metric_unit?: string | null
          period_start?: string | null
          period_end?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      donors: {
        Row: {
          id: string
          org_id: string
          name: string
          email: string | null
          phone: string | null
          first_donation_date: string | null
          last_donation_date: string | null
          total_donated: number
          donation_count: number
          is_recurring: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          email?: string | null
          phone?: string | null
          first_donation_date?: string | null
          last_donation_date?: string | null
          total_donated?: number
          donation_count?: number
          is_recurring?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          first_donation_date?: string | null
          last_donation_date?: string | null
          total_donated?: number
          donation_count?: number
          is_recurring?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          org_id: string
          donor_id: string | null
          campaign_id: string | null
          amount: number
          donation_date: string
          payment_method: string | null
          transaction_id: string | null
          receipt_sent: boolean
          receipt_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          donor_id?: string | null
          campaign_id?: string | null
          amount: number
          donation_date: string
          payment_method?: string | null
          transaction_id?: string | null
          receipt_sent?: boolean
          receipt_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          donor_id?: string | null
          campaign_id?: string | null
          amount?: number
          donation_date?: string
          payment_method?: string | null
          transaction_id?: string | null
          receipt_sent?: boolean
          receipt_url?: string | null
          created_at?: string
        }
      }
      conversation_messages: {
        Row: {
          id: string
          org_id: string
          role: string
          message_text: string
          section: string | null
          step_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          role: string
          message_text: string
          section?: string | null
          step_number?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          role?: string
          message_text?: string
          section?: string | null
          step_number?: number | null
          created_at?: string
        }
      }
    }
  }
}
