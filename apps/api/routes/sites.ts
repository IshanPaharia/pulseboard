import { Router } from "express";

import { query } from "../db/client";

type SiteRow = {
  id: string;
  api_key: string;
};

type CreateSiteBody = {
  domain?: string;
};

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { domain } = req.body as CreateSiteBody;
    const normalizedDomain = domain?.trim().toLowerCase();

    if (!normalizedDomain) {
      res.status(400).json({ error: "Missing required field: domain" });
      return;
    }

    const rows = await query<SiteRow>(
      `
        INSERT INTO sites (domain)
        VALUES ($1)
        ON CONFLICT (domain) DO UPDATE SET domain = EXCLUDED.domain
        RETURNING id, api_key
      `,
      [normalizedDomain],
    );

    const site = rows[0];
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    const embedSnippet = `<script defer data-api-key="${site.api_key}" src="${apiBaseUrl}/pb.js"></script>`;

    res.status(201).json({
      siteId: site.id,
      apiKey: site.api_key,
      embedSnippet,
    });
  } catch (error) {
    next(error);
  }
});

export const sitesRouter = router;
