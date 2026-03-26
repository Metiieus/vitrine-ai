import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaymentInfo } from "@/lib/mercadopago/client";
import {
  validateMercadoPagoSignature,
  logSecurityEvent,
  internalError,
  badRequestError,
  sanitizeUUID,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const requestBody = await request.text();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    // ✅ 1. VALIDAR ASSINATURA DO WEBHOOK (ANTI-FALSIFICAÇÃO)
    const signature = request.headers.get("x-signature");
    const webhookToken = process.env.MERCADOPAGO_WEBHOOK_TOKEN;

    if (!webhookToken) {
      logSecurityEvent(
        "webhook.config_missing",
        { endpoint: "mercadopago", requestId },
        "error"
      );
      throw new Error("Webhook token não configurado");
    }

    const isValidSignature = validateMercadoPagoSignature(
      requestBody,
      signature || undefined,
      webhookToken
    );

    if (!isValidSignature) {
      logSecurityEvent(
        "webhook.invalid_signature",
        { endpoint: "mercadopago", requestId, ip: request.headers.get("x-forwarded-for") },
        "warning"
      );
      // Retornar 200 para não disparar retry do Mercado Pago
      return NextResponse.json({ success: false, reason: "Invalid signature" }, { status: 200 });
    }

    // ✅ 7. INSTANCIAR SUPABASE COM SERVICE ROLE (BYPASS RLS PARA WEBHOOKS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✅ 2. DISPATCHER DE NOTIFICAÇÃO
    if (type === "payment") {
      return await handlePaymentNotification(id!, supabase, requestId);
    } else if (type === "preapproval") {
      return await handleSubscriptionNotification(id!, supabase, requestId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logSecurityEvent(
      "webhook.error",
      { endpoint: "mercadopago", requestId, error: String(error) },
      "error"
    );
    return NextResponse.json({ success: false, requestId }, { status: 200 });
  }
}

/**
 * Lida com pagamentos únicos ou faturas de assinatura
 */
async function handlePaymentNotification(id: string, supabase: any, requestId: string) {
  const paymentInfo = await getPaymentInfo(id);
  const userId = paymentInfo.metadata?.user_id;
  const plan = paymentInfo.metadata?.plan;

  if (!userId) return NextResponse.json({ success: false }, { status: 200 });

  // Idempotência: verificar se pagamento já existe
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("mercadopago_payment_id", String(paymentInfo.id))
    .single();

  if (existing) return NextResponse.json({ success: true, note: "already_processed" });

  const status = paymentInfo.status as string;
  let ourStatus: "approved" | "pending" | "failed" | "refunded" = "pending";

  if (status === "approved") ourStatus = "approved";
  else if (status === "rejected" || status === "cancelled") ourStatus = "failed";
  else if (status === "refunded") ourStatus = "refunded";

  await supabase.from("payments").insert({
    user_id: userId,
    mercadopago_payment_id: String(paymentInfo.id),
    status: ourStatus,
    amount: paymentInfo.transaction_amount || 0,
    plan: plan || "essential",
  });

  if (ourStatus === "approved") {
    // Atualizar perfil
    await supabase.from("profiles").update({ plan: plan || "essential" }).eq("id", userId);

    // Atualizar assinatura
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: plan || "essential",
      status: "active",
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }, { onConflict: "user_id" });
  }

  return NextResponse.json({ success: true });
}

/**
 * Lida com criação/atualização de assinaturas recorrentes
 */
async function handleSubscriptionNotification(id: string, supabase: any, requestId: string) {
  // Nota: Para preapproval, precisamos de um endpoint diferente no SDK se quisermos detalhes
  // Mas no Vitrine.ai, geralmente usamos o metadata ou buscamos via ID.
  // Por agora, logamos e marcamos a intenção.

  logSecurityEvent("webhook.subscription_event", { subscriptionId: id }, "info");

  // Implementação futura: Buscar preapproval por ID e atualizar o plano do usuário
  return NextResponse.json({ success: true });
}

// Para verificar que o webhook está ativo
export async function GET(request: NextRequest) {
  return NextResponse.json({ webhook: "ativo" });
}
