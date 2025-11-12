import { UserService } from "./user.service";
import { TemplateService } from "./template.service";
import { PushClientProvider } from "./push-client.provider";
import { RetryService } from "./retry.service";
import { CircuitBreakerService } from "./circuit-breaker.service";
export declare class PushNotificationService {
    private readonly userService;
    private readonly templateService;
    private readonly pushClient;
    private readonly retryService;
    private readonly circuitBreakerService;
    private readonly logger;
    constructor(userService: UserService, templateService: TemplateService, pushClient: PushClientProvider, retryService: RetryService, circuitBreakerService: CircuitBreakerService);
    sendPushNotification(data: any): Promise<any>;
    private processTemplate;
}
