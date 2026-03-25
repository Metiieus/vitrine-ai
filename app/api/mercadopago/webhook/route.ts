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

    // ✅ 2. VALIDAR TIPO DE NOTIFICAÇÃO
    if (type !== "payment") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // ✅ 3. VALIDAR ID
    if (!id) {
      logSecurityEvent(
        "webhook.missing_payment_id",
        { endpoint: "mercadopago", requestId },
        "warning"
      );
      return NextResponse.json({ success: false }, { status: 200 });
    }

    // ✅ 4. BUSCAR INFORMAÇÕES DO PAGAMENTO
    let paymentInfo;
    try {
      paymentInfo = await getPaymentInfo(id);
    } catch (error) {
      logSecurityEvent(
        "webhook.payment_fetch_failed",
        { endpoint: "mercadopago", paymentId: id, requestId, error: String(error) },
        "error"
      );
      // Retornar 200 para Mercado Pago (evitar retry infinito)
      throw new Error("Payment not found");
    }

    // ✅ 5. VALIDAR DADOS DO PAGAMENTO
    const userId = paymentInfo.metadata?.user_id;
    const plan = paymentInfo.metadata?.plan;

    if (!userId || !sanitizeUUID(userId)) {
      logSecurityEvent(
        "webhook.invalid_user_id",
        { endpoint: "mercadopago", paymentId: id, requestId },
        "warning"
      );
      return NextResponse.json({ success: false }, { status: 200 });
    }

    // ✅ 6. MAPEAR STATUS
    const status = paymentInfo.status as string;
    let ourStatus: "approved" | "pending" | "failed" | "refunded" = "pending";

    if (status === "approved") ourStatus = "approved";
    else if (status === "rejected" || status === "cancelled") ourStatus = "failed";
    else if (status === "refunded") ourStatus = "refunded";

    // ✅ 7. SALVAR PAGAMENTO NO BANCO
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        mercadopago_payment_id: String(paymentInfo.id),
        status: ourStatus,
        amount: paymentInfo.transaction_amount || 0,
        plan: plan || "essential",
      });

    if (paymentError) {
      logSecurityEvent(
        "webhook.payment_save_failed",
        { endpoint: "mercadopago", userId, error: paymentError.message },
        "error"
      );
      throw paymentError;
    }

    // ✅ 8. SE APROVADO, ATUALIZAR PLANO
    if (ourStatus === "approved") {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ plan: plan || "essential" })
        .eq("id", userId);

      if (profileError) {
        logSecurityEvent(
          "webhook.profile_update_failed",
          { endpoint: "mercadopago", userId },
          "error"
        );
        throw profileError;
      }

      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan: plan || "essential",
            status: "active",
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          { onConflict: "user_id" }
        );

      if (subscriptionError) {
        logSecurityEvent(
          "webhook.subscription_update_failed",
          { endpoint: "mercadopago", userId },
          "error"
        );
        throw subscriptionError;
      }

      logSecurityEvent(
        "payment.approved",
        { userId, plan, paymentId: paymentInfo.id },
        "info"
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    // ❌ ERRO NÃO EXPÕE DETALHES
    logSecurityEvent(
      "webhook.error",
      { endpoint: "mercadopago", requestId, error: String(error) },
      "error"
    );

    // Retornar 200 para Mercado Pago não reenviar (queue infinita)
    // Erros são logados internamente
    return NextResponse.json({ success: false, requestId }, { status: 200 });
  }
}

// Para verificar que o webhook está ativo
export async function GET(request: NextRequest) {
  return NextResponse.json({ webhook: "ativo" });
}
