import path from "node:path";
import dotenv from "dotenv";
import Redis from "ioredis";

import type { RealtimeStats } from "@pulseboard/types";

import { sseManager } from "./sse";

dotenv.config();

if (!process.env.REDIS_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
}

const updateChannelPrefix = "pulseboard:updates:";
const subscriber = new Redis(process.env.REDIS_URL ?? "redis://redis:6379");

void subscriber.psubscribe(`${updateChannelPrefix}*`).then(() => {
  console.log("Redis subscriber listening on pulseboard:updates:*");
});

subscriber.on("pmessage", (_pattern: string, channel: string, message: string) => {
  if (!channel.startsWith(updateChannelPrefix)) {
    return;
  }

  const siteId = channel.slice(updateChannelPrefix.length);

  try {
    const stats = JSON.parse(message) as RealtimeStats;
    sseManager.broadcast(siteId, stats);
  } catch (error) {
    console.error(`Failed to parse realtime stats update for site ${siteId}`, error);
  }
});

subscriber.on("error", (error) => {
  console.error("Redis subscriber error", error);
});

export async function closeSubscriber(): Promise<void> {
  await subscriber.quit();
}
