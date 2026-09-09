import { env } from "../config/env.js";
import {Redis} from "ioredis";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error);
});

export default redis;