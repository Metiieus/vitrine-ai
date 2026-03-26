import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createPaymentPreference, createPreapproval } from "@/lib/mercadopago/client";
import {
  checkRateLimit,
  validateQueryParams,
  unauthorizedError,
  badRequestError,
  rateLimitedError,
  internalError,
  CheckoutSchema,
  logSecurityEvent,
} from "@/lib/security";

const RATE_LIMIT_CONFIG = {
  limit: 10,
  window: 60, // 10 requisições por minuto
};

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // ✅ 1. AUTENTICAR
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // noop for POST
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedError(requestId);
    }

    // ✅ 2. RATE LIMITING
    const rateLimitCheck = await checkRateLimit(
      user.id,
      "checkout.create",
      RATE_LIMIT_CONFIG.limit,
      RATE_LIMIT_CONFIG.window
    );

    if (!rateLimitCheck.success) {
      logSecurityEvent(
        "checkout.rate_limited",
        { userId: user.id, requestId },
        "warning"
      );
      return rateLimitedError(RATE_LIMIT_CONFIG.window, requestId);
    }

    // ✅ 3. VALIDAR INPUT COM ZOD
    const raw = await request.json().catch(() => null);
    const validation = CheckoutSchema.safeParse(raw);

    if (!validation.success) {
      logSecurityEvent(
        "checkout.invalid_input",
        { userId: user.id, errors: validation.error.flatten(), requestId },
        "warning"
      );
      return badRequestError(requestId);
    }

    const { plan } = validation.data;

    // ✅ 4. BUSCAR PERFIL DO USUÁRIO
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", user.id)
      .single();

    if (!profile) {
      logSecurityEvent(
        "checkout.profile_not_found",
        { userId: user.id, requestId },
        "warning"
      );
      return internalError(new Error("Profile not found"), requestId);
    }

    // ✅ 5. CRIAR ASSINATURA RECORRENTE (PREAPPROVAL)
    // Nota: Em produção, o planId deve vir de variáveis de ambiente configuradas via script de setup
    const planIds: Record<string, string | undefined> = {
      essential: process.env.MERCADOPAGO_PLAN_ESSENTIAL_ID,
      pro: process.env.MERCADOPAGO_PLAN_PRO_ID,
      agency: process.env.MERCADOPAGO_PLAN_AGENCY_ID,
    };

    const targetPlanId = planIds[plan];

    if (!targetPlanId) {
      // Fallback para pagamento único se o plano recorrente não estiver configurado
      // Isso garante que o checkout não quebre enquanto os planos são provisionados
      const preference = await createPaymentPreference({
        userId: user.id,
        plan: plan as any,
        email: profile.email || user.email!,
        fullName: profile.name,
      });

      return NextResponse.json({
        init_point: preference.init_point,
        preference_id: preference.id,
        mode: 'one_time_fallback'
      });
    }

    const subscription = await createPreapproval({
      planId: targetPlanId,
      payerEmail: profile.email || user.email!,
    });

    logSecurityEvent(
      "checkout.subscription_created",
      { userId: user.id, plan, subscriptionId: subscription.id },
      "info"
    );

    return NextResponse.json({
      init_point: subscription.init_point,
      subscription_id: subscription.id,
      mode: 'subscription'
    });
  } catch (error: unknown) {
    logSecurityEvent(
      "checkout.error",
      { requestId, error: String(error) },
      "error"
    );
    return internalError(error, requestId);
  }
}
