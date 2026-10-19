@echo off
title ParkFlow Next.js Development Server
echo ========================================================
echo   Starting ParkFlow (React + Next.js) Dev Server...
echo ========================================================

:: Ensure Visual Studio's bundled Node.js and npm are on PATH
set "PATH=C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs;%PATH%"

cd /d "%~dp0"

:: Start Next.js development server
call "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs\npm.cmd" run dev
