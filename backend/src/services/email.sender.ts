import { getEtherealTransporter } from "../config/ethereal.js";
import nodemailer from "nodemailer";

interface SendEmailInput {
  recipient: string;
  subject: string;
  body: string;
}

export const sendEmail = async ({
  recipient,
  subject,
  body,
}: SendEmailInput) => {

  const transporter = await getEtherealTransporter();

  const info = await transporter.sendMail({
    from: '"ReachInbox Scheduler" <scheduler@reachinbox.local>',
    to: recipient,
    subject,
    text: body,
    html: `<p>${body.replace(/\n/g, "<br />")}</p>`,
  });

  console.log("Email sent successfully");
  console.log("Message ID:", info.messageId);

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log("Ethereal preview URL:", previewUrl);
  }

  return info;
};