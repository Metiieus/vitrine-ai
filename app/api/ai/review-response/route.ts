/**
 * POST /api/ai/review-response
 *
 * Gera uma resposta personalizada para uma avaliação do Google
 * usando o Claude (Anthropic API).
 *
 * Body: { reviewId, authorName, rating, text, businessName, category, city, state }
 * Returns: { response: string, reviewId: string }
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BodySchema = z.object({
  reviewId: z.string().optional(),
  authorName: z.string().default("Cliente"),
  rating: z.number().int().min(1).max(5),
  text: z.string().default(""),
  businessName: z.string(),
  category: z.string().default("negócio"),
  city: z.string().default(""),
  state: z.string().default(""),
});

function buildPrompt(data: z.infer<typeof BodySchema>): string {
  const { businessName, category, city, state, rating, authorName, text } = data;

  const location = [city, state].filter(Boolean).join(", ");
  const locationStr = location ? ` em ${location}` : "";

  const toneGuide =
    rating >= 4
      ? "caloroso, grato e entusiasmado — reforce o que foi elogiado especificamente"
      : rating === 3
      ? "positivo e construtivo — agradeça o feedback honesto e mencione melhorias concretas"
      : "empático e resolutivo — peça desculpas genuínas, mostre que vai melhorar, ofereça resolver";

  const strategy =
    rating >= 4
      ? "Agradeça o cliente pelo nome, reforce o elogio específico, e convide a retornar."
      : rating === 3
      ? "Agradeça o feedback, reconheça o ponto de melhoria mencionado, e convide a dar uma nova chance."
      : "Peça desculpas sem ser defensivo, mostre empatia real, ofereça uma solução (ex: contato direto) e convide a retornar.";

  return `Você é o responsável pelo atendimento de "${businessName}", ${category}${locationStr}, Brasil.

Avaliação recebida no Google Meu Negócio:
- Avaliador: ${authorName}
- Estrelas: ${rating}/5
- Comentário: "${text || "Sem comentário escrito"}"

Tom: ${toneGuide}

Estratégia: ${strategy}

Regras obrigatórias:
- Escreva em português brasileiro natural
- Máximo de 4 frases curtas
- Não comece com "Olá", "Prezado(a)" ou o nome da pessoa isolado
- Mencione "${businessName}" pelo menos uma vez de forma natural
- Termine com um convite genuíno para retornar
- Sem emojis em excesso (máximo 1)
- Não invente informações que não estejam na avaliação

Responda APENAS com o texto da resposta, sem aspas, sem explicações.`;
}

export async function POST(request: NextRequest) {
  // Verificar autenticação
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Validar body
  const raw = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Verificar quota do plano (plano free: 5/mês)
  // TODO: implementar contador por user/mês

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system:
        "Você é especialista em atendimento ao cliente para negócios locais brasileiros. " +
        "Gera respostas curtas, autênticas e personalizadas para avaliações do Google.",
      messages: [{ role: "user", content: buildPrompt(data) }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    if (!responseText) {
      throw new Error("Resposta vazia do modelo");
    }

    // Salvar resposta gerada no banco (se reviewId fornecido)
    if (data.reviewId) {
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      );

      // Busca os business_ids do usuário primeiro
      const { data: businesses } = await adminSupabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id);

      const businessIds = (businesses ?? []).map((b: { id: string }) => b.id);

      if (businessIds.length > 0) {
        await adminSupabase
          .from("reviews")
          .update({
            ai_response: responseText,
            response_status: "generated",
          })
          .eq("id", data.reviewId)
          .in("business_id", businessIds);
      }
    }

    return NextResponse.json({
      response: responseText,
      reviewId: data.reviewId ?? null,
      model: "claude-sonnet-4-6",
      tokens: message.usage.output_tokens,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("AI review-response error:", message);
    return NextResponse.json(
      { error: "Falha ao gerar resposta. Tente novamente." },
      { status: 500 }
    );
  }
}
