import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class StatusUpdateService {
  constructor(
    @Inject("RABBITMQ_SERVICE") private readonly client: ClientProxy,
  ) {}

  async updateStatus(payload: {
    notification_id: string;
    status: string;
    timestamp: string;
    error?: string;
  }) {
    try {
      // Emit status update to the notification status queue using direct exchange
      // We'll send to the exchange with a routing key for status updates
      await this.client.emit("notification_status", payload).toPromise();
    } catch (error) {
      console.error("Failed to update notification status:", error);
    }
  }
}
