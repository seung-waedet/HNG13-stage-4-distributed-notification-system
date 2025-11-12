import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { NotificationMessage } from "../../../shared-contracts/types/notification.types";
import { AxiosError } from "axios";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private httpService: HttpService) {}

  async getUser(userId: string): Promise<any> {
    const baseUrl = process.env.USER_SERVICE_URL;
    const mockPushToken = process.env.MOCK_PUSH_TOKEN;

    if (!baseUrl) {
      this.logger.warn(
        "USER_SERVICE_URL is not set. Using mock user for development.",
      );
      return {
        id: userId,
        push_token: mockPushToken,
        preferences: { push: true },
      };
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${baseUrl}/api/v1/users/${userId}`),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      const code = error.code;
      const message = error.message || "Unknown error";

      const transientCodes = [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEDOUT",
        "ECONNRESET",
      ];
      const isTransient =
        !status || status >= 500 || transientCodes.includes(code ?? "");

      if (isTransient && process.env.USER_FALLBACK_ON_ERROR === "true") {
        this.logger.warn(
          `User service transient error (${code || status}): ${message}. Using mock user fallback.`,
        );
        return {
          id: userId,
          push_token: mockPushToken,
          preferences: { push: true },
        };
      }

      throw new Error(
        `Failed to retrieve user: ${message}${status ? ` (status ${status})` : ""}`,
      );
    }
  }

  async getUserPreferences(userId: string): Promise<any> {
    const baseUrl = process.env.USER_SERVICE_URL;
    if (!baseUrl) {
      this.logger.warn(
        "USER_SERVICE_URL is not set. Returning default push-enabled preferences.",
      );
      return { push: true };
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${baseUrl}/api/v1/users/${userId}/preferences`),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      const code = error.code;
      const message = error.message || "Unknown error";

      const transientCodes = [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEDOUT",
        "ECONNRESET",
      ];
      const isTransient =
        !status || status >= 500 || transientCodes.includes(code ?? "");

      if (isTransient && process.env.USER_FALLBACK_ON_ERROR === "true") {
        this.logger.warn(
          `User preferences transient error (${code || status}): ${message}. Returning default preferences.`,
        );
        return { push: true };
      }

      throw new Error(
        `Failed to retrieve user preferences: ${message}${
          status ? ` (status ${status})` : ""
        }`,
      );
    }
  }
}
