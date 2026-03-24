"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300",
        scrolled &&
          "bg-[rgba(10,15,13,0.85)] backdrop-blur-xl border-b border-[rgba(93,202,165,0.08)]"
      )}
    >
      <div className="max-w-[1120px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon />
          <span className="text-xl font-semibold text-[#eef0ef]">
            vitrine<span className="text-[#1D9E75]">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="#features"
            className="hidden md:block text-sm text-[#9a9f9c] hover:text-[#5DCAA5] transition-colors"
          >
            Recursos
          </Link>
          <Link
            href="#geo"
            className="hidden md:block text-sm text-[#9a9f9c] hover:text-[#5DCAA5] transition-colors"
          >
            GEO
          </Link>
          <Link
            href="#pricing"
            className="hidden md:block text-sm text-[#9a9f9c] hover:text-[#5DCAA5] transition-colors"
          >
            Preços
          </Link>
          <Link
            href="/login"
            className="hidden md:block text-sm text-[#9a9f9c] hover:text-[#5DCAA5] transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="#cta"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-[#1D9E75] text-white transition-all duration-200 hover:bg-[#3DB88E] hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(29,158,117,0.3)]"
          >
            Analisar grátis
          </Link>
        </div>
      </div>
    </nav>
  );
}

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="20" rx="3" stroke="#1D9E75" strokeWidth="2" />
      <rect
        x="6"
        y="6"
        width="20"
        height="6"
        rx="1.5"
        fill="rgba(29,158,117,.2)"
        stroke="#1D9E75"
        strokeWidth="1"
      />
      <rect x="8" y="15" width="7" height="6" rx="1.5" fill="rgba(93,202,165,.25)" />
      <rect x="17" y="15" width="7" height="6" rx="1.5" fill="rgba(93,202,165,.15)" />
      <circle cx="16" cy="29" r="2.5" fill="#1D9E75" />
      <line x1="16" y1="24" x2="16" y2="26.5" stroke="#1D9E75" strokeWidth="1.5" />
    </svg>
  );
}
