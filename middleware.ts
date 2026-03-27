import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { CSP_HEADERS } from "@/lib/security";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // ✅ ROTAS PROTEGIDAS
  const protectedPaths = ["/dashboard", "/auditoria", "/reviews", "/posts", "/geo", "/relatorios", "/configuracoes", "/conectar"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Só executa getUser se for rota protegida ou login
  const shouldCheckAuth = isProtected || pathname === "/login";

  let user = null;
  if (shouldCheckAuth) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // ✅ ADICIONAR SECURITY HEADERS
  const secureResponse = supabaseResponse;

  secureResponse.headers.set("X-Frame-Options", "DENY");
  secureResponse.headers.set("X-Content-Type-Options", "nosniff");
  secureResponse.headers.set("X-XSS-Protection", "1; mode=block");
  secureResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  secureResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  secureResponse.headers.set("Set-Cookie", `SameSite=Strict; Secure`);

  if (process.env.NODE_ENV === "production") {
    secureResponse.headers.set("Content-Security-Policy", CSP_HEADERS["Content-Security-Policy"]);
  }

  // Proteção de rotas
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    secureResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set({ ...cookie });
    });
    return redirectResponse;
  }

  // Redireciona se já logado
  if (user && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    secureResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set({ ...cookie });
    });
    return redirectResponse;
  }

  return secureResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
