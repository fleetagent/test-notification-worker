import { Job } from "bullmq";

export async function processPush(job: Job) {
  const { deviceToken, title, body } = job.data;
  // TODO: integrate FCM
  console.log(`Push to ${deviceToken}: ${title} - ${body}`);
}
