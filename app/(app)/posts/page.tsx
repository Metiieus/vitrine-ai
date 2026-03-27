"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type Business = {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  status: "draft" | "scheduled" | "published";
  media_url: string | null;
};

const TOPICS = [
  "Promoção da semana",
  "Novo produto/prato",
  "Horário especial",
  "Evento",
  "Depoimento de cliente",
  "Dica relacionada ao negócio",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostsPage() {
  const supabase = createClient();

  // State para dados reais
  const [posts, setPosts] = useState<Post[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State do formulário
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

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
        const { data: businesses, error: businessError } = (await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.data.user.id)
          .limit(1)) as { data: any[]; error: any };

        if (businessError || !businesses || businesses.length === 0) {
          setError("Nenhum negócio encontrado. Conecte um de seus negócios.");
          setLoading(false);
          return;
        }

        const currentBusiness = businesses[0];
        setBusiness(currentBusiness);

        // ✅ Fetch posts REAIS deste negócio
        const { data: realPosts, error: postError } = (await supabase
          .from("google_posts")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })) as { data: any[]; error: any };

        if (postError) throw postError;

        setPosts(realPosts || []);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar posts"
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

  async function handleGenerate() {
    setGenerating(true);
    setGenerated("");
    try {
      const resp = await fetch("/api/ai/google-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business!.name,
          category: business!.category,
          city: business!.city,
          state: business!.state,
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

  async function handlePublish() {
    if (!generated || !business) return;

    try {
      const { data, error: insertError } = await supabase
        .from("google_posts")
        .insert({
          business_id: business.id,
          content: generated,
          status: "draft",
          created_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Atualizar lista local
      setPosts([data, ...posts]);
      setGenerated("");
      setShowForm(false);
      alert("Post salvo com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao publicar post");
    }
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
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${topic === t && !customTopic
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
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1D9E75] text-white hover:bg-[#3DB88E] transition-colors"
                  >
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
          {posts.length === 0 ? (
            <div className="text-center py-8 text-[#5a5f5c]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum post publicado ainda</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5"
              >
                <p className="text-sm text-[#dadedd] leading-relaxed mb-4">
                  {post.content}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4 text-xs text-[#5a5f5c]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.media_url && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(29,158,117,0.1)] text-[#5DCAA5] flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Imagem
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded ${post.status === "published"
                      ? "bg-[rgba(29,158,117,0.1)] text-[#5DCAA5]"
                      : post.status === "scheduled"
                        ? "bg-[rgba(239,159,39,0.1)] text-[#EF9F27]"
                        : "bg-[rgba(93,202,165,0.1)] text-[#5DCAA5]"
                      }`}>
                      {post.status === "published" ? "Publicado" : post.status === "scheduled" ? "Agendado" : "Rascunho"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
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
