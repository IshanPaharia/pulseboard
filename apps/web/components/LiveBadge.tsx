"use client";

import { useSSE } from "@/hooks/useSSE";

type LiveBadgeProps = {
  siteId: string;
  apiKey: string;
};

export function LiveBadge({ siteId, apiKey }: LiveBadgeProps) {
  const stats = useSSE(siteId, apiKey);

  if (!stats) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-bg-raised px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-text-muted" />
        <span className="text-xs font-medium text-text-secondary">connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-brand-muted px-3 py-1.5">
      <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
      <span className="text-xs font-medium text-text-secondary">
        {stats.liveVisitors} live now
      </span>
    </div>
  );
}
