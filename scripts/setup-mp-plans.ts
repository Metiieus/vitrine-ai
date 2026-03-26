/**
 * Script para provisionar os planos de assinatura no Mercado Pago
 * Uso: npx ts-node scripts/setup-mp-plans.ts
 */
import { createSubscriptionPlan, PLANES } from "../lib/mercadopago/client";

async function setup() {
    console.log("🚀 Iniciando criação de planos no Mercado Pago...");

    for (const [key, plan] of Object.entries(PLANES)) {
        try {
            console.log(`- Criando plano: ${plan.name} (${key})...`);
            const result = await createSubscriptionPlan({
                reason: `Vitrine.ai - Plano ${plan.name}`,
                amount: plan.price,
                frequency: 1,
                frequency_type: "months",
            });
            console.log(`✅ Sucesso! ID do Plano: ${result.id}`);
            console.log(`🔗 Link do Plano: ${result.init_point}`);
            console.log("---");
        } catch (error) {
            console.error(`❌ Erro ao criar plano ${key}:`, error);
        }
    }

    console.log("🏁 Configuração concluída.");
}

// setup(); // Comentado por segurança se rodar acidentalmente
