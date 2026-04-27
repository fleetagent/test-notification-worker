import amqp from "amqplib";
import { logger } from "../lib/logger";

export async function consumeDeadLetterQueue() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  const channel = await conn.createChannel();
  await channel.assertQueue("notification-dlq", { durable: true });

  channel.consume("notification-dlq", (msg) => {
    if (!msg) return;
    logger.warn({ content: msg.content.toString() }, "Dead letter received");
    channel.ack(msg);
  });
}

export async function publishRetry(exchange: string, routingKey: string, payload: Buffer) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  const channel = await conn.createChannel();
  await channel.assertExchange(exchange, "topic", { durable: true });
  channel.publish(exchange, routingKey, payload);
  await channel.close();
  await conn.close();
}
