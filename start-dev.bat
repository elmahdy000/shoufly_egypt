@echo off
REM Start Shoofly Development Server
REM Run from project root directory

echo.
echo ============================================
echo   🚀 Starting Shoofly Development Server
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo ⚠️  node_modules not found, running npm install...
  call npm install
  echo.
)

REM Check if .env exists
if not exist ".env" (
  echo ⚠️  .env file not found, copying from .env.example...
  copy .env.example .env
  echo ✅ .env created - please update with your configuration
  echo.
)

REM Start development server
echo Starting server on port 5000...
echo.
call npm run dev

pause
