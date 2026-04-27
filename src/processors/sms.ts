import { Job } from "bullmq";

export async function processSms(job: Job) {
  const { phone, message } = job.data;
  // TODO: integrate Twilio
  console.log(`SMS to ${phone}: ${message}`);
}
