import { redirect } from "next/navigation";
import { getUser, getUserBusinesses, getBusinessAudits, getBusinessReviews } from "@/lib/supabase/queries";
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
    return <EmptyDashboard />;
  }

  const business = businesses[0];

  const [audits, reviews] = await Promise.all([
    getBusinessAudits(business.id).catch(() => []),
    getBusinessReviews(business.id).catch(() => [])
  ]);

  const latestAudit = audits.length > 0 ? audits[0] : null;
  // Filter for reviews that don't have an ai_response or aren't published
  const pendingReviewsCount = reviews.filter((r: any) => !r.ai_response && r.response_status !== 'published').length;

  return (
    <DashboardClient
      business={business}
      latestAudit={latestAudit}
      pendingReviewsCount={pendingReviewsCount}
    />
  );
}
