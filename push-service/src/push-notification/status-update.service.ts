import { Injectable } from "@nestjs/common";
import { StatusPublisherService } from "./status-publisher.service";

@Injectable()
export class StatusUpdateService {
  constructor(private readonly statusPublisher: StatusPublisherService) {}

  async updateStatus(payload: {
    notification_id: string;
    status: string;
    timestamp: string;
    error?: string;
  }) {
    try {
      await this.statusPublisher.publishStatus(payload);
    } catch (error) {
      console.error("Failed to update notification status:", error);
    }
  }
}
