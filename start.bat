@echo off
title Glastad Samlinger
echo Starter Glastad Samlinger...
echo Nettleseren åpnes automatisk.
echo.
echo Trykk Ctrl+C for å avslutte.
echo.
cd /d "%~dp0"
npm run preview
pause
