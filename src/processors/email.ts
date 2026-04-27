import { Job } from "bullmq";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logger } from "../lib/logger";

const ses = new SESClient({ region: process.env.AWS_REGION || "eu-west-1" });

const templates: Record<string, string> = {
  welcome: "Welcome {{name}}! Your account is ready.",
  order_confirmation: "Hi {{name}}, your order #{{orderId}} has been confirmed.",
  password_reset: "Click here to reset your password: {{resetLink}}",
};

export async function processEmail(job: Job) {
  const { to, templateId, variables, subject } = job.data;
  const template = templates[templateId];
  if (!template) throw new Error(`Unknown template: ${templateId}`);

  const html = Handlebars.compile(template)(variables);

  if (process.env.USE_SES === "true") {
    await ses.send(new SendEmailCommand({
      Source: "noreply@fleet.example.com",
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    }));
  } else {
    const transporter = nodemailer.createTransport({ host: "localhost", port: 1025 });
    await transporter.sendMail({ from: "noreply@fleet.example.com", to, subject, html });
  }

  logger.info({ to, templateId }, "Email sent");
}
