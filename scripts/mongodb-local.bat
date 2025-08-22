@echo off
echo MongoDB Local Development Setup
echo ================================

if "%1"=="start" (
    echo Starting MongoDB containers...
    docker-compose up -d
    echo.
    echo MongoDB is starting up...
    echo - MongoDB: http://localhost:27017
    echo - Mongo Express (Web UI): http://localhost:8081
    echo - Username: admin
    echo - Password: password123
    echo.
    echo Waiting for MongoDB to be ready...
    timeout /t 10 /nobreak > nul
    echo MongoDB is ready!
    echo.
    echo You can now run your application with: npm run dev
    echo Or test the API endpoints directly.
) else if "%1"=="stop" (
    echo Stopping MongoDB containers...
    docker-compose down
    echo MongoDB containers stopped.
) else if "%1"=="restart" (
    echo Restarting MongoDB containers...
    docker-compose down
    docker-compose up -d
    echo MongoDB restarted!
) else if "%1"=="logs" (
    echo Showing MongoDB logs...
    docker-compose logs -f mongodb
) else if "%1"=="status" (
    echo Checking container status...
    docker-compose ps
) else (
    echo Usage: mongodb-local.bat [start^|stop^|restart^|logs^|status]
    echo.
    echo Commands:
    echo   start   - Start MongoDB containers
    echo   stop    - Stop MongoDB containers
    echo   restart - Restart MongoDB containers
    echo   logs    - Show MongoDB logs
    echo   status  - Show container status
    echo.
    echo After starting, you can access:
    echo - MongoDB: localhost:27017
    echo - Mongo Express: http://localhost:8081
)
