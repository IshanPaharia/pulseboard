import type { RealtimeStats } from "@pulseboard/types";

export type HistoryPoint = {
  hour: string;
  count: number;
};

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3001"
    );
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getRealtimeStats(siteId: string): Promise<RealtimeStats> {
  return fetchJson<RealtimeStats>(`/api/stats/${siteId}/live`);
}

export async function getHistory(siteId: string): Promise<HistoryPoint[]> {
  return fetchJson<HistoryPoint[]>(`/api/stats/${siteId}/history`);
}
