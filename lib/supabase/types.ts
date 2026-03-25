export type Plan = "free" | "essential" | "pro" | "agency";
export type ResponseStatus = "pending" | "generated" | "published";
export type PostStatus = "draft" | "scheduled" | "published";
export type AiPlatform = "chatgpt" | "gemini" | "perplexity" | "ai_overviews";
export type PaymentStatus = "pending" | "approved" | "failed" | "refunded";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          plan: Plan;
          mercadopago_customer_id: string | null;
          mercadopago_subscription_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          plan?: Plan;
          mercadopago_customer_id?: string | null;
          mercadopago_subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          plan?: Plan;
          mercadopago_customer_id?: string | null;
          mercadopago_subscription_id?: string | null;
        };
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          google_account_id: string | null;
          google_location_id: string | null;
          name: string;
          category: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          website: string | null;
          google_rating: number | null;
          total_reviews: number | null;
          last_audit_at: string | null;
          audit_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          google_account_id?: string | null;
          google_location_id?: string | null;
          name: string;
          category?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          website?: string | null;
          google_rating?: number | null;
          total_reviews?: number | null;
          last_audit_at?: string | null;
          audit_score?: number | null;
          created_at?: string;
        };
        Update: {
          google_account_id?: string | null;
          google_location_id?: string | null;
          name?: string;
          category?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          website?: string | null;
          google_rating?: number | null;
          total_reviews?: number | null;
          last_audit_at?: string | null;
          audit_score?: number | null;
        };
      };
      audits: {
        Row: {
          id: string;
          business_id: string;
          score: number;
          details: AuditDetails | null;
          tasks: AuditTask[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          score: number;
          details?: AuditDetails | null;
          tasks?: AuditTask[] | null;
          created_at?: string;
        };
        Update: {
          score?: number;
          details?: AuditDetails | null;
          tasks?: AuditTask[] | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          business_id: string;
          google_review_id: string | null;
          author_name: string | null;
          rating: number | null;
          text: string | null;
          ai_response: string | null;
          response_status: ResponseStatus;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          google_review_id?: string | null;
          author_name?: string | null;
          rating?: number | null;
          text?: string | null;
          ai_response?: string | null;
          response_status?: ResponseStatus;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          ai_response?: string | null;
          response_status?: ResponseStatus;
          published_at?: string | null;
        };
      };
      google_posts: {
        Row: {
          id: string;
          business_id: string;
          content: string;
          image_url: string | null;
          status: PostStatus;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          content: string;
          image_url?: string | null;
          status?: PostStatus;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          image_url?: string | null;
          status?: PostStatus;
          published_at?: string | null;
        };
      };
      geo_checks: {
        Row: {
          id: string;
          business_id: string;
          query: string;
          ai_platform: AiPlatform;
          found: boolean;
          position: number | null;
          snippet: string | null;
          checked_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          query: string;
          ai_platform: AiPlatform;
          found?: boolean;
          position?: number | null;
          snippet?: string | null;
          checked_at?: string;
        };
        Update: {
          found?: boolean;
          position?: number | null;
          snippet?: string | null;
        };
      };
      insights: {
        Row: {
          id: string;
          business_id: string;
          period_start: string | null;
          period_end: string | null;
          searches: number | null;
          views: number | null;
          calls: number | null;
          direction_requests: number | null;
          website_clicks: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          period_start?: string | null;
          period_end?: string | null;
          searches?: number | null;
          views?: number | null;
          calls?: number | null;
          direction_requests?: number | null;
          website_clicks?: number | null;
          created_at?: string;
        };
        Update: {
          period_start?: string | null;
          period_end?: string | null;
          searches?: number | null;
          views?: number | null;
          calls?: number | null;
          direction_requests?: number | null;
          website_clicks?: number | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          mercadopago_payment_id: string;
          mercadopago_preference_id: string | null;
          status: PaymentStatus;
          amount: number;
          plan: Plan;
          billing_cycle: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mercadopago_payment_id: string;
          mercadopago_preference_id?: string | null;
          status?: PaymentStatus;
          amount: number;
          plan: Plan;
          billing_cycle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: PaymentStatus;
          amount?: number;
          billing_cycle?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          mercadopago_subscription_id: string | null;
          plan: Plan;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          next_billing_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mercadopago_subscription_id?: string | null;
          plan?: Plan;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          next_billing_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: Plan;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          next_billing_date?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface AuditDetails {
  photos: number;      // 0-25
  info: number;        // 0-25
  reviews: number;     // 0-20
  posts: number;       // 0-15
  geo: number;         // 0-15
}

export interface AuditTask {
  priority: "high" | "medium" | "low";
  category: "photos" | "info" | "reviews" | "posts" | "geo";
  text: string;
}
