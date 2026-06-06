@echo off
cd /d D:\bbma\bursadisleksi\oogmatik

set msg=Auto-commit: %date% %time%

git add .
git commit -m "%msg%"
git push origin main

pause