import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cookies } from "next/headers";

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
  type ProfileRow = { name: string | null; plan: string; created_at: string };
  let profile: ProfileRow | null = null;
  try {
    const result = await supabase
      .from("profiles")
      .select("name, plan, created_at")
      .eq("id", user.id)
      .single();
    profile = (result.data as ProfileRow | null) ?? null;
  } catch {
    // migration ainda não rodada — usa defaults
  }

  // Verifica expiração do trial de 14 dias para o plano free
  if (profile?.plan === 'free' && profile?.created_at) {
    const trialDays = 14;
    const createdDate = new Date(profile.created_at);
    const currentDate = new Date();

    const diffTime = currentDate.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > trialDays) {
      redirect("/precos?trial_expired=true");
    }
  }

  const { data: businessesData } = (await supabase
    .from("businesses")
    .select("id, name")
    .eq("user_id", user.id)) as { data: any[]; error: any };

  const validBusinesses = businessesData || [];

  const cookieStore = cookies();
  const activeBusinessIdFromCookie = cookieStore.get("active_business_id")?.value;

  let activeBusinessId = null;
  if (validBusinesses.length > 0) {
    if (activeBusinessIdFromCookie && validBusinesses.some(b => b.id === activeBusinessIdFromCookie)) {
      activeBusinessId = activeBusinessIdFromCookie;
    } else {
      activeBusinessId = validBusinesses[0].id;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F0D]">
      <Sidebar
        userName={profile?.name ?? ""}
        userEmail={user.email ?? ""}
        plan={profile?.plan ?? "free"}
        businesses={validBusinesses}
        activeBusinessId={activeBusinessId}
      />
      {/* Offset do conteúdo: ml-60 em md+, mt-14 em mobile */}
      <main className="flex-1 md:ml-60 mt-14 md:mt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
