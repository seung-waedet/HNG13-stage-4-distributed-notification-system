import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { setupRabbitMQ } from './rabbitmq/rabbitmq.config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // Setup RabbitMQ exchange and queues
  try {
    await setupRabbitMQ();
  } catch (error) {
    logger.warn('RabbitMQ setup failed');
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Use correlation ID middleware (as a function)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);
    next();
  });

  // Use validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Use logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Notification System API Gateway')
    .setDescription('API Gateway for the distributed notification system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);
  logger.log(`API Gateway running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api`);
}
bootstrap();
