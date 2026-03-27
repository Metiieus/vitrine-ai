import { createSupabaseServer } from "@/lib/supabase/queries";
import { headers } from "next/headers";

/**
 * 🔒 Registrar evento de auditoria no Supabase
 */
export async function logAudit(params: {
    action: string;
    resource?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
    userId?: string;
}) {
    try {
        const supabase = createSupabaseServer();
        const headerList = headers();

        // Obter IP e User Agent para auditoria
        const ip = headerList.get("x-forwarded-for") || "unknown";
        const userAgent = headerList.get("user-agent") || "unknown";

        const { error } = await supabase
            .from("audit_logs")
            .insert({
                user_id: params.userId,
                action: params.action,
                resource: params.resource,
                details: params.details,
                ip_address: ip,
                user_agent: userAgent,
            });

        if (error) {
            console.error("[AuditLog] Failed to save log:", error.message);
        }
    } catch (error) {
        console.error("[AuditLog] Critical error during audit logging:", error);
    }
}
