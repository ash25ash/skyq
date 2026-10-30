@echo off
title SkyQ.com In-Flight Web App Server
echo ===================================================
echo     Launching SkyQ.com Web App & Databases
echo ===================================================
cd /d "%~dp0\.."

REM Check if node exists in PATH or Visual Studio path
where node >nul 2>nul
if %errorlevel% equ 0 (
    node src/server.js
) else (
    if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe" (
        "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe" src/server.js
    ) else (
        echo [ERROR] Node.js executable not found in PATH or standard location.
        pause
    )
)
pause
