import fs from "node:fs/promises";
import path from "node:path";

import { db } from "./client";

async function readMigrationSql(): Promise<string> {
  const migrationPaths = [
    path.resolve(process.cwd(), "db", "migrations", "001_init.sql"),
    path.resolve(__dirname, "migrations", "001_init.sql"),
    path.resolve(__dirname, "..", "..", "db", "migrations", "001_init.sql"),
  ];

  for (const migrationPath of migrationPaths) {
    try {
      return await fs.readFile(migrationPath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  throw new Error(`Unable to find 001_init.sql in: ${migrationPaths.join(", ")}`);
}

export async function migrate(): Promise<void> {
  try {
    const sql = await readMigrationSql();
    await db.query(sql);
    console.log("Database migration completed: 001_init.sql");
  } catch (error) {
    console.error("Database migration failed while running 001_init.sql", error);
    throw error;
  }
}

if (require.main === module) {
  migrate()
    .catch(() => {
      process.exitCode = 1;
    })
    .finally(async () => {
      await db.end();
    });
}
