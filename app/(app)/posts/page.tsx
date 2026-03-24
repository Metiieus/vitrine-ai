"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Plus,
  Image as ImageIcon,
  Calendar,
  Eye,
  Copy,
  Check,
  Tag,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_POSTS = [
  {
    id: "1",
    text: "🍕 Fim de semana chegou e a pizza perfeita também! Venha experimentar nosso novo sabor Trufa com Rúcula — disponível por tempo limitado. Reserve sua mesa agora pelo WhatsApp! #PizzaMoema #CasaDaPizza",
    createdAt: "Há 11 dias",
    hasImage: true,
    hasCta: true,
    views: 312,
  },
  {
    id: "2",
    text: "☕ Bom dia, Moema! Que tal uma pizza no almoço de hoje? Estamos abertos das 11h às 15h com buffet especial. Venha nos visitar! #AlmocoDePizza #Moema",
    createdAt: "Há 18 dias",
    hasImage: false,
    hasCta: true,
    views: 198,
  },
];

const TOPICS = [
  "Promoção da semana",
  "Novo produto/prato",
  "Horário especial",
  "Evento",
  "Depoimento de cliente",
  "Dica relacionada ao negócio",
];

// Dados do negócio mock — será substituído pelo negócio real do usuário
const MOCK_BUSINESS = {
  name: "Casa da Pizza",
  category: "Restaurante",
  city: "São Paulo",
  state: "SP",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostsPage() {
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setGenerated("");
    try {
      const resp = await fetch("/api/ai/google-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: MOCK_BUSINESS.name,
          category: MOCK_BUSINESS.category,
          city: MOCK_BUSINESS.city,
          state: MOCK_BUSINESS.state,
          topic: customTopic.trim() || topic,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Erro ao gerar post");
      setGenerated(data.text ?? "");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao gerar post");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[900px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
              Google Posts
            </h1>
            <p className="text-sm text-[#5a5f5c]">
              Gere e publique posts otimizados para SEO local
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#3DB88E] transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            Novo post com IA
          </button>
        </div>

        {/* Generator form */}
        {showForm && (
          <div className="bg-[#1a1f1c] border border-[rgba(29,158,117,0.2)] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-[#1D9E75]" />
              <h2 className="text-[15px] font-semibold text-[#FAFBFA]">
                Gerador de posts com IA
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-[#9a9f9c] mb-2 font-medium">
                  Tema do post
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTopic(t); setCustomTopic(""); }}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        topic === t && !customTopic
                          ? "bg-[rgba(29,158,117,0.15)] border-[rgba(29,158,117,0.3)] text-[#5DCAA5]"
                          : "border-[#2a2f2c] text-[#9a9f9c] hover:border-[#3a3f3c] hover:text-[#FAFBFA]"
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#9a9f9c] mb-2 font-medium">
                  Ou descreva o tema livremente
                </label>
                <textarea
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ex: Quero falar sobre nosso forno a lenha importado da Itália..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-[#0d1210] border border-[#2a2f2c] rounded-xl text-sm text-[#FAFBFA] placeholder-[#3a3f3c] focus:outline-none focus:border-[#1D9E75] transition-colors resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#3DB88E] transition-colors disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Gerando post..." : "Gerar post"}
            </button>

            {/* Generated result */}
            {generated && (
              <div className="mt-5 bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.15)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#1D9E75] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Post gerado
                  </span>
                  <span className="text-xs text-[#5a5f5c]">
                    {generated.length}/300 caracteres
                  </span>
                </div>
                <p className="text-sm text-[#dadedd] leading-relaxed mb-4">
                  {generated}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#1D9E75]" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copiado!" : "Copiar texto"}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1D9E75] text-white hover:bg-[#3DB88E] transition-colors">
                    <Eye className="w-3 h-3" />
                    Publicar no Google
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Regerar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing posts */}
        <h2 className="text-[15px] font-semibold text-[#FAFBFA] mb-4">
          Posts publicados
        </h2>

        <div className="flex flex-col gap-4">
          {MOCK_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5"
            >
              <p className="text-sm text-[#dadedd] leading-relaxed mb-4">
                {post.text}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 text-xs text-[#5a5f5c]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.views} visualizações
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {post.hasImage && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(29,158,117,0.1)] text-[#5DCAA5] flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Imagem
                    </span>
                  )}
                  {post.hasCta && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(93,202,165,0.1)] text-[#5DCAA5]">
                      CTA
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(29,158,117,0.1)] text-[#5DCAA5]">
                    Publicado
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty hint */}
        <div className="mt-6 p-4 bg-[rgba(239,159,39,0.05)] border border-[rgba(239,159,39,0.15)] rounded-xl">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-[#EF9F27] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#FAFBFA]">
                Meta: 4 posts por mês
              </p>
              <p className="text-xs text-[#5a5f5c] mt-0.5">
                Você publicou 1 post este mês. Posts frequentes aumentam sua
                visibilidade no Google Maps e melhoram seu score em +7 pontos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
