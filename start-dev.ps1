# Real Estate Platform - Windows Dev Starter
# This script starts backend and frontend in separate PowerShell windows

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " Real Estate Platform - Starting Development Servers" -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running (for Postgres)
Write-Host "Checking Docker and Postgres..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "Press any key to continue anyway or Ctrl+C to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
} else {
    $postgresRunning = docker ps --filter "name=real-estate-postgres" --format "{{.Names}}" 2>$null
    if ($postgresRunning -eq "real-estate-postgres") {
        Write-Host "✓ Postgres container is running" -ForegroundColor Green
    } else {
        Write-Host "Starting Postgres container..." -ForegroundColor Yellow
        docker-compose up -d
        Start-Sleep -Seconds 3
        Write-Host "✓ Postgres started" -ForegroundColor Green
    }
}

Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Backend started in new window" -ForegroundColor Green
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "main-app"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Frontend started in new window" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " System Started Successfully!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend:  http://localhost:8001" -ForegroundColor White
Write-Host "  • API:      http://localhost:8001/api" -ForegroundColor White
Write-Host ""
Write-Host "Two PowerShell windows have been opened for the servers." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
