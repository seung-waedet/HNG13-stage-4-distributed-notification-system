"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PushNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const template_service_1 = require("./template.service");
const push_client_provider_1 = require("./push-client.provider");
const retry_service_1 = require("./retry.service");
const circuit_breaker_service_1 = require("./circuit-breaker.service");
let PushNotificationService = PushNotificationService_1 = class PushNotificationService {
    constructor(userService, templateService, pushClient, retryService, circuitBreakerService) {
        this.userService = userService;
        this.templateService = templateService;
        this.pushClient = pushClient;
        this.retryService = retryService;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(PushNotificationService_1.name);
    }
    async sendPushNotification(data) {
        var _a;
        try {
            const user = await this.retryService.executeWithRetry(() => this.userService.getUser(data.user_id), 3, 500);
            if (!((_a = user.preferences) === null || _a === void 0 ? void 0 : _a.push)) {
                throw new Error("User has disabled push notifications");
            }
            const template = await this.retryService.executeWithRetry(() => this.templateService.getTemplate(data.template_code), 3, 500);
            const processedContent = this.processTemplate(template, data.variables);
            const pushCircuitBreaker = this.circuitBreakerService.createCircuitBreaker("push-sending", (token, content, metadata) => this.pushClient.sendPush(token, content, metadata), {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
            });
            const result = await this.retryService.executeWithRetry(() => pushCircuitBreaker.fire(user.push_token, processedContent, data.metadata), 3, 1000);
            return result;
        }
        catch (error) {
            this.logger.error(`Error sending push notification: ${error.message}`, error);
            throw error;
        }
    }
    processTemplate(template, variables) {
        let content = template.body;
        Object.entries(variables).forEach(([key, value]) => {
            content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
        });
        return content;
    }
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = PushNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        template_service_1.TemplateService,
        push_client_provider_1.PushClientProvider,
        retry_service_1.RetryService,
        circuit_breaker_service_1.CircuitBreakerService])
], PushNotificationService);
//# sourceMappingURL=push-notification.service.js.map