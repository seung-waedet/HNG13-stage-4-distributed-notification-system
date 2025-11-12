"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const uuid_1 = require("uuid");
const rabbitmq_config_1 = require("./rabbitmq/rabbitmq.config");
const logger = new common_1.Logger('Bootstrap');
async function bootstrap() {
    try {
        await (0, rabbitmq_config_1.setupRabbitMQ)();
    }
    catch (error) {
        logger.warn('⚠️ RabbitMQ setup failed, continuing anyway...');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.use((req, res, next) => {
        const correlationId = req.headers['x-correlation-id'] || (0, uuid_1.v4)();
        req.headers['x-correlation-id'] = correlationId;
        res.setHeader('X-Correlation-Id', correlationId);
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Notification System API Gateway')
        .setDescription('API Gateway for the distributed notification system')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 API Gateway running on port ${port}`);
    logger.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map