

export interface AuditResult {
    score: number;
    dimensions: {
        photos: { score: number; max: number };
        info: { score: number; max: number };
        reviews: { score: number; max: number };
        posts: { score: number; max: number };
        geo: { score: number; max: number };
    };
    tasks: Array<{
        id: string;
        priority: "high" | "medium" | "low";
        category: string;
        text: string;
        href: string;
    }>;
}

export async function runBusinessAudit(businessId: string): Promise<AuditResult> {
    // In a real scenario, this would:
    // 1. Fetch fresh data from Google Business Profile API using the user's connected account
    // 2. Fetch fresh data from Gemini/Perplexity for GEO visibility
    // 3. Compare with our local database (Supabase)

    // Since we are mocking the actual GBP API call in this boilerplate, we will generate a realistic mock result based on database fields if they exist, or just random/fixed.

    const photosScore = Math.floor(Math.random() * 15) + 10; // Out of 25
    const infoScore = 20; // Out of 25
    const reviewsScore = Math.floor(Math.random() * 10) + 10; // Out of 20
    const postsScore = 5; // Out of 15
    const geoScore = 8; // Out of 15

    const totalScore = photosScore + infoScore + reviewsScore + postsScore + geoScore;

    const tasks: AuditResult["tasks"] = [];

    if (reviewsScore < 15) {
        tasks.push({
            id: "t1",
            priority: "high",
            category: "reviews",
            text: "Você tem avaliações pendentes sem resposta",
            href: "/reviews",
        });
    }

    if (postsScore < 10) {
        tasks.push({
            id: "t2",
            priority: "high",
            category: "posts",
            text: "Seu último post no Google faz mais de 15 dias",
            href: "/posts",
        });
    }

    if (geoScore < 10) {
        tasks.push({
            id: "t3",
            priority: "medium",
            category: "geo",
            text: "Sua visibilidade em IAs (Gemini/ChatGPT) está baixa",
            href: "/geo",
        });
    }

    if (photosScore < 20) {
        tasks.push({
            id: "t4",
            priority: "low",
            category: "photos",
            text: "Adicione mais fotos recentes (apenas 2 este mês)",
            href: "/auditoria",
        });
    }

    return {
        score: totalScore,
        dimensions: {
            photos: { score: photosScore, max: 25 },
            info: { score: infoScore, max: 25 },
            reviews: { score: reviewsScore, max: 20 },
            posts: { score: postsScore, max: 15 },
            geo: { score: geoScore, max: 15 },
        },
        tasks,
    };
}
