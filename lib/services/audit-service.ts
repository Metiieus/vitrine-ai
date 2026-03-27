import { createSupabaseServer, getUser } from "@/lib/supabase/queries";
import { Result } from "./subscription-service";
import { AuditTask, AuditDetails } from "@/lib/supabase/types";
import { AuditResult } from "@/lib/google/audit";

export class AuditService {
    /**
     * Salvar um novo resultado de auditoria
     */
    static async saveAudit(businessId: string, auditData: AuditResult): Promise<Result<Record<string, unknown>>> {
        try {
            const user = await getUser();
            const supabase = createSupabaseServer();

            // Mapear dados para o formato do Supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedTasks: AuditTask[] = ((auditData.tasks as any[]) || []).map((t: any) => ({
                priority: t.priority as "high" | "medium" | "low",
                category: t.category as "photos" | "info" | "reviews" | "posts" | "geo",
                text: t.text,
            }));

            const mappedDetails: AuditDetails = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                photos: (auditData.dimensions as any)?.photos?.score || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                info: (auditData.dimensions as any)?.info?.score || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reviews: (auditData.dimensions as any)?.reviews?.score || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                posts: (auditData.dimensions as any)?.posts?.score || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                geo: (auditData.dimensions as any)?.geo?.score || 0,
            };

            // Inserir auditoria
            const { data: newAudit, error: auditError } = await supabase
                .from("audits")
                .insert({
                    business_id: businessId,
                    score: (auditData.score as number) || 0,
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
                    audit_score: (auditData.score as number) || 0,
                })
                .eq("id", businessId)
                .eq("user_id", user.id);

            return { success: true, data: newAudit as Record<string, unknown> };
        } catch (error) {
            console.error("[AuditService] Error saving audit:", error);
            return { success: false, error: error as Error };
        }
    }
}
