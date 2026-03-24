/**
 * GET  /api/google/locations?account=accounts%2F123
 *   → Lista os negócios (locations) de uma conta Google Business
 *
 * POST /api/google/locations
 *   → Salva o negócio selecionado no Supabase (cria/atualiza em `businesses`)
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getGoogleFetch } from "@/lib/google/client";
import { listLocations, listAccounts } from "@/lib/google/business";

async function getUser(request: NextRequest) {
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
  return user;
}

// ── GET: listar locations ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const gFetch = await getGoogleFetch(user.id);

    // Parâmetro ?account=accounts%2F12345 (opcional — usa o 1º se não informado)
    let accountName = request.nextUrl.searchParams.get("account");

    if (!accountName) {
      const accounts = await listAccounts(gFetch);
      const main = accounts.find((a) => a.type === "PERSONAL") ?? accounts[0];
      if (!main) {
        return NextResponse.json({ error: "Nenhuma conta Google Business encontrada" }, { status: 404 });
      }
      accountName = main.name;
    }

    const locations = await listLocations(gFetch, accountName);

    return NextResponse.json({ locations, accountName });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";

    if (message === "NO_GOOGLE_CONNECTION") {
      return NextResponse.json(
        { error: "Google não conectado. Faça a autenticação primeiro." },
        { status: 403 }
      );
    }

    console.error("GET /api/google/locations error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST: salvar negócio selecionado ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    locationName: string; // "accounts/{id}/locations/{id}"
    accountName: string;
  };

  if (!body.locationName || !body.accountName) {
    return NextResponse.json({ error: "locationName e accountName são obrigatórios" }, { status: 400 });
  }

  try {
    const gFetch = await getGoogleFetch(user.id);

    // Buscar detalhes do location selecionado
    const { getLocation } = await import("@/lib/google/business");
    const location = await getLocation(gFetch, body.locationName);

    // Extrair dados estruturados
    const addr = location.storefrontAddress;
    const locationId = body.locationName.split("/").pop()!;

    // Buscar google_connection_id do usuário
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: conn } = await supabase
      .from("google_connections")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Criar ou atualizar o registro de negócio
    const { data: business, error } = await supabase
      .from("businesses")
      .upsert(
        {
          user_id: user.id,
          google_connection_id: conn?.id ?? null,
          google_account_id: body.accountName,
          google_location_id: locationId,
          name: location.title,
          category: location.categories?.primaryCategory?.displayName ?? null,
          address: addr?.addressLines?.join(", ") ?? null,
          city: addr?.locality ?? null,
          state: addr?.administrativeArea ?? null,
          phone: location.phoneNumbers?.primaryPhone ?? null,
          website: location.websiteUri ?? null,
          last_audit_at: null,
          audit_score: null,
        },
        {
          onConflict: "google_location_id",
          ignoreDuplicates: false,
        }
      )
      .select("id, name")
      .single();

    if (error) {
      console.error("Failed to save business:", error);
      return NextResponse.json({ error: "Erro ao salvar negócio" }, { status: 500 });
    }

    return NextResponse.json({ business, location });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("POST /api/google/locations error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
