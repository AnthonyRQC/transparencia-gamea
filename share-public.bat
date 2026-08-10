@echo off
title Transparencia - Demo publica
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0share-public.ps1"
echo.
pause
