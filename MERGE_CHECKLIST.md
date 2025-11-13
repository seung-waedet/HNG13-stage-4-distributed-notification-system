# ✅ Pre-Merge Checklist

Before merging `api-gateway-push-service` → `dev`, complete these steps:

## 🔒 Security & Configuration

- [ ] **Remove sensitive data from git history**
  - Run `./cleanup.sh` to remove `.env` files from tracking
  - Verify with `git log --all --full-history -- "*.env"`
  
- [ ] **Verify .env files are gitignored**
  - Check `git status` doesn't show `.env` files
  - Confirm `.env.example` files are present
  
- [ ] **Update environment variables**
  - [ ] Remove production DB credentials from user-service/.env
  - [ ] Use environment-specific values
  - [ ] Document all required env vars in .env.example files

## 🧪 Testing

- [ ] **Test API Gateway**
  ```bash
  curl http://localhost:8000/health
  curl -X POST http://localhost:8000/api/v1/notifications \
    -H "Content-Type: application/json" \
    -d '{"notification_type":"push","user_id":"test-uuid","template_code":"test","variables":{"name":"Test","link":"http://test.com"},"request_id":"test-req-123"}'
  ```

- [ ] **Test User Service**
  ```bash
  curl http://localhost:8081/health
  curl http://localhost:8081/api/v1/users
  ```

- [ ] **Test Push Service**
  ```bash
  curl http://localhost:8004/health
  ```

- [ ] **Test RabbitMQ Integration**
  - Verify messages are published to exchange
  - Verify push service consumes messages
  - Check logs for successful delivery

## 🐳 Docker

- [ ] **Build all Docker images**
  ```bash
  docker build -t api-gateway ./api-gateway
  docker build -t push-service ./push-service
  docker build -t user-service ./user-service
  ```

- [ ] **Test Docker containers**
  - Verify containers start successfully
  - Check health endpoints work in containers

## 📝 Documentation

- [ ] **README.md is complete**
  - Architecture overview
  - Setup instructions
  - API documentation
  - Configuration guide

- [ ] **PR Description is ready**
  - Review `PR_DESCRIPTION.md`
  - Update with any last-minute changes
  - Include breaking changes if any

- [ ] **Code comments are adequate**
  - Complex logic is explained
  - Public APIs are documented

## 🔍 Code Quality

- [ ] **No console.logs in production code**
  - Use proper logging (Logger service)
  
- [ ] **Error handling is comprehensive**
  - All async operations have try-catch
  - Errors are logged with context
  
- [ ] **TypeScript types are correct**
  - No `any` types (or justified)
  - Interfaces are properly defined
  
- [ ] **Code follows NestJS conventions**
  - Proper use of decorators
  - Dependency injection is used
  - Modules are properly structured

## 🗂️ Git Hygiene

- [ ] **Run cleanup script**
  ```bash
  ./cleanup.sh
  ```

- [ ] **Verify git status is clean**
  ```bash
  git status
  ```

- [ ] **Check commit history**
  ```bash
  git log --oneline -20
  ```

- [ ] **Squash commits if needed**
  - Consider squashing fix commits
  - Keep meaningful commit messages

## 🚀 Deployment Readiness

- [ ] **Environment variables documented**
  - All services have .env.example
  - Required vs optional vars are clear
  
- [ ] **Database migrations are ready**
  - User service schema is defined
  - Migration scripts if needed
  
- [ ] **External dependencies documented**
  - RabbitMQ setup requirements
  - Redis configuration
  - PostgreSQL setup
  - Firebase project setup

## 📊 Monitoring & Observability

- [ ] **Health checks work**
  - All services respond to /health
  - Health checks include dependencies
  
- [ ] **Logging is consistent**
  - Correlation IDs are used
  - Log levels are appropriate
  - Sensitive data is not logged
  
- [ ] **Error tracking is in place**
  - Errors are logged with stack traces
  - Error context is preserved

## 🤝 Team Communication

- [ ] **Notify team about the PR**
  - Share PR link
  - Highlight breaking changes
  - Request specific reviewers
  
- [ ] **Update project board/tickets**
  - Link related issues
  - Update task status
  
- [ ] **Schedule code review**
  - Set expectations for review timeline
  - Be available for questions

## 🎯 Final Steps

1. **Run the cleanup script:**
   ```bash
   ./cleanup.sh
   ```

2. **Verify everything works:**
   ```bash
   # Start all services and test end-to-end
   cd api-gateway && npm run start:dev &
   cd push-service && npm run start:dev &
   cd user-service && npm run start:dev &
   ```

3. **Push cleaned branch:**
   ```bash
   git push origin api-gateway-push-service --force
   ```

4. **Create Pull Request:**
   - Use content from `PR_DESCRIPTION.md`
   - Add reviewers
   - Link related issues
   - Set appropriate labels

5. **Monitor CI/CD:**
   - Watch for build failures
   - Fix any issues promptly

## ⚠️ Known Issues to Address

- [ ] User service PORT is empty in .env (should be 8081)
- [ ] Consider adding docker-compose.yml for local development
- [ ] Add integration tests
- [ ] Consider adding API authentication
- [ ] Add rate limiting configuration
- [ ] Document RabbitMQ exchange/queue setup

## 📞 Need Help?

If you encounter issues:
- Check `CLEANUP_INSTRUCTIONS.md` for git cleanup help
- Review `README.md` for setup instructions
- Check service logs for errors
- Verify all dependencies are running (RabbitMQ, Redis, PostgreSQL)

---

**Remember:** It's better to take time and do it right than to rush and create problems! 🎯
