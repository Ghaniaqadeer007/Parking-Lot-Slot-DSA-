@echo off
title ParkFlow Next.js Development Server
echo ========================================================
echo   Starting ParkFlow (React + Next.js) Dev Server...
echo ========================================================

cd /d "%~dp0"

:: Detect npm in PATH or common Visual Studio / Node.js install paths
set "NPM_CMD="
where npm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "NPM_CMD=npm"
) else if exist "C:\Program Files\nodejs\npm.cmd" (
    set "NPM_CMD=\"C:\Program Files\nodejs\npm.cmd\""
) else if exist "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs\npm.cmd" (
    set "NPM_CMD=\"C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs\npm.cmd\""
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\npm.cmd" (
    set "NPM_CMD=\"C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\npm.cmd\""
) else (
    set "NPM_CMD=npm"
)

:: Automatically launch browser window to the project URL
start http://localhost:3000

:: Start Next.js development server
call %NPM_CMD% run dev
