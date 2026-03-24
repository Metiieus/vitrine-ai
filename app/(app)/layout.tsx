import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Tenta buscar perfil — silencia erros se tabelas ainda não existem
  type ProfileRow = { name: string | null; plan: string };
  let profile: ProfileRow | null = null;
  try {
    const result = await supabase
      .from("profiles")
      .select("name, plan")
      .eq("id", user.id)
      .single();
    profile = (result.data as ProfileRow | null) ?? null;
  } catch {
    // migration ainda não rodada — usa defaults
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F0D]">
      <Sidebar
        userName={profile?.name ?? ""}
        userEmail={user.email ?? ""}
        plan={profile?.plan ?? "free"}
      />
      {/* Offset do conteúdo: ml-60 em md+, mt-14 em mobile */}
      <main className="flex-1 md:ml-60 mt-14 md:mt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
