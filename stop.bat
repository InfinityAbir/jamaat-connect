@echo off
setlocal EnableExtensions

cd /d "%~dp0"

where docker >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop is not installed or Docker is not on PATH.
  pause
  exit /b 1
)

echo Stopping Jamaat Connect services...
rem This stops only this compose project and preserves the PostgreSQL data volume.
docker compose -f "%~dp0docker-compose.yml" down --remove-orphans
if errorlevel 1 (
  echo.
  echo The services could not be stopped. Ensure Docker Desktop is running and try again.
  pause
  exit /b 1
)

echo Jamaat Connect has stopped. Your database data was kept.
pause
exit /b 0
