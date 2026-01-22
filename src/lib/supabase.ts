import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      programs: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          target_audience: string[];
          application_period?: string;
          location?: string;
          cost?: string;
          application_process?: string;
          official_url?: string;
          format?: string;
          image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['programs']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          program_id: string;
          user_id: string;
          rating: number;
          title: string;
          content: string;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['reviews']['Row'],
          'id' | 'helpful_count' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['comments']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      drafts: {
        Row: {
          id: string;
          user_id?: string;
          program_id: string;
          device_id: string;
          title: string;
          content: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['drafts']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['drafts']['Insert']>;
      };
    };
  };
};
