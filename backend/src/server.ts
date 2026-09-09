import express from "express";
import cors from "cors";

import emailRoutes from "./modules/emails/email.route.js";
import { env } from "./config/env.js";
import prisma from "./lib/prisma.js";
import redis from "./lib/redis.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/emails", emailRoutes);
console.log("Email routes registered");

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const redisStatus = await redis.ping();

    res.json({
      status: "ok",
      message: "ReachInbox Scheduler API is running",
      database: "connected",
      redis: redisStatus,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Service connection failed",
    });
  }
});

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});