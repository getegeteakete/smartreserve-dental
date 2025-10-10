export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_preferences: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string
          preference_order: number
          preferred_date: string
          preferred_time_slot: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          preference_order: number
          preferred_date: string
          preferred_time_slot: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          preference_order?: number
          preferred_date?: string
          preferred_time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_preferences_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_tokens: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          type: string
          used: boolean | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          token: string
          type: string
          used?: boolean | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          type?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          age: number | null
          appointment_date: string
          confirmed_date: string | null
          confirmed_time_slot: string | null
          created_at: string | null
          email: string | null
          fee: number | null
          id: string
          notes: string | null
          patient_name: string
          phone: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          treatment_name: string | null
        }
        Insert: {
          age?: number | null
          appointment_date: string
          confirmed_date?: string | null
          confirmed_time_slot?: string | null
          created_at?: string | null
          email?: string | null
          fee?: number | null
          id?: string
          notes?: string | null
          patient_name: string
          phone: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_name?: string | null
        }
        Update: {
          age?: number | null
          appointment_date?: string
          confirmed_date?: string | null
          confirmed_time_slot?: string | null
          created_at?: string | null
          email?: string | null
          fee?: number | null
          id?: string
          notes?: string | null
          patient_name?: string
          phone?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_name?: string | null
        }
        Relationships: []
      }
      clinic_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          month: number
          start_time: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          month: number
          start_time: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          month?: number
          start_time?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          allergies: string | null
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_history: string | null
          notes: string | null
          patient_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_history?: string | null
          notes?: string | null
          patient_name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_history?: string | null
          notes?: string | null
          patient_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservation_limits: {
        Row: {
          created_at: string
          email: string
          id: string
          last_reservation_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_reservation_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_reservation_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      special_clinic_schedules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_available: boolean
          specific_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_available?: boolean
          specific_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_available?: boolean
          specific_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatment_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatment_limits: {
        Row: {
          created_at: string
          id: string
          max_reservations_per_slot: number
          treatment_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_reservations_per_slot?: number
          treatment_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_reservations_per_slot?: number
          treatment_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration: number
          fee: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          fee?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          fee?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "treatment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_appointment_with_reason: {
        Args: { p_appointment_id: string; p_cancel_reason?: string }
        Returns: boolean
      }
      cancel_existing_pending_appointments: {
        Args: { p_email: string }
        Returns: number
      }
      check_appointment_time_conflict: {
        Args: {
          p_email: string
          p_confirmed_date: string
          p_confirmed_time_slot: string
          p_exclude_appointment_id?: string
        }
        Returns: boolean
      }
      check_confirmed_time_conflict: {
        Args: {
          p_email: string
          p_date: string
          p_time_slot: string
          p_exclude_appointment_id?: string
        }
        Returns: boolean
      }
      check_preferred_dates_conflict: {
        Args: { p_email: string; p_preferred_dates: Json }
        Returns: boolean
      }
      check_rebooking_eligibility: {
        Args: { p_email: string }
        Returns: {
          can_rebook: boolean
          pending_count: number
          confirmed_count: number
          message: string
        }[]
      }
      check_reservation_limit: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_treatment_reservation_limit: {
        Args: { p_email: string; p_treatment_name: string }
        Returns: boolean
      }
      cleanup_old_reservation_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_special_clinic_schedule: {
        Args: { p_id: string }
        Returns: undefined
      }
      generate_appointment_token: {
        Args: { p_email: string; p_appointment_id: string; p_type: string }
        Returns: string
      }
      get_clinic_schedules: {
        Args: { p_year: number; p_month: number }
        Returns: {
          id: string
          year: number
          month: number
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
        }[]
      }
      get_special_clinic_schedules: {
        Args: { p_year: number; p_month: number }
        Returns: {
          id: string
          specific_date: string
          start_time: string
          end_time: string
          is_available: boolean
        }[]
      }
      get_treatment_limits: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          treatment_name: string
          max_reservations_per_slot: number
        }[]
      }
      insert_clinic_schedule: {
        Args: {
          p_year: number
          p_month: number
          p_day_of_week: number
          p_start_time: string
          p_end_time: string
          p_is_available: boolean
        }
        Returns: string
      }
      insert_special_clinic_schedule: {
        Args: {
          p_specific_date: string
          p_start_time: string
          p_end_time: string
          p_is_available: boolean
        }
        Returns: string
      }
      mark_token_as_used: {
        Args: { p_token: string }
        Returns: boolean
      }
      record_reservation_limit: {
        Args: { p_email: string }
        Returns: undefined
      }
      update_clinic_schedule: {
        Args: { p_id: string; p_is_available: boolean }
        Returns: undefined
      }
      update_special_clinic_schedule: {
        Args: { p_id: string; p_is_available: boolean }
        Returns: undefined
      }
      upsert_treatment_limit: {
        Args: { p_treatment_name: string; p_max_reservations: number }
        Returns: string
      }
      validate_appointment_token: {
        Args: { p_token: string }
        Returns: {
          is_valid: boolean
          email: string
          appointment_id: string
          type: string
          error_message: string
        }[]
      }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "cancelled"
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
      appointment_status: ["pending", "confirmed", "cancelled"],
    },
  },
} as const
