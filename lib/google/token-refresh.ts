/**
 * Google OAuth Token Refresh
 * Renova tokens automaticamente antes de expirar
 * 
 * Executado via Vercel Cron ou Supabase Edge Function
 */

import { createServerClient } from "@supabase/ssr";
import { refreshAccessToken } from "./oauth";
import { encrypt, decrypt } from "@/lib/utils/encrypt";

/**
 * 🔄 Renovar token expirado ou próximo a expirar
 * @param userId - User ID
 * @param refreshToken - Token de refresh (descriptografado)
 * @returns Novo access token (encriptografado)
 */
export async function refreshGoogleToken(
  userId: string,
  refreshTokenEnc: string
): Promise<{
  newAccessToken: string;
  newRefreshToken?: string;
  expiresAt: string;
  success: boolean;
  error?: string;
}> {
  try {
    // 1. Descriptografar refresh token (armazenado criptografado em repouso)
    const refreshToken = decrypt(refreshTokenEnc);

    // 2. Chamar Google API para renovar
    const tokenData = await refreshAccessToken(refreshToken);

    if (tokenData.error || !tokenData.access_token) {
      console.error(
        `[Token Refresh] Falha para user ${userId}:`,
        tokenData.error_description
      );
      return {
        success: false,
        newAccessToken: "",
        expiresAt: new Date().toISOString(),
        error: tokenData.error_description || "Token refresh failed",
      };
    }

    // 3. Encriptar novo access token
    const encryptedAccess = encrypt(tokenData.access_token);
    const encryptedRefresh = tokenData.refresh_token
      ? encrypt(tokenData.refresh_token)
      : undefined;

    const expiresAt = new Date(
      Date.now() + (tokenData.expires_in ?? 3600) * 1000
    ).toISOString();

    return {
      success: true,
      newAccessToken: encryptedAccess,
      newRefreshToken: encryptedRefresh,
      expiresAt,
    };
  } catch (error) {
    console.error(`[Token Refresh] Erro para user ${userId}:`, error);
    return {
      success: false,
      newAccessToken: "",
      expiresAt: new Date().toISOString(),
      error: String(error),
    };
  }
}

/**
 * 🔄 Verificar e renovar todos os tokens que estão perto de expirar
 * (Executado por cron job)
 *
 * @param hoursThreshold - Renovar tokens que expiram em menos de X horas (padrão: 1h)
 * @returns Resumo: quantos tokens foram renovados
 */
export async function refreshExpiredTokens(hoursThreshold: number = 1) {
  console.log(
    `[Token Refresh] Iniciando... (renovar se expiram em < ${hoursThreshold}h)`
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  // 1. Buscar conexões Google que estão perto de expirar
  const thresholdTime = new Date(Date.now() + hoursThreshold * 60 * 60 * 1000);

  const { data: connectionsToRefresh, error: selectError } = await supabase
    .from("google_connections")
    .select("id, user_id, refresh_token_enc, token_expires_at")
    .lt("token_expires_at", thresholdTime.toISOString()) // Expira antes do threshold
    .is("refresh_token_enc", null) // Só se tiver refresh token
    .order("token_expires_at", { ascending: true }); // Mais urgentes primeiro

  if (selectError) {
    console.error("[Token Refresh] Erro ao buscar conexões:", selectError);
    return {
      total: 0,
      refreshed: 0,
      failed: 0,
      error: selectError.message,
    };
  }

  if (!connectionsToRefresh || connectionsToRefresh.length === 0) {
    console.log("[Token Refresh] Nenhum token para renovar");
    return { total: 0, refreshed: 0, failed: 0 };
  }

  let refreshed = 0;
  let failed = 0;

  // 2. Renovar cada token
  for (const conn of connectionsToRefresh) {
    if (!conn.refresh_token_enc) {
      console.warn(`[Token Refresh] User ${conn.user_id} sem refresh token`);
      failed++;
      continue;
    }

    const result = await refreshGoogleToken(conn.user_id, conn.refresh_token_enc);

    if (!result.success) {
      console.error(
        `[Token Refresh] Falha para user ${conn.user_id}:`,
        result.error
      );
      failed++;
      continue;
    }

    // 3. Atualizar no banco
    const { error: updateError } = await supabase
      .from("google_connections")
      .update({
        access_token_enc: result.newAccessToken,
        refresh_token_enc: result.newRefreshToken || conn.refresh_token_enc,
        token_expires_at: result.expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conn.id);

    if (updateError) {
      console.error(
        `[Token Refresh] Erro ao atualizar token para user ${conn.user_id}:`,
        updateError
      );
      failed++;
    } else {
      console.log(`[Token Refresh] ✅ Token renovado para user ${conn.user_id}`);
      refreshed++;
    }
  }

  console.log(
    `[Token Refresh] Concluído: ${refreshed} renovados, ${failed} falharam`
  );

  return {
    total: connectionsToRefresh.length,
    refreshed,
    failed,
  };
}

/**
 * 🔄 Verificar se token está expirado (antes de usar)
 * Use antes de chamar Google Business API
 */
export async function ensureTokenValid(userId: string): Promise<{
  valid: boolean;
  expiresAt?: Date;
  error?: string;
}> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  const { data: conn, error } = await supabase
    .from("google_connections")
    .select("id, token_expires_at, refresh_token_enc")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { valid: false, error: error.message };
  }

  const now = new Date();
  const expiresAt = new Date(conn.token_expires_at);

  // Se expira em menos de 5 minutos, renovar
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (expiresAt <= fiveMinutesFromNow) {
    console.log(`[Token Check] Token expirando em < 5min para user ${userId}`);

    if (!conn.refresh_token_enc) {
      return {
        valid: false,
        error: "Token expirado e sem refresh token disponível",
      };
    }

    // Renovar automaticamente
    const result = await refreshGoogleToken(userId, conn.refresh_token_enc);

    if (!result.success) {
      return { valid: false, error: result.error };
    }

    // Atualizar banco
    await supabase
      .from("google_connections")
      .update({
        access_token_enc: result.newAccessToken,
        refresh_token_enc: result.newRefreshToken || conn.refresh_token_enc,
        token_expires_at: result.expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return { valid: true, expiresAt: new Date(result.expiresAt) };
  }

  // Token ainda válido
  if (expiresAt > now) {
    return { valid: true, expiresAt };
  }

  // Token expirou
  return {
    valid: false,
    error: "Token expirado",
  };
}
