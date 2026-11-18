@echo off
cd /d "%~dp0"

echo ============================================================
echo   CS CORP - Git Commit & Sync All Branches (origin + gorilla)
echo ============================================================
echo.

set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" set "COMMIT_MSG=feat(cslocker,khatakit): add CS Locker document vault with MongoDB GridFS and mobile-first UI"

echo [1/4] Staging all changes...
git add .

echo [2/4] Committing changes: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%"

echo [3/4] Syncing local branches (production, development, main)...
git branch -f production HEAD
git branch -f development HEAD
git branch -f main HEAD

echo [4/4] Pushing to origin (CS-CORPORATION) and gorilla (Portfolio-Article)...
git push origin production development main
git push gorilla HEAD:production HEAD:development HEAD:main HEAD:dev HEAD:master HEAD:staging

echo.
echo ============================================================
echo   Done! All branches committed and pushed successfully.
echo ============================================================
pause
