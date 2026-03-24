"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Star,
  FileText,
  Globe,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
  ChevronRight,
  MapPin,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Dashboard",      icon: LayoutDashboard, badge: undefined, lock: undefined },
  { href: "/auditoria",    label: "Auditoria",      icon: ClipboardCheck,  badge: undefined, lock: undefined },
  { href: "/reviews",      label: "Reviews",        icon: Star,            badge: undefined, lock: undefined },
  { href: "/posts",        label: "Google Posts",   icon: FileText,        badge: undefined, lock: undefined },
  { href: "/geo",          label: "Monitor GEO",    icon: Globe,           badge: "NOVO",    lock: undefined },
  { href: "/radar-local",  label: "RadarLocal",     icon: MapPin,          badge: undefined, lock: "agency"  },
  { href: "/relatorios",   label: "Relatórios",     icon: BarChart3,       badge: undefined, lock: undefined },
  { href: "/configuracoes",label: "Configurações",  icon: Settings,        badge: undefined, lock: undefined },
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "text-[#5a5f5c] bg-[#2a2f2c]" },
  essential: { label: "Essencial", color: "text-[#5DCAA5] bg-[rgba(93,202,165,0.1)]" },
  pro: { label: "Profissional", color: "text-[#1D9E75] bg-[rgba(29,158,117,0.15)]" },
  agency: { label: "Agência", color: "text-[#EF9F27] bg-[rgba(239,159,39,0.12)]" },
};

interface SidebarProps {
  userName: string;
  userEmail: string;
  plan: string;
}

export function Sidebar({ userName, userEmail, plan }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free;
  const displayName = userName || userEmail?.split("@")[0] || "Usuário";

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0A0F0D] border-b border-[#2a2f2c] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-sm font-semibold text-[#FAFBFA]">
            vitrine<span className="text-[#1D9E75]">.ai</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-[#9a9f9c] hover:text-[#FAFBFA] hover:bg-[#2a2f2c] transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 flex flex-col bg-[#0d1210] border-r border-[#2a2f2c] transition-transform duration-300",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#2a2f2c] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[17px] font-semibold text-[#FAFBFA]">
              vitrine<span className="text-[#1D9E75]">.ai</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-[#5a5f5c] hover:text-[#FAFBFA] hover:bg-[#2a2f2c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]"
                      : "text-[#9a9f9c] hover:bg-[#2a2f2c] hover:text-[#FAFBFA]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      active ? "text-[#1D9E75]" : "text-[#5a5f5c]"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(29,158,117,0.15)] text-[#5DCAA5] uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {item.lock && (
                    <Lock className="w-3 h-3 text-[#EF9F27] opacity-70" />
                  )}
                  {active && !item.lock && (
                    <ChevronRight className="w-3 h-3 text-[#1D9E75] opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Upgrade CTA (free plan) */}
          {plan === "free" && (
            <div className="mt-4 p-3.5 rounded-xl border border-[rgba(29,158,117,0.15)] bg-[rgba(29,158,117,0.05)]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#EF9F27]" />
                <span className="text-xs font-semibold text-[#FAFBFA]">
                  Fazer upgrade
                </span>
              </div>
              <p className="text-[11px] text-[#5a5f5c] leading-relaxed mb-3">
                Desbloqueie respostas IA ilimitadas, monitor GEO e relatório PDF.
              </p>
              <Link
                href="/configuracoes"
                className="block text-center text-[11px] font-semibold py-1.5 rounded-lg bg-[#1D9E75] text-white hover:bg-[#3DB88E] transition-colors"
              >
                Ver planos →
              </Link>
            </div>
          )}
        </nav>

        {/* User info */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-[#2a2f2c]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#FAFBFA] truncate">
                {displayName}
              </div>
              <span
                className={cn(
                  "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5",
                  planInfo.color
                )}
              >
                {planInfo.label}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="20" rx="3" stroke="#1D9E75" strokeWidth="2" />
      <rect x="6" y="6" width="20" height="6" rx="1.5" fill="rgba(29,158,117,.2)" stroke="#1D9E75" strokeWidth="1" />
      <rect x="8" y="15" width="7" height="6" rx="1.5" fill="rgba(93,202,165,.25)" />
      <rect x="17" y="15" width="7" height="6" rx="1.5" fill="rgba(93,202,165,.15)" />
      <circle cx="16" cy="29" r="2.5" fill="#1D9E75" />
      <line x1="16" y1="24" x2="16" y2="26.5" stroke="#1D9E75" strokeWidth="1.5" />
    </svg>
  );
}
