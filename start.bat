@echo off
echo Starting Web Store Next.js App...
echo.
echo Please wait a few seconds while Next.js compiles the app.
echo Your default web browser will open shortly.
echo.

:: Start the browser to port 3005
start http://localhost:3005

:: Run the dev server on port 3005
npm run dev -- -p 3005

pause
