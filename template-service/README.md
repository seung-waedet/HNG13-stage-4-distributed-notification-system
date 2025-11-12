# 🧩 Template Service

### Overview

The **Template Service** is responsible for storing, retrieving, and managing notification templates used by the **Email Service** and **Push Service**. Templates can contain placeholders (e.g., `{{name}}`, `{{link}}`) that are later substituted with real user data.

This service does **not** render templates; instead, it returns the template content and metadata (including version) when requested by other services like the API Gateway or Email Service.

---

## ⚙️ Tech Stack

* **Language:** Python (FastAPI)
* **Template Engine (optional):** Jinja2 (for variable placeholders)
* **Database (optional):** JSON store or PostgreSQL
* **Container:** Docker
* **Port:** `8002`

---

## 🚀 Endpoints

### 1️⃣ Root Endpoint

**GET /**
Returns a simple message confirming the service is running.

```json
{
  "message": "Template Service running successfully"
}
```

### 2️⃣ Health Check Endpoint

**GET /health**
Used by orchestrators or CI/CD pipelines to confirm the service is healthy.

```json
{
  "status": "healthy",
  "uptime": "120s"
}
```

### 3️⃣ Get Template by Code

**GET /api/v1/templates/{template_code}**
Fetches a template by its code (or ID) for rendering notifications.

#### Example Request

```
GET /api/v1/templates/welcome_email
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "template_code": "welcome_email",
    "subject": "Welcome, {{name}}!",
    "body": "Hello {{name}}, welcome to our platform! Click here: {{link}}",
    "language": "en",
    "version": 3,
    "created_at": "2025-11-12T10:32:00Z",
    "updated_at": "2025-11-12T10:32:00Z"
  },
  "message": "Template fetched successfully"
}
```

---

## 🧠 Response Format (Standardized)

```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null,
  "message": string,
  }
}
```

---


## 🧩 Example Template Data

```json
[
  {
    "template_code": "welcome_email",
    "subject": "Welcome, {{name}}!",
    "body": "Hello {{name}}, welcome to our platform! Click here: {{link}}",
    "language": "en",
    "version": 3
  },
  {
    "template_code": "password_reset",
    "subject": "Reset Your Password",
    "body": "Hi {{name}}, reset your password using this link: {{link}}",
    "language": "en",
    "version": 1
  }
]
```

---

## 🔁 Service Communication Flow

* **API Gateway → Template Service**: Fetch template by code.
* **Email/Push Service → Template Service**: Retrieve template to render personalized messages.
* **Template Service → Shared Store (optional)**: Can cache templates or store metadata.

---

✅ **Port:** 8002
✅ **Health Endpoint:** `/health`
✅ **Versioned Templates:** Supported via `version` field
