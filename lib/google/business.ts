/**
 * Google Business Profile API wrappers.
 *
 * APIs used:
 * - Account Management: mybusinessaccountmanagement.googleapis.com/v1
 * - Business Information: mybusinessbusinessinformation.googleapis.com/v1
 * - Reviews (v4):        mybusiness.googleapis.com/v4
 * - Performance:         businessprofileperformance.googleapis.com/v1
 */

const ACCOUNT_MGMT = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BIZ_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GBP_V4 = "https://mybusiness.googleapis.com/v4";
const PERFORMANCE = "https://businessprofileperformance.googleapis.com/v1";

type GoogleFetch = (url: string, init?: RequestInit) => Promise<unknown>;

// ─── Accounts ────────────────────────────────────────────────────────────────

export interface GBPAccount {
  name: string;          // "accounts/12345678"
  accountName: string;
  type: "PERSONAL" | "LOCATION_GROUP" | "USER_GROUP" | "ORGANIZATION";
  role?: string;
  verificationState?: string;
}

export async function listAccounts(gFetch: GoogleFetch): Promise<GBPAccount[]> {
  const data = (await gFetch(`${ACCOUNT_MGMT}/accounts?pageSize=20`)) as {
    accounts?: GBPAccount[];
  };
  return data.accounts ?? [];
}

// ─── Locations ───────────────────────────────────────────────────────────────

export interface GBPAddress {
  addressLines?: string[];
  locality?: string;           // city
  administrativeArea?: string; // state
  postalCode?: string;
  regionCode?: string;         // country code (BR)
}

export interface GBPLocation {
  name: string;                // "accounts/{id}/locations/{id}"
  title: string;
  categories?: {
    primaryCategory?: { displayName: string; name: string };
    additionalCategories?: Array<{ displayName: string; name: string }>;
  };
  storefrontAddress?: GBPAddress;
  phoneNumbers?: { primaryPhone?: string };
  websiteUri?: string;
  regularHours?: unknown;
  specialHours?: unknown;
  profile?: { description?: string };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
    placeId?: string;
  };
  latlng?: { latitude: number; longitude: number };
}

export async function listLocations(
  gFetch: GoogleFetch,
  accountName: string
): Promise<GBPLocation[]> {
  const readMask = [
    "name",
    "title",
    "categories",
    "storefrontAddress",
    "phoneNumbers",
    "websiteUri",
    "metadata",
    "profile",
  ].join(",");

  const data = (await gFetch(
    `${BIZ_INFO}/${accountName}/locations?readMask=${readMask}&pageSize=100`
  )) as { locations?: GBPLocation[] };

  return data.locations ?? [];
}

export async function getLocation(
  gFetch: GoogleFetch,
  locationName: string
): Promise<GBPLocation> {
  const readMask = "name,title,categories,storefrontAddress,phoneNumbers,websiteUri,metadata,profile";
  return (await gFetch(
    `${BIZ_INFO}/${locationName}?readMask=${readMask}`
  )) as GBPLocation;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type StarRating = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";

const STAR_MAP: Record<StarRating, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

export function starRatingToNumber(rating: StarRating): number {
  return STAR_MAP[rating] ?? 0;
}

export interface GBPReview {
  name: string;              // "accounts/.../locations/.../reviews/{reviewId}"
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous?: boolean;
  };
  starRating: StarRating;
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface ReviewsResponse {
  reviews: GBPReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

export async function listReviews(
  gFetch: GoogleFetch,
  locationName: string,
  pageToken?: string
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    pageSize: "50",
    orderBy: "updateTime desc",
  });
  if (pageToken) params.set("pageToken", pageToken);

  const data = (await gFetch(
    `${GBP_V4}/${locationName}/reviews?${params}`
  )) as ReviewsResponse;

  return {
    reviews: data.reviews ?? [],
    averageRating: data.averageRating,
    totalReviewCount: data.totalReviewCount,
    nextPageToken: data.nextPageToken,
  };
}

// ─── Insights / Performance ───────────────────────────────────────────────────

export type InsightMetric =
  | "BUSINESS_IMPRESSIONS_DESKTOP_MAPS"
  | "BUSINESS_IMPRESSIONS_MOBILE_MAPS"
  | "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"
  | "BUSINESS_IMPRESSIONS_MOBILE_SEARCH"
  | "BUSINESS_CONVERSATIONS"
  | "BUSINESS_DIRECTION_REQUESTS"
  | "CALL_CLICKS"
  | "WEBSITE_CLICKS"
  | "BUSINESS_BOOKINGS"
  | "BUSINESS_FOOD_ORDERS";

export interface InsightSummary {
  searches: number;   // desktop + mobile impressions (maps + search)
  views: number;      // maps views
  calls: number;
  directionRequests: number;
  websiteClicks: number;
  period: { start: string; end: string };
}

function sumDailyValues(timeSeries: unknown): number {
  const ts = timeSeries as {
    datedValues?: Array<{ value?: string }>;
  } | null;
  if (!ts?.datedValues) return 0;
  return ts.datedValues.reduce((sum, d) => sum + Number(d.value ?? 0), 0);
}

export async function getInsightsSummary(
  gFetch: GoogleFetch,
  locationName: string,
  days = 30
): Promise<InsightSummary> {
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  function dateParams(prefix: string, date: Date) {
    return {
      [`${prefix}.year`]: String(date.getFullYear()),
      [`${prefix}.month`]: String(date.getMonth() + 1),
      [`${prefix}.day`]: String(date.getDate()),
    };
  }

  const METRICS: InsightMetric[] = [
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "BUSINESS_DIRECTION_REQUESTS",
    "CALL_CLICKS",
    "WEBSITE_CLICKS",
  ];

  const results = await Promise.allSettled(
    METRICS.map(async (metric) => {
      const params = new URLSearchParams({
        dailyMetric: metric,
        ...dateParams("dailyRange.startDate", startDate),
        ...dateParams("dailyRange.endDate", endDate),
      });
      const data = (await gFetch(
        `${PERFORMANCE}/${locationName}:getDailyMetricsTimeSeries?${params}`
      )) as { timeSeries?: unknown };
      return { metric, total: sumDailyValues(data.timeSeries) };
    })
  );

  const totals: Partial<Record<InsightMetric, number>> = {};
  for (const r of results) {
    if (r.status === "fulfilled") totals[r.value.metric] = r.value.total;
  }

  return {
    searches:
      (totals.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH ?? 0) +
      (totals.BUSINESS_IMPRESSIONS_MOBILE_SEARCH ?? 0),
    views:
      (totals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS ?? 0) +
      (totals.BUSINESS_IMPRESSIONS_MOBILE_MAPS ?? 0),
    calls: totals.CALL_CLICKS ?? 0,
    directionRequests: totals.BUSINESS_DIRECTION_REQUESTS ?? 0,
    websiteClicks: totals.WEBSITE_CLICKS ?? 0,
    period: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    },
  };
}
