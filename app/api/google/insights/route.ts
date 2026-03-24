/**
 * GET /api/google/insights?businessId={uuid}&days=30
 *
 * Busca métricas de desempenho do Google Business (via Performance API)
 * e salva na tabela `insights`.
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getGoogleFetch } from "@/lib/google/client";
import { getInsightsSummary } from "@/lib/google/business";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get("businessId");
  const days = Math.min(Number(searchParams.get("days") ?? 30), 90);

  if (!businessId) {
    return NextResponse.json({ error: "businessId obrigatório" }, { status: 400 });
  }

  // Auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: business } = await adminSupabase
    .from("businesses")
    .select("id, google_account_id, google_location_id, user_id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });
  }

  if (!business.google_account_id || !business.google_location_id) {
    return NextResponse.json({ error: "Negócio sem conexão Google" }, { status: 422 });
  }

  try {
    const gFetch = await getGoogleFetch(user.id);
    const locationName = `${business.google_account_id}/locations/${business.google_location_id}`;

    const summary = await getInsightsSummary(gFetch, locationName, days);

    // Salvar snapshot no banco
    await adminSupabase.from("insights").insert({
      business_id: businessId,
      period_start: summary.period.start,
      period_end: summary.period.end,
      searches: summary.searches,
      views: summary.views,
      calls: summary.calls,
      direction_requests: summary.directionRequests,
      website_clicks: summary.websiteClicks,
    });

    return NextResponse.json({ insights: summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";

    if (message === "NO_GOOGLE_CONNECTION") {
      return NextResponse.json({ error: "Google não conectado" }, { status: 403 });
    }

    console.error("GET /api/google/insights error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
