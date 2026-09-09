import { Queue } from "bullmq";
import redis from "../lib/redis.js";

export const EMAIL_QUEUE_NAME = "email-sending";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redis,
});