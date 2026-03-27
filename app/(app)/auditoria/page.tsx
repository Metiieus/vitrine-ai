"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getLatestAudit } from "@/lib/supabase/queries";
import {
  Camera,
  Info,
  Star,
  FileText,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: "photos" | "info" | "reviews" | "posts" | "geo";
  label: string;
  icon: any;
  score: number;
  max: number;
  color: string;
  items: Array<{ text: string; done: boolean; tip?: string }>;
};

type Audit = {
  id: string;
  score: number;
  details?: Record<string, any>;
  created_at: string;
};

type Business = {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
};

const CATEGORY_ICONS: Record<string, any> = {
  photos: Camera,
  info: Info,
  reviews: Star,
  posts: FileText,
  geo: Globe,
};

const CATEGORY_COLORS: Record<string, string> = {
  photos: "#5DCAA5",
  info: "#1D9E75",
  reviews: "#EF9F27",
  posts: "#EF9F27",
  geo: "#EF9F27",
};

const CATEGORY_LABELS: Record<string, string> = {
  photos: "Fotos e Mídia",
  info: "Informações e Categorias",
  reviews: "Reviews",
  posts: "Google Posts",
  geo: "Visibilidade em IAs — GEO",
};

const CATEGORY_MAX: Record<string, number> = {
  photos: 25,
  info: 25,
  reviews: 20,
  posts: 15,
  geo: 15,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryCard({
  category,
}: {
  category: Category;
}) {
  const Icon = CATEGORY_ICONS[category.id];
  const pct = Math.round((category.score / category.max) * 100);
  const done = category.items.filter((i) => i.done).length;

  return (
    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${category.color}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: category.color }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#FAFBFA]">
              {category.label}
            </h3>
            <p className="text-xs text-[#5a5f5c]">
              {done} de {category.items.length} itens completos
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-display font-bold"
            style={{ color: category.color }}
          >
            {category.score}
            <span className="text-sm font-normal text-[#5a5f5c]">
              /{category.max}
            </span>
          </div>
          <div className="text-xs text-[#5a5f5c]">{pct}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[#2a2f2c] mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: category.color }}
        />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {category.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-[#E24B4A] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-snug ${
                  item.done ? "text-[#9a9f9c]" : "text-[#dadedd]"
                }`}
              >
                {item.text}
              </p>
              {!item.done && item.tip && (
                <p className="text-xs text-[#5a5f5c] mt-0.5 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#EF9F27]" />
                  {item.tip}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditoriaPage() {
  const supabase = createClient();

  // State para dados reais
  const [audit, setAudit] = useState<Audit | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  // ✅ Carregar dados reais do Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }

        // Fetch businesses do usuário
        const { data: businesses, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.data.user.id)
          .limit(1);

        if (businessError || !businesses || businesses.length === 0) {
          setError("Nenhum negócio encontrado. Conecte um de seus negócios.");
          setLoading(false);
          return;
        }

        const currentBusiness = businesses[0] as Business;
        setBusiness(currentBusiness);

        // ✅ Buscar audit mais recente
        const { data: latestAudit, error: auditError } = await supabase
          .from("audits")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (auditError) throw auditError;

        if (!latestAudit) {
          setError("Nenhuma auditoria encontrada. Execute uma auditoria primeiramente.");
          setLoading(false);
          return;
        }

        const audit = latestAudit as Audit;
        setAudit(audit);

        // Construir categorias a partir do audit
        const builtCategories: Category[] = [
          "photos",
          "info",
          "reviews",
          "posts",
          "geo",
        ].map((catId) => {
          const details = audit.details?.[catId] || {};
          const score = details.score || 0;
          const max = CATEGORY_MAX[catId] || 15;

          return {
            id: catId as "photos" | "info" | "reviews" | "posts" | "geo",
            label: CATEGORY_LABELS[catId],
            icon: CATEGORY_ICONS[catId],
            score,
            max,
            color: CATEGORY_COLORS[catId],
            items: details.items || [
              { text: "Dados não disponíveis", done: false },
            ],
          };
        });

        setCategories(builtCategories);
        setTotalScore(audit.score || 0);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar auditoria"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const pending = categories.flatMap((c) =>
    c.items.filter((i) => !i.done)
  ).length;

  async function handleNewAudit() {
    try {
      const resp = await fetch("/api/audit/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business?.id }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Erro ao executar auditoria");
      }

      const newAudit = await resp.json() as Audit;
      setAudit(newAudit);

      // Reconstruir categorias com novos dados
      const builtCategories: Category[] = [
        "photos",
        "info",
        "reviews",
        "posts",
        "geo",
      ].map((catId) => {
        const details = newAudit.details?.[catId] || {};
        const score = details.score || 0;
        const max = CATEGORY_MAX[catId] || 15;

        return {
          id: catId as "photos" | "info" | "reviews" | "posts" | "geo",
          label: CATEGORY_LABELS[catId],
          icon: CATEGORY_ICONS[catId],
          score,
          max,
          color: CATEGORY_COLORS[catId],
          items: details.items || [
            { text: "Dados não disponíveis", done: false },
          ],
        };
      });

      setCategories(builtCategories);
      setTotalScore(newAudit.score || 0);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao executar auditoria");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[1100px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
                Auditoria completa
              </h1>
              <p className="text-sm text-[#5a5f5c]">
                {pending} melhorias identificadas
              </p>
            </div>
          </div>
          <button
            onClick={handleNewAudit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-sm text-[#9a9f9c] hover:text-[#FAFBFA] hover:border-[#3a3f3c] transition-all w-fit"
          >
            <RefreshCw className="w-4 h-4" />
            Nova auditoria
          </button>
        </div>

        {/* Score geral */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={totalScore} size={160} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#FAFBFA] mb-1">
              Score de saúde do perfil
            </h2>
            <p className="text-sm text-[#5a5f5c] mb-4">
              Baseado em 5 dimensões. Corrija os itens abaixo para aumentar seu
              score e aparecer mais no Google e nas IAs.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {categories.map((c) => {
                const pct = Math.round((c.score / c.max) * 100);
                return (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <div className="w-full h-1.5 rounded-full bg-[#2a2f2c] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: c.color }}
                      />
                    </div>
                    <span className="text-[10px] text-[#5a5f5c] text-center leading-tight">
                      {c.label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categories grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}
