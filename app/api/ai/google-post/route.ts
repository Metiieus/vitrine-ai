/**
 * POST /api/ai/google-post
 *
 * Gera um Google Post otimizado para SEO local usando Claude.
 *
 * Body: { businessName, category, city, state, topic?, tone?, includeCta? }
 * Returns: { text, cta, hashtags, charCount }
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BodySchema = z.object({
  businessName: z.string(),
  category: z.string().default("negócio"),
  city: z.string().default(""),
  state: z.string().default(""),
  topic: z.string().optional(),
  tone: z.enum(["casual", "professional", "promotional"]).default("casual"),
  includeCta: z.boolean().default(true),
  includeHashtags: z.boolean().default(true),
});

const TONE_DESCRIPTIONS = {
  casual: "descontraído, próximo e amigável — como se fosse um amigo recomendando",
  professional: "profissional e confiável — transmite autoridade e qualidade",
  promotional: "empolgante e persuasivo — foca nos benefícios e urgência",
};

function buildPrompt(data: z.infer<typeof BodySchema>): string {
  const { businessName, category, city, state, topic, tone, includeCta, includeHashtags } = data;
  const location = [city, state].filter(Boolean).join(", ");

  return `Crie um Google Post para "${businessName}", ${category}${location ? ` em ${location}` : ""}.

${topic ? `Tema/ocasião: ${topic}` : "Escolha um tema relevante e atual para o negócio (promoção, novidade, dica, destaque)."}

Tom: ${TONE_DESCRIPTIONS[tone]}

Requisitos do post:
- Máximo 1.500 caracteres (Google Posts têm esse limite)
- Comece de forma que chame atenção imediatamente (sem "Olá!" genérico)
- Inclua a cidade "${city || "da cidade"}" naturalmente para SEO local
- Use vocabulário cotidiano do brasileiro
${includeCta ? "- Inclua uma chamada para ação clara ao final" : ""}
${includeHashtags ? "- Adicione 3-5 hashtags relevantes no final (ex: #PizzaEmMoema #MelhoresPizzarias)" : ""}

Responda EXATAMENTE neste formato JSON (sem markdown, sem explicações):
{
  "text": "texto completo do post incluindo hashtags se solicitado",
  "cta": "texto curto do botão CTA (ex: 'Ligue agora', 'Saiba mais', 'Reserve')",
  "highlight": "frase de destaque de até 40 chars para o título do post"
}`;
}

export async function POST(request: NextRequest) {
  // Auth
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

  const raw = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system:
        "Você é especialista em marketing digital e SEO local para negócios brasileiros. " +
        "Cria Google Posts que geram engajamento e melhoram a visibilidade local. " +
        "Sempre responde em JSON válido conforme o formato solicitado.",
      messages: [{ role: "user", content: buildPrompt(parsed.data) }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

    // Limpar possível markdown do modelo
    const jsonStr = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    const postData = JSON.parse(jsonStr) as {
      text: string;
      cta: string;
      highlight: string;
    };

    return NextResponse.json({
      text: postData.text ?? "",
      cta: postData.cta ?? "Saiba mais",
      highlight: postData.highlight ?? "",
      charCount: (postData.text ?? "").length,
      model: "claude-sonnet-4-6",
      tokens: message.usage.output_tokens,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("AI google-post error:", msg);
    return NextResponse.json(
      { error: "Falha ao gerar post. Tente novamente." },
      { status: 500 }
    );
  }
}
