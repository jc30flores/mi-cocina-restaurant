export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      break_history: {
        Row: {
          break_end: string | null
          break_start: string
          created_at: string | null
          date: string
          employee_id: string
          id: string
        }
        Insert: {
          break_end?: string | null
          break_start: string
          created_at?: string | null
          date?: string
          employee_id: string
          id?: string
        }
        Update: {
          break_end?: string | null
          break_start?: string
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "break_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          break_end: string | null
          break_start: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          hourly_rate: number
          id: string
          name: string
          position: string
          status: string
          updated_at: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          hourly_rate: number
          id?: string
          name: string
          position: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          hourly_rate?: number
          id?: string
          name?: string
          position?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          image: string | null
          name: string
          quantity: number
          supplier: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          cost: number
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          quantity: number
          supplier?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          quantity?: number
          supplier?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_item_modifiers: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          modifier_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          modifier_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          modifier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_modifiers_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_modifiers_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image: string | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      modifier_options: {
        Row: {
          created_at: string | null
          id: string
          modifier_id: string | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          modifier_id?: string | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          modifier_id?: string | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_options_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
        ]
      }
      modifiers: {
        Row: {
          created_at: string | null
          id: string
          multi_select: boolean | null
          name: string
          required: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          multi_select?: boolean | null
          name: string
          required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          multi_select?: boolean | null
          name?: string
          required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_item_modifiers: {
        Row: {
          created_at: string | null
          id: string
          modifier_id: string | null
          modifier_option_id: string | null
          order_item_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          modifier_id?: string | null
          modifier_option_id?: string | null
          order_item_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          modifier_id?: string | null
          modifier_option_id?: string | null
          order_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_item_modifiers_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_modifiers_modifier_option_id_fkey"
            columns: ["modifier_option_id"]
            isOneToOne: false
            referencedRelation: "modifier_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_modifiers_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          client_number: number | null
          created_at: string | null
          id: string
          menu_item_id: string | null
          notes: string | null
          order_id: string | null
          price: number
          quantity: number
        }
        Insert: {
          client_number?: number | null
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string | null
          price: number
          quantity: number
        }
        Update: {
          client_number?: number | null
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_splits: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_id: string | null
          paid: boolean | null
          payment_method: string | null
          subtotal: number
          tax: number
          tip: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_id?: string | null
          paid?: boolean | null
          payment_method?: string | null
          subtotal: number
          tax: number
          tip?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_id?: string | null
          paid?: boolean | null
          payment_method?: string | null
          subtotal?: number
          tax?: number
          tip?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_splits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_count: number | null
          created_at: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          payment_method: string | null
          server: string
          status: string
          subtotal: number
          table_number: string | null
          tax: number | null
          tip: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          client_count?: number | null
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          payment_method?: string | null
          server: string
          status: string
          subtotal: number
          table_number?: string | null
          tax?: number | null
          tip?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          client_count?: number | null
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          payment_method?: string | null
          server?: string
          status?: string
          subtotal?: number
          table_number?: string | null
          tax?: number | null
          tip?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_number_fkey"
            columns: ["table_number"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["number"]
          },
        ]
      }
      restaurant_sections: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      split_items: {
        Row: {
          created_at: string | null
          id: string
          order_item_id: string | null
          split_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_item_id?: string | null
          split_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_item_id?: string | null
          split_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_items_split_id_fkey"
            columns: ["split_id"]
            isOneToOne: false
            referencedRelation: "order_splits"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number
          created_at: string | null
          height: number | null
          id: string
          number: string
          position_x: number | null
          position_y: number | null
          section_id: string | null
          status: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          height?: number | null
          id?: string
          number: string
          position_x?: number | null
          position_y?: number | null
          section_id?: string | null
          status?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          height?: number | null
          id?: string
          number?: string
          position_x?: number | null
          position_y?: number | null
          section_id?: string | null
          status?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "restaurant_sections"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
