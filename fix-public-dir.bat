@echo off
echo Fixing public directory issues...
echo.

REM Navigate to the correct directory
cd /d %~dp0
echo Current directory: %CD%
echo.

REM Ensure public directory exists
echo Ensuring public directory exists...
if not exist frontend\public (
    mkdir frontend\public
    echo Created frontend\public directory.
) else (
    echo frontend\public directory already exists.
)

REM Create placeholder files
echo Creating placeholder files...
echo ^<!-- Placeholder for favicon.ico --^> > frontend\public\favicon.ico
echo Created frontend\public\favicon.ico file.

echo ^<svg width="800px" height="400px" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg"^> > frontend\public\placeholder.svg
echo   ^<rect x="0" y="0" width="800" height="400" fill="#f3f4f6"/^> >> frontend\public\placeholder.svg
echo   ^<text x="400" y="200" font-family="Arial" font-size="32" text-anchor="middle" fill="#6b7280"^>Greeting View^</text^> >> frontend\public\placeholder.svg
echo ^</svg^> >> frontend\public\placeholder.svg
echo Created frontend\public\placeholder.svg file.

REM Create robots.txt
echo User-agent: * > frontend\public\robots.txt
echo Allow: / >> frontend\public\robots.txt
echo Created frontend\public\robots.txt file.

REM Create .env.local file for frontend
echo Creating .env.local file for frontend...
echo NEXT_PUBLIC_API_URL=http://localhost:3001> frontend\.env.local
echo NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080>> frontend\.env.local
echo NEXT_PUBLIC_KEYCLOAK_REALM=greeting-view>> frontend\.env.local
echo NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=greeting-view-frontend>> frontend\.env.local
echo Created frontend\.env.local file.

echo.
echo Public directory structure fixed successfully.
echo You can now run docker-compose up -d --build to build and start the containers.
echo.

echo Press any key to exit...
pause > nul 