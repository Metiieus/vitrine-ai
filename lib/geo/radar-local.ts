/**
 * Serviço para gerenciar geo rankings (RadarLocal)
 */

import { createClient } from "@/lib/supabase/client";

export type GridCell = { rank: number | null; lat: number; lng: number };

export const KEYWORDS = [
  "pizzaria em Moema",
  "pizza artesanal São Paulo",
  "melhor pizza Moema",
  "restaurante pizza zona sul",
  "pizza delivery Moema",
];

export const COL_LABELS = ["Vila Olímpia", "Itaim Bibi", "Brooklin N.", "Moema", "Brooklin S.", "Santo André", "Jabaquara"];
export const ROW_LABELS = ["Pinheiros", "Jardins", "Moema N.", "Centro", "Moema S.", "Saúde", "Cursino"];

/**
 * Buscar grid de rankings do Supabase
 */
export async function fetchGridFromDB(
  businessId: string,
  keyword: string
): Promise<GridCell[][]> {
  const supabase = createClient();

  const { data: rankings, error } = await supabase
    .from("geo_rankings")
    .select("*")
    .eq("business_id", businessId)
    .eq("keyword", keyword)
    .order("grid_row")
    .order("grid_col");

  if (error) {
    console.warn("Erro ao buscar grid:", error);
    return generateMockGrid(keyword); // Fallback
  }

  // Converter array plato em grid 7x7
  const grid: GridCell[][] = [];
  for (let row = 0; row < 7; row++) {
    const rowCells: GridCell[] = [];
    for (let col = 0; col < 7; col++) {
      const ranking = rankings?.find((r) => r.grid_row === row && r.grid_col === col);
      rowCells.push({
        rank: ranking?.rank || null,
        lat: ranking?.latitude ? Number(ranking.latitude) : 0,
        lng: ranking?.longitude ? Number(ranking.longitude) : 0,
      });
    }
    grid.push(rowCells);
  }

  return grid;
}

/**
 * Gerar grid mock (usado quando DB não tem dados)
 */
export function generateMockGrid(keyword: string): GridCell[][] {
  const seed = keyword.length * 7 + keyword.charCodeAt(0);
  const grid: GridCell[][] = [];

  for (let row = 0; row < 7; row++) {
    const rowData: GridCell[] = [];
    for (let col = 0; col < 7; col++) {
      const distFromCenter = Math.sqrt(Math.pow(row - 3, 2) + Math.pow(col - 3, 2));
      const base = Math.round(distFromCenter * 3.5 + ((seed * (row + 1) * (col + 1)) % 5));
      const rank = Math.min(Math.max(1, base + Math.round(((seed % 7) - 3) * 0.5)), 20);
      rowData.push({ rank: row === 3 && col === 3 ? 2 : rank, lat: 0, lng: 0 });
    }
    grid.push(rowData);
  }
  return grid;
}

/**
 * Calcular estatísticas do grid
 */
export function gridStats(grid: GridCell[][]) {
  const ranks = grid.flat().map((c) => c.rank).filter((r): r is number => r !== null);
  const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
  const top3 = ranks.filter((r) => r <= 3).length;
  const top10 = ranks.filter((r) => r <= 10).length;
  const out20 = ranks.filter((r) => r > 15).length;
  return { avg: avg.toFixed(1), top3, top10, out20, total: ranks.length };
}

/**
 * Cor baseado no ranking
 */
export function rankColor(rank: number | null): { bg: string; text: string; border: string } {
  if (rank === null) return { bg: "#1a1f1c", text: "#5a5f5c", border: "#2a2f2c" };
  if (rank <= 3)  return { bg: "rgba(15,110,86,0.3)",  text: "#5DCAA5", border: "rgba(93,202,165,0.4)" };
  if (rank <= 7)  return { bg: "rgba(29,158,117,0.15)", text: "#1D9E75", border: "rgba(29,158,117,0.3)" };
  if (rank <= 10) return { bg: "rgba(239,159,39,0.12)", text: "#EF9F27", border: "rgba(239,159,39,0.3)" };
  if (rank <= 15) return { bg: "rgba(226,75,74,0.1)",  text: "#F09595", border: "rgba(226,75,74,0.25)" };
  return { bg: "rgba(226,75,74,0.06)", text: "#E24B4A", border: "rgba(226,75,74,0.15)" };
}
