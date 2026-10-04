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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          is_primary: boolean
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          is_primary?: boolean
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          is_primary?: boolean
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          app_icon_url: string | null
          app_name: string
          designation_en: string
          designation_mr: string
          header_image_url: string | null
          header_photo_url: string | null
          id: number
          leader_name: string
          leader_photo_url: string | null
          leader_title: string
          name_en: string
          name_mr: string
          office_address: string
          office_lat: number | null
          office_lng: number | null
          office_phone: string
          office_whatsapp: string
          party_logo_url: string | null
          party_name_en: string
          party_name_mr: string
          slogan_en: string
          slogan_mr: string
          splash_logo_url: string | null
          splash_photo_url: string | null
          tagline_en: string
          tagline_mr: string
          updated_at: string
          ward_en: string
          ward_mr: string
        }
        Insert: {
          app_icon_url?: string | null
          app_name?: string
          designation_en?: string
          designation_mr?: string
          header_image_url?: string | null
          header_photo_url?: string | null
          id?: number
          leader_name?: string
          leader_photo_url?: string | null
          leader_title?: string
          name_en?: string
          name_mr?: string
          office_address?: string
          office_lat?: number | null
          office_lng?: number | null
          office_phone?: string
          office_whatsapp?: string
          party_logo_url?: string | null
          party_name_en?: string
          party_name_mr?: string
          slogan_en?: string
          slogan_mr?: string
          splash_logo_url?: string | null
          splash_photo_url?: string | null
          tagline_en?: string
          tagline_mr?: string
          updated_at?: string
          ward_en?: string
          ward_mr?: string
        }
        Update: {
          app_icon_url?: string | null
          app_name?: string
          designation_en?: string
          designation_mr?: string
          header_image_url?: string | null
          header_photo_url?: string | null
          id?: number
          leader_name?: string
          leader_photo_url?: string | null
          leader_title?: string
          name_en?: string
          name_mr?: string
          office_address?: string
          office_lat?: number | null
          office_lng?: number | null
          office_phone?: string
          office_whatsapp?: string
          party_logo_url?: string | null
          party_name_en?: string
          party_name_mr?: string
          slogan_en?: string
          slogan_mr?: string
          splash_logo_url?: string | null
          splash_photo_url?: string | null
          tagline_en?: string
          tagline_mr?: string
          updated_at?: string
          ward_en?: string
          ward_mr?: string
        }
        Relationships: []
      }
      citizens: {
        Row: {
          address: string
          created_at: string
          device_id: string | null
          dob: string | null
          id: string
          mobile: string
          name: string
          session_token: string
        }
        Insert: {
          address?: string
          created_at?: string
          device_id?: string | null
          dob?: string | null
          id?: string
          mobile: string
          name: string
          session_token?: string
        }
        Update: {
          address?: string
          created_at?: string
          device_id?: string | null
          dob?: string | null
          id?: string
          mobile?: string
          name?: string
          session_token?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category_id: string | null
          citizen_id: string
          created_at: string
          id: string
          message: string
          status: string
        }
        Insert: {
          category_id?: string | null
          citizen_id: string
          created_at?: string
          id?: string
          message?: string
          status?: string
        }
        Update: {
          category_id?: string | null
          citizen_id?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          citizen_id: string | null
          created_at: string
          fcm_token: string
          id: string
          platform: string | null
        }
        Insert: {
          citizen_id?: string | null
          created_at?: string
          fcm_token: string
          id?: string
          platform?: string | null
        }
        Update: {
          citizen_id?: string | null
          created_at?: string
          fcm_token?: string
          id?: string
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          caption: string | null
          caption_en: string | null
          caption_mr: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          video_link: string | null
        }
        Insert: {
          caption?: string | null
          caption_en?: string | null
          caption_mr?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          video_link?: string | null
        }
        Update: {
          caption?: string | null
          caption_en?: string | null
          caption_mr?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          video_link?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          citizen_id: string | null
          created_at: string
          id: string
          image_url: string | null
          message: string
          title: string
          type: string
        }
        Insert: {
          citizen_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          title: string
          type?: string
        }
        Update: {
          citizen_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          apply_link: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_mr: string | null
          eligibility: string | null
          how_to_apply: string | null
          icon: string | null
          id: string
          image_url: string | null
          sort_order: number
          title_en: string
          title_mr: string
        }
        Insert: {
          apply_link?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_mr?: string | null
          eligibility?: string | null
          how_to_apply?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          title_en: string
          title_mr: string
        }
        Update: {
          apply_link?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_mr?: string | null
          eligibility?: string | null
          how_to_apply?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          title_en?: string
          title_mr?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          active: boolean
          created_at: string
          icon: string
          id: string
          name_en: string
          name_mr: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string
          id?: string
          name_en: string
          name_mr: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string
          id?: string
          name_en?: string
          name_mr?: string
          sort_order?: number
        }
        Relationships: []
      }
      updates: {
        Row: {
          body_en: string
          body_mr: string
          category_en: string
          category_mr: string
          created_at: string
          id: string
          is_alert: boolean
          title_en: string
          title_mr: string
        }
        Insert: {
          body_en?: string
          body_mr?: string
          category_en?: string
          category_mr?: string
          created_at?: string
          id?: string
          is_alert?: boolean
          title_en: string
          title_mr: string
        }
        Update: {
          body_en?: string
          body_mr?: string
          category_en?: string
          category_mr?: string
          created_at?: string
          id?: string
          is_alert?: boolean
          title_en?: string
          title_mr?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          created_at: string
          description_en: string
          description_mr: string
          id: string
          photo_url: string | null
          sort_order: number
          status_en: string
          status_mr: string
          title_en: string
          title_mr: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_mr?: string
          id?: string
          photo_url?: string | null
          sort_order?: number
          status_en?: string
          status_mr?: string
          title_en: string
          title_mr: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_mr?: string
          id?: string
          photo_url?: string | null
          sort_order?: number
          status_en?: string
          status_mr?: string
          title_en?: string
          title_mr?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
