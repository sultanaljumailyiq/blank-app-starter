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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          clinic_id: number | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          doctor_id: string | null
          id: number
          notes: string | null
          patient_id: number | null
          payment_status: string | null
          status: string | null
          treatment_type: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          clinic_id?: number | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          doctor_id?: string | null
          id?: number
          notes?: string | null
          patient_id?: number | null
          payment_status?: string | null
          status?: string | null
          treatment_type: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          clinic_id?: number | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          doctor_id?: string | null
          id?: number
          notes?: string | null
          patient_id?: number | null
          payment_status?: string | null
          status?: string | null
          treatment_type?: string
          updated_at?: string | null
        }
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          allergies: string[] | null
          assigned_doctor_id: string | null
          blood_type: string | null
          city: string | null
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string
          id: number
          is_active: boolean | null
          last_visit_date: string | null
          medical_history: string | null
          notes: string | null
          phone: string
          total_visits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: number
          is_active?: boolean | null
          last_visit_date?: string | null
          medical_history?: string | null
          notes?: string | null
          phone: string
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: number
          is_active?: boolean | null
          last_visit_date?: string | null
          medical_history?: string | null
          notes?: string | null
          phone?: string
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
      dental_laboratories: {
        Row: {
          id: string
          lab_name: string
          lab_name_ar: string | null
          city: string | null
          address: string | null
          phone: string | null
          email: string | null
          rating: number | null
          total_orders: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          lab_name: string
          lab_name_ar?: string | null
          city?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          rating?: number | null
          total_orders?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          lab_name?: string
          lab_name_ar?: string | null
          city?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          rating?: number | null
          total_orders?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          phone: string | null
          city: string | null
          avatar_url: string | null
          account_status: string
          commission_percentage: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: string
          phone?: string | null
          city?: string | null
          avatar_url?: string | null
          account_status?: string
          commission_percentage?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          city?: string | null
          avatar_url?: string | null
          account_status?: string
          commission_percentage?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      clinics: {
        Row: {
          id: number
          name: string
          address: string
          city: string
          phone: string
          email: string | null
          owner_id: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          description: string | null
          image_url: string | null
          rating: number | null
          reviews_count: number | null
        }
        Insert: {
          id?: number
          name: string
          address: string
          city: string
          phone: string
          email?: string | null
          owner_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          description?: string | null
          image_url?: string | null
          rating?: number | null
          reviews_count?: number | null
        }
        Update: {
          id?: number
          name?: string
          address?: string
          city?: string
          phone?: string
          email?: string | null
          owner_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          description?: string | null
          image_url?: string | null
          rating?: number | null
          reviews_count?: number | null
        }
      }
      dental_lab_orders: {
        Row: {
          id: string
          order_number: string
          patient_id: string
          patient_name: string
          patient_phone: string | null
          clinic_id: string | null
          laboratory_id: string
          service_id: string
          service_name: string
          unit_price: number
          total_amount: number
          final_amount: number
          status: string | null
          priority: string | null
          order_date: string | null
          estimated_delivery_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          patient_id: string
          patient_name: string
          patient_phone?: string | null
          clinic_id?: string | null
          laboratory_id: string
          service_id: string
          service_name: string
          unit_price: number
          total_amount: number
          final_amount: number
          status?: string | null
          priority?: string | null
          order_date?: string | null
          estimated_delivery_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          patient_id?: string
          patient_name?: string
          patient_phone?: string | null
          clinic_id?: string | null
          laboratory_id?: string
          service_id?: string
          service_name?: string
          unit_price?: number
          total_amount?: number
          final_amount?: number
          status?: string | null
          priority?: string | null
          order_date?: string | null
          estimated_delivery_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
