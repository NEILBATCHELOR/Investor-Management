export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      investor_groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      investor_groups_investors: {
        Row: {
          created_at: string;
          group_id: string;
          investor_id: string;
        };
        Insert: {
          created_at?: string;
          group_id: string;
          investor_id: string;
        };
        Update: {
          created_at?: string;
          group_id?: string;
          investor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investor_groups_investors_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "investor_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_groups_investors_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investors";
            referencedColumns: ["id"];
          },
        ];
      };
      investors: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          kyc_status: string;
          last_updated: string;
          name: string;
          type: string;
          wallet_address: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          kyc_status?: string;
          last_updated?: string;
          name: string;
          type: string;
          wallet_address?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          kyc_status?: string;
          last_updated?: string;
          name?: string;
          type?: string;
          wallet_address?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
