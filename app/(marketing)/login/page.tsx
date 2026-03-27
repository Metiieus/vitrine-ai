"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessUrl, setBusinessUrl] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("E-mail ou senha incorretos.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            onboarding_business_url: businessUrl,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else if (data.user && data.session) {
        // Se já estiver logado (auto-confirm on), vai pro dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccess("Conta criada! Verifique seu e-mail para confirmar seu cadastro.");
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setGoogleLoading(true);

    // Se houver uma URL de negócio, salvar temporariamente em um cookie
    // para que o callback da API possa recuperar e salvar no perfil do usuário
    if (businessUrl) {
      document.cookie = `sb_onboarding_business_url=${encodeURIComponent(businessUrl)}; path=/; max-age=3600; SameSite=Lax`;
    }

    const redirectTo = process.env.NODE_ENV === "production"
      ? "https://vitrine-ai-five.vercel.app/api/auth/callback?next=/dashboard"
      : `${window.location.origin}/api/auth/callback?next=/dashboard`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(29,158,117,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <LogoMark />
            <span className="text-xl font-semibold text-[#FAFBFA]">
              vitrine<span className="text-[#1D9E75]">.ai</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
            {tab === "login" ? "Bem-vindo de volta" : "Criar conta grátis"}
          </h1>
          <p className="text-sm text-[#5a5f5c] mt-1">
            {tab === "login"
              ? "Acesse seu painel"
              : "14 dias grátis, sem cartão"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex bg-[#0d1210] rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === t
                  ? "bg-[#1D9E75] text-white"
                  : "text-[#5a5f5c] hover:text-[#9a9f9c]"
                  }`}
              >
                {t === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-[#2a2f2c] text-sm text-[#dadedd] hover:border-[#3a3f3c] hover:bg-[rgba(255,255,255,0.03)] transition-all disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#2a2f2c]" />
            <span className="text-xs text-[#5a5f5c]">ou</span>
            <div className="flex-1 h-px bg-[#2a2f2c]" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-[#9a9f9c] mb-1.5 font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5f5c]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0d1210] border border-[#2a2f2c] rounded-xl text-sm text-[#FAFBFA] placeholder-[#3a3f3c] focus:outline-none focus:border-[#1D9E75] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#9a9f9c] mb-1.5 font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5f5c]" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#0d1210] border border-[#2a2f2c] rounded-xl text-sm text-[#FAFBFA] placeholder-[#3a3f3c] focus:outline-none focus:border-[#1D9E75] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5f5c] hover:text-[#9a9f9c]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {tab === "signup" && (
              <div>
                <label className="block text-xs text-[#9a9f9c] mb-1.5 font-medium">
                  Link do seu negócio no Google Maps (opcional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={businessUrl}
                    onChange={(e) => setBusinessUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-4 py-2.5 bg-[#0d1210] border border-[#2a2f2c] rounded-xl text-sm text-[#FAFBFA] placeholder-[#3a3f3c] focus:outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[#5a5f5c] mt-1.5 px-1 leading-tight">
                  Isso ajuda a configurar seu dashboard mais rápido.
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs text-[#F09595] bg-[rgba(226,75,74,0.1)] border border-[rgba(226,75,74,0.2)] rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-[#5DCAA5] bg-[rgba(93,202,165,0.1)] border border-[rgba(93,202,165,0.2)] rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#3DB88E] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#5a5f5c] mt-4">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/termos" className="text-[#1D9E75] hover:underline">
            Termos de Uso
          </Link>
        </p>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="20" rx="3" stroke="#1D9E75" strokeWidth="2" />
      <rect x="6" y="6" width="20" height="6" rx="1.5" fill="rgba(29,158,117,.2)" stroke="#1D9E75" strokeWidth="1" />
      <rect x="8" y="15" width="7" height="6" rx="1.5" fill="rgba(93,202,165,.25)" />
      <rect x="17" y="15" width="7" height="6" rx="1.5" fill="rgba(93,202,165,.15)" />
      <circle cx="16" cy="29" r="2.5" fill="#1D9E75" />
      <line x1="16" y1="24" x2="16" y2="26.5" stroke="#1D9E75" strokeWidth="1.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
