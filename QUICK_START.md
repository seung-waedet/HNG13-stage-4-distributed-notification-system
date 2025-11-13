# 🚀 Quick Start Guide

Get your PR ready in 3 simple steps!

## Step 1: Clean Up Git (5 minutes)

Run the automated cleanup script:

```bash
./cleanup.sh
```

This will:
- ✅ Add .gitignore files
- ✅ Add .env.example templates
- ✅ Remove node_modules from git
- ✅ Remove dist folders from git
- ✅ Remove .env files from git
- ✅ Commit all changes

## Step 2: Verify Everything Works (10 minutes)

### Start Infrastructure
```bash
# Make sure these are running:
# - RabbitMQ (port 5672)
# - Redis (port 6379)
# - PostgreSQL (port 5432 or your Aiven instance)
```

### Start Services
```bash
# Terminal 1 - API Gateway
cd api-gateway
npm install
npm run start:dev

# Terminal 2 - Push Service
cd push-service
npm install
npm run start:dev

# Terminal 3 - User Service
cd user-service
npm install
npm run start:dev
```

### Test Health Endpoints
```bash
# Should all return 200 OK
curl http://localhost:8000/health
curl http://localhost:8004/health
curl http://localhost:8081/health
```

### Test End-to-End Flow
```bash
# 1. Create a test user
curl -X POST http://localhost:8081/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "push_token": "test_fcm_token_123",
    "preferences": {
      "email": true,
      "push": true
    }
  }'

# Note the user ID from response

# 2. Send a notification
curl -X POST http://localhost:8000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "push",
    "user_id": "YOUR_USER_ID_HERE",
    "template_code": "welcome_notification",
    "variables": {
      "name": "Test User",
      "link": "https://example.com"
    },
    "request_id": "test-req-123",
    "priority": 1
  }'

# 3. Check logs to verify message flow
# - API Gateway should log message published
# - Push Service should log message received and processed
```

## Step 3: Create Pull Request (5 minutes)

### Push Your Changes
```bash
# Review what will be pushed
git log --oneline -10

# Push to remote
git push origin api-gateway-push-service

# If you need to force push (after cleanup):
git push origin api-gateway-push-service --force
```

### Create PR on GitHub/GitLab

1. Go to your repository
2. Click "New Pull Request"
3. Select: `api-gateway-push-service` → `dev`
4. Copy content from `PR_DESCRIPTION.md` into PR description
5. Add reviewers
6. Add labels (e.g., `feature`, `microservices`)
7. Link related issues
8. Click "Create Pull Request"

## 📋 Pre-Flight Checklist

Before creating the PR, verify:

- [ ] `./cleanup.sh` ran successfully
- [ ] All services start without errors
- [ ] Health checks return 200 OK
- [ ] Test notification flows through the system
- [ ] No `.env` files in `git status`
- [ ] `.env.example` files are present
- [ ] README.md is complete
- [ ] Commits are clean and meaningful

## 🎯 What You've Built

Your PR includes:

### 3 Microservices
- **API Gateway** - REST API with RabbitMQ publisher
- **Push Service** - RabbitMQ consumer with Firebase integration
- **User Service** - User management with PostgreSQL

### Key Features
- ✅ Async message queuing with RabbitMQ
- ✅ Circuit breaker pattern
- ✅ Retry mechanism with exponential backoff
- ✅ Correlation ID tracking
- ✅ Health checks
- ✅ Swagger documentation
- ✅ Docker support
- ✅ Redis caching
- ✅ Rate limiting

### Infrastructure
- RabbitMQ for message queuing
- Redis for caching
- PostgreSQL for data persistence
- Firebase for push notifications

## 🆘 Troubleshooting

### Cleanup script fails
```bash
# Check what's tracked
git status

# Manually remove files
git rm -r --cached node_modules
git rm -r --cached dist
git rm --cached .env
```

### Services won't start
```bash
# Check dependencies
docker ps  # Verify RabbitMQ, Redis are running

# Check logs
npm run start:dev  # Look for error messages

# Verify .env files exist
ls -la */.env
```

### Tests fail
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20+
```

### RabbitMQ connection fails
```bash
# Verify RabbitMQ is running
curl http://localhost:15672  # Management UI

# Check connection string in .env
cat api-gateway/.env | grep RABBITMQ_URL
```

## 📚 Additional Resources

- `README.md` - Full project documentation
- `PR_DESCRIPTION.md` - Detailed PR description
- `CLEANUP_INSTRUCTIONS.md` - Manual cleanup steps
- `MERGE_CHECKLIST.md` - Complete pre-merge checklist

## 🎉 You're Ready!

Once you've completed these steps, your PR is ready for review. Good luck! 🚀

---

**Estimated Time:** 20 minutes total
**Difficulty:** Easy (mostly automated)
**Prerequisites:** Node.js 20+, RabbitMQ, Redis, PostgreSQL
