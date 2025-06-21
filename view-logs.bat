@echo off
echo Viewing Docker logs...
echo.

REM Navigate to the correct directory
cd /d %~dp0
echo Current directory: %CD%
echo.

REM Check if Docker is running
docker info > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Please start Docker Desktop or Docker service.
    pause
    exit /b 1
)

echo Available services:
echo 1. All services
echo 2. Keycloak
echo 3. Backend
echo 4. Frontend
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Viewing logs for all services...
    docker-compose logs -f
) else if "%choice%"=="2" (
    echo Viewing logs for Keycloak...
    docker-compose logs -f keycloak
) else if "%choice%"=="3" (
    echo Viewing logs for Backend...
    docker-compose logs -f backend
) else if "%choice%"=="4" (
    echo Viewing logs for Frontend...
    docker-compose logs -f frontend
) else (
    echo Invalid choice. Please enter a number between 1 and 4.
    pause
    exit /b 1
)

echo.
echo Press Ctrl+C to stop viewing logs.
echo. 