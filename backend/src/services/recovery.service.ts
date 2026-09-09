import prisma from "../lib/prisma.js";
import { emailQueue } from "../queue/email.queue.js";
import { env } from "../config/env.js";

export const recoverScheduledEmails = async () => {
  console.log("Starting email recovery...");

  // Any PROCESSING email from a previous worker instance
  // may have been interrupted. Put it back into SCHEDULED.
const stuckThreshold = new Date(
  Date.now() - 5 * 60 * 1000
);

await prisma.email.updateMany({
  where: {
    status: "PROCESSING",
    processingStartedAt: {
      lt: stuckThreshold,
    },
  },
  data: {
    status: "SCHEDULED",
    processingStartedAt: null,
  },
});

  const scheduledEmails = await prisma.email.findMany({
    where: {
      status: "SCHEDULED",
    },
  });

  let recovered = 0;

  for (const email of scheduledEmails) {
    const existingJob = await emailQueue.getJob(email.id);

    if (existingJob) {
      continue;
    }

    const delay = Math.max(
      0,
      email.scheduledAt.getTime() - Date.now()
    );

    await emailQueue.add(
      "send-email",
      {
        emailId: email.id,
      },
      {
        jobId: email.id,
        delay,
        attempts: env.EMAIL_MAX_ATTEMPTS,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    recovered++;

    console.log(`Recovered email job: ${email.id}`);
  }

  console.log(
    `Email recovery completed. Recovered ${recovered} jobs.`
  );
};