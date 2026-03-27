

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

export async function logGDBSync() {
    // This function is a placeholder for logging GDB sync operations.
    // The parameters _userId and _businessId are prefixed with an underscore
    // to indicate they are intentionally unused in this mock implementation,
    // silencing potential linter warnings.
    console.log(`Logging GDB sync`);
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function runBusinessAudit(businessId: string): Promise<AuditResult> {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for backend logic
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => { },
            },
        }
    );

    // 1. Fetch real counts
    const [{ count: reviewsCount }, { count: postsCount }, { data: business }] = await Promise.all([
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("business_id", businessId),
        supabase.from("google_posts").select("*", { count: "exact", head: true }).eq("business_id", businessId),
        supabase.from("businesses").select("*").eq("id", businessId).single()
    ]);

    // 2. Score logic (Dynamic based on data)
    // Photos: 0-25 (Mocked for now as we don't sync photos yet)
    let photosScore = 15;

    // Info: 0-25
    let infoScore = 10;
    if (business?.category) infoScore += 5;
    if (business?.phone) infoScore += 5;
    if (business?.website) infoScore += 5;

    // Reviews: 0-20
    let reviewsScore = Math.min(20, (reviewsCount || 0) * 2);
    if (reviewsCount && reviewsCount > 50) reviewsScore = 20;

    // Posts: 0-15
    let postsScore = Math.min(15, (postsCount || 0) * 3);

    // GEO: 0-15 (Still mocked until RadarLocal is fully integrated)
    const geoScore = 8;

    const totalScore = photosScore + infoScore + reviewsScore + postsScore + geoScore;

    const tasks: AuditResult["tasks"] = [];

    if (reviewsScore < 15) {
        tasks.push({
            id: "t1",
            priority: "high",
            category: "reviews",
            text: reviewsCount === 0 ? "Você ainda não tem avaliações sincronizadas." : "Você tem avaliações pendentes sem resposta",
            href: "/reviews",
        });
    }

    if (postsScore < 10) {
        tasks.push({
            id: "t2",
            priority: "high",
            category: "posts",
            text: "Crie mais posts no Google para aumentar seu alcance",
            href: "/posts",
        });
    }

    if (geoScore < 10) {
        tasks.push({
            id: "t3",
            priority: "medium",
            category: "geo",
            text: "Sua visibilidade em IAs (Gemini/ChatGPT) pode ser melhorada",
            href: "/geo",
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
