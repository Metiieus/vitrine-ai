/**
 * CRON JOB — Google Token Refresh
 * 
 * Rota: GET /api/cron/google-token-refresh
 * Executado via: Vercel Cron (free tier) ou manual trigger
 * 
 * Configurado em vercel.json:
 * Executa a cada 1 hora: "0 * * * *" (Vercel cron syntax)
 */

import { NextRequest, NextResponse } from "next/server";
import { refreshExpiredTokens } from "@/lib/google/token-refresh";

export const dynamic = "force-dynamic";

/**
 * Validar secret para evitar abuse (cron job públicos são vulneáveis)
 */
function validateCronSecret(request: NextRequest): boolean {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");

  // Secret deve estar em .env (gerado com: openssl rand -hex 32)
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || !secret) {
    console.warn("[Cron] Tentativa sem secret");
    return false;
  }

  // Timing-safe comparison (evitar timing attacks)
  const crypto = require("crypto");
  return crypto.timingSafeEqual(
    Buffer.from(secret),
    Buffer.from(expectedSecret)
  );
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // ✅ Validar secret
    if (!validateCronSecret(request)) {
      console.error(`[Cron ${requestId}] Secret inválido`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Cron ${requestId}] Iniciando token refresh...`);

    // ✅ Executar refresh de tokens
    const result = await refreshExpiredTokens(1); // Renovar se expiram em < 1h

    console.log(`[Cron ${requestId}] Resultado:`, result);

    return NextResponse.json(
      {
        success: true,
        message: "Token refresh completado",
        requestId,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[Cron ${requestId}] Erro:`, error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
        requestId,
      },
      { status: 500 }
    );
  }
}
