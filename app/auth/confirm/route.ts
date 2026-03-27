/**
 * GET /auth/confirm?token_hash=...&type=email&next=/dashboard
 *
 * Supabase envia o usuário para cá após clicar no link de confirmação de e-mail.
 * Troca o token por uma sessão e redireciona para o destino.
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";

const APP_URL = process.env.NODE_ENV === "production"
  ? "https://vitrine-ai-five.vercel.app"
  : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${APP_URL}/login?error=link_invalido`);
  }

  const response = NextResponse.redirect(`${APP_URL}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Link expirado ou inválido.")}`
    );
  }

  return response;
}
