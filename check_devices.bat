@echo off
title Flutter Device Check
cd /d D:\latest\shoofly-egy\mobile\shoofly_vendor
echo.
echo === Flutter Version ===
flutter --version
echo.
echo === Connected Devices ===
flutter devices
echo.
echo === Flutter Doctor ===
flutter doctor -v
echo.
pause
