export interface PageviewEvent {
  siteId: string;
  url: string;
  referrer: string;
  sessionId: string;
  title: string;
  userAgent: string;
  ipHash: string;
  country?: string;
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  siteId: string;
  startedAt: number;
  lastSeenAt: number;
  pageCount: number;
}

export interface RealtimeStats {
  liveVisitors: number;
  totalToday: number;
  topPages: Array<{ url: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
}

export interface CustomEvent {
  siteId: string;
  name: string;
  properties: Record<string, unknown>;
  sessionId: string;
  timestamp: number;
}
