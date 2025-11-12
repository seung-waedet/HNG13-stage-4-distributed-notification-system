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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PushNotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationProcessor = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const push_notification_service_1 = require("./push-notification.service");
const status_update_service_1 = require("./status-update.service");
let PushNotificationProcessor = PushNotificationProcessor_1 = class PushNotificationProcessor {
    constructor(pushNotificationService, statusUpdateService) {
        this.pushNotificationService = pushNotificationService;
        this.statusUpdateService = statusUpdateService;
        this.logger = new common_1.Logger(PushNotificationProcessor_1.name);
    }
    async handlePushNotification(data, context) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const routingKey = originalMsg.fields.routingKey;
        if (routingKey !== 'push') {
            this.logger.warn(`🚦 Received message with routing key "${routingKey}" - ignoring.`);
            channel.ack(originalMsg);
            return;
        }
        this.logger.log('═══════════════════════════════════════');
        this.logger.log('📬 RECEIVED PUSH NOTIFICATION EVENT');
        this.logger.log('═══════════════════════════════════════');
        this.logger.log(`📦 Raw message: ${originalMsg.content.toString()}`);
        this.logger.log(`🏷️  Routing key: ${originalMsg.fields.routingKey}`);
        this.logger.log(`📋 Properties: ${JSON.stringify(originalMsg.properties)}`);
        this.logger.log(`📦 Parsed data: ${JSON.stringify(data)}`);
        this.logger.log(`🔍 Notification ID: ${data === null || data === void 0 ? void 0 : data.notification_id}`);
        this.logger.log('═══════════════════════════════════════');
        try {
            this.logger.log(`⚙️ Processing push notification: ${data.notification_id}`);
            const result = await this.pushNotificationService.sendPushNotification(data);
            this.logger.log(`✅ Push notification sent successfully: ${JSON.stringify(result)}`);
            await this.statusUpdateService.updateStatus({
                notification_id: data.notification_id,
                status: 'delivered',
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`✅ Successfully delivered notification: ${data.notification_id}`);
            channel.ack(originalMsg);
            this.logger.log(`✅ Message acknowledged`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Failed to deliver notification: ${data.notification_id}`, error === null || error === void 0 ? void 0 : error.stack);
            await this.statusUpdateService.updateStatus({
                notification_id: data.notification_id,
                status: 'failed',
                timestamp: new Date().toISOString(),
                error: error === null || error === void 0 ? void 0 : error.message,
            });
            const msg = ((error === null || error === void 0 ? void 0 : error.message) || '').toLowerCase();
            const transientHints = ['econnrefused', 'enotfound', 'etimedout', 'econnreset', 'timeout', '503', '502', '500'];
            const is4xx = /status\s+4\d{2}/.test(msg);
            const userOptOut = msg.includes('user has disabled push notifications');
            const shouldRequeue = transientHints.some(h => msg.includes(h)) && !userOptOut && !is4xx;
            if (shouldRequeue) {
                channel.nack(originalMsg, false, true);
                this.logger.warn(`⚠️ Message rejected and requeued for retry`);
            }
            else {
                channel.ack(originalMsg);
                this.logger.warn(`⚠️ Message acknowledged without requeue due to non-retriable error`);
            }
        }
    }
};
exports.PushNotificationProcessor = PushNotificationProcessor;
__decorate([
    (0, microservices_1.EventPattern)('push'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], PushNotificationProcessor.prototype, "handlePushNotification", null);
exports.PushNotificationProcessor = PushNotificationProcessor = PushNotificationProcessor_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [push_notification_service_1.PushNotificationService,
        status_update_service_1.StatusUpdateService])
], PushNotificationProcessor);
//# sourceMappingURL=push-notification.processor.js.map