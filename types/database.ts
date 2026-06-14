export type AppRole =
  | "owner_admin"
  | "operations_manager"
  | "buyer"
  | "pickup_payment_coordinator"
  | "market_lead"
  | "seller";

export type ScenarioStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "used_for_buying_trip"
  | "archived";

export type Database = {
  public: {
    Tables: {
      stock_scenarios: {
        Row: {
          id: string;
          business_id: string;
          created_by: string;
          name: string;
          description: string;
          status: ScenarioStatus;
          planning_mode: "budget" | "quantity";
          data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          created_by: string;
          name: string;
          description?: string;
          status?: ScenarioStatus;
          planning_mode?: "budget" | "quantity";
          data: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["stock_scenarios"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      scenario_status: ScenarioStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
