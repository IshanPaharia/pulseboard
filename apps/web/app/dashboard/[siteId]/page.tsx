import { LiveBadge } from "@/components/LiveBadge";
import { PageviewsChart } from "@/components/PageviewsChart";
import { StatsCard } from "@/components/StatsCard";
import { TopPages } from "@/components/TopPages";
import { getRealtimeStats } from "@/lib/api";

type DashboardPageProps = {
  params: Promise<{
    siteId: string;
  }>;
  searchParams: Promise<{
    key?: string | string[];
    domain?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { siteId } = await params;
  const { key, domain } = await searchParams;
  const apiKey = firstValue(key);
  const siteDomain = firstValue(domain) || `Site ${siteId.slice(0, 8)}`;
  const initialStats = await getRealtimeStats(siteId);
  const topPage = initialStats.topPages[0]?.url ?? "No pages yet";

  return (
    <div className="min-h-screen bg-bg-base">
      <nav className="flex h-14 items-center justify-between border-b border-bg-border bg-bg-surface px-8 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="text-sm font-semibold tracking-tight text-text-primary">PulseBoard</div>
          <div className="truncate text-sm font-medium text-text-secondary">{siteDomain}</div>
        </div>
        <LiveBadge apiKey={apiKey} siteId={siteId} />
      </nav>

      <main className="px-8 py-6">
        <div className="mb-4 grid grid-cols-3 gap-4 max-lg:grid-cols-1">
          <StatsCard title="Total today" value={initialStats.totalToday} />
          <StatsCard title="Live now" value={initialStats.liveVisitors} />
          <StatsCard title="Top page" value={topPage} />
        </div>

        <div className="grid gap-4">
          <PageviewsChart apiKey={apiKey} siteId={siteId} />
          <TopPages apiKey={apiKey} siteId={siteId} />
        </div>
      </main>
    </div>
  );
}
