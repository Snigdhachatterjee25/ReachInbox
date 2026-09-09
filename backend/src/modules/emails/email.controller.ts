import type{ Request, Response } from "express";
import { scheduleEmail } from "../../services/scheduler.service.js";

export const scheduleEmailController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      campaignId,
      senderId,
      recipient,
      subject,
      body,
      scheduledAt,
    } = req.body;

    if (
      !userId ||
      !campaignId ||
      !senderId ||
      !recipient ||
      !subject ||
      !body ||
      !scheduledAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId, campaignId, senderId, recipient, subject, body and scheduledAt are required",
      });
    }

    const scheduleDate = new Date(scheduledAt);

    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduledAt date",
      });
    }

    if (scheduleDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt must be in the future",
      });
    }

    const email = await scheduleEmail({
      userId,
      campaignId,
      senderId,
      recipient,
      subject,
      body,
      scheduledAt: scheduleDate,
    });

    return res.status(201).json({
      success: true,
      message: "Email scheduled successfully",
      data: email,
    });
  } catch (error) {
    console.error("Schedule email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to schedule email",
    });
  }
};