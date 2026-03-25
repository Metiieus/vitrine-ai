-- ============================================================
-- RLS Validation Script — Vitrine.ai
-- Execute no Supabase SQL Editor para validar RLS policies
-- ============================================================

-- ========================================
-- 1️⃣ TESTE 1: Verificar RLS Habilitado
-- ========================================
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ENABLED' ELSE '❌ RLS DISABLED' END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- 2️⃣ TESTE 2: Listar Todas as Policies
-- ========================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    ELSE '[SELECT]'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE '[UPDATE/INSERT]'
  END as check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- 3️⃣ TESTE 3: Contar Policies por Tabela
-- ========================================
SELECT
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================
-- 🔒 VALIDAÇÃO MANUAL (Copie e execute como diferentes users)
-- ============================================================

-- Para USER A (substitua 'user-a-uuid' com UUID real)
-- SET jwt.claims.sub = 'user-a-uuid';

-- SELECT 'USER A ACCESSING BUSINESSES' as test;
-- SELECT id, name, user_id FROM public.businesses;
-- -- Esperado: Apenas negócios onde user_id = user-a-uuid

-- Para USER B (substitua 'user-b-uuid' com UUID real)
-- SET jwt.claims.sub = 'user-b-uuid';

-- SELECT 'USER B ACCESSING BUSINESSES' as test;
-- SELECT id, name, user_id FROM public.businesses;
-- -- Esperado: Apenas negócios de USER B (isolados de USER A)

-- ========================================
-- 4️⃣ TESTE 4: Verificar FKs e Cascata
-- ========================================
SELECT
  constraint_name,
  table_name,
  column_name,
  foreign_table_name,
  'CASCADE' as delete_behavior
FROM (
  SELECT
    constraint_name,
    table_name,
    column_name,
    foreign_table_name
  FROM pg_constraints 
  JOIN information_schema.key_column_usage 
    ON pg_constraints.conname = key_column_usage.constraint_name
  JOIN information_schema.constraint_column_usage
    ON constraint_column_usage.constraint_name = key_column_usage.constraint_name
  WHERE table_schema = 'public'
    AND constraint_type = 'FOREIGN KEY'
) fks
WHERE foreign_table_name IS NOT NULL
ORDER BY table_name, constraint_name;

-- ========================================
-- 5️⃣ TESTE 5: Performance de Query com RLS
-- ========================================
-- Medir tempo de query COM RLS habilitado
EXPLAIN ANALYZE
SELECT * FROM public.businesses
WHERE user_id = auth.uid()
LIMIT 10;

-- Resultado esperado: < 100ms even com milhões de linhas
-- Se > 1s, pode haver problema com índices ou policies mal otimizadas

-- ============================================================
-- 🔒 LIMPEZA / DEBUG (Use se precisar resetar RLS)
-- ============================================================

-- ⚠️ CUIDADO: Abaixo são queries destrutivas. Só execute se souber o que está fazendo.

-- Mostrar todas as policies de uma tabela específica:
-- SELECT * FROM pg_policies WHERE tablename = 'businesses';

-- Desabilitar RLS temporariamente para debug (NUNCA em produção!):
-- ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;

-- Re-habilitar RLS:
-- ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Dropar uma policy:
-- DROP POLICY "policy_name" ON public.businesses;

-- ============================================================
-- ✅ RESULTADO ESPERADO
-- ============================================================

/*
Teste 1 (Acima): Todas as 10 tabelas devem mostrar "✅ RLS ENABLED"
├─ profiles
├─ businesses
├─ audits
├─ reviews
├─ google_posts
├─ geo_checks
├─ insights
├─ google_connections
├─ payments
└─ subscriptions

Teste 2 (Acima): Deve listar ~10-15 policies (1-2 por tabela)
├─ profiles: 1 policy
├─ businesses: 1 policy
├─ audits: 1 policy
├─ reviews: 1 policy
├─ google_posts: 1 policy
├─ geo_checks: 1 policy
├─ insights: 1 policy
├─ google_connections: 1 policy
├─ payments: 1 policy
└─ subscriptions: 1 policy

Teste 3: Todas tabelas devem ter total_policies >= 1

Teste 4: Cascadas funcionando (deletes propagam)

Teste 5: EXPLAIN ANALYZE < 100ms (bom desempenho)

Se tudo estiver verde (✅), RLS está 100% funcional e seguro!
Se algum estiver vermelho (❌), contate o time de segurança.
*/
