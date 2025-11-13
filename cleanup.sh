#!/bin/bash

# Cleanup script for removing unwanted files from git tracking
# This script removes node_modules, dist folders, and .env files from git

set -e  # Exit on error

echo "🧹 Starting Git Cleanup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Add new files
echo "${YELLOW}Step 1: Adding new configuration files...${NC}"
git add api-gateway/.gitignore
git add api-gateway/.env.example
git add push-service/.gitignore
git add push-service/.env.example
git add user-service/.env.example
echo "${GREEN}✓ Configuration files staged${NC}"
echo ""

# Step 2: Commit configuration files
echo "${YELLOW}Step 2: Committing configuration files...${NC}"
git commit -m "chore: add .env.example templates"
echo "${GREEN}✓ Configuration files committed${NC}"
echo ""

# Step 3: Remove node_modules from tracking
echo "${YELLOW}Step 3: Removing node_modules from git tracking...${NC}"
if [ -d "api-gateway/node_modules" ]; then
    git rm -r --cached api-gateway/node_modules 2>/dev/null || echo "  api-gateway/node_modules already removed"
fi
if [ -d "push-service/node_modules" ]; then
    git rm -r --cached push-service/node_modules 2>/dev/null || echo "  push-service/node_modules already removed"
fi
if [ -d "user-service/node_modules" ]; then
    git rm -r --cached user-service/node_modules 2>/dev/null || echo "  user-service/node_modules already removed"
fi
echo "${GREEN}✓ node_modules removed from tracking${NC}"
echo ""

# Step 4: Remove dist folders from tracking
echo "${YELLOW}Step 4: Removing dist folders from git tracking...${NC}"
if [ -d "api-gateway/dist" ]; then
    git rm -r --cached api-gateway/dist 2>/dev/null || echo "  api-gateway/dist already removed"
fi
if [ -d "push-service/dist" ]; then
    git rm -r --cached push-service/dist 2>/dev/null || echo "  push-service/dist already removed"
fi
if [ -d "user-service/dist" ]; then
    git rm -r --cached user-service/dist 2>/dev/null || echo "  user-service/dist already removed"
fi
echo "${GREEN}✓ dist folders removed from tracking${NC}"
echo ""

# Step 5: Remove .env files from tracking
echo "${YELLOW}Step 5: Removing .env files from git tracking...${NC}"
git rm --cached api-gateway/.env 2>/dev/null || echo "  api-gateway/.env already removed"
git rm --cached push-service/.env 2>/dev/null || echo "  push-service/.env already removed"
git rm --cached user-service/.env 2>/dev/null || echo "  user-service/.env already removed"
echo "${GREEN}✓ .env files removed from tracking${NC}"
echo ""

# Step 6: Remove tsbuildinfo
echo "${YELLOW}Step 6: Removing build artifacts...${NC}"
git rm --cached api-gateway/tsconfig.tsbuildinfo 2>/dev/null || echo "  tsbuildinfo already removed"
git rm --cached api-gateway/dist/tsconfig.tsbuildinfo 2>/dev/null || echo "  dist/tsbuildinfo already removed"
echo "${GREEN}✓ Build artifacts removed${NC}"
echo ""

# Step 7: Commit the cleanup
echo "${YELLOW}Step 7: Committing cleanup changes...${NC}"
git commit -m "chore: remove node_modules, dist, from git tracking"
echo "${GREEN}✓ Cleanup committed${NC}"
echo ""

# Step 8: Show status
echo "${YELLOW}Step 8: Verifying cleanup...${NC}"
echo ""
git status --short
echo ""

echo "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the changes with: git log --oneline -5"
echo "  2. Push to remote with: git push origin api-gateway-push-service"
echo "  3. Or force push if needed: git push origin api-gateway-push-service --force"
echo ""
echo "${YELLOW}⚠️  Note: Your local .env files are safe and still exist!${NC}"
