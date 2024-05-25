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

:: Install dependencies
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please check the error messages above.
    pause
    exit /b
)