/**
 * Error handling genérico
 * Não expõe detalhes internos, stack traces, ou informações sensíveis ao cliente
 */

import { NextResponse } from "next/server";

export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  RATE_LIMITED = "RATE_LIMITED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

interface SafeErrorResponse {
  error: string;
  code: ErrorCode;
  requestId?: string; // Para logging/debugging sem expor detalhes
  timestamp: string;
}

/**
 * Mapear erros conhecidos para mensagens seguras
 */
function getSafeErrorMessage(error: unknown, code: ErrorCode): string {
  const errorMap: Record<string, Record<ErrorCode, string>> = {
    "NO_GOOGLE_CONNECTION": {
      [ErrorCode.FORBIDDEN]: "Entidade não conectada ao Google",
      [ErrorCode.NOT_FOUND]: "Entidade não encontrada",
      [ErrorCode.UNAUTHORIZED]: "Acesso não autorizado",
      [ErrorCode.BAD_REQUEST]: "Dados inválidos",
      [ErrorCode.RATE_LIMITED]: "Muitas requisições. Tente mais tarde",
      [ErrorCode.INTERNAL_ERROR]: "Erro interno do servidor",
      [ErrorCode.SERVICE_UNAVAILABLE]: "Serviço indisponível",
    },
    "AUTHENTICATION_FAILED": {
      [ErrorCode.UNAUTHORIZED]: "Acesso negado",
      [ErrorCode.FORBIDDEN]: "Permissão insuficiente",
      [ErrorCode.NOT_FOUND]: "Recurso não encontrado",
      [ErrorCode.BAD_REQUEST]: "Dados inválidos",
      [ErrorCode.RATE_LIMITED]: "Muitas tentativas. Tente mais tarde",
      [ErrorCode.INTERNAL_ERROR]: "Erro ao processar",
      [ErrorCode.SERVICE_UNAVAILABLE]: "Serviço temporariamente indisponível",
    },
  };

  const errorKey =
    error instanceof Error && typeof error.message === "string"
      ? error.message.split(":")[0]
      : null;

  return (
    errorMap[errorKey as string]?.[code] ||
    {
      [ErrorCode.UNAUTHORIZED]: "Você não tem permissão",
      [ErrorCode.FORBIDDEN]: "Acesso proibido",
      [ErrorCode.NOT_FOUND]: "Recurso não encontrado",
      [ErrorCode.BAD_REQUEST]: "Dados inválidos",
      [ErrorCode.RATE_LIMITED]: "Muitas requisições. Tente mais tarde",
      [ErrorCode.INTERNAL_ERROR]: "Erro ao processar requisição",
      [ErrorCode.SERVICE_UNAVAILABLE]: "Serviço temporariamente indisponível",
    }[code]
  );
}

/**
 * Enviar erro seguro ao cliente (sem expor stack trace)
 */
export function sendSafeError(
  error: unknown,
  code: ErrorCode,
  statusCode: number,
  requestId?: string
): NextResponse<SafeErrorResponse> {
  // LOGAR INTERNAMENTE para debugging (NÃO enviar ao client)
  logError(error, code, requestId);

  const safeMessage = getSafeErrorMessage(error, code);

  return NextResponse.json(
    {
      error: safeMessage,
      code,
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Logger seguro (não expõe URLs, tokens, etc)
 */
export function logError(
  error: unknown,
  code: ErrorCode,
  requestId?: string
): void {
  const sanitizedError = sanitizeErrorForLogging(error);

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      code,
      requestId,
      message: sanitizedError.message,
      stack: sanitizedError.stack,
    })
  );
}

/**
 * Logs estruturados seguros
 */
export function logSecurityEvent(
  eventType: string,
  details: Record<string, unknown>,
  severity: "info" | "warning" | "error" = "info"
): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: severity,
      event: eventType,
      details: sanitizeErrorForLogging(details),
    })
  );
}

/**
 * Sanitizar erro para logging (remover tokens, senhas, URLs privadas)
 */
function sanitizeErrorForLogging(error: unknown): {
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      message: sanitizeString(error.message),
      stack: error.stack ? sanitizeString(error.stack) : undefined,
    };
  }

  if (typeof error === "string") {
    return { message: sanitizeString(error) };
  }

  if (typeof error === "object" && error !== null) {
    return {
      message: sanitizeString(JSON.stringify(error)),
    };
  }

  return { message: "Unknown error" };
}

/**
 * Remover informações sensíveis da string (tokens, IPs, etc)
 */
function sanitizeString(str: string): string {
  return str
    // Remover JWTs
    .replace(/eyJ[A-Za-z0-9_-]{20,}/g, "[JWT]")
    // Remover URLs
    .replace(
      /https?:\/\/[^\s]+/g,
      "[URL]"
    )
    // Remover emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
    // Remover IPs privados
    .replace(
      /\b(?:192\.168|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[01])\.[0-9.]+\b/g,
      "[PRIVATE_IP]"
    )
    // Remover credential-like strings
    .replace(/(?:password|secret|key|token)[\s=:'"]*[^\s'"]+/gi, "[REDACTED]");
}

/**
 * Helpers para erros comuns
 */

export function unauthorizedError(requestId?: string) {
  return sendSafeError(
    new Error("AUTHENTICATION_FAILED"),
    ErrorCode.UNAUTHORIZED,
    401,
    requestId
  );
}

export function forbiddenError(requestId?: string) {
  return sendSafeError(
    new Error("FORBIDDEN"),
    ErrorCode.FORBIDDEN,
    403,
    requestId
  );
}

export function notFoundError(requestId?: string) {
  return sendSafeError(
    new Error("NOT_FOUND"),
    ErrorCode.NOT_FOUND,
    404,
    requestId
  );
}

export function badRequestError(requestId?: string) {
  return sendSafeError(
    new Error("BAD_REQUEST"),
    ErrorCode.BAD_REQUEST,
    400,
    requestId
  );
}

export function rateLimitedError(retryAfter?: number, requestId?: string) {
  const response = sendSafeError(
    new Error("RATE_LIMITED"),
    ErrorCode.RATE_LIMITED,
    429,
    requestId
  );

  if (retryAfter) {
    response.headers.set("Retry-After", String(retryAfter));
  }

  return response;
}

export function internalError(error: unknown, requestId?: string) {
  return sendSafeError(error, ErrorCode.INTERNAL_ERROR, 500, requestId);
}

export function serviceUnavailableError(requestId?: string) {
  return sendSafeError(
    new Error("SERVICE_UNAVAILABLE"),
    ErrorCode.SERVICE_UNAVAILABLE,
    503,
    requestId
  );
}
