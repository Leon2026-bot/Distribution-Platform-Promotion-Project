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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_platforms: {
        Row: {
          created_at: string | null
          display_order: number | null
          fee_description: string | null
          id: string
          is_active: boolean | null
          jump_url_template: string
          logo_url: string | null
          name: string
          site_promo_code: string | null
          slug: string
          supported_sources: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          fee_description?: string | null
          id?: string
          is_active?: boolean | null
          jump_url_template: string
          logo_url?: string | null
          name: string
          site_promo_code?: string | null
          slug: string
          supported_sources?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          fee_description?: string | null
          id?: string
          is_active?: boolean | null
          jump_url_template?: string
          logo_url?: string | null
          name?: string
          site_promo_code?: string | null
          slug?: string
          supported_sources?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      attribution_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          device_type: string | null
          expires_at: string | null
          first_touch_ref: string | null
          id: string
          last_touch_ref: string | null
          os: string | null
          promoter_id: string | null
          promoter_username: string | null
          referrer: string | null
          session_id: string
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_type?: string | null
          expires_at?: string | null
          first_touch_ref?: string | null
          id?: string
          last_touch_ref?: string | null
          os?: string | null
          promoter_id?: string | null
          promoter_username?: string | null
          referrer?: string | null
          session_id: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_type?: string | null
          expires_at?: string | null
          first_touch_ref?: string | null
          id?: string
          last_touch_ref?: string | null
          os?: string | null
          promoter_id?: string | null
          promoter_username?: string | null
          referrer?: string | null
          session_id?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attribution_sessions_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          focus_keyword: string | null
          id: string
          is_ai_generated: boolean | null
          published_at: string | null
          related_products: string[] | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          is_ai_generated?: boolean | null
          published_at?: string | null
          related_products?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          is_ai_generated?: boolean | null
          published_at?: string | null
          related_products?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          product_count: number | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          product_count?: number | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          product_count?: number | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          product_count: number | null
          slug: string
          sort_order: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          product_count?: number | null
          slug: string
          sort_order?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          product_count?: number | null
          slug?: string
          sort_order?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      click_events: {
        Row: {
          blog_id: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_country: string | null
          platform_id: string | null
          product_id: string | null
          promoter_id: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          blog_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_country?: string | null
          platform_id?: string | null
          product_id?: string | null
          promoter_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          blog_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_country?: string | null
          platform_id?: string | null
          product_id?: string | null
          promoter_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "click_events_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "agent_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          click_count: number | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          description_zh: string | null
          id: string
          images: string[]
          is_active: boolean | null
          is_featured: boolean | null
          original_images: string[] | null
          price_cny: number
          price_usd: number | null
          seo_description: string | null
          seo_title: string | null
          sizes: Json | null
          slug: string
          source_item_id: string
          source_type: string
          source_url: string | null
          tags: string[] | null
          title: string
          title_zh: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          brand?: string | null
          category: string
          click_count?: number | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          description_zh?: string | null
          id?: string
          images: string[]
          is_active?: boolean | null
          is_featured?: boolean | null
          original_images?: string[] | null
          price_cny: number
          price_usd?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sizes?: Json | null
          slug: string
          source_item_id: string
          source_type: string
          source_url?: string | null
          tags?: string[] | null
          title: string
          title_zh?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          brand?: string | null
          category?: string
          click_count?: number | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          description_zh?: string | null
          id?: string
          images?: string[]
          is_active?: boolean | null
          is_featured?: boolean | null
          original_images?: string[] | null
          price_cny?: number
          price_usd?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sizes?: Json | null
          slug?: string
          source_item_id?: string
          source_type?: string
          source_url?: string | null
          tags?: string[] | null
          title?: string
          title_zh?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      promo_links: {
        Row: {
          click_count: number | null
          created_at: string | null
          final_url: string | null
          id: string
          last_clicked_at: string | null
          platform_id: string | null
          product_id: string | null
          product_type: string | null
          promoter_code: string | null
          promoter_id: string | null
          short_code: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          final_url?: string | null
          id?: string
          last_clicked_at?: string | null
          platform_id?: string | null
          product_id?: string | null
          product_type?: string | null
          promoter_code?: string | null
          promoter_id?: string | null
          short_code: string
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          final_url?: string | null
          id?: string
          last_clicked_at?: string | null
          platform_id?: string | null
          product_id?: string | null
          product_type?: string | null
          promoter_code?: string | null
          promoter_id?: string | null
          short_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_links_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "agent_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_links_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      promoter_channels: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          member_id: string
          platform_id: string | null
          promoter_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          member_id: string
          platform_id?: string | null
          promoter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          member_id?: string
          platform_id?: string | null
          promoter_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promoter_channels_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "agent_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promoter_channels_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      promoter_products: {
        Row: {
          added_at: string | null
          custom_category: string | null
          custom_image: string | null
          custom_name: string | null
          custom_price: number | null
          custom_tags: string[] | null
          custom_url: string | null
          display_order: number | null
          id: string
          is_pinned: boolean | null
          product_id: string | null
          product_type: string | null
          promoter_id: string | null
          status: string | null
        }
        Insert: {
          added_at?: string | null
          custom_category?: string | null
          custom_image?: string | null
          custom_name?: string | null
          custom_price?: number | null
          custom_tags?: string[] | null
          custom_url?: string | null
          display_order?: number | null
          id?: string
          is_pinned?: boolean | null
          product_id?: string | null
          product_type?: string | null
          promoter_id?: string | null
          status?: string | null
        }
        Update: {
          added_at?: string | null
          custom_category?: string | null
          custom_image?: string | null
          custom_name?: string | null
          custom_price?: number | null
          custom_tags?: string[] | null
          custom_url?: string | null
          display_order?: number | null
          id?: string
          is_pinned?: boolean | null
          product_id?: string | null
          product_type?: string | null
          promoter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promoter_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promoter_products_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      promoters: {
        Row: {
          avatar_url: string | null
          banner_config: Json | null
          bio: string | null
          created_at: string | null
          default_platform_id: string | null
          display_name: string | null
          id: string
          social_links: Json | null
          status: string | null
          theme_config: Json | null
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          banner_config?: Json | null
          bio?: string | null
          created_at?: string | null
          default_platform_id?: string | null
          display_name?: string | null
          id?: string
          social_links?: Json | null
          status?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          banner_config?: Json | null
          bio?: string | null
          created_at?: string | null
          default_platform_id?: string | null
          display_name?: string | null
          id?: string
          social_links?: Json | null
          status?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "promoters_default_platform_id_fkey"
            columns: ["default_platform_id"]
            isOneToOne: false
            referencedRelation: "agent_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          created_at: string | null
          id: string
          result_count: number | null
          search_query: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          result_count?: number | null
          search_query: string
        }
        Update: {
          created_at?: string | null
          id?: string
          result_count?: number | null
          search_query?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
