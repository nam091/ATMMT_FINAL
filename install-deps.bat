@echo off
echo Installing dependencies...
echo.

REM Navigate to the correct directory
cd /d %~dp0
echo Current directory: %CD%
echo.

REM Install dependencies
echo Installing autoprefixer...
npm install --save-dev autoprefixer
echo.

echo Dependencies installed successfully.
echo.

echo Press any key to exit...
pause > nul 