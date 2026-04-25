import { Router } from "express";

import { query } from "../db/client";

type SiteLookupRow = {
  id: string;
};

type CustomEventBody = {
  name?: string;
  properties?: Record<string, unknown>;
  sessionId?: string;
};

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

    const { name, properties, sessionId } = req.body as CustomEventBody;

    if (typeof name !== "string" || !name || typeof sessionId !== "string" || !sessionId) {
      res.status(400).json({ error: "Missing required fields: name, sessionId" });
      return;
    }

    if (properties !== undefined && !isRecord(properties)) {
      res.status(400).json({ error: "Invalid field: properties" });
      return;
    }

    await query(
      `
        INSERT INTO custom_events (site_id, name, properties, session_id)
        VALUES ($1, $2, $3, $4)
      `,
      [siteId, name, JSON.stringify(properties ?? {}), sessionId],
    );

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export const eventsRouter = router;
