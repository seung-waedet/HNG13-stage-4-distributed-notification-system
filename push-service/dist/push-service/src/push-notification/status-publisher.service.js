"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StatusPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusPublisherService = void 0;
const common_1 = require("@nestjs/common");
const amqplib = require("amqplib");
let StatusPublisherService = StatusPublisherService_1 = class StatusPublisherService {
    constructor() {
        this.logger = new common_1.Logger(StatusPublisherService_1.name);
        this.exchangeName = "notifications.direct";
        this.exchangeType = "direct";
    }
    async ensureChannel() {
        if (this.channel)
            return this.channel;
        const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
        this.connection = await amqplib.connect(url);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
            durable: true,
        });
        this.connection.on("close", () => {
            this.logger.warn("RabbitMQ connection closed for StatusPublisherService");
            this.connection = undefined;
            this.channel = undefined;
        });
        this.connection.on("error", (err) => {
            this.logger.error(`RabbitMQ connection error: ${err.message}`);
        });
        return this.channel;
    }
    async publishStatus(payload) {
        const channel = await this.ensureChannel();
        const routingKey = "notification_status";
        const content = Buffer.from(JSON.stringify(payload));
        const options = {
            contentType: "application/json",
            headers: {},
            deliveryMode: 2,
        };
        channel.publish(this.exchangeName, routingKey, content, options);
        this.logger.log(`Status published to ${this.exchangeName} with routing key '${routingKey}': ${JSON.stringify(payload)}`);
    }
};
exports.StatusPublisherService = StatusPublisherService;
exports.StatusPublisherService = StatusPublisherService = StatusPublisherService_1 = __decorate([
    (0, common_1.Injectable)()
], StatusPublisherService);
//# sourceMappingURL=status-publisher.service.js.map