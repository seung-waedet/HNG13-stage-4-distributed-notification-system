import { Injectable, Logger, Inject } from "@nestjs/common";
import { UserService } from "./user.service";
import { TemplateService } from "./template.service";
import { PushClientProvider } from "./push-client.provider";
import { RetryService } from "./retry.service";
import { CircuitBreakerService } from "./circuit-breaker.service";

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly userService: UserService,
    private readonly templateService: TemplateService,
    private readonly pushClient: PushClientProvider,
    private readonly retryService: RetryService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async sendPushNotification(data: any): Promise<any> {
    try {
      // 1. Get user data (device token, preferences)
      const user = await this.retryService.executeWithRetry(
        () => this.userService.getUser(data.user_id),
        3, // maxRetries
        500, // baseDelay in ms
      );

      // Check if user has opted out of push notifications
      if (!user.preferences?.push) {
        throw new Error("User has disabled push notifications");
      }

      // 2. Get template content
      const template = await this.retryService.executeWithRetry(
        () => this.templateService.getTemplate(data.template_code),
        3,
        500,
      );

      // 3. Process template with variables
      const processedContent = this.processTemplate(template, data.variables);

      // 4. Create circuit breaker for push sending
      const pushCircuitBreaker =
        this.circuitBreakerService.createCircuitBreaker(
          "push-sending",
          (token, content, metadata) =>
            this.pushClient.sendPush(token, content, metadata),
          {
            timeout: 10000, // 10 seconds timeout
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
          },
        );

      // 5. Send push notification with circuit breaker and retry logic
      const result = await this.retryService.executeWithRetry(
        () =>
          pushCircuitBreaker.fire(
            user.push_token,
            processedContent,
            data.metadata,
          ),
        3, // maxRetries
        1000, // baseDelay in ms
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error sending push notification: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  private processTemplate(
    template: any,
    variables: Record<string, any>,
  ): string {
    // Replace template placeholders with actual values
    let content = template.body;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    return content;
  }
}
