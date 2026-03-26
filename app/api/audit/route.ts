import { NextResponse } from "next/response";
import { getUser, createSupabaseServer } from "@/lib/supabase/queries";
import { runBusinessAudit } from "@/lib/google/audit";
import { AuditTask, AuditDetails } from "@/lib/supabase/types";

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { businessId } = await req.json();

        if (!businessId) {
            return NextResponse.json({ error: "ID do negócio obrigatório" }, { status: 400 });
        }

        const supabase = createSupabaseServer();

        // Verify ownership
        const { data: business, error: businessError } = await supabase
            .from("businesses")
            .select("id")
            .eq("id", businessId)
            .eq("user_id", user.id)
            .single();

        if (businessError || !business) {
            return NextResponse.json({ error: "Negócio não encontrado ou sem permissão" }, { status: 404 });
        }

        const auditData = await runBusinessAudit(businessId);

        // Map to Supabase types
        const mappedTasks: AuditTask[] = auditData.tasks.map((t) => ({
            priority: t.priority,
            category: t.category as any,
            text: t.text,
        }));

        const mappedDetails: AuditDetails = {
            photos: auditData.dimensions.photos.score,
            info: auditData.dimensions.info.score,
            reviews: auditData.dimensions.reviews.score,
            posts: auditData.dimensions.posts.score,
            geo: auditData.dimensions.geo.score,
        };

        // Insert into 'audits' table
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

        if (auditError) {
            throw auditError;
        }

        // Update business's last_audit_at and audit_score
        await supabase.from("businesses").update({
            last_audit_at: new Date().toISOString(),
            audit_score: auditData.score,
        }).eq("id", businessId);

        return NextResponse.json({ success: true, audit: newAudit });
    } catch (error: any) {
        console.error("Error in /api/audit:", error);
        return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
    }
}
