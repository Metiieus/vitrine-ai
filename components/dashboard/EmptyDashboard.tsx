"use client";

import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export function EmptyDashboard({ onboardingUrl }: { onboardingUrl?: string }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[rgba(29,158,117,0.1)] flex items-center justify-center mb-6">
        <Building2 className="w-10 h-10 text-[#1D9E75]" />
      </div>
      <h1 className="font-display text-3xl font-bold text-[#FAFBFA] mb-4">
        Bem-vindo ao Vitrine.ai!
      </h1>
      <p className="text-[#9a9f9c] max-w-md mx-auto mb-4 leading-relaxed">
        Para começarmos a analisar seu negócio e gerar insights valiosos, o
        primeiro passo é conectar seu perfil do Google Meu Negócio.
      </p>

      {onboardingUrl && (
        <div className="bg-[rgba(93,202,165,0.05)] border border-[rgba(93,202,165,0.1)] rounded-xl p-4 mb-8 max-w-sm w-full">
          <p className="text-xs text-[#5DCAA5] uppercase tracking-wider font-semibold mb-2">Seu negócio detectado:</p>
          <p className="text-sm text-[#FAFBFA] truncate mb-1">{onboardingUrl}</p>
        </div>
      )}

      <Link
        href="/conectar"
        className="group flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-xl bg-[#1D9E75] text-white font-medium text-[16px] hover:bg-[#3DB88E] transition-all duration-200 shadow-[0_8px_32px_rgba(29,158,117,0.3)]"
      >
        Conectar agora
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
