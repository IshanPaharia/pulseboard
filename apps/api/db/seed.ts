import { db, query } from "./client";

type SiteSeedRow = {
  api_key: string;
};

async function seed(): Promise<void> {
  try {
    const rows = await query<SiteSeedRow>(
      `
        WITH inserted AS (
          INSERT INTO sites (domain)
          VALUES ('localhost')
          ON CONFLICT DO NOTHING
          RETURNING api_key
        )
        SELECT api_key FROM inserted
        UNION ALL
        SELECT api_key
        FROM sites
        WHERE domain = 'localhost'
          AND NOT EXISTS (SELECT 1 FROM inserted)
      `,
    );

    const apiKey = rows[0]?.api_key;
    console.log(`Seed site ready: localhost api_key=${apiKey ?? "unknown"}`);
  } catch (error) {
    console.error("Database seed failed", error);
    throw error;
  }
}

seed()
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
