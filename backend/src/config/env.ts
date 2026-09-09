import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 4000),

  DATABASE_URL: process.env.DATABASE_URL || "",

  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),

  WORKER_CONCURRENCY: Number(
  process.env.WORKER_CONCURRENCY || 5
),

  MIN_EMAIL_DELAY_MS: Number(
  process.env.MIN_EMAIL_DELAY_MS || 2000
),

  MAX_EMAILS_PER_HOUR_PER_SENDER: Number(
  process.env.MAX_EMAILS_PER_HOUR_PER_SENDER || 100
),

  EMAIL_MAX_ATTEMPTS: Number(
  process.env.EMAIL_MAX_ATTEMPTS || 3
),
};