/**
 * GET /api/google/auth
 *
 * Inicia o fluxo OAuth 2.0 com o Google.
 * Redireciona o usuário para a tela de consentimento do Google.
 *
 * Segurança:
 * - Verifica sessão Supabase antes de redirecionar
 * - Grava user_id + nonce em cookies httpOnly para verificação no callback
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { buildAuthUrl } from "@/lib/google/oauth";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vitrine-ai-five.vercel.app"
    : "http://localhost:3000");

export async function GET(request: NextRequest) {
  // 1. Verificar autenticação Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${APP_URL}/login?error=config_error`);
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => { },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login?next=/conectar`);
  }

  // 2. Gerar state aleatório (previne CSRF)
  const state = randomBytes(16).toString("hex");

  // 3. Construir URL de autorização Google
  const authUrl = buildAuthUrl(state);

  // 4. Salvar state + userId em cookies httpOnly (TTL: 10 min)
  const response = NextResponse.redirect(authUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };

  response.cookies.set("_gbp_oauth_state", state, cookieOptions);
  response.cookies.set("_gbp_oauth_uid", user.id, cookieOptions);

  return response;
}
