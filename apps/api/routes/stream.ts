import crypto from "node:crypto";
import { Router } from "express";

import { query } from "../db/client";
import { redisService } from "../services/redis";
import { sseManager } from "../services/sse";

type SiteLookupRow = {
  id: string;
};

const router = Router();

router.get("/:siteId", async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    const sites = await query<SiteLookupRow>(
      "SELECT id FROM sites WHERE id::text = $1 AND api_key::text = $2 LIMIT 1",
      [siteId, apiKey],
    );

    if (!sites[0]) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const clientId = crypto.randomUUID();
    sseManager.addClient(siteId, { id: clientId, siteId, res });

    const stats = await redisService.getRealtimeStats(siteId);
    res.write(`data: ${JSON.stringify(stats)}\n\n`);

    req.on("close", () => {
      sseManager.removeClient(siteId, clientId);
    });
  } catch (error) {
    next(error);
  }
});

export const streamRouter = router;
