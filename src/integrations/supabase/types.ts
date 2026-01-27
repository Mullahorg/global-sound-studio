export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beat_purchases: {
        Row: {
          beat_id: string
          buyer_id: string
          id: string
          license_type: Database["public"]["Enums"]["license_type"]
          price_paid: number
          purchased_at: string
        }
        Insert: {
          beat_id: string
          buyer_id: string
          id?: string
          license_type: Database["public"]["Enums"]["license_type"]
          price_paid: number
          purchased_at?: string
        }
        Update: {
          beat_id?: string
          buyer_id?: string
          id?: string
          license_type?: Database["public"]["Enums"]["license_type"]
          price_paid?: number
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beat_purchases_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      beats: {
        Row: {
          audio_url: string
          bpm: number
          cover_url: string | null
          created_at: string
          description: string | null
          genre: Database["public"]["Enums"]["beat_genre"]
          id: string
          is_sample: boolean | null
          is_sold_exclusive: boolean | null
          key: string | null
          mood: Database["public"]["Enums"]["beat_mood"]
          play_count: number | null
          price_basic: number
          price_exclusive: number
          price_premium: number
          producer_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          bpm: number
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre: Database["public"]["Enums"]["beat_genre"]
          id?: string
          is_sample?: boolean | null
          is_sold_exclusive?: boolean | null
          key?: string | null
          mood: Database["public"]["Enums"]["beat_mood"]
          play_count?: number | null
          price_basic?: number
          price_exclusive?: number
          price_premium?: number
          producer_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          bpm?: number
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: Database["public"]["Enums"]["beat_genre"]
          id?: string
          is_sample?: boolean | null
          is_sold_exclusive?: boolean | null
          key?: string | null
          mood?: Database["public"]["Enums"]["beat_mood"]
          play_count?: number | null
          price_basic?: number
          price_exclusive?: number
          price_premium?: number
          producer_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string
          duration_hours: number
          id: string
          notes: string | null
          producer_id: string | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_hours?: number
          id?: string
          notes?: string | null
          producer_id?: string | null
          session_date: string
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_hours?: number
          id?: string
          notes?: string | null
          producer_id?: string | null
          session_date?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          beat_id: string | null
          created_at: string
          currency: string
          gross_amount: number
          id: string
          net_amount: number
          order_id: string | null
          payout_id: string | null
          platform_fee: number
          producer_id: string
          status: string
        }
        Insert: {
          beat_id?: string | null
          created_at?: string
          currency?: string
          gross_amount: number
          id?: string
          net_amount: number
          order_id?: string | null
          payout_id?: string | null
          platform_fee?: number
          producer_id: string
          status?: string
        }
        Update: {
          beat_id?: string | null
          created_at?: string
          currency?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          payout_id?: string | null
          platform_fee?: number
          producer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          beat_id: string
          commercial_use: boolean | null
          created_at: string
          distribution_copies: number | null
          features: Json | null
          file_types: string[] | null
          id: string
          license_type: string
          price: number
          stems_included: boolean | null
          streaming_limit: number | null
          updated_at: string
        }
        Insert: {
          beat_id: string
          commercial_use?: boolean | null
          created_at?: string
          distribution_copies?: number | null
          features?: Json | null
          file_types?: string[] | null
          id?: string
          license_type: string
          price?: number
          stems_included?: boolean | null
          streaming_limit?: number | null
          updated_at?: string
        }
        Update: {
          beat_id?: string
          commercial_use?: boolean | null
          created_at?: string
          distribution_copies?: number | null
          features?: Json | null
          file_types?: string[] | null
          id?: string
          license_type?: string
          price?: number
          stems_included?: boolean | null
          streaming_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          proof_file_name: string | null
          proof_url: string | null
          reference_code: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          proof_file_name?: string | null
          proof_url?: string | null
          reference_code: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          proof_file_name?: string | null
          proof_url?: string | null
          reference_code?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          beat_id: string | null
          created_at: string
          currency: string
          download_expires_at: string | null
          download_url: string | null
          id: string
          license_type: string
          order_number: string
          payment_method: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          beat_id?: string | null
          created_at?: string
          currency?: string
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          license_type: string
          order_number?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          beat_id?: string | null
          created_at?: string
          currency?: string
          download_expires_at?: string | null
          download_url?: string | null
          id?: string
          license_type?: string
          order_number?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_applications: {
        Row: {
          admin_notes: string | null
          applicant_email: string
          applicant_id: string
          applicant_name: string
          bio: string | null
          created_at: string
          demo_url: string | null
          experience_level: string
          id: string
          portfolio_url: string | null
          program_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: Json | null
          status: string
          talent_type: string
          why_apply: string | null
        }
        Insert: {
          admin_notes?: string | null
          applicant_email: string
          applicant_id: string
          applicant_name: string
          bio?: string | null
          created_at?: string
          demo_url?: string | null
          experience_level: string
          id?: string
          portfolio_url?: string | null
          program_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: string
          talent_type: string
          why_apply?: string | null
        }
        Update: {
          admin_notes?: string | null
          applicant_email?: string
          applicant_id?: string
          applicant_name?: string
          bio?: string | null
          created_at?: string
          demo_url?: string | null
          experience_level?: string
          id?: string
          portfolio_url?: string | null
          program_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: string
          talent_type?: string
          why_apply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "outreach_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_programs: {
        Row: {
          benefits: Json | null
          cover_image: string | null
          created_at: string
          current_participants: number | null
          description: string | null
          end_date: string | null
          id: string
          max_participants: number | null
          program_type: string
          requirements: Json | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: Json | null
          cover_image?: string | null
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          program_type?: string
          requirements?: Json | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: Json | null
          cover_image?: string | null
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          program_type?: string
          requirements?: Json | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          checkout_request_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          merchant_request_id: string | null
          metadata: Json | null
          mpesa_receipt_number: string | null
          payment_method: string | null
          payment_type: string
          phone_number: string | null
          reference_id: string | null
          result_code: string | null
          result_desc: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          checkout_request_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          payment_method?: string | null
          payment_type: string
          phone_number?: string | null
          reference_id?: string | null
          result_code?: string | null
          result_desc?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          checkout_request_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          payment_method?: string | null
          payment_type?: string
          phone_number?: string | null
          reference_id?: string | null
          result_code?: string | null
          result_desc?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          mpesa_receipt_number: string | null
          payment_method: string
          phone_number: string | null
          processed_at: string | null
          processed_by: string | null
          producer_id: string
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          mpesa_receipt_number?: string | null
          payment_method?: string
          phone_number?: string | null
          processed_at?: string | null
          processed_by?: string | null
          producer_id: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          mpesa_receipt_number?: string | null
          payment_method?: string
          phone_number?: string | null
          processed_at?: string | null
          processed_by?: string | null
          producer_id?: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_sensitive: boolean | null
          setting_key: string
          setting_type: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          setting_key: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      play_history: {
        Row: {
          beat_id: string
          completed: boolean | null
          duration_seconds: number | null
          id: string
          played_at: string
          user_id: string
        }
        Insert: {
          beat_id: string
          completed?: boolean | null
          duration_seconds?: number | null
          id?: string
          played_at?: string
          user_id: string
        }
        Update: {
          beat_id?: string
          completed?: boolean | null
          duration_seconds?: number | null
          id?: string
          played_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_history_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badge: string | null
          bio: string | null
          client_type: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          region: string | null
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          region?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          region?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          uploaded_by: string
          version: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          uploaded_by: string
          version?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          producer_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          producer_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          producer_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          beat_id: string
          comment: string | null
          created_at: string
          id: string
          is_verified_purchase: boolean | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          beat_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          beat_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          mpesa_receipt_number: string | null
          order_id: string | null
          payment_method: string
          phone_number: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          order_id?: string | null
          payment_method?: string
          phone_number?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          order_id?: string | null
          payment_method?: string
          phone_number?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          beat_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          beat_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          beat_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          badge: string | null
          bio: string | null
          client_type: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          region: string | null
        }
        Insert: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          region?: string | null
        }
        Update: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          region?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "artist" | "producer" | "admin"
      beat_genre:
        | "hip_hop"
        | "rnb"
        | "pop"
        | "electronic"
        | "trap"
        | "jazz"
        | "rock"
        | "ambient"
        | "afrobeats"
        | "latin"
      beat_mood:
        | "energetic"
        | "chill"
        | "dark"
        | "uplifting"
        | "romantic"
        | "aggressive"
        | "melancholic"
        | "happy"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      license_type: "basic" | "premium" | "exclusive"
      project_status:
        | "draft"
        | "in_progress"
        | "review"
        | "completed"
        | "archived"
      session_type:
        | "recording"
        | "mixing"
        | "mastering"
        | "production"
        | "consultation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["artist", "producer", "admin"],
      beat_genre: [
        "hip_hop",
        "rnb",
        "pop",
        "electronic",
        "trap",
        "jazz",
        "rock",
        "ambient",
        "afrobeats",
        "latin",
      ],
      beat_mood: [
        "energetic",
        "chill",
        "dark",
        "uplifting",
        "romantic",
        "aggressive",
        "melancholic",
        "happy",
      ],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      license_type: ["basic", "premium", "exclusive"],
      project_status: [
        "draft",
        "in_progress",
        "review",
        "completed",
        "archived",
      ],
      session_type: [
        "recording",
        "mixing",
        "mastering",
        "production",
        "consultation",
      ],
    },
  },
} as const
