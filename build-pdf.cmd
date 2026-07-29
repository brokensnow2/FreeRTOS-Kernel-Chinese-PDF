@echo off
setlocal

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Install Node.js 20 or newer, then run this file again.
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] pnpm was not found.
  echo Run "corepack enable", then run this file again.
  exit /b 1
)

echo Installing locked dependencies...
call pnpm install --frozen-lockfile
if errorlevel 1 exit /b 1

echo Building the Chinese PDF preview...
call pnpm run preview
if errorlevel 1 exit /b 1

echo.
echo PDF created in output\pdf
