/**
 * Sanitização contra XSS
 * Compatível com next/sanitize ou DOMPurify
 */

/**
 * Sanitizar input de texto simples (remover tags HTML)
 * Use para dados que nunca deveriam ter HTML (nomes, descrições, etc)
 */
export function sanitizeTextInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    // Remover tags HTML
    .replace(/<[^>]*>/g, "")
    // Escapar &, <, >, ", '
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    // Remover caracteres de controle
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .trim();
}

/**
 * Validar e whitelist de URLs (para user profiles, websites)
 * Só permite http:// https://, bloqueia javascript:, data:, etc
 */
export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsed = new URL(url);
    // Whitelist de protocolos seguros
    if (!["http:", "https:"].includes(parsed.protocol)) {
      console.warn(`[Security] URL com protocolo perigoso: ${parsed.protocol}`);
      return null;
    }
    return parsed.toString();
  } catch {
    console.warn(`[Security] URL inválida: ${url}`);
    return null;
  }
}

/**
 * Sanitizar email (validar formato)
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const trimmed = email.trim().toLowerCase();
  // RFC 5322 simplificado
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(trimmed) ? trimmed : null;
}

/**
 * Sanitizar número (para ratings, IDs)
 */
export function sanitizeNumber(value: unknown, min: number = 0, max: number = 100): number | null {
  const num = typeof value === "string" ? parseInt(value, 10) : typeof value === "number" ? value : null;

  if (num === null || isNaN(num)) {
    return null;
  }

  return num >= min && num <= max ? num : null;
}

/**
 * Sanitizar UUID
 */
export function sanitizeUUID(value: string): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value) ? value : null;
}

/**
 * Escapar para uso em atributos HTML
 * Use ao renderizar dados no template (next.js já faz isso por padrão com JSX)
 */
export function escapeHTMLAttribute(str: string): string {
  if (!str) return "";

  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sanitizar para JSON (remover caracteres especiais)
 */
export function sanitizeJSON(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeTextInput(obj);
  }
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeJSON);
    }
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar a chave também
      const sanitizedKey = sanitizeTextInput(key);
      sanitized[sanitizedKey] = sanitizeJSON(value);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Content Security Policy Headers
 * Use em `next.config.mjs` ou middleware para adicionar headers
 */
export const CSP_HEADERS = {
  "Content-Security-Policy":
    // Não permita eval, scripts inline, etc
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; " + // unsafe-inline para Next.js
    "style-src 'self' 'unsafe-inline'; " + // unsafe-inline para Tailwind
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://www.google.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",
  "X-Content-Type-Options": "nosniff", // Não adivinhar MIME type
  "X-Frame-Options": "DENY", // Não permitir embed em iframes
  "X-XSS-Protection": "1; mode=block", // XSS protection (legacy)
  "Referrer-Policy": "strict-origin-when-cross-origin", // Não vazar URL para sites terceiros
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=()", // Desabilitar APIs perigosas
};
