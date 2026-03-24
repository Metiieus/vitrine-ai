/**
 * Authenticated Google API client.
 * Reads tokens from DB, auto-refreshes when expired, and returns a fetch wrapper.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { refreshAccessToken } from "./oauth";
import { encrypt, decrypt } from "@/lib/utils/encrypt";

async function getSupabaseAdmin() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

/**
 * Returns a valid (refreshed if needed) access token for the given user.
 * Returns null if no connection exists or refresh fails.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = await getSupabaseAdmin();

  const { data: conn, error } = await supabase
    .from("google_connections")
    .select("id, access_token_enc, refresh_token_enc, token_expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !conn) return null;

  const now = Date.now();
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
  // Buffer: refresh 2 min before actual expiry
  const needsRefresh = expiresAt - now < 2 * 60 * 1000;

  if (!needsRefresh) {
    return decrypt(conn.access_token_enc);
  }

  if (!conn.refresh_token_enc) return null;

  const refreshToken = decrypt(conn.refresh_token_enc);
  const tokenData = await refreshAccessToken(refreshToken);

  if (tokenData.error || !tokenData.access_token) {
    console.error("Token refresh failed:", tokenData.error_description);
    return null;
  }

  const newExpiry = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  await supabase
    .from("google_connections")
    .update({
      access_token_enc: encrypt(tokenData.access_token),
      token_expires_at: newExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conn.id);

  return tokenData.access_token;
}

/**
 * Returns a fetch-like function pre-authorized for the Google APIs.
 * Throws if token is unavailable.
 */
export async function getGoogleFetch(userId: string) {
  const token = await getValidAccessToken(userId);
  if (!token) throw new Error("NO_GOOGLE_CONNECTION");

  return async function googleFetch(url: string, init?: RequestInit) {
    const resp = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(
        `Google API error ${resp.status}: ${JSON.stringify(body?.error ?? body)}`
      );
    }

    return resp.json();
  };
}
