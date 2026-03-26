import { createSupabaseServer, getUser } from "@/lib/supabase/queries";
import { Result } from "./subscription-service";
import { AuditTask, AuditDetails } from "@/lib/supabase/types";

export class AuditService {
    /**
     * Salvar um novo resultado de auditoria
     */
    static async saveAudit(businessId: string, auditData: any): Promise<Result<any>> {
        try {
            const user = await getUser();
            const supabase = createSupabaseServer();

            // Mapear dados para o formato do Supabase
            const mappedTasks: AuditTask[] = auditData.tasks.map((t: any) => ({
                priority: t.priority,
                category: t.category,
                text: t.text,
            }));

            const mappedDetails: AuditDetails = {
                photos: auditData.dimensions.photos.score,
                info: auditData.dimensions.info.score,
                reviews: auditData.dimensions.reviews.score,
                posts: auditData.dimensions.posts.score,
                geo: auditData.dimensions.geo.score,
            };

            // Inserir auditoria
            const { data: newAudit, error: auditError } = await supabase
                .from("audits")
                .insert({
                    business_id: businessId,
                    score: auditData.score,
                    details: mappedDetails,
                    tasks: mappedTasks,
                })
                .select()
                .single();

            if (auditError) throw auditError;

            // Atualizar estatísticas do negócio
            await supabase.from("businesses")
                .update({
                    last_audit_at: new Date().toISOString(),
                    audit_score: auditData.score,
                })
                .eq("id", businessId)
                .eq("user_id", user.id);

            return { success: true, data: newAudit };
        } catch (error: any) {
            console.error("[AuditService] Error saving audit:", error);
            return { success: false, error: error as Error };
        }
    }
}
