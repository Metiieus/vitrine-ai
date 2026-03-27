import { createSupabaseServer, getUser } from "@/lib/supabase/queries";

export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

export class SubscriptionService {
    /**
     * Obter o status atual da assinatura do usuário
     */
    static async getCurrentSubscription(): Promise<Result<{ isActive: boolean; plan: string; subscription: Record<string, unknown> | null }>> {
        try {
            const user = await getUser();
            const supabase = createSupabaseServer();

            const { data, error } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error && error.code !== "PGRST116") throw error;

            return {
                success: true,
                data: {
                    isActive: data?.status === "active",
                    plan: data?.plan || "free",
                    subscription: data,
                }
            };
        } catch (error) {
            console.error("[SubscriptionService] Error getting subscription:", error);
            return { success: false, error: error as Error };
        }
    }

    /**
     * Validar se o usuário tem permissão para uma funcionalidade baseada no plano
     */
    static async canAccessFeature(feature: keyof typeof PLAN_FEATURES) {
        const result = await this.getCurrentSubscription();

        if (!result.success) return false;

        const { plan, isActive } = result.data;

        if (!isActive && plan !== "free") return false;

        const features = (PLAN_FEATURES as Record<string, typeof PLAN_FEATURES.free>)[plan] || PLAN_FEATURES.free;
        return !!(features as Record<string, unknown>)[feature];
    }
}

// Definição técnica das limitações de cada plano para uso no backend
export const PLAN_FEATURES = {
    free: {
        maxBusinesses: 1,
        aiResponses: 0,
        googlePosts: 0,
        geoMonitor: false,
    },
    essential: {
        maxBusinesses: 1,
        aiResponses: 5,
        googlePosts: 2,
        geoMonitor: false,
    },
    pro: {
        maxBusinesses: 1,
        aiResponses: 999999, // ilimitado
        googlePosts: 4,
        geoMonitor: true,
    },
    agency: {
        maxBusinesses: 5,
        aiResponses: 999999,
        googlePosts: 999999,
        geoMonitor: true,
    },
};
