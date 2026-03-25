"use client";

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  CreditCard,
  LogOut,
  Check,
  Shield,
  Bell,
  Link as LinkIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ─── Planos ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "essential",
    name: "Essencial",
    price: "R$89,90",
    period: "/mês",
    color: "#5DCAA5",
    current: false,
    highlight: false,
    features: [
      "Auditoria completa + score 0-100",
      "10 respostas IA para reviews/mês",
      "4 Google Posts com IA por mês",
      "Monitor GEO (2 IAs: Gemini + ChatGPT)",
      "Alertas de novas avaliações",
      "Relatório mensal básico",
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    price: "R$179,90",
    period: "/mês",
    color: "#1D9E75",
    current: true,
    highlight: true,
    features: [
      "Tudo do Essencial",
      "Respostas IA ilimitadas",
      "Google Posts ilimitados",
      "Monitor GEO (5 IAs completo)",
      "Competitor Radar (3 concorrentes)",
      "Calendário de conteúdo com IA",
      "Campanha de pedido de reviews",
      "Alertas WhatsApp",
      "Relatório PDF mensal",
    ],
  },
  {
    id: "agency",
    name: "Agência",
    price: "R$399,90",
    period: "/mês",
    color: "#EF9F27",
    current: false,
    highlight: false,
    features: [
      "Tudo do Profissional",
      "RadarLocal — heat map de ranking",
      "Até 10 perfis de negócio",
      "Competitor Radar (10 concorrentes)",
      "Resposta automática a 5★ (com aprovação)",
      "White-label completo",
      "Acesso à API",
      "Suporte prioritário via WhatsApp",
    ],
  },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#2a2f2c]">
        <div className="w-8 h-8 rounded-lg bg-[rgba(29,158,117,0.1)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#1D9E75]" />
        </div>
        <h2 className="text-[15px] font-semibold text-[#FAFBFA]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
}) {
  const [val, setVal] = useState(value);
  return (
    <div>
      <label className="block text-xs text-[#9a9f9c] mb-1.5 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0d1210] border border-[#2a2f2c] rounded-xl text-sm text-[#FAFBFA] placeholder-[#3a3f3c] focus:outline-none focus:border-[#1D9E75] transition-colors"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    newReview: true,
    weeklyReport: true,
    geoAlert: false,
    tips: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      setUser(authUser);

      // Buscar dados do negócio
      const { data: businesses } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", authUser.id)
        .limit(1);

      if (businesses && businesses.length > 0) {
        setBusiness(businesses[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const userEmail = user?.email || "seu-email@exemplo.com";
  const initials = (business?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/"); // Volta para home (landing page)
  }

  async function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[800px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
              Configurações
            </h1>
            <p className="text-sm text-[#5a5f5c]">Gerencie sua conta</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">

          {/* Perfil */}
          <Section title="Perfil" icon={User}>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <Field label="Nome" value={user?.user_metadata?.name || ""} />
              <Field label="E-mail" value={userEmail} />
              <Field label="Telefone" value={user?.user_metadata?.phone || ""} type="tel" />
              <Field label="WhatsApp para suporte" value="" placeholder="(11) 99999-9999" type="tel" />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#3DB88E] transition-colors"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? "Salvo!" : "Salvar alterações"}
            </button>
          </Section>

          {/* Negócio */}
          <Section title="Negócio conectado" icon={Building2}>
            {business ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.15)] rounded-xl mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#FAFBFA]">
                      {business.name}
                    </div>
                    <div className="text-xs text-[#5a5f5c] mt-0.5">
                      {business.category} • {business.city}, {business.state}
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <Field label="Nome do negócio" value={business.name || ""} />
                  <Field label="Categoria" value={business.category || ""} />
                  <Field label="Cidade" value={business.city || ""} />
                  <Field label="Estado" value={business.state || ""} />
                </div>
                <a
                  href="/conectar"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold outline-dashed outline-[#1D9E75] text-[#1D9E75] hover:bg-[rgba(29,158,117,0.1)] transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Conectar outro negócio
                </a>
              </>
            ) : (
              <div className="p-4 text-center text-[#5a5f5c]">
                <p className="text-sm mb-3">Nenhum negócio conectado ainda</p>
                <a
                  href="/conectar"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#3DB88E] transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Conectar Google Meu Negócio
                </a>
              </div>
            )}
          </Section>

          {/* Plano */}
          <Section title="Plano e cobrança" icon={CreditCard}>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 relative ${
                    plan.current
                      ? "border-[rgba(29,158,117,0.4)] bg-[rgba(29,158,117,0.07)]"
                      : plan.highlight
                      ? "border-[rgba(29,158,117,0.25)] bg-[rgba(29,158,117,0.03)]"
                      : "border-[#2a2f2c] bg-[#0d1210]"
                  }`}
                >
                  {plan.current && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D9E75] text-white whitespace-nowrap">
                      Plano atual
                    </span>
                  )}
                  {!plan.current && plan.highlight && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F6E56] text-[#5DCAA5] whitespace-nowrap border border-[rgba(93,202,165,0.3)]">
                      Mais popular
                    </span>
                  )}
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: plan.color }}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-0.5 mb-3">
                    <span className="text-xl font-display font-bold text-[#FAFBFA]">
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#5a5f5c]">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-[#9a9f9c]">
                        <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!plan.current && (
                    <button
                      className="w-full py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: plan.color + "44",
                        color: plan.color,
                      }}
                    >
                      {plan.id === "agency" ? "Falar com vendas" : "Fazer upgrade"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-[#5a5f5c]">
              <span>Próxima cobrança: 24/04/2026</span>
              <button className="text-[#E24B4A] hover:underline">
                Cancelar plano
              </button>
            </div>
          </Section>

          {/* Notificações */}
          <Section title="Notificações" icon={Bell}>
            <div className="flex flex-col gap-3">
              {[
                { key: "newReview", label: "Nova avaliação recebida", desc: "Alerta quando chegar uma review nova" },
                { key: "weeklyReport", label: "Relatório semanal", desc: "Resumo de performance toda segunda-feira" },
                { key: "geoAlert", label: "Alerta de GEO", desc: "Quando sua presença em IAs mudar" },
                { key: "tips", label: "Dicas de otimização", desc: "Sugestões personalizadas por e-mail" },
              ].map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between py-3 border-b border-[#1e2320] last:border-0"
                >
                  <div>
                    <div className="text-sm text-[#dadedd]">{n.label}</div>
                    <div className="text-xs text-[#5a5f5c] mt-0.5">{n.desc}</div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [n.key]: !prev[n.key as keyof typeof prev],
                      }))
                    }
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      notifications[n.key as keyof typeof notifications]
                        ? "bg-[#1D9E75]"
                        : "bg-[#2a2f2c]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications[n.key as keyof typeof notifications]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Segurança */}
          <Section title="Segurança" icon={Shield}>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <span className="text-sm text-[#dadedd]">Alterar senha</span>
                <ChevronRight className="w-4 h-4 text-[#5a5f5c]" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <span className="text-sm text-[#dadedd]">Autenticação em dois fatores</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5a5f5c]">Desativada</span>
                  <ChevronRight className="w-4 h-4 text-[#5a5f5c]" />
                </div>
              </button>
              <button className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <span className="text-sm text-[#dadedd]">Sessões ativas</span>
                <ChevronRight className="w-4 h-4 text-[#5a5f5c]" />
              </button>
            </div>
          </Section>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[rgba(226,75,74,0.2)] text-[#E24B4A] text-sm font-medium hover:bg-[rgba(226,75,74,0.05)] transition-colors disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {loggingOut ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
