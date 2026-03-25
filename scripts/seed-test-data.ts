/**
 * Script para popular dados de teste no Supabase
 * 
 * Uso:
 *   npx tsx scripts/seed-test-data.ts
 * 
 * Isso vai:
 * 1. Criar um usuário de teste
 * 2. Criar um negócio de teste
 * 3. Criar auditorias, reviews, insights, posts, geo_checks
 * 4. Liberar tudo para testes end-to-end
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Faltam env vars: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_USER_EMAIL = "teste@vitrine-ai.local";
const TEST_USER_PASSWORD = "Teste@123456";

async function seedData() {
  console.log("🌱 Iniciando seed de dados de teste...\n");

  try {
    // ─── 1. Criar usuário de teste ─────────────────────────────────────────

    console.log("1️⃣  Criando usuário de teste...");
    
    let userId: string | null = null;
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      // User already exists, get their ID
      if (authError.message?.includes("already exists") || authError.code === "email_exists") {
        console.log(`ℹ️  Usuário já existe, usando ID existente...`);
        userId = await getUserId(TEST_USER_EMAIL);
      } else {
        console.error("❌ Erro ao criar usuário:", authError);
        process.exit(1);
      }
    } else {
      userId = authUser?.user?.id;
    }
    if (!userId) {
      console.error("❌ Não conseguiu obter user ID");
      process.exit(1);
    }

    console.log(`✅ Usuário criado: ${TEST_USER_EMAIL}`);
    console.log(`   ID: ${userId}\n`);

    // ─── 2. Criar profile ──────────────────────────────────────────────────

    console.log("2️⃣  Criando profile...");

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          name: "Teste Casa da Pizza",
          plan: "agency",
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("❌ Erro ao criar profile:", profileError);
      process.exit(1);
    }

    console.log("✅ Profile criado\n");

    // ─── 3. Criar negócio de teste ─────────────────────────────────────────

    console.log("3️⃣  Criando negócio de teste...");

    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        name: "Casa da Pizza - Vila Mariana",
        category: "Pizzaria",
        city: "São Paulo",
        state: "SP",
        google_account_id: "accounts/123456789",
        google_location_id: "locations/987654321",
        google_rating: 4.3,
        total_reviews: 47,
      })
      .select()
      .single();

    if (businessError) {
      console.error("❌ Erro ao criar negócio:", businessError);
      process.exit(1);
    }

    const businessId = businessData.id;
    console.log(`✅ Negócio criado: ${businessData.name}`);
    console.log(`   ID: ${businessId}\n`);

    // ─── 4. Criar auditoria ────────────────────────────────────────────────

    console.log("4️⃣  Criando auditoria...");

    const auditScore = 72;
    const { error: auditError } = await supabase.from("audits").insert({
      business_id: businessId,
      score: auditScore,
      details: {
        photos: { score: 21, max: 25, items: ["Logo", "Foto capa", "5 fotos do ambiente"] },
        info: { score: 22, max: 25, items: ["Descrição", "Categorias", "Horários"] },
        reviews: { score: 15, max: 20, items: ["47 reviews", "4.3★ média", "80% respondidas"] },
        posts: { score: 8, max: 15, items: ["Apenas 2 posts", "Nenhum na última semana"] },
        geo: { score: 6, max: 15, items: ["Aparece no Gemini", "Falta ChatGPT"] },
      },
    });

    if (auditError) {
      console.error("❌ Erro ao criar auditoria:", auditError);
      process.exit(1);
    }

    console.log(`✅ Auditoria criada com score ${auditScore}/100\n`);

    // ─── 5. Criar reviews ─────────────────────────────────────────────────

    console.log("5️⃣  Criando reviews...");

    const reviews = [
      {
        business_id: businessId,
        google_review_id: "rev_001",
        author_name: "Maria Silva",
        rating: 5,
        text: "Melhor pizza da região! Massa crocante e ingredientes frescos. Recomendo!",
        response_status: "published",
        ai_response: "Muito obrigado Maria! Ficamos felizes que você tenha gostado. Esperamos sua próxima visita! 🍕",
      },
      {
        business_id: businessId,
        google_review_id: "rev_002",
        author_name: "João Pereira",
        rating: 2,
        text: "Esperei 1 hora e meia pelo pedido. Fiquei muito decepcionado com o atendimento.",
        response_status: "pending",
        ai_response: null,
      },
      {
        business_id: businessId,
        google_review_id: "rev_003",
        author_name: "Ana Costa",
        rating: 4,
        text: "Pizza boa e ambiente aconchegante. Poderia melhorar a velocidade do atendimento.",
        response_status: "published",
        ai_response: "Obrigado Ana! Suas sugestões nos ajudam a melhorar. Voltamos em breve melhorado! 😊",
      },
      {
        business_id: businessId,
        google_review_id: "rev_004",
        author_name: "Carlos Santos",
        rating: 5,
        text: "Experiência excelente do início ao fim. Voltarei com minha família!",
        response_status: "pending",
        ai_response: null,
      },
    ];

    const { error: reviewError } = await supabase
      .from("reviews")
      .upsert(reviews, { onConflict: "google_review_id" });

    if (reviewError) {
      console.error("❌ Erro ao criar reviews:", reviewError);
      process.exit(1);
    }

    console.log(`✅ ${reviews.length} reviews criados/atualizados\n`);

    // ─── 6. Criar insights ─────────────────────────────────────────────────

    console.log("6️⃣  Criando insights...");

    const { error: insightError } = await supabase.from("insights").insert({
      business_id: businessId,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      searches: 1240,
      views: 3420,
      calls: 89,
      direction_requests: 156,
      website_clicks: 234,
    });

    if (insightError) {
      console.error("❌ Erro ao criar insights:", insightError);
      process.exit(1);
    }

    console.log("✅ Insights criados\n");

    // ─── 7. Criar Google Posts ────────────────────────────────────────────

    console.log("7️⃣  Criando Google Posts...");

    // Deletar posts antigos para esta empresa
    await supabase.from("google_posts").delete().eq("business_id", businessId);

    const posts = [
      {
        business_id: businessId,
        content: "🍕 Sexta é dia de Pizza! Venha aproveitar nossas promoções especiais: 2 pizzas grandes por R$79,90. Aceitamos naturalmente pelo @whatsapp (11) 98765-4321",
        status: "published",
      },
      {
        business_id: businessId,
        content: "✨ Nossa massa é preparada diariamente com ingredientes 100% frescos. Vem provar a diferença! 🤤",
        status: "published",
      },
    ];

    const { error: postError } = await supabase.from("google_posts").insert(posts);

    if (postError) {
      console.error("❌ Erro ao criar posts:", postError);
      process.exit(1);
    }

    console.log(`✅ ${posts.length} posts criados\n`);

    // ─── 8. Criar GEO checks ──────────────────────────────────────────────

    console.log("8️⃣  Criando GEO checks...");

    // Deletar GEO checks antigos para esta empresa
    await supabase.from("geo_checks").delete().eq("business_id", businessId);

    const geoChecks = [
      {
        business_id: businessId,
        query: "melhor pizzaria em são paulo",
        ai_platform: "gemini",
        found: true,
        position: 3,
        snippet: "Casa da Pizza é uma das melhores pizzarias de São Paulo...",
        checked_at: new Date().toISOString(),
      },
      {
        business_id: businessId,
        query: "pizzaria vila mariana",
        ai_platform: "chatgpt",
        found: false,
        position: null,
        snippet: null,
        checked_at: new Date().toISOString(),
      },
      {
        business_id: businessId,
        query: "pizza barata em sp",
        ai_platform: "perplexity",
        found: true,
        position: 5,
        snippet: "Casa da Pizza oferece excelente custo-benefício...",
        checked_at: new Date().toISOString(),
      },
    ];

    const { error: geoError } = await supabase.from("geo_checks").insert(geoChecks);

    if (geoError) {
      console.error("❌ Erro ao criar GEO checks:", geoError);
      process.exit(1);
    }

    console.log(`✅ ${geoChecks.length} GEO checks criados\n`);

    // ─── Resumo ────────────────────────────────────────────────────────────

    console.log("═".repeat(60));
    console.log("✅ SEED COMPLETO!");
    console.log("═".repeat(60));
    console.log(`
📧 Email: ${TEST_USER_EMAIL}
🔑 Senha: ${TEST_USER_PASSWORD}

👤 User ID:     ${userId}
🏪 Business ID: ${businessId}

Dados criados:
  • 1 Usuario
  • 1 Profile
  • 1 Negócio
  • 1 Auditoria (score ${auditScore}/100)
  • ${reviews.length} Reviews
  • 1 Insights (últimos 30 dias)
  • ${posts.length} Google Posts
  • ${geoChecks.length} GEO Checks

🚀 Próximos passos:
  1. npm run dev
  2. Fazer login com ${TEST_USER_EMAIL}
  3. Dashboard carrega dados reais! 🎉

⚠️  IMPORTANTE: Este usuário é só para testes locais!
    Em produção, use usuários reais.
`);

  } catch (error) {
    console.error("❌ Erro geral:", error);
    process.exit(1);
  }
}

/**
 * Buscar user ID por email (se já existe)
 */
async function getUserId(email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return null;
  return data.users.find((u) => u.email === email)?.id ?? null;
}

// ─── Rodar ────────────────────────────────────────────────────────────────────

seedData();
