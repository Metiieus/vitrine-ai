"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface AuditDetails {
  photos: number;
  info: number;
  reviews: number;
  posts: number;
  geo: number;
}

interface AuditBarsProps {
  details: AuditDetails;
  maxValues?: AuditDetails;
}

const DEFAULT_MAX: AuditDetails = {
  photos: 25,
  info: 25,
  reviews: 20,
  posts: 15,
  geo: 15,
};

const BAR_META = [
  { key: "photos" as const, label: "Fotos e mídia", icon: "📷" },
  { key: "info" as const, label: "Informações e categorias", icon: "📋" },
  { key: "reviews" as const, label: "Reviews", icon: "⭐" },
  { key: "posts" as const, label: "Google Posts", icon: "📝" },
  { key: "geo" as const, label: "Visibilidade em IAs", icon: "🤖" },
];

function getBarColor(pct: number) {
  if (pct >= 70) return { fill: "#1D9E75", text: "text-[#5DCAA5]" };
  if (pct >= 40) return { fill: "#EF9F27", text: "text-[#EF9F27]" };
  return { fill: "#E24B4A", text: "text-[#F09595]" };
}

export function AuditBars({ details, maxValues = DEFAULT_MAX }: AuditBarsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {BAR_META.map(({ key, label, icon }) => {
        const value = details[key];
        const max = maxValues[key];
        const pct = Math.round((value / max) * 100);
        const { fill, text } = getBarColor(pct);

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-[13px] text-[#9a9f9c]">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[13px] font-semibold", text)}>
                  {value}
                  <span className="text-[11px] font-normal text-[#5a5f5c]">
                    /{max}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    text
                  )}
                  style={{ background: `${fill}18` }}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#2a2f2c] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: animated ? `${pct}%` : "0%",
                  background: fill,
                  boxShadow: animated ? `0 0 8px ${fill}60` : "none",
                  transition:
                    "width 1.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.4s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
