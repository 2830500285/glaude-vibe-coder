@echo off
setlocal
cd /d "%~dp0"

set "BUN_EXE=%USERPROFILE%\.bun\bin\bun.exe"
if not exist "%BUN_EXE%" set "BUN_EXE=bun"

"%BUN_EXE%" run app
