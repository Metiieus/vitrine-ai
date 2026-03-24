"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const SCORE_LABELS = [
  { min: 80, label: "Ótimo", color: "#5DCAA5" },
  { min: 60, label: "Bom", color: "#1D9E75" },
  { min: 40, label: "Regular", color: "#EF9F27" },
  { min: 0, label: "Ruim", color: "#E24B4A" },
];

function getScoreStyle(score: number) {
  return SCORE_LABELS.find((s) => score >= s.min) ?? SCORE_LABELS[3];
}

export function ScoreGauge({ score, size = 172 }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(false);

  const cx = 80;
  const cy = 80;
  const radius = 62;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const style = getScoreStyle(score);
  const offset = animated ? circumference * (1 - score / 100) : circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#2a2f2c"
            strokeWidth={strokeWidth}
          />
          {/* Glow filter */}
          <defs>
            <filter id="score-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={style.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#score-glow)"
            style={{
              transition: "stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-[2.8rem] font-bold leading-none"
            style={{ color: style.color }}
          >
            {score}
          </span>
          <span className="text-xs text-[#5a5f5c] mt-1">de 100</span>
        </div>
      </div>

      {/* Label badge */}
      <span
        className="text-[13px] font-semibold px-3 py-1 rounded-full"
        style={{
          color: style.color,
          background: `${style.color}18`,
        }}
      >
        {style.label}
      </span>
    </div>
  );
}
