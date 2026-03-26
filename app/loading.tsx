import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#0A0F0D] flex flex-col items-center justify-center z-[9999]">
            {/* Glow Effect */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(29,158,117,0.05) 0%, transparent 80%)",
                }}
            />

            <div className="relative flex flex-col items-center gap-4">
                {/* Animated Logo Mark */}
                <div className="animate-pulse mb-2">
                    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                        <rect x="4" y="4" width="24" height="20" rx="3" stroke="#1D9E75" strokeWidth="2" />
                        <circle cx="16" cy="29" r="2.5" fill="#1D9E75" />
                        <line x1="16" y1="24" x2="16" y2="26.5" stroke="#1D9E75" strokeWidth="1.5" />
                    </svg>
                </div>

                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#1D9E75] animate-spin" />
                    <span className="text-sm font-medium text-[#FAFBFA] tracking-wide uppercase opacity-70">
                        Carregando...
                    </span>
                </div>
            </div>
        </div>
    );
}
