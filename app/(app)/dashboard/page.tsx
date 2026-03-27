import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUser,
  getUserBusinesses,
  getBusinessAudits,
  getBusinessReviews,
  getBusinessInsights,
  getBusinessGeoChecks
} from "@/lib/supabase/queries";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard | Vitrine.ai",
  description: "Visão geral do seu negócio no Vitrine.ai"
};

export default async function DashboardPage() {
  const user = await getUser().catch(() => null);
  if (!user) redirect("/login");

  const businesses = await getUserBusinesses().catch(() => []);

  if (!businesses || businesses.length === 0) {
    const businessUrl = user.user_metadata?.onboarding_business_url;
    return <EmptyDashboard onboardingUrl={businessUrl} />;
  }

  const business = businesses[0];

  // ✅ CONSOLIDAR queries: usar select() com relacionamentos ao invés de N+1
  const supabase = await createClient();
  const { data: businessData } = await supabase
    .from('businesses')
    .select(`
      *,
      audits(*),
      reviews(*),
      insights(*),
      geo_checks(*)
    `)
    .eq('id', business.id)
    .single()
    .catch(() => ({ data: null }));

  const audits = businessData?.audits ?? [];
  const reviews = businessData?.reviews ?? [];
  const insights = businessData?.insights?.[0] ?? null;
  const geoChecks = businessData?.geo_checks ?? [];

  const latestAudit = audits.length > 0 ? audits[0] : null;
  // Filter for reviews that don't have an ai_response or aren't published
  const pendingReviewsCount = reviews.filter((r: any) => !r.ai_response && r.response_status !== 'published').length;

  return (
    <DashboardClient
      business={business}
      latestAudit={latestAudit}
      pendingReviewsCount={pendingReviewsCount}
      insights={insights}
      geoChecks={geoChecks}
    />
  );
}
