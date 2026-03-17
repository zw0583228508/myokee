#!/bin/bash
# Push MYOUKEE to GitHub for the first time.
# Run this from the Replit Shell tab.
#
# Usage:
#   chmod +x deploy/github-push.sh
#   ./deploy/github-push.sh YOUR_GITHUB_USERNAME REPO_NAME

set -e

GITHUB_USER="${1:?Usage: $0 <github-username> <repo-name>}"
REPO_NAME="${2:?Usage: $0 <github-username> <repo-name>}"

echo "=== MYOUKEE — Push to GitHub ==="
echo "Repo: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "Step 1: Configure git identity (if not set)"
git config user.email 2>/dev/null || git config user.email "you@example.com"
git config user.name  2>/dev/null || git config user.name  "MYOUKEE"

echo ""
echo "Step 2: Add remote origin"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "Step 3: Add all files"
git add -A

echo ""
echo "Step 4: Commit"
git commit -m "feat: initial MYOUKEE production deployment setup" || echo "Nothing new to commit"

echo ""
echo "Step 5: Push to main"
echo "You will be prompted for your GitHub username + Personal Access Token"
echo "(Create token at: https://github.com/settings/tokens/new?scopes=repo)"
echo ""
git push -u origin main

echo ""
echo "=== Done! ==="
echo "Next steps:"
echo "  1. Vercel:  vercel.com/new → import $GITHUB_USER/$REPO_NAME"
echo "  2. Railway: railway.app/new → deploy from GitHub"
echo "  3. Modal:   pip install modal && modal deploy deploy/modal_processor.py"
