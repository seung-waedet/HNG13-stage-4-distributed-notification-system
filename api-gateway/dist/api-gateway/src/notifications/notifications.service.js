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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const publisher_service_1 = require("../rabbitmq/publisher.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(client, publisher) {
        this.client = client;
        this.publisher = publisher;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.logger.log('📡 NotificationsService initialized with RabbitMQ client');
    }
    async processNotification(dto) {
        this.logger.log(`📨 Received notification request: ${JSON.stringify(dto)}`);
        try {
            const messageData = {
                notification_id: dto.request_id,
                user_id: dto.user_id,
                notification_type: dto.notification_type,
                template_code: dto.template_code,
                variables: dto.variables,
                request_id: dto.request_id,
                priority: dto.priority || 1,
                created_at: new Date().toISOString(),
                retry_count: 0,
                metadata: dto.metadata || {},
            };
            const pattern = dto.notification_type;
            this.logger.log(`🚀 Publishing message with routing key: "${pattern}"`);
            this.logger.log(`📦 Message Data: ${JSON.stringify(messageData)}`);
            await this.publisher.publish(pattern, messageData);
            this.logger.log(`✅ Message published to exchange "notifications.direct" with key "${pattern}"`);
            return {
                success: true,
                data: { notification_id: dto.request_id, status: 'queued' },
                message: 'Notification queued successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to process notification: ${error.message}`, error.stack);
            return {
                success: false,
                error: error.message,
                message: 'Failed to process notification',
            };
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        publisher_service_1.RabbitMQPublisherService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map