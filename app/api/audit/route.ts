import { NextResponse } from "next/server";
import { runBusinessAudit } from "@/lib/google/audit";
import { BusinessService } from "@/lib/services/business-service";
import { AuditService } from "@/lib/services/audit-service";

export async function POST(req: Request) {
    try {
        const { businessId } = await req.json();

        if (!businessId) {
            return NextResponse.json({ error: "ID do negócio obrigatório" }, { status: 400 });
        }

        // 1. Verificar propriedade e obter dados do negócio (Service Layer)
        const businessResult = await BusinessService.getBusinessById(businessId);
        if (!businessResult.success) {
            return NextResponse.json({ error: businessResult.error.message }, { status: 403 });
        }

        // 2. Executar processo técnico da auditoria
        const auditData = await runBusinessAudit(businessId);

        // 3. Persistir auditoria e atualizar negócio (Service Layer)
        const saveResult = await AuditService.saveAudit(businessId, auditData);
        if (!saveResult.success) {
            throw saveResult.error;
        }

        return NextResponse.json({ success: true, audit: saveResult.data });
    } catch (error: any) {
        console.error("Error in /api/audit:", error);
        return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
    }
}
