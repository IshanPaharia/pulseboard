import { Router } from "express";

import { query } from "../db/client";
import { redisService } from "../services/redis";

type HistoryRow = {
  hour: Date;
  count: string;
};

export type HourlyStats = {
  hour: string;
  count: number;
};

const router = Router();

router.get("/:siteId/live", async (req, res, next) => {
  try {
    const stats = await redisService.getRealtimeStats(req.params.siteId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get("/:siteId/history", async (req, res, next) => {
  try {
    const rows = await query<HistoryRow>(
      `
        SELECT date_trunc('hour', created_at) as hour, COUNT(*) as count
        FROM pageviews
        WHERE site_id = $1 AND created_at > now() - interval '24 hours'
        GROUP BY 1
        ORDER BY 1
      `,
      [req.params.siteId],
    );

    const history: HourlyStats[] = rows.map((row) => ({
      hour: row.hour.toISOString(),
      count: Number(row.count),
    }));

    res.json(history);
  } catch (error) {
    next(error);
  }
});

export const statsRouter = router;
