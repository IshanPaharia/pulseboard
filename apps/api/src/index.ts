import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 3001);
const databaseUrl = process.env.DATABASE_URL ?? "postgres://pulse:pulse@postgres:5432/pulseboard";
const redisUrl = process.env.REDIS_URL ?? "redis://redis:6379";

const pgPool = new Pool({
  connectionString: databaseUrl,
});

const redis = new Redis(redisUrl);

app.get("/health", async (_req, res) => {
  try {
    await pgPool.query("SELECT 1");
    await redis.ping();
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed", error);
    res.status(500).json({ status: "error" });
  }
});

app.listen(port, () => {
  console.log(`PulseBoard API listening on port ${port}`);
});

process.on("SIGINT", async () => {
  await redis.quit();
  await pgPool.end();
  process.exit(0);
});
