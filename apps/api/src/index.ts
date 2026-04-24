import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";

import { db } from "../db/client";
import { migrate } from "../db/migrate";

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 3001);
const redisUrl = process.env.REDIS_URL ?? "redis://redis:6379";

const redis = new Redis(redisUrl);

app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    await redis.ping();
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed", error);
    res.status(500).json({ status: "error" });
  }
});

async function start(): Promise<void> {
  try {
    await migrate();
    app.listen(port, () => {
      console.log(`PulseBoard API listening on port ${port}`);
    });
  } catch (error) {
    console.error("PulseBoard API startup aborted because migrations failed", error);
    await redis.quit();
    await db.end();
    process.exit(1);
  }
}

void start();

process.on("SIGINT", async () => {
  await redis.quit();
  await db.end();
  process.exit(0);
});
