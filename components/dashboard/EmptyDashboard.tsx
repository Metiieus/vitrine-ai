"use client";

import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export function EmptyDashboard() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[rgba(29,158,117,0.1)] flex items-center justify-center mb-6">
        <Building2 className="w-10 h-10 text-[#1D9E75]" />
      </div>
      <h1 className="font-display text-3xl font-bold text-[#FAFBFA] mb-4">
        Bem-vindo ao Vitrine.ai!
      </h1>
      <p className="text-[#9a9f9c] max-w-md mx-auto mb-8 leading-relaxed">
        Para começarmos a analisar seu negócio e gerar insights valiosos, o
        primeiro passo é conectar seu perfil do Google Meu Negócio.
      </p>
      <Link
        href="/conectar"
        className="group flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-xl bg-[#1D9E75] text-white font-medium text-[16px] hover:bg-[#3DB88E] transition-all duration-200 shadow-[0_8px_32px_rgba(29,158,117,0.3)]"
      >
        Conectar Google Meu Negócio
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
