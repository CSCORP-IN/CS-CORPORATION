@echo off
cd /d "%~dp0"

echo ============================================================
echo   CS CORP - Git Commit & Sync All Branches (origin + gorilla)
echo ============================================================
echo.

set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" set "COMMIT_MSG=feat(cslocker,khatakit): add CS Locker document vault with MongoDB GridFS and mobile-first UI"

echo [1/4] Staging & committing changes (if any)...
git add .
git commit -m "%COMMIT_MSG%"

echo [2/4] Updating local branches...
git branch -f development HEAD 2>nul
git branch -f main HEAD 2>nul
git branch -f production HEAD 2>nul

echo [3/4] Pushing HEAD to ALL branches on origin (CS-CORPORATION)...
git push --force origin HEAD:production
git push --force origin HEAD:development
git push --force origin HEAD:main

echo [4/4] Pushing HEAD to ALL branches on gorilla (Portfolio-Article)...
git push --force gorilla HEAD:production
git push --force gorilla HEAD:development
git push --force gorilla HEAD:main
git push --force gorilla HEAD:dev
git push --force gorilla HEAD:master
git push --force gorilla HEAD:staging

echo.
echo ============================================================
echo   Done! All branches on origin & gorilla are now synced!
echo ============================================================
pause
