import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { CSP_HEADERS } from "@/lib/security";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ✅ ADICIONAR SECURITY HEADERS GLOBAIS
  // Copiar headers da resposta Supabase
  const secureResponse = supabaseResponse;
  
  // Anti-clickjacking
  secureResponse.headers.set("X-Frame-Options", "DENY");
  
  // Previne MIME type sniffing
  secureResponse.headers.set("X-Content-Type-Options", "nosniff");
  
  // Legacy XSS protection
  secureResponse.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Referrer policy (não vazar URLs)
  secureResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissões de features perigosas
  secureResponse.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payments=()"
  );
  
  // SameSite cookies por padrão
  secureResponse.headers.set("Set-Cookie", `SameSite=Strict; Secure`);

  // ✅ CONTENT SECURITY POLICY (rígida)
  if (process.env.NODE_ENV === "production") {
    secureResponse.headers.set("Content-Security-Policy", CSP_HEADERS["Content-Security-Policy"]);
  }

  // Rotas protegidas — exigem autenticação
  const protectedPaths = ["/dashboard", "/auditoria", "/reviews", "/posts", "/geo", "/relatorios", "/configuracoes", "/conectar"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redireciona usuário logado para fora de /login
  if (user && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return secureResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
