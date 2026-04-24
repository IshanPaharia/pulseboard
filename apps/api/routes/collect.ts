import { Router } from "express";

import type { PageviewEvent } from "@pulseboard/types";

import { query } from "../db/client";
import { hashIp } from "../services/hash";
import { redisService } from "../services/redis";

type SiteLookupRow = {
  id: string;
};

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    const sites = await query<SiteLookupRow>(
      "SELECT id FROM sites WHERE api_key::text = $1 LIMIT 1",
      [apiKey],
    );
    const siteId = sites[0]?.id;

    if (!siteId) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    const body = req.body as Partial<PageviewEvent>;

    if (!body.url || !body.sessionId) {
      res.status(400).json({ error: "Missing required fields: url, sessionId" });
      return;
    }

    const event: PageviewEvent = {
      siteId,
      url: body.url,
      referrer: body.referrer ?? req.get("referer") ?? "",
      sessionId: body.sessionId,
      title: body.title ?? "",
      userAgent: body.userAgent ?? req.get("user-agent") ?? "",
      ipHash: hashIp(req.ip ?? req.socket.remoteAddress ?? ""),
      country: body.country,
      timestamp: Date.now(),
    };

    await query(
      `
        INSERT INTO pageviews (
          site_id,
          url,
          referrer,
          user_agent,
          ip_hash,
          session_id,
          country,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8 / 1000.0))
      `,
      [
        event.siteId,
        event.url,
        event.referrer,
        event.userAgent,
        event.ipHash,
        event.sessionId,
        event.country ?? null,
        event.timestamp,
      ],
    );

    await query(
      `
        INSERT INTO sessions (site_id, session_id, started_at, last_seen_at, page_count)
        VALUES ($1, $2, now(), now(), 1)
        ON CONFLICT (site_id, session_id)
        DO UPDATE SET
          last_seen_at = now(),
          page_count = sessions.page_count + 1
      `,
      [event.siteId, event.sessionId],
    );

    await redisService.trackPageview(event);
    const stats = await redisService.getRealtimeStats(siteId);
    await redisService.publish(siteId, stats);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export const collectRouter = router;
