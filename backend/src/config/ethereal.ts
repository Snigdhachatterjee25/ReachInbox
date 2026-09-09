import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export const getEtherealTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();

  console.log("Ethereal account created");
  console.log("Ethereal user:", testAccount.user);

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};