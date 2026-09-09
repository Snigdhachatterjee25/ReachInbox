import { Worker, Job, DelayedError } from "bullmq";

import redis from "../lib/redis.js";
import prisma from "../lib/prisma.js";
import { EMAIL_QUEUE_NAME } from "./email.queue.js";
import { sendEmail } from "../services/email.sender.js";
import {
  checkHourlyRateLimit,
  enforceMinimumSendDelay,
} from "../services/rate-limit.service.js";
import { env } from "../config/env.js";
import { recoverScheduledEmails } from "../services/recovery.service.js";
interface SendEmailJob {
  emailId: string;
}

const worker = new Worker<SendEmailJob>(
  EMAIL_QUEUE_NAME,
  async (
  job: Job<SendEmailJob>,
  token?: string
  ) => {
    console.log(`Processing email job: ${job.id}`);

    const email = await prisma.email.findUnique({
      where: {
        id: job.data.emailId,
      },
    });

    if (!email) {
      throw new Error(
        `Email ${job.data.emailId} not found`
      );
    }

    // Idempotency protection
    if (email.status === "SENT") {
      console.log(
        `Email ${email.id} already sent. Skipping.`
      );

      return;
    }

  const rateLimit = await checkHourlyRateLimit(
  email.senderId
);

if (!rateLimit.allowed && rateLimit.retryAt) {
  console.log(
    `Hourly rate limit reached for sender ${email.senderId}.`
  );

  console.log(
    `Rescheduling email ${email.id} for ${rateLimit.retryAt.toISOString()}`
  );

  if (!token) {
    throw new Error(
      "Worker token unavailable while rescheduling rate-limited job"
    );
  }

  await job.moveToDelayed(
    rateLimit.retryAt.getTime(),
    token
  );

  throw new DelayedError();
}

  const minDelayResult = await enforceMinimumSendDelay(email.senderId);

if (!minDelayResult.allowed) {
  const retryAt = minDelayResult.retryAt!;

  await job.moveToDelayed(retryAt.getTime(), job.token!);

  console.log(
    `Minimum send delay reached. Email ${email.id} rescheduled for ${retryAt.toISOString()}`
  );

  throw new DelayedError();
}

    const claimResult = await prisma.email.updateMany({
  where: {
    id: email.id,
    status:  "SCHEDULED",
  },
  data: {
  status: "PROCESSING",
  attempts: { increment: 1 },
  processingStartedAt: new Date(),
},
});

if (claimResult.count === 0) {
  console.log(
    `Email ${email.id} was already claimed or sent. Skipping.`
  );

  return;
}
    try {
        const info = await sendEmail({
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      });

      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
          messageId: info.messageId,
          processingStartedAt: null,
          error: null,
        },
      });

      console.log(
        `Email ${email.id} marked as SENT`
      );
    } catch (error) {

  const isLastAttempt =
  job.attemptsMade + 1 >= env.EMAIL_MAX_ATTEMPTS;

    if (isLastAttempt) {
      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "FAILED",
          processingStartedAt: null,
          error:
            error instanceof Error
              ? error.message
              : "Unknown email sending error",
        },
      });

      console.error(
  `Email ${email.id} permanently failed after ${env.EMAIL_MAX_ATTEMPTS} attempts`
);
    } else {
      await prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          status: "SCHEDULED",
          processingStartedAt: null,
          error:
            error instanceof Error
              ? error.message
              : "Temporary email sending error",
        },
      });

      console.log(
        `Email ${email.id} failed. BullMQ will retry.`
      );
    }

    throw error;
  }
  },
  {
    connection: redis,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(
    `Job failed: ${job?.id}`,
    error
  );
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

console.log("Email worker started");

recoverScheduledEmails().catch((error) => {
  console.error("Email recovery failed:", error);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down worker...`);

  await worker.close();
  await redis.quit();
  await prisma.$disconnect();

  console.log("Worker shut down cleanly.");
  process.exit(0);
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});