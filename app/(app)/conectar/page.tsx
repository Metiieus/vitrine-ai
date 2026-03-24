import { Suspense } from "react";
import { ConnectBusiness } from "@/components/dashboard/ConnectBusiness";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Conectar Google Meu Negócio",
};

export default function ConectarPage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4 py-12">
      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(29,158,117,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Suspense needed because ConnectBusiness uses useSearchParams */}
        <Suspense
          fallback={
            <div className="flex items-center gap-3 text-[#9a9f9c]">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando...
            </div>
          }
        >
          <ConnectBusiness />
        </Suspense>
      </div>
    </div>
  );
}
