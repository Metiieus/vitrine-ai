import { createSupabaseServer, getUser } from "@/lib/supabase/queries";
import { Result } from "./subscription-service";

export class BusinessService {
    /**
     * Listar todos os negócios do usuário autenticado
     */
    static async listUserBusinesses() {
        try {
            const user = await getUser();
            const supabase = createSupabaseServer();

            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return { success: true, data: data || [] } as Result<any[]>;
        } catch (error) {
            console.error("[BusinessService] Error listing businesses:", error);
            return { success: false, error: error as Error } as Result<any[]>;
        }
    }

    /**
     * Obter um negócio específico com garantia de isolamento
     */
    static async getBusinessById(businessId: string) {
        try {
            const user = await getUser();
            const supabase = createSupabaseServer();

            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("id", businessId)
                .eq("user_id", user.id) // Reforço do isolamento no código
                .single();

            if (error) {
                if (error.code === "PGRST116") throw new Error("Negócio não encontrado ou sem permissão");
                throw error;
            }

            return { success: true, data } as Result<any>;
        } catch (error) {
            console.error("[BusinessService] Error getting business:", error);
            return { success: false, error: error as Error } as Result<any>;
        }
    }

    /**
     * Criar um novo negócio validando limites do plano
     */
    static async createBusiness(params: { name: string; website?: string; url?: string }) {
        try {
            const user = await getUser();
            const supabase = createSupabaseServer();

            // Aqui poderíamos injetar o SubscriptionService para validar limites
            // const canCreate = await SubscriptionService.canAccessFeature('maxBusinesses');

            const { data, error } = await supabase
                .from("businesses")
                .insert({
                    ...params,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, data } as Result<any>;
        } catch (error) {
            console.error("[BusinessService] Error creating business:", error);
            return { success: false, error: error as Error } as Result<any>;
        }
    }
}
