/**
 * GET /api/google/reviews?businessId={uuid}&pageToken={token}
 *
 * Puxa reviews do Google Business e sincroniza com a tabela `reviews`.
 * Retorna reviews paginados + contagem total.
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getGoogleFetch } from "@/lib/google/client";
import { listReviews, starRatingToNumber } from "@/lib/google/business";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get("businessId");
  const pageToken = searchParams.get("pageToken") ?? undefined;
  const sync = searchParams.get("sync") === "true";

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

  // Buscar dados do negócio (verificar que pertence ao usuário)
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

    const { reviews, nextPageToken, totalReviewCount, averageRating } =
      await listReviews(gFetch, locationName, pageToken);

    // Sincronizar com banco (upsert) se solicitado ou sem pageToken (primeira página)
    if (sync || !pageToken) {
      const rows = reviews.map((r) => ({
        business_id: businessId,
        google_review_id: r.reviewId,
        author_name: r.reviewer.displayName,
        rating: starRatingToNumber(r.starRating),
        text: r.comment ?? null,
        response_status: r.reviewReply ? "published" : "pending",
        created_at: r.createTime,
      }));

      if (rows.length > 0) {
        await adminSupabase
          .from("reviews")
          .upsert(rows, { onConflict: "google_review_id", ignoreDuplicates: true });
      }

      // Atualizar rating e contagem no negócio
      if (averageRating || totalReviewCount) {
        await adminSupabase
          .from("businesses")
          .update({
            google_rating: averageRating ?? null,
            total_reviews: totalReviewCount ?? null,
          })
          .eq("id", businessId);
      }
    }

    return NextResponse.json({
      reviews,
      nextPageToken,
      totalReviewCount,
      averageRating,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";

    if (message === "NO_GOOGLE_CONNECTION") {
      return NextResponse.json({ error: "Google não conectado" }, { status: 403 });
    }

    console.error("GET /api/google/reviews error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
