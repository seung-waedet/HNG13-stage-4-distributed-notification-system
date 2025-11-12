import { Injectable, Logger } from "@nestjs/common";
import * as amqplib from "amqplib";

@Injectable()
export class StatusPublisherService {
  private readonly logger = new Logger(StatusPublisherService.name);
  private connection?: amqplib.Connection;
  private channel?: amqplib.Channel;
  private readonly exchangeName = "notifications.direct";
  private readonly exchangeType: amqplib.Options.AssertExchange["type"] = "direct";

  private async ensureChannel(): Promise<amqplib.Channel> {
    if (this.channel) return this.channel;

    const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
      durable: true,
    });

    // Handle close/errors
    this.connection.on("close", () => {
      this.logger.warn("RabbitMQ connection closed for StatusPublisherService");
      this.connection = undefined;
      this.channel = undefined;
    });
    this.connection.on("error", (err) => {
      this.logger.error(`RabbitMQ connection error: ${err.message}`);
    });

    return this.channel;
  }

  async publishStatus(payload: any): Promise<void> {
    const channel = await this.ensureChannel();
    const routingKey = "notification_status";
    const content = Buffer.from(JSON.stringify(payload));
    const options: amqplib.Options.Publish = {
      contentType: "application/json",
      headers: {},
      deliveryMode: 2, // persistent
    };

    channel.publish(this.exchangeName, routingKey, content, options);
    this.logger.log(
      `Status published to ${this.exchangeName} with routing key '${routingKey}': ${JSON.stringify(
        payload,
      )}`,
    );
  }
}