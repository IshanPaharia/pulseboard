"use client";

import { useEffect, useState } from "react";

import type { RealtimeStats } from "@pulseboard/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type SSEState = {
  connectionKey: string;
  stats: RealtimeStats | null;
};

export function useSSE(siteId: string, apiKey: string): RealtimeStats | null {
  const connectionKey = `${siteId}:${apiKey}`;
  const [state, setState] = useState<SSEState>({
    connectionKey,
    stats: null,
  });

  useEffect(() => {
    if (!siteId || !apiKey) {
      return;
    }

    const streamUrl = new URL(`/api/stream/${siteId}`, apiBaseUrl);
    streamUrl.searchParams.set("key", apiKey);

    const eventSource = new EventSource(streamUrl.toString());

    eventSource.onmessage = (event) => {
      setState({
        connectionKey,
        stats: JSON.parse(event.data) as RealtimeStats,
      });
    };

    eventSource.onerror = () => {
      setState({
        connectionKey,
        stats: null,
      });
    };

    return () => {
      eventSource.close();
    };
  }, [apiKey, connectionKey, siteId]);

  if (!siteId || !apiKey || state.connectionKey !== connectionKey) {
    return null;
  }

  return state.stats;
}
