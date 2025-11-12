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
var RabbitMQPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQPublisherService = void 0;
const common_1 = require("@nestjs/common");
const amqp_connection_manager_1 = require("amqp-connection-manager");
let RabbitMQPublisherService = RabbitMQPublisherService_1 = class RabbitMQPublisherService {
    constructor() {
        this.logger = new common_1.Logger(RabbitMQPublisherService_1.name);
        this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        this.exchange = 'notifications.direct';
        this.connection = (0, amqp_connection_manager_1.connect)([this.url]);
        this.connection.on('connect', () => this.logger.log('✅ RabbitMQ publisher connected'));
        this.connection.on('disconnect', (err) => { var _a; return this.logger.error(`❌ RabbitMQ publisher disconnected: ${((_a = err === null || err === void 0 ? void 0 : err.err) === null || _a === void 0 ? void 0 : _a.message) || err}`); });
        this.channel = this.connection.createChannel({
            setup: async (channel) => {
                await channel.assertExchange(this.exchange, 'direct', { durable: true });
                this.logger.log(`📡 Publisher using exchange: ${this.exchange} (direct)`);
            },
        });
    }
    async publish(routingKey, payload) {
        const content = Buffer.from(JSON.stringify(payload));
        const options = {
            contentType: 'application/json',
            deliveryMode: 2,
        };
        try {
            await this.channel.publish(this.exchange, routingKey, content, options);
            this.logger.log(`📤 Published message to exchange "${this.exchange}" with key "${routingKey}"`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to publish message: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RabbitMQPublisherService = RabbitMQPublisherService;
exports.RabbitMQPublisherService = RabbitMQPublisherService = RabbitMQPublisherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RabbitMQPublisherService);
//# sourceMappingURL=publisher.service.js.map