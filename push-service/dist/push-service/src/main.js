"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
dotenv.config();
const logger = new common_1.Logger("Bootstrap");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
    logger.log(`🔌 Connecting to RabbitMQ at: ${rabbitmqUrl}`);
    logger.log(`📬 Queue: push.queue`);
    logger.log(`🔄 Exchange: notifications.direct (direct)`);
    logger.log(`🎯 Listening for pattern: "push"`);
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [rabbitmqUrl],
            queue: 'push.queue',
            queueOptions: {
                durable: true,
            },
            noAck: false,
            prefetchCount: 1,
            exchange: 'notifications.direct',
            exchangeType: 'direct',
            socketOptions: {
                heartbeatIntervalInSeconds: 60,
                reconnectTimeInSeconds: 5,
            },
            deserializer: {
                deserialize: (value) => {
                    var _a, _b, _c, _d;
                    try {
                        const contentStr = (_c = (_b = (_a = value === null || value === void 0 ? void 0 : value.content) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : '';
                        if (contentStr) {
                            const parsed = JSON.parse(contentStr);
                            if (parsed && typeof parsed === 'object' && 'pattern' in parsed && 'data' in parsed) {
                                return { pattern: parsed.pattern, data: parsed.data };
                            }
                            const routingKey = ((_d = value === null || value === void 0 ? void 0 : value.fields) === null || _d === void 0 ? void 0 : _d.routingKey) || 'push';
                            return { pattern: routingKey, data: parsed };
                        }
                        return { pattern: 'push', data: value };
                    }
                    catch (err) {
                        return { pattern: 'push', data: value };
                    }
                },
            },
        },
    });
    await app.startAllMicroservices();
    logger.log("✅ RabbitMQ microservice started and listening for messages on push.queue");
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 Push Service HTTP server running on port ${port}`);
    logger.log(`💡 Ready to process push notifications!`);
}
bootstrap();
//# sourceMappingURL=main.js.map