"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GBPLocation {
  name: string;
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
  };
  categories?: {
    primaryCategory?: { displayName: string };
  };
  phoneNumbers?: { primaryPhone?: string };
  websiteUri?: string;
}

type Step = "initial" | "loading_locations" | "select" | "saving" | "success" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export function ConnectBusiness() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>("initial");
  const [locations, setLocations] = useState<GBPLocation[]>([]);
  const [accountName, setAccountName] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<GBPLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Detecta retorno do OAuth
  useEffect(() => {
    const oauthStep = searchParams.get("step");
    const account = searchParams.get("account");
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      setStep("error");
      return;
    }

    if (oauthStep === "select") {
      setStep("loading_locations");
      fetchLocations(account ? decodeURIComponent(account) : undefined);
    }
  }, [searchParams]);

  async function fetchLocations(account?: string) {
    setStep("loading_locations");
    try {
      const url = new URL("/api/google/locations", window.location.origin);
      if (account) url.searchParams.set("account", account);

      const resp = await fetch(url.toString());
      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error ?? "Erro ao buscar negócios");

      setLocations(data.locations ?? []);
      setAccountName(data.accountName ?? "");
      setStep("select");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar negócios";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  async function saveLocation(location: GBPLocation) {
    setSelectedLocation(location);
    setStep("saving");

    try {
      const resp = await fetch("/api/google/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: location.name,
          accountName,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Erro ao salvar negócio");

      setStep("success");

      // Redireciona para dashboard após 1.5s
      setTimeout(() => router.push("/dashboard?connected=true"), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  // ── Renders ───────────────────────────────────────────────────────────────

  if (step === "initial") {
    return <StepInitial />;
  }

  if (step === "loading_locations") {
    return (
      <StepLoading message="Buscando seus negócios no Google..." />
    );
  }

  if (step === "select") {
    return (
      <StepSelectLocation
        locations={locations}
        onSelect={saveLocation}
        onBack={() => setStep("initial")}
      />
    );
  }

  if (step === "saving") {
    return (
      <StepLoading
        message={`Conectando "${selectedLocation?.title}"...`}
      />
    );
  }

  if (step === "success") {
    return <StepSuccess businessName={selectedLocation?.title ?? ""} />;
  }

  if (step === "error") {
    return (
      <StepError
        message={errorMsg}
        onRetry={() => setStep("initial")}
      />
    );
  }

  return null;
}

// ── Sub-steps ─────────────────────────────────────────────────────────────────

function StepInitial() {
  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(29,158,117,0.12)] flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-[#1D9E75]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#FAFBFA] mb-2">
          Conectar Google Meu Negócio
        </h2>
        <p className="text-sm text-[#9a9f9c] leading-relaxed">
          Conecte seu perfil do Google para ver o score de saúde, receber
          tarefas semanais e monitorar avaliações — tudo em um lugar só.
        </p>
      </div>

      {/* Benefits */}
      <ul className="flex flex-col gap-3 mb-8">
        {[
          "Score de saúde 0-100 do seu perfil",
          "Respostas a reviews com IA em 1 clique",
          "Monitor GEO: você no ChatGPT, Gemini e Perplexity",
          "Métricas: buscas, visualizações, ligações e rotas",
        ].map((benefit) => (
          <li key={benefit} className="flex items-center gap-3 text-sm text-[#9a9f9c]">
            <CheckCircle className="w-4 h-4 text-[#1D9E75] flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>

      <a
        href="/api/google/auth"
        className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-[#1D9E75] text-white font-medium text-[15px] hover:bg-[#3DB88E] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(29,158,117,0.3)]"
      >
        <GoogleIcon />
        Conectar com Google
      </a>

      <p className="text-center text-[11px] text-[#5a5f5c] mt-4 leading-relaxed">
        Usamos a API oficial do Google Business Profile.
        <br />
        Nunca postamos nada sem sua aprovação.
      </p>
    </div>
  );
}

function StepLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
      <p className="text-sm text-[#9a9f9c]">{message}</p>
    </div>
  );
}

function StepSelectLocation({
  locations,
  onSelect,
  onBack,
}: {
  locations: GBPLocation[];
  onSelect: (l: GBPLocation) => void;
  onBack: () => void;
}) {
  if (locations.length === 0) {
    return (
      <div className="max-w-md w-full text-center py-12">
        <Building2 className="w-12 h-12 text-[#5a5f5c] mx-auto mb-4" />
        <h3 className="text-[#FAFBFA] font-semibold mb-2">
          Nenhum negócio encontrado
        </h3>
        <p className="text-sm text-[#9a9f9c] mb-6">
          Sua conta Google não tem perfis no Google Meu Negócio.
          Crie um em{" "}
          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D9E75] underline"
          >
            business.google.com
          </a>{" "}
          e tente novamente.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-[#5a5f5c] hover:text-[#9a9f9c] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <h2 className="font-display text-xl font-bold text-[#FAFBFA]">
          Selecione seu negócio
        </h2>
        <p className="text-sm text-[#9a9f9c] mt-1">
          {locations.length} negócio{locations.length !== 1 ? "s" : ""} encontrado
          {locations.length !== 1 ? "s" : ""} na sua conta Google.
        </p>
      </div>

      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {locations.map((loc) => {
          const addr = loc.storefrontAddress;
          const city = addr?.locality;
          const state = addr?.administrativeArea;
          const address = addr?.addressLines?.join(", ");

          return (
            <button
              key={loc.name}
              onClick={() => onSelect(loc)}
              className="group flex items-center gap-4 p-4 rounded-xl border border-[#2a2f2c] bg-[#1a1f1c] text-left hover:border-[rgba(29,158,117,0.3)] hover:bg-[rgba(29,158,117,0.04)] transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {loc.title.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#FAFBFA] truncate">
                  {loc.title}
                </div>
                {loc.categories?.primaryCategory?.displayName && (
                  <div className="text-xs text-[#5DCAA5] mt-0.5">
                    {loc.categories.primaryCategory.displayName}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 mt-1">
                  {city && (
                    <span className="flex items-center gap-1 text-[11px] text-[#5a5f5c]">
                      <MapPin className="w-3 h-3" />
                      {city}{state ? `, ${state}` : ""}
                    </span>
                  )}
                  {!city && address && (
                    <span className="flex items-center gap-1 text-[11px] text-[#5a5f5c]">
                      <MapPin className="w-3 h-3" />
                      {address}
                    </span>
                  )}
                  {loc.phoneNumbers?.primaryPhone && (
                    <span className="flex items-center gap-1 text-[11px] text-[#5a5f5c]">
                      <Phone className="w-3 h-3" />
                      {loc.phoneNumbers.primaryPhone}
                    </span>
                  )}
                  {loc.websiteUri && (
                    <span className="flex items-center gap-1 text-[11px] text-[#5a5f5c]">
                      <Globe className="w-3 h-3" />
                      {loc.websiteUri.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#3a3f3c] group-hover:text-[#1D9E75] transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSuccess({ businessName }: { businessName: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[rgba(29,158,117,0.12)] flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-[#1D9E75]" />
      </div>
      <h3 className="font-display text-xl font-bold text-[#FAFBFA]">
        Conectado com sucesso!
      </h3>
      <p className="text-sm text-[#9a9f9c]">
        <span className="text-[#FAFBFA] font-medium">{businessName}</span> foi
        conectado. Redirecionando para o dashboard...
      </p>
      <Loader2 className="w-5 h-5 text-[#1D9E75] animate-spin mt-2" />
    </div>
  );
}

function StepError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center max-w-sm">
      <div className="w-14 h-14 rounded-full bg-[rgba(226,75,74,0.1)] flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-[#E24B4A]" />
      </div>
      <h3 className="font-semibold text-[#FAFBFA]">Algo deu errado</h3>
      <p className="text-sm text-[#9a9f9c]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 px-6 py-2.5 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-sm text-[#9a9f9c] hover:text-[#FAFBFA] hover:border-[#3a3f3c] transition-all"
      >
        Tentar novamente
      </button>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
