import prisma from "../lib/prisma.js";

interface CreateEmailInput {
  userId: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
}

export const createEmail = async (data: CreateEmailInput) => {
  const email = await prisma.email.create({
    data: {
      userId: data.userId,
      campaignId: data.campaignId,
      senderId: data.senderId,
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      scheduledAt: data.scheduledAt,
      status: "SCHEDULED",
    },
  });

  return email;
};