/**
 * Validação centralizada de inputs com Zod
 * Use para whitelist de parâmetros, tipos esperados, ranges, etc
 */

import { z } from "zod";

// ================================
// COMMON SCHEMAS
// ================================

export const UUIDSchema = z.string().uuid("UUID inválido");

export const EmailSchema = z
  .string()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo");

export const PhoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]{7,}$/, "Telefone inválido")
  .max(20);

export const URLSchema = z
  .string()
  .url("URL inválida")
  .max(2048);

// ================================
// BUSINESS/AUDIT SCHEMAS
// ================================

export const BusinessNameSchema = z
  .string()
  .min(2, "Nome muito curto")
  .max(255, "Nome muito longo")
  .trim();

export const CategorySchema = z
  .string()
  .min(1, "Categoria obrigatória")
  .max(100, "Categoria muito longa");

export const RatingSchema = z
  .number()
  .int("Rating deve ser número inteiro")
  .min(1, "Rating mínimo é 1")
  .max(5, "Rating máximo é 5");

// ================================
// AI/CONTENT SCHEMAS
// ================================

export const ReviewTextSchema = z
  .string()
  .min(5, "Texto muito curto (mín. 5 chars)")
  .max(5000, "Texto muito longo (máx. 5000 chars)")
  .trim();

export const ReviewResponseSchema = z.object({
  reviewId: UUIDSchema.optional(),
  authorName: z
    .string()
    .max(100, "Nome do autor muito longo")
    .trim()
    .default("Cliente"),
  rating: RatingSchema,
  text: ReviewTextSchema.default(""),
  businessName: BusinessNameSchema,
  category: CategorySchema.default("negócio"),
  city: z
    .string()
    .max(100, "Cidade muito longa")
    .trim()
    .default(""),
  state: z
    .string()
    .regex(/^[A-Z]{2}$/, "Estado deve ser 2 dígitos (ex: SP)")
    .default(""),
});

export const GooglePostSchema = z.object({
  businessName: BusinessNameSchema,
  category: CategorySchema,
  city: z
    .string()
    .min(1, "Cidade obrigatória")
    .max(100)
    .trim(),
  topic: z
    .string()
    .max(200, "Tema muito longo")
    .trim()
    .optional(),
});

// ================================
// PAYMENT/CHECKOUT SCHEMAS
// ================================

export const PlanSchema = z.enum(["essential", "pro", "agency"]);

export const CheckoutSchema = z.object({
  plan: PlanSchema,
});

// ================================
// GOOGLE OAUTH SCHEMAS
// ================================

export const GoogleLocationSchema = z.object({
  locationName: z
    .string()
    .regex(
      /^accounts\/[\w-]+\/locations\/[\w-]+$/,
      "Location name inválido"
    ),
  accountName: z
    .string()
    .regex(/^accounts\/[\w-]+$/, "Account name inválido"),
});

// ================================
// PAGINATION & FILTERING
// ================================

export const PaginationSchema = z.object({
  pageToken: z.string().optional(),
  limit: z
    .number()
    .int()
    .min(1, "Limite mínimo é 1")
    .max(100, "Limite máximo é 100")
    .default(20),
});

export const DaysRangeSchema = z
  .number()
  .int()
  .min(1, "Mínimo 1 dia")
  .max(90, "Máximo 90 dias")
  .default(30);

// ================================
// WEBHOOK SCHEMAS
// ================================

export const MercadoPagoWebhookSchema = z.object({
  action: z.enum(["payment.created", "payment.updated"]),
  type: z.enum(["payment"]),
  data: z.object({
    id: z.number(),
  }),
});

// ================================
// EXPORT UTILITIES
// ================================

/**
 * Safe parse com resposta amigável
 * Retorna { success, data/error }
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten(),
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Parse com throw (use em server actions onde erro é esperado)
 */
export function parse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validar query params
 */
export function validateQueryParams(
  searchParams: URLSearchParams,
  schema: z.ZodSchema
) {
  const obj: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    // Converter "true"/"false" em boolean
    if (value === "true") obj[key] = true;
    else if (value === "false") obj[key] = false;
    // Converter números string em number
    else if (/^\d+$/.test(value)) obj[key] = parseInt(value, 10);
    else obj[key] = value;
  });

  return schema.safeParse(obj);
}
