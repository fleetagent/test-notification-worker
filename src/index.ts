import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { processEmail } from "./processors/email";
import { processSms } from "./processors/sms";
import { processPush } from "./processors/push";
import { logger } from "./lib/logger";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

const emailWorker = new Worker("email-notifications", processEmail, { connection });
const smsWorker = new Worker("sms-notifications", processSms, { connection });
const pushWorker = new Worker("push-notifications", processPush, { connection });

emailWorker.on("completed", (job) => logger.info(`Email job ${job.id} completed`));
emailWorker.on("failed", (job, err) => logger.error(`Email job ${job?.id} failed`, err));
smsWorker.on("completed", (job) => logger.info(`SMS job ${job.id} completed`));
pushWorker.on("completed", (job) => logger.info(`Push job ${job.id} completed`));

logger.info("Notification worker started");
