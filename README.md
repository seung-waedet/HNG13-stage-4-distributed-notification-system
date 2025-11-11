# Stage 4 Distributed Notification System: Full Microservices Documentation

## 1️⃣ Overview

The Stage 4 backend task requires building a **Distributed Notification System** using microservices that send emails and push notifications. Each service communicates **asynchronously via RabbitMQ** and optionally synchronously via REST for quick lookups. All services are containerized using Docker, and CI/CD ensures reliable builds and deployments.

**Services:**

1. API Gateway (Port 8000)
2. User Service (Port 8001)
3. Template Service (Port 8002)
4. Email Service (Port 8003)
5. Push Service (Port 8004)

**Shared Tools:**

* RabbitMQ: message queuing for async communication (Ports 5672 / 15672)
* Redis: caching user preferences and rate limits (Port 6379)
* PostgreSQL: service-specific databases (Port 5432)

**Communication Principles:**

* **REST (Synchronous):** user data lookups, template retrieval, notification status queries
* **RabbitMQ (Asynchronous):** sending notifications, retry handling, status updates
* **Idempotency:** every notification request has a unique `request_id` to prevent duplicates
* **Health Checks:** each service exposes `/health` endpoint
* **Monitoring & Logging:** correlation IDs track full notification lifecycle

---

## 2️⃣ Microservices Responsibilities & Communication

### **2.1 API Gateway (Port 8000)**

**Receives:**

* Client POST `/api/v1/notifications/` with payload:

```json
{
  "notification_type": "email|push",
  "user_id": "uuid",
  "template_code": "string",
  "variables": {"name": "John", "link": "http://example.com"},
  "request_id": "unique-string",
  "priority": 1,
  "metadata": {"optional": "data"}
}
```

**Returns:**

* Standard response with `success`, `message`, and optional `data`/`error`

**Side Effects:**

* Validates and authenticates request
* Publishes message to RabbitMQ exchange `notifications.direct` on correct queue (`email.queue` or `push.queue`)
* Logs request with correlation ID

**Errors:**

* 400 for invalid payload
* 401 for unauthorized requests
* 500 for internal errors

---

### **2.2 User Service (Port 8001)**

**Receives:**

* REST GET `/users/{user_id}` from API Gateway
* Payload: `{ "user_id": "uuid" }`

**Returns:**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "push_token": "token123",
    "preferences": {"email": true, "push": true}
  },
  "message": "User retrieved successfully",
  "meta": {"total": 1, "limit": 10, "page": 1, "total_pages": 1, "has_next": false, "has_previous": false}
}
```

**Side Effects:**

* Optionally caches user data in Redis for faster lookups
* Logs request with correlation ID

**Errors:**

* 404 if user not found
* 401 if unauthorized
* `error` field populated for other issues

---

### **2.3 Template Service (Port 8002)**

**Receives:**

* REST GET `/templates/{template_code}` from API Gateway

**Returns:**

* Template content with required variables for substitution

**Side Effects:**

* Logs template access
* Can cache frequently accessed templates in Redis

**Errors:**

* 404 if template not found
* 500 for server errors

---

### **2.4 Email Service (Port 8003)**

**Receives:**

* RabbitMQ messages from `email.queue`
* Message structure:

```json
{
  "user_id": "uuid",
  "template_code": "string",
  "variables": {"name": "John", "link": "http://example.com"},
  "request_id": "unique-string"
}
```

**Returns:**

* Updates status store (Redis/Postgres) asynchronously
* Publishes success/failure status if needed

**Side Effects:**

* Sends email via SMTP/API
* Retries failed messages with exponential backoff
* Moves permanently failed messages to `failed.queue`

**Errors:**

* Logs errors with correlation ID
* Failed messages handled by retry mechanism

---

### **2.5 Push Service (Port 8004)**

**Receives:**

* RabbitMQ messages from `push.queue`
* Message structure same as Email Service

**Returns:**

* Updates notification status in Redis/Postgres

**Side Effects:**

* Sends push notifications to devices
* Validates push tokens
* Retries failed messages, moves permanently failed to `failed.queue`

**Errors:**

* Logs invalid device tokens
* Retry system handles transient failures

---

## 3️⃣ Message Queue Structure (RabbitMQ Ports 5672 / 15672)

```
Exchange: notifications.direct
 ├── email.queue → Email Service
 ├── push.queue  → Push Service
 └── failed.queue → Dead Letter Queue
```

* Queues handle asynchronous notification processing
* Retries managed with exponential backoff

---

## 4️⃣ Data Storage Strategy (Postgres Port 5432)

| Service               | Database             | Purpose                  |
| --------------------- | -------------------- | ------------------------ |
| User Service          | PostgreSQL           | user info, preferences   |
| Template Service      | PostgreSQL           | templates, versions      |
| Notification Services | Redis (6379) + local | status tracking, caching |

---

## 5️⃣ CI/CD Integration

**CI:**

* Builds Docker images for all services
* Runs optional tests
* Blocks PR merges if build fails

**CD:**

* Triggered on merge to main
* Rebuilds images and prepares for server deployment

---

## 6️⃣ Team Guidelines

1. Follow provided ports and environment variables
2. Use Docker Compose for local testing to match CI
3. Responses must be in snake_case
4. Ensure CI passes before merging PRs
5. Focus on communication; DB can be simplified for now

---
