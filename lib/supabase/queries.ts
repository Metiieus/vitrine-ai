/**
 * Queries reutilizáveis para o Supabase
 * Use essas funções em server components ou API routes
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Criar cliente servidor (use em Server Components ou API Routes)
 */
export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Obter usuário autenticado
 */
export async function getUser() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error('Não autenticado');
  return user;
}

/**
 * Obter perfil do usuário
 */
export async function getUserProfile() {
  const user = await getUser();
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obter negócios do usuário
 */
export async function getUserBusinesses() {
  const user = await getUser();
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obter assinatura ativa
 */
export async function getUserSubscription() {
  const user = await getUser();
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

/**
 * Obter histórico de pagamentos
 */
export async function getUserPayments() {
  const user = await getUser();
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obter auditorias de um negócio
 */
export async function getBusinessAudits(businessId: string) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  // Verificar que o negócio pertence ao usuário
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (businessError || !business) throw new Error('Negócio não encontrado');

  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obter reviews de um negócio
 */
export async function getBusinessReviews(businessId: string) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  // Verificar que o negócio pertence ao usuário
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (businessError || !business) throw new Error('Negócio não encontrado');

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obter posts de um negócio
 */
export async function getBusinessPosts(businessId: string) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  // Verificar que o negócio pertence ao usuário
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (businessError || !business) throw new Error('Negócio não encontrado');

  const { data, error } = await supabase
    .from('google_posts')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Criar novo negócio
 */
export async function createBusiness(params: {
  name: string;
  category?: string;
  phone?: string;
  website?: string;
}) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      user_id: user.id,
      name: params.name,
      category: params.category,
      phone: params.phone,
      website: params.website,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atualizar negócio
 */
export async function updateBusiness(
  businessId: string,
  updates: Partial<{
    name: string;
    category: string;
    phone: string;
    website: string;
    city: string;
    state: string;
    address: string;
  }>
) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  // Verificar que o negócio pertence ao usuário
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (businessError || !business) throw new Error('Negócio não encontrado');

  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletar negócio
 */
export async function deleteBusiness(businessId: string) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  // Verificar que o negócio pertence ao usuário
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (businessError || !business) throw new Error('Negócio não encontrado');

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (error) throw error;
}

/**
 * Responder review com IA
 */
export async function respondToReview(
  reviewId: string,
  response: string
) {
  const user = await getUser();
  const supabase = createSupabaseServer();

  // Verificar que o review pertence a um negócio do usuário
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('business_id')
    .eq('id', reviewId)
    .single();

  if (reviewError || !review) throw new Error('Review não encontrado');

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', review.business_id)
    .eq('user_id', user.id)
    .single();

  if (businessError || !business) throw new Error('Negócio não encontrado');

  const { data, error } = await supabase
    .from('reviews')
    .update({
      ai_response: response,
      response_status: 'generated',
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Publicar resposta para review (integração com Google)
 */
export async function publishReviewResponse(reviewId: string) {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from('reviews')
    .update({
      response_status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

const supabaseQueries = {
  getUser,
  getUserProfile,
  getUserBusinesses,
  getUserSubscription,
  getUserPayments,
  getBusinessAudits,
  getBusinessReviews,
  getBusinessPosts,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  respondToReview,
  publishReviewResponse,
};

export default supabaseQueries;
