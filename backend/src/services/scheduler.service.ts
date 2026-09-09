import { emailQueue } from "../queue/email.queue.js";
import { createEmail } from "./email.service.js";
import { env } from "../config/env.js";

interface ScheduleEmailInput {
  userId: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
}

export const scheduleEmail = async (data: ScheduleEmailInput) => {
  const email = await createEmail(data);

  const requestedDelay =
  data.scheduledAt.getTime() - Date.now();

  const delay = Math.max(
  env.MIN_EMAIL_DELAY_MS,
  requestedDelay
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
  return email;
};