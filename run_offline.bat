@echo off
title Pearl Frontier - Offline Prototype
color 0F

echo ========================================================
echo   PEARL FRONTIER (PF) - Minimalist Sovereign Prototype
echo   East Africa's Sovereign Digital Square
echo ========================================================
echo.
echo Starting local offline environment...
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js runtime detected.
    echo Launching high-fidelity local server...
    start "Pearl Frontier Server" /b node "%~dp0server.js"
    timeout /t 2 /nobreak >nul
    echo Opening application in your default browser...
    start http://localhost:3000
) else (
    echo [INFO] Node.js not found in PATH.
    echo Launching standalone index.html directly in browser...
    start "" "%~dp0index.html"
)

echo.
echo ========================================================
echo   Prototype is running!
echo   Secret Admin Access: Click the PEARL FRONTIER logo.
echo   Password: Kyeyuneneithen1$
echo ========================================================
pause >nul
