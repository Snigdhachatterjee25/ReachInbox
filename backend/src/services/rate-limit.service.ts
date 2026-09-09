import redis from "../lib/redis.js";
import { env } from "../config/env.js";

const ONE_HOUR_SECONDS = 60 * 60;

export const checkHourlyRateLimit = async (
  senderId: string
) => {
  const now = new Date();

  // Current UTC hour window
  const hourWindow = now.toISOString().slice(0, 13);

  // Separate rate-limit counter for each sender and hour
  const key = `email:rate-limit:${senderId}:${hourWindow}`;

  const result = await redis.eval(
    `
    local current = redis.call("INCR", KEYS[1])

    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end

    if current <= tonumber(ARGV[2]) then
      return 1
    end

    redis.call("DECR", KEYS[1])

    return 0
    `,
    1,
    key,
    ONE_HOUR_SECONDS,
    env.MAX_EMAILS_PER_HOUR_PER_SENDER
  );

  // Email is allowed
  if (result === 1) {
    return {
      allowed: true,
      retryAt: null,
    };
  }

  // Rate limit reached.
  // Calculate the beginning of the next UTC hour.
  const nextHour = new Date(now);

  nextHour.setUTCMinutes(0, 0, 0);
  nextHour.setUTCHours(
    nextHour.getUTCHours() + 1
  );

  return {
    allowed: false,
    retryAt: nextHour,
  };
};

export const enforceMinimumSendDelay = async (
  senderId: string
) => {
  const key = `email:min-delay:${senderId}`;

  const now = Date.now();
  const nextAllowedAt = now + env.MIN_EMAIL_DELAY_MS;

  // Atomically reserve the next send slot.
  const result = await redis.set(
    key,
    nextAllowedAt.toString(),
    "PX",
    env.MIN_EMAIL_DELAY_MS,
    "NX"
  );

  // We successfully reserved the slot.
  if (result === "OK") {
    return {
      allowed: true,
      retryAt: null,
    };
  }

  // Another worker already reserved the slot.
  const existingNextAllowedAt = await redis.get(key);

  return {
    allowed: false,
    retryAt: new Date(
      Number(existingNextAllowedAt || nextAllowedAt)
    ),
  };
};