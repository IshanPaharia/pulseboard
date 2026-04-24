import path from "node:path";
import dotenv from "dotenv";
import Redis from "ioredis";

import type { PageviewEvent, RealtimeStats } from "@pulseboard/types";

dotenv.config();

if (!process.env.REDIS_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
}

const redisTtlSeconds = 172_800;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function topTen<K extends "url" | "referrer">(
  counts: Map<string, number>,
  key: K,
): Array<Record<K, string> & { count: number }> {
  return Array.from(counts.entries())
    .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
    .slice(0, 10)
    .map(([value, count]) => ({ [key]: value, count }) as Record<K, string> & { count: number });
}

class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL ?? "redis://redis:6379");
  }

  async trackPageview(event: PageviewEvent): Promise<void> {
    const viewsKey = `pulseboard:views:${event.siteId}`;
    const totalKey = `pulseboard:total:${event.siteId}:${todayKey()}`;

    await this.client
      .multi()
      .zadd(viewsKey, event.timestamp, JSON.stringify(event))
      .incr(totalKey)
      .expire(viewsKey, redisTtlSeconds)
      .expire(totalKey, redisTtlSeconds)
      .exec();
  }

  async getLiveVisitorCount(siteId: string): Promise<number> {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    return this.client.zcount(`pulseboard:views:${siteId}`, fiveMinutesAgo, now);
  }

  async getRealtimeStats(siteId: string): Promise<RealtimeStats> {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const totalKey = `pulseboard:total:${siteId}:${todayKey()}`;
    const viewsKey = `pulseboard:views:${siteId}`;

    const [liveVisitors, totalTodayValue, recentViews] = await Promise.all([
      this.getLiveVisitorCount(siteId),
      this.client.get(totalKey),
      this.client.zrangebyscore(viewsKey, oneHourAgo, now),
    ]);

    const pageCounts = new Map<string, number>();
    const referrerCounts = new Map<string, number>();

    for (const view of recentViews) {
      try {
        const event = JSON.parse(view) as Partial<PageviewEvent>;

        if (event.url) {
          pageCounts.set(event.url, (pageCounts.get(event.url) ?? 0) + 1);
        }

        if (event.referrer) {
          referrerCounts.set(event.referrer, (referrerCounts.get(event.referrer) ?? 0) + 1);
        }
      } catch {
        // Skip malformed cached entries without taking down the stats endpoint.
      }
    }

    return {
      liveVisitors,
      totalToday: Number(totalTodayValue ?? 0),
      topPages: topTen(pageCounts, "url"),
      topReferrers: topTen(referrerCounts, "referrer"),
    };
  }

  async publish(siteId: string, stats: RealtimeStats): Promise<void> {
    await this.client.publish(`pulseboard:updates:${siteId}`, JSON.stringify(stats));
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}

export const redisService = new RedisService();
