/**
 * POST /api/ai/review-response
 *
 * Gera uma resposta personalizada para uma avaliação do Google
 * usando o Claude (Anthropic API).
 *
 * Body: { reviewId, authorName, rating, text, businessName, category, city, state }
 * Returns: { response: string }
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import Anthropic from "@anthropic-ai/sdk";
import {
  checkRateLimit,
  unauthorizedError,
  badRequestError,
  rateLimitedError,
  internalError,
  sanitizeTextInput,
  logSecurityEvent,
  ReviewResponseSchema,
} from "@/lib/security";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RATE_LIMIT_CONFIG = {
  limit: 5,
  window: 60, // 5 respostas por minuto
};

function buildPrompt(data: {
  businessName: string;
  category: string;
  city: string;
  state: string;
  rating: number;
  authorName: string;
  text: string;
}): string {
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
  const requestId = crypto.randomUUID();

  try {
    // ✅ 1. AUTENTICAR
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedError(requestId);
    }

    // ✅ 2. RATE LIMITING
    const rateLimitCheck = await checkRateLimit(
      user.id,
      "ai.review-response",
      RATE_LIMIT_CONFIG.limit,
      RATE_LIMIT_CONFIG.window
    );

    if (!rateLimitCheck.success) {
      logSecurityEvent(
        "ai.rate_limited",
        { userId: user.id, endpoint: "review-response", requestId },
        "warning"
      );
      return rateLimitedError(RATE_LIMIT_CONFIG.window, requestId);
    }

    // ✅ 3. VALIDAR INPUT COM ZOD + SANITIZAR
    const raw = await request.json().catch(() => null);
    const validation = ReviewResponseSchema.safeParse(raw);

    if (!validation.success) {
      logSecurityEvent(
        "ai.invalid_input",
        { userId: user.id, errors: validation.error.flatten(), requestId },
        "warning"
      );
      return badRequestError(requestId);
    }

    const data = validation.data;

    // Sanitizar entradas de texto (contra XSS)
    const sanitizedData = {
      ...data,
      authorName: sanitizeTextInput(data.authorName),
      text: sanitizeTextInput(data.text),
      businessName: sanitizeTextInput(data.businessName),
      category: sanitizeTextInput(data.category),
      city: sanitizeTextInput(data.city),
    };

    // ✅ 4. CHAMAR API IA
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system:
          "Você é especialista em atendimento ao cliente para negócios locais brasileiros. " +
          "Gera respostas curtas, autênticas e personalizadas para avaliações do Google.",
        messages: [{ role: "user", content: buildPrompt(sanitizedData) }],
      });

      const responseText =
        message.content[0].type === "text" ? message.content[0].text.trim() : "";

      if (!responseText) {
        throw new Error("Empty AI response");
      }

      // ✅ 5. SALVAR NO BANCO (se reviewId fornecido)
      if (data.reviewId) {
        const adminSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { cookies: { getAll: () => [], setAll: () => {} } }
        );

        // Buscar businesses do usuário (autorização)
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

      logSecurityEvent(
        "ai.review_response_generated",
        { userId: user.id, rating: data.rating },
        "info"
      );

      return NextResponse.json({ response: responseText });
    } catch (aiError: unknown) {
      const errorMsg = aiError instanceof Error ? aiError.message : "AI service error";

      // ❌ NÃO expor detalhes da API externamente
      if (
        errorMsg.includes("API") ||
        errorMsg.includes("key") ||
        errorMsg.includes("quota")
      ) {
        logSecurityEvent(
          "ai.api_error",
          { userId: user.id, error: errorMsg, requestId },
          "error"
        );
        return internalError(new Error("Service unavailable"), requestId);
      }

      throw aiError;
    }
  } catch (error: unknown) {
    logSecurityEvent(
      "ai.error",
      { requestId, error: String(error) },
      "error"
    );
    return internalError(error, requestId);
  }
}
