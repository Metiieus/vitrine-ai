/**
 * GET /api/google/callback
 *
 * Recebe o redirect do Google após consentimento OAuth.
 * Troca o `code` por tokens, criptografa e salva no Supabase.
 * Redireciona para /conectar?step=select após sucesso.
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  exchangeCodeForTokens,
  getGoogleUserEmail,
} from "@/lib/google/oauth";
import { listAccounts } from "@/lib/google/business";
import { encrypt } from "@/lib/utils/encrypt";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vitrine-ai-five.vercel.app"
    : "http://localhost:3000");

function redirectError(msg: string) {
  return NextResponse.redirect(
    `${APP_URL}/conectar?error=${encodeURIComponent(msg)}`
  );
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.delete("_gbp_oauth_state");
  response.cookies.delete("_gbp_oauth_uid");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // Usuário cancelou no Google
  if (errorParam) {
    return redirectError("Acesso negado. Tente novamente.");
  }

  if (!code || !state) {
    return redirectError("Parâmetros inválidos no callback.");
  }

  // 1. Verificar state CSRF
  const storedState = request.cookies.get("_gbp_oauth_state")?.value;
  const userId = request.cookies.get("_gbp_oauth_uid")?.value;

  if (!storedState || storedState !== state) {
    return redirectError("State inválido. Reinicie o processo.");
  }

  if (!userId) {
    return redirectError("Sessão expirada. Faça login novamente.");
  }

  // 2. Trocar code por tokens
  const tokenData = await exchangeCodeForTokens(code);

  if (tokenData.error || !tokenData.access_token) {
    console.error("Token exchange failed:", tokenData.error_description);
    return redirectError("Falha ao obter tokens. Tente novamente.");
  }

  // 3. Buscar email da conta Google conectada
  const googleEmail = await getGoogleUserEmail(tokenData.access_token);

  // 4. Buscar ID da conta principal do Google Business
  let googleAccountId: string | null = null;
  try {
    const gFetch = async (url: string) => {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      return r.json();
    };
    const accounts = await listAccounts(gFetch);
    // Pega a primeira conta pessoal ou a primeira disponível
    const mainAccount =
      accounts.find((a) => a.type === "PERSONAL") ?? accounts[0];
    googleAccountId = mainAccount?.name ?? null;
  } catch (err) {
    console.warn("Could not fetch Google accounts:", err);
  }

  // 5. Criptografar tokens
  const expiresAt = new Date(
    Date.now() + (tokenData.expires_in ?? 3600) * 1000
  ).toISOString();

  const encryptedAccess = encrypt(tokenData.access_token);
  const encryptedRefresh = tokenData.refresh_token
    ? encrypt(tokenData.refresh_token)
    : null;

  // 6. Salvar/atualizar no Supabase (admin client — bypassa RLS)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => { } },
    }
  );

  const { error: upsertError } = await supabase
    .from("google_connections")
    .upsert(
      {
        user_id: userId,
        google_account_id: googleAccountId,
        google_email: googleEmail,
        access_token_enc: encryptedAccess,
        refresh_token_enc: encryptedRefresh,
        token_expires_at: expiresAt,
        scopes: tokenData.scope ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    console.error("Failed to save Google connection:", upsertError);
    // Para debug em produção, vamos passar o código do erro
    return redirectError(`Erro ao salvar conexão: ${upsertError.message || JSON.stringify(upsertError)}`);
  }

  // 7. Redirecionar para seleção de negócio
  const successUrl = new URL(`${APP_URL}/conectar`);
  successUrl.searchParams.set("step", "select");
  if (googleAccountId) {
    successUrl.searchParams.set("account", encodeURIComponent(googleAccountId));
  }

  const response = NextResponse.redirect(successUrl.toString());
  clearOAuthCookies(response);
  return response;
}
