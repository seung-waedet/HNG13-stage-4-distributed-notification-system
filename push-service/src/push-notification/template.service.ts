import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { AxiosError } from "axios";

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(private httpService: HttpService) {}

  async getTemplate(templateCode: string): Promise<any> {
    const baseUrl = process.env.TEMPLATE_SERVICE_URL;

    if (!baseUrl) {
      this.logger.warn(
        "TEMPLATE_SERVICE_URL is not set. Using mock template for development.",
      );
      return this.getMockTemplate(templateCode);
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${baseUrl}/api/v1/templates/${templateCode}`),
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

      if (isTransient && process.env.TEMPLATE_FALLBACK_ON_ERROR === "true") {
        this.logger.warn(
          `Template service transient error (${code || status}): ${message}. Using mock template fallback.`,
        );
        return this.getMockTemplate(templateCode);
      }

      throw new Error(
        `Failed to retrieve template: ${message}${
          status ? ` (status ${status})` : ""
        }`,
      );
    }
  }

  private getMockTemplate(templateCode: string): any {
    // You can adjust these mocks to suit your use case
    const mockTemplates: Record<string, any> = {
      welcome_email: {
        code: "welcome_email",
        subject: "Welcome to our platform!",
        body: "Hi {{name}}, welcome aboard! We’re glad to have you here.",
        channels: ["email", "push"],
      },
      PASSWORD_RESET: {
        code: "PASSWORD_RESET",
        subject: "Reset your password",
        body: "Click the link below to reset your password: {{reset_link}}",
        channels: ["email"],
      },
    };

    return (
      mockTemplates[templateCode] || {
        code: templateCode,
        subject: "Default Notification",
        body: "This is a mock template body for {{templateCode}}.",
        channels: ["push"],
      }
    );
  }
}
