@echo off
title Wuthering Waves RPC

:: Variables
set SCRIPT_PATH=%~dp0%~nx0
set SHORTCUT_NAME=WutheringWavesRPC.lnk
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

:: Create a shortcut to this script in the startup folder
echo Creating startup shortcut...
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%'); $s.TargetPath='%SCRIPT_PATH%'; $s.WorkingDirectory='%~dp0'; $s.Save()"

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in the PATH. Please install Node.js and try again.
    pause
    exit /b
)

:: Check if package.json exists
if not exist package.json (
    echo package.json not found. Please ensure you are in the correct directory.
    pause
    exit /b
)

:: Check if node_modules exists, if not run npm install
if not exist node_modules (
    echo node_modules not found. Running npm install...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install npm dependencies. Please check the error messages above.
        pause
        exit /b
    )
)

:: Fetch the latest version from GitHub
echo Checking for updates...
node checkUpdates.js

start "" "RBTray.exe"

:: Run the main script
echo Starting the Rich Presence...
echo Use ctrl + alt + down to minimize!
node .
if %errorlevel% neq 0 (
    echo Failed to run the script. Please check the error messages above.
    pause
    exit /b
)

pause