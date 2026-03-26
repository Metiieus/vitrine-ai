/**
 * GET /api/auth/callback?code=...&next=/dashboard
 *
 * Callback para OAuth com Google via Supabase Auth (login social).
 * Diferente de /api/google/callback que é para a Google Business Profile API.
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_sem_code`);
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

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase OAuth callback error:", error.message);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_falhou`);
  }

  // 🔄 RECUPERAR BUSINESS URL DO COOKIE SE EXISTIR
  const businessUrlCookie = request.cookies.get("sb_onboarding_business_url")?.value;
  if (businessUrlCookie && session?.user) {
    const businessUrl = decodeURIComponent(businessUrlCookie);

    // Atualiza metadados do usuário
    await supabase.auth.updateUser({
      data: { onboarding_business_url: businessUrl }
    });

    // Limpa o cookie
    response.cookies.delete("sb_onboarding_business_url");
  }

  return response;
}
