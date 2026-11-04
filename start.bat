@echo off
setlocal EnableExtensions

rem A double-clicked batch file normally closes its window when it exits.
rem Relaunch inside a persistent command prompt so startup diagnostics remain visible.
if /I not "%~1"=="__keep_open" (
  start "Jamaat Connect Startup" cmd.exe /k call "%~f0" __keep_open
  exit /b 0
)

cd /d "%~dp0"
set "COMPOSE_FILE=%~dp0docker-compose.yml"
set "FRONTEND_URL=http://localhost:4200"

where docker >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop is not installed or Docker is not on PATH.
  echo Install and start Docker Desktop, then run this file again.
  pause
  exit /b 1
)

docker info >nul 2>&1
if not errorlevel 1 goto docker_ready

echo Starting Docker Desktop...
if not exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" goto docker_desktop_missing
start "Docker Desktop" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker Desktop to become ready...
set /a DOCKER_WAIT=0
:wait_for_docker
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if not errorlevel 1 goto docker_ready
set /a DOCKER_WAIT+=3
if %DOCKER_WAIT% LSS 120 goto wait_for_docker
goto docker_not_ready

:docker_desktop_missing
echo Docker Desktop could not be found at its standard location.
echo Open Docker Desktop manually, wait until it is running, then run this file again.
pause
exit /b 1

:docker_not_ready
echo Docker Desktop did not become ready within two minutes.
echo Check that Docker Desktop is running and that you have permission to use it.
pause
exit /b 1

:docker_ready
echo Building and starting Jamaat Connect...
rem Use only the production compose file: docker-compose.override.yml is for a separate dev workflow.
docker compose -f "%COMPOSE_FILE%" up -d --build
if errorlevel 1 (
  echo.
  echo Jamaat Connect could not start. Run "docker compose -f docker-compose.yml logs" for details.
  pause
  exit /b 1
)

echo Waiting for the frontend at %FRONTEND_URL%...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline = (Get-Date).AddSeconds(90); do { try { $response = Invoke-WebRequest -Uri '%FRONTEND_URL%' -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { exit 0 } } catch {}; Start-Sleep -Seconds 2 } while ((Get-Date) -lt $deadline); exit 1"
if errorlevel 1 (
  echo.
  echo Services were started, but the frontend did not become available within 90 seconds.
  echo Inspect the status with: docker compose -f docker-compose.yml ps
  pause
  exit /b 1
)

start "Jamaat Connect" "%FRONTEND_URL%"
echo.
echo Jamaat Connect is running at %FRONTEND_URL%
echo You can close this window; the Docker services will keep running.
pause
exit /b 0
