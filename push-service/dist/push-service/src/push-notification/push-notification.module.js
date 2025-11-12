"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const push_notification_processor_1 = require("./push-notification.processor");
const push_notification_service_1 = require("./push-notification.service");
const user_service_1 = require("./user.service");
const template_service_1 = require("./template.service");
const push_client_provider_1 = require("./push-client.provider");
const retry_service_1 = require("./retry.service");
const status_update_service_1 = require("./status-update.service");
const circuit_breaker_service_1 = require("./circuit-breaker.service");
const status_publisher_service_1 = require("./status-publisher.service");
let PushNotificationModule = class PushNotificationModule {
};
exports.PushNotificationModule = PushNotificationModule;
exports.PushNotificationModule = PushNotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
        ],
        controllers: [push_notification_processor_1.PushNotificationProcessor],
        providers: [
            push_notification_service_1.PushNotificationService,
            user_service_1.UserService,
            template_service_1.TemplateService,
            push_client_provider_1.PushClientProvider,
            retry_service_1.RetryService,
            status_update_service_1.StatusUpdateService,
            circuit_breaker_service_1.CircuitBreakerService,
            status_publisher_service_1.StatusPublisherService,
        ],
    })
], PushNotificationModule);
//# sourceMappingURL=push-notification.module.js.map