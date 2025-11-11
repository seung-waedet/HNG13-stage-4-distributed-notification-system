# Distributed Notification System - Architecture & Flow

## Overview

This system consists of 5 microservices working asynchronously via RabbitMQ for notifications: API Gateway, User Service, Email Service, Push Service, Template Service.

**Shared Tools:**

* Redis: user preference cache
* PostgreSQL: shared notification status store

## Services & Responsibilities

### 1. API Gateway

* Receives notification POST requests from clients: `/api/v1/notifications/`
* Validates and authenticates requests
* Collects user info from `user service` and template data from `template service`
* Writes initial `pending` status to shared store (PostgreSQL)
* Pushes notification messages to RabbitMQ queue (email or push)
* Provides `POST /api/v1/{notification_preference}/status/` endpoint for clients
* Ports: **8000**

### 2. User Service

* Manages user information and notification preferences
* Exposes REST API endpoints for creating/updating users, and fetching user preferences
* Maintains PostgreSQL database `users_db`
* Updates Redis cache for user preferences
* Ports: **8001**

**User Payload Example:**

```json
POST /api/v1/users/
{
  "name": "str",
  "email": "email",
  "push_token": "optional str",
  "preferences": {
    "email": true,
    "push": false
  },
  "password": "str"
}
```

```json
GET /api/v1/users/{user_id}
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "push_token": "string | null",
  "preferences": {
    "email": true,
    "push": false
  }
}
```


### 3. Template Service

* Stores and manages notification templates
* Supports variable substitution and multiple languages
* Maintains template version history
* Provides REST API for retrieving template content
* Ports: **8002**

### 4. Email Service

* Consumes messages from `email.queue` in RabbitMQ
* Checks user preference via Redis cache
* Confirms notification `pending` status in PostgreSQL shared store
* Sends email via SMTP/API (SendGrid, Mailgun, Gmail)
* Updates `/api/v1/email/status/` endpoint with delivery status
* Ports: none required externally (internal service)

### 5. Push Service

* Consumes messages from `push.queue` in RabbitMQ
* Checks user preference via Redis cache
* Confirms notification `pending` status in PostgreSQL shared store
* Sends push notifications (FCM, OneSignal, Web Push)
* Updates `/api/v1/push/status/` endpoint with delivery status
* Ports: none required externally (internal service)

## Message Queue Setup (RabbitMQ)

* Exchange: `notifications.direct`

  * `email.queue` → Email Service
  * `push.queue` → Push Service
  * `failed.queue` → Dead Letter Queue

## Notification Lifecycle Flow

1. **Client → API Gateway:** POST `/api/v1/notifications/` with payload

```json
{
  "notification_type": "email | push",
  "user_id": "uuid",
  "template_code": "str/path",
  "variables": {"name": "str", "link": "url"},
  "request_id": "str",
  "priority": 1,
  "metadata": {}
}
```

2. **API Gateway Actions:**

   * Collect user info from User Service (REST)
   * Collect template from Template Service (REST)
   * Write `pending` status to PostgreSQL shared store
   * Publish message to RabbitMQ queue (`email.queue` or `push.queue`)
3. **Email/Push Worker:**

   * Consume message from queue
   * Confirm user preference via Redis cache
   * Check notification status in PostgreSQL (should be `pending`)
   * Send notification
   * Update `/api/v1/{notification_type}/status/` endpoint with `delivered` or `failed`
4. **Shared Store & Redis:**

   * PostgreSQL reflects current status for tracking and reporting
   * Redis currently caches user preferences (future: can cache notification status for fast reads)

## Notification Status Endpoint

**POST /api/v1/{notification_type}/status/**

```json
{
  "notification_id": "str",
  "status": "delivered | pending | failed",
  "timestamp": "optional datetime",
  "error": "optional str"
}
```

**Purpose:** Worker services update delivery outcomes here; API Gateway ensures both **PostgreSQL** and optionally Redis are updated.

## Ports Summary

| Service          | Port                     |
| ---------------- | ------------------------ |
| API Gateway      | 8000                     |
| User Service     | 8001                     |
| Template Service | 8002                     |
| RabbitMQ         | 5672, 15672 (management) |
| PostgreSQL       | 5432                     |
| Redis            | 6379                     |

## Key Concepts

* **Idempotency:** Check shared store before sending to prevent duplicates
* **Circuit Breaker:** Handle SMTP/FCM downtime gracefully
* **Retry System:** Retry with exponential backoff, failures go to `failed.queue`
* **Health Checks:** `/health` endpoint per service
* **Service Communication:**

  * Synchronous (REST) → User info, Template retrieval, Status queries
  * Asynchronous (RabbitMQ) → Notification delivery and retries

## Data Storage Strategy

* Each service uses its own database (User Service → Postgres, Template Service → Postgres)
* Shared Tools: Redis for caching user preferences, PostgreSQL for notification status

## Monitoring & Logs

* Track metrics: Queue message rates, service response times, error rates, queue lengths
* Logs include correlation IDs and full notification lifecycle

## Notes

* Redis currently serves only user preferences; future optimization can add caching for notification status
* Each service can horizontally scale independently
* Docker Compose orchestrates all services for local testing
* CI/CD will build images, run tests, and optionally deploy to server environment


