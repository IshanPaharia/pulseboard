import dotenv from "dotenv";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";

import { db } from "./db/client";
import { migrate } from "./db/migrate";
import { collectRouter } from "./routes/collect";
import { statsRouter } from "./routes/stats";
import { redisService } from "./services/redis";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

const collectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", async (_req, res, next) => {
  try {
    await db.query("SELECT 1");
    await redisService.ping();
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use("/collect", collectLimiter, collectRouter);
app.use("/api/stats", statsRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Unhandled API error", error);
  res.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await migrate();
    app.listen(port, () => {
      console.log(`PulseBoard API listening on port ${port}`);
    });
  } catch (error) {
    console.error("PulseBoard API startup aborted because migrations failed", error);
    await redisService.quit();
    await db.end();
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await redisService.quit();
  await db.end();
  process.exit(0);
});

void start();
