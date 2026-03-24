"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

const BARS = [
  { label: "Fotos e mídia", value: 75, type: "good" as const },
  { label: "Descrição e categorias", value: 45, type: "mid" as const },
  { label: "Reviews respondidas", value: 15, type: "bad" as const },
  { label: "Google Posts", value: 0, type: "bad" as const },
  { label: "Visibilidade em IAs", value: 40, type: "mid" as const },
];

const TASKS = [
  { dot: "red" as const, text: "Responder 12 avaliações sem resposta" },
  { dot: "amber" as const, text: "Adicionar horário especial de feriado" },
  { dot: "green" as const, text: "Publicar post semanal com IA" },
];

const BAR_STYLES = {
  good: { fill: "bg-[#1D9E75]", text: "text-[#5DCAA5]" },
  mid: { fill: "bg-[#EF9F27]", text: "text-[#EF9F27]" },
  bad: { fill: "bg-[#E24B4A]", text: "text-[#F09595]" },
};

const DOT_COLORS = {
  red: "bg-[#E24B4A]",
  amber: "bg-[#EF9F27]",
  green: "bg-[#1D9E75]",
};

export function ScoreCardMockup() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-[#1a1f1c] border border-[rgba(93,202,165,0.1)] rounded-2xl p-8 max-w-[640px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-base font-semibold text-white">
            CP
          </div>
          <div>
            <div className="text-[15px] font-medium text-[#eef0ef]">
              Casa da Pizza — Moema
            </div>
            <div className="text-xs text-[#5a5f5c]">Restaurante · São Paulo, SP</div>
          </div>
        </div>
        <div className="font-display text-5xl font-bold text-[#EF9F27]">
          42<span className="text-xl text-[#5a5f5c]">/100</span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-2.5">
        {BARS.map((bar) => {
          const s = BAR_STYLES[bar.type];
          return (
            <div key={bar.label} className="flex items-center gap-3">
              <span className="text-[13px] text-[#9a9f9c] w-[140px] flex-shrink-0">
                {bar.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-[#2a2f2c]">
                <div
                  className={cn("h-full rounded-full", s.fill)}
                  style={{
                    width: animated ? `${bar.value}%` : "0%",
                    transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              <span className={cn("text-xs font-medium w-8 text-right", s.text)}>
                {bar.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tasks */}
      <div className="mt-5 pt-4 border-t border-[#2a2f2c]">
        <div className="text-[11px] text-[#5a5f5c] uppercase tracking-[0.08em] mb-2.5">
          Tarefas desta semana
        </div>
        <div className="flex flex-col">
          {TASKS.map((t) => (
            <div
              key={t.text}
              className="flex items-center gap-2.5 py-2 text-[13px] text-[#babfbc]"
            >
              <span
                className={cn("w-2 h-2 rounded-full flex-shrink-0", DOT_COLORS[t.dot])}
              />
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
