# 🚀 Distributed Notification System - API Gateway & Push Service

## Overview
This PR introduces a complete microservices-based notification system with API Gateway, Push Service, and User Service implementations. The system enables asynchronous push notification delivery using RabbitMQ message queuing and Firebase Cloud Messaging.

## 🏗️ Architecture

### Services Implemented

#### 1. **API Gateway** (Port 8000)
- REST API entry point for notification requests
- RabbitMQ message publisher with direct exchange routing
- Request validation and transformation
- Correlation ID tracking for distributed tracing
- Rate limiting with Redis
- Swagger API documentation
- Health check endpoint

#### 2. **Push Service** (Port 8004)
- RabbitMQ consumer for push notifications
- Firebase Cloud Messaging integration
- Circuit breaker pattern for fault tolerance
- Retry mechanism with exponential backoff
- Status update publishing
- Health check endpoint
- Graceful error handling with smart requeuing

#### 3. **User Service** (Port 8081)
- User management with CRUD operations
- User preferences (email/push opt-in)
- PostgreSQL database with TypeORM
- Health check endpoint
- Swagger API documentation

### Infrastructure Components
- **RabbitMQ**: Message broker with direct exchange pattern
- **Redis**: Caching and rate limiting
- **PostgreSQL**: User data persistence (Aiven cloud)
- **Firebase**: Push notification delivery
- **Docker**: Containerization for all services

## ✨ Key Features

### Resilience & Reliability
- ✅ Circuit breaker pattern to prevent cascading failures
- ✅ Retry mechanism with exponential backoff
- ✅ Smart message requeuing (transient vs permanent errors)
- ✅ Health checks for all services
- ✅ Graceful error handling

### Observability
- ✅ Correlation IDs for request tracing
- ✅ Comprehensive logging with context
- ✅ Status update tracking
- ✅ Request/response logging interceptor

### API Design
- ✅ RESTful endpoints with proper HTTP status codes
- ✅ Standardized response format
- ✅ Input validation with DTOs
- ✅ Swagger documentation
- ✅ CORS enabled

### Message Queue Architecture
- ✅ Direct exchange with routing keys (`push`, `email`)
- ✅ Durable queues for message persistence
- ✅ Manual acknowledgment for reliability
- ✅ Prefetch count for load management
- ✅ Custom serializers/deserializers

## 📁 Project Structure

```
.
├── api-gateway/          # API Gateway service
│   ├── src/
│   │   ├── notifications/    # Notification endpoints
│   │   ├── rabbitmq/         # RabbitMQ publisher
│   │   ├── redis/            # Redis cache module
│   │   ├── health/           # Health checks
│   │   ├── interceptors/     # Logging interceptor
│   │   └── middleware/       # Correlation ID middleware
│   ├── Dockerfile
│   └── package.json
│
├── push-service/         # Push notification service
│   ├── src/
│   │   └── push-notification/
│   │       ├── push-notification.processor.ts    # RabbitMQ consumer
│   │       ├── push-notification.service.ts      # Business logic
│   │       ├── circuit-breaker.service.ts        # Circuit breaker
│   │       ├── retry.service.ts                  # Retry logic
│   │       ├── push-client.provider.ts           # Firebase client
│   │       └── status-update.service.ts          # Status tracking
│   ├── Dockerfile
│   └── package.json
│
├── user-service/         # User management service
│   ├── src/
│   │   └── user/
│   │       ├── user.controller.ts    # REST endpoints
│   │       ├── user.service.ts       # Business logic
│   │       ├── user.entity.ts        # TypeORM entity
│   │       └── dto/                  # Data transfer objects
│   ├── Dockerfile
│   └── package.json
│
└── shared-contracts/     # Shared TypeScript types
    └── types/
        ├── notification.types.ts
        └── response.types.ts
```

## 🔄 Message Flow

1. **Client** → POST `/api/v1/notifications` → **API Gateway**
2. **API Gateway** → Publishes message to RabbitMQ exchange with routing key
3. **RabbitMQ** → Routes message to appropriate queue (`push.queue`)
4. **Push Service** → Consumes message from queue
5. **Push Service** → Fetches user data and template
6. **Push Service** → Sends push via Firebase
7. **Push Service** → Publishes status update
8. **Push Service** → Acknowledges message

## 🔧 Technical Highlights

### Circuit Breaker Implementation
```typescript
- Timeout: 10 seconds
- Error threshold: 50%
- Reset timeout: 30 seconds
- Prevents cascading failures to Firebase
```

### Retry Strategy
```typescript
- Max retries: 3
- Base delay: 500ms - 1000ms
- Exponential backoff
- Applied to user/template fetching and push sending
```

### Smart Requeuing
- Transient errors (network, timeouts) → Requeue
- Permanent errors (4xx, user opt-out) → Acknowledge without requeue
- Prevents infinite retry loops

## 📊 API Endpoints

### API Gateway
- `POST /api/v1/notifications` - Create notification
- `GET /health` - Health check
- `GET /api` - Swagger documentation

### User Service
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `PUT /api/v1/users/:id/preferences` - Update preferences
- `DELETE /api/v1/users/:id` - Delete user
- `GET /health` - Health check

### Push Service
- `GET /health` - Health check

## 🐳 Docker Support

All services include multi-stage Dockerfiles:
- Stage 1: Build with dependencies
- Stage 2: Production image with only runtime dependencies
- Optimized for size and security

## 📝 Environment Configuration

Each service now includes `.env.example` files with required configuration. Actual `.env` files are gitignored for security.

## 🧪 Testing Considerations

- Mock user and template services for testing
- Fallback mechanisms when external services fail
- Health checks for monitoring
- Comprehensive error logging

## 🔒 Security Improvements

- ✅ Environment variables moved to `.env.example`
- ✅ Sensitive credentials removed from git
- ✅ `.gitignore` updated to exclude secrets
- ✅ Input validation on all endpoints
- ✅ Rate limiting enabled

## 📦 Commits Summary

- Initial push service implementation with retry and health checks
- Redis cache module for API gateway
- Request logging and correlation IDs
- Circuit breaker pattern
- Firebase integration fixes
- RabbitMQ routing corrections
- Complete user service with database
- Health checks for all services
- Dockerfiles for containerization
- Code cleanup and restructuring

## 🚀 Deployment Notes

### Prerequisites
- Node.js 20+
- RabbitMQ server
- Redis server
- PostgreSQL database
- Firebase project with FCM enabled

### Environment Setup
1. Copy `.env.example` to `.env` in each service directory
2. Configure database credentials
3. Add Firebase service account credentials
4. Update service URLs for your environment

### Running Services
```bash
# API Gateway
cd api-gateway && npm install && npm run start:dev

# Push Service
cd push-service && npm install && npm run start:dev

# User Service
cd user-service && npm install && npm run start:dev
```

### Docker Deployment
```bash
docker build -t api-gateway ./api-gateway
docker build -t push-service ./push-service
docker build -t user-service ./user-service
```

## 🔍 What's Next?

Potential future enhancements:
- [ ] Email service implementation
- [ ] Template service implementation
- [ ] Message persistence and retry queue
- [ ] Metrics and monitoring (Prometheus/Grafana)
- [ ] Integration tests
- [ ] CI/CD pipeline
- [ ] API authentication/authorization
- [ ] Message deduplication
- [ ] Dead letter queue handling
- [ ] Docker Compose for local development

## 📋 Checklist

- [x] API Gateway implementation
- [x] Push Service implementation
- [x] User Service implementation
- [x] RabbitMQ integration
- [x] Redis caching
- [x] Firebase integration
- [x] Circuit breaker pattern
- [x] Retry mechanism
- [x] Health checks
- [x] Swagger documentation
- [x] Docker support
- [x] Error handling
- [x] Logging and tracing
- [x] Environment configuration
- [x] Security improvements

## 🤝 Review Focus Areas

Please pay special attention to:
1. RabbitMQ message routing and acknowledgment logic
2. Circuit breaker and retry configurations
3. Error handling and requeuing strategy
4. Database schema and migrations
5. Environment variable management
6. Docker configuration

---

**Branch:** `api-gateway-push-service` → `dev`  
**Type:** Feature  
**Breaking Changes:** No
