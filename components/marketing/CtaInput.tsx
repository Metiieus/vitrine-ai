"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CtaInput() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/analisar?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 max-w-[480px] mx-auto"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nome do seu negócio..."
        className="flex-1 px-[18px] py-3.5 rounded-[10px] border border-[#3a3f3c] bg-[#1a1f1c] text-[#FAFBFA] text-[15px] font-sans outline-none transition-colors duration-200 placeholder:text-[#5a5f5c] focus:border-[rgba(29,158,117,0.5)]"
      />
      <button
        type="submit"
        className="px-7 py-3.5 rounded-[10px] bg-[#1D9E75] text-white text-[15px] font-medium whitespace-nowrap transition-all duration-200 hover:bg-[#3DB88E] hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(29,158,117,0.3)] active:translate-y-0"
      >
        Analisar →
      </button>
    </form>
  );
}
