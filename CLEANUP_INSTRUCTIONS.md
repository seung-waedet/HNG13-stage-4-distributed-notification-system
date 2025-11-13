# 🧹 Git Cleanup Instructions

## Problem
Your branch currently has `node_modules/`, `dist/`, and `.env` files tracked in git. These should be ignored.

## Solution

Follow these steps to clean up your git repository:

### Step 1: Stage the new files
```bash
git add .gitignore
git add README.md
git add PR_DESCRIPTION.md
git add api-gateway/.gitignore
git add api-gateway/.env.example
git add push-service/.gitignore
git add push-service/.env.example
git add user-service/.env.example
git add CLEANUP_INSTRUCTIONS.md
```

### Step 2: Commit the gitignore and example files
```bash
git commit -m "chore: add .gitignore files and .env.example templates"
```

### Step 3: Remove tracked files that should be ignored
```bash
# Remove node_modules from git (but keep locally)
git rm -r --cached api-gateway/node_modules
git rm -r --cached push-service/node_modules
git rm -r --cached user-service/node_modules

# Remove dist folders from git (but keep locally)
git rm -r --cached api-gateway/dist
git rm -r --cached push-service/dist
git rm -r --cached user-service/dist

# Remove .env files from git (but keep locally)
git rm --cached api-gateway/.env
git rm --cached push-service/.env
git rm --cached user-service/.env

# Remove tsbuildinfo
git rm --cached api-gateway/tsconfig.tsbuildinfo
```

### Step 4: Commit the cleanup
```bash
git commit -m "chore: remove node_modules, dist, and .env files from git tracking"
```

### Step 5: Verify the cleanup
```bash
git status
```

You should now see a much cleaner git status with only source files tracked.

## ⚠️ Important Notes

1. **Your local files are safe**: The `--cached` flag only removes files from git tracking, not from your filesystem
2. **Environment files**: Make sure you have your `.env` files backed up before running these commands
3. **After cleanup**: Your `.env` files will still exist locally but won't be tracked by git
4. **Team members**: Share the `.env.example` files with your team so they can create their own `.env` files

## Alternative: Fresh Start (Nuclear Option)

If you want to completely reset and start fresh:

```bash
# WARNING: This will lose uncommitted changes!
# Make sure you have backups of your .env files first!

# 1. Backup your .env files
cp api-gateway/.env api-gateway/.env.backup
cp push-service/.env push-service/.env.backup
cp user-service/.env user-service/.env.backup

# 2. Reset to dev branch
git fetch origin dev
git reset --hard origin/dev

# 3. Cherry-pick your source code commits (skip the ones with node_modules)
# You'll need to identify the commit hashes of your actual code changes
git cherry-pick <commit-hash>

# 4. Restore your .env files
cp api-gateway/.env.backup api-gateway/.env
cp push-service/.env.backup push-service/.env
cp user-service/.env.backup user-service/.env
```

## After Cleanup: Push to Remote

Once you've cleaned up:

```bash
# Force push to your branch (since you're rewriting history)
git push origin api-gateway-push-service --force

# Or if you prefer a safer approach, create a new branch
git checkout -b api-gateway-push-service-clean
git push origin api-gateway-push-service-clean
```

## Verification Checklist

After cleanup, verify:
- [ ] `node_modules/` directories are not in `git status`
- [ ] `dist/` directories are not in `git status`
- [ ] `.env` files are not in `git status`
- [ ] `.env.example` files ARE in `git status`
- [ ] Source code files (`.ts`, `.json`, etc.) are still tracked
- [ ] `.gitignore` files are committed
- [ ] Your local `.env` files still exist and work

## Need Help?

If you run into issues:
1. Check `git status` to see what's tracked
2. Use `git diff --cached` to see what will be committed
3. Use `git reset HEAD <file>` to unstage files if needed
