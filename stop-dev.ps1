# Real Estate Platform - Stop Development Servers
# This script stops all Node/tsx/next processes

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " Stopping Development Servers..." -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Stop tsx (backend)
Write-Host "Stopping backend (tsx processes)..." -ForegroundColor Yellow
$tsxProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*tsx*" -or $_.CommandLine -like "*tsx*" }
if ($tsxProcesses) {
    $tsxProcesses | Stop-Process -Force
    Write-Host "✓ Backend processes stopped" -ForegroundColor Green
} else {
    Write-Host "  No backend processes found" -ForegroundColor Gray
}

# Stop next (frontend)
Write-Host "Stopping frontend (next processes)..." -ForegroundColor Yellow
$nextProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*next*" -or $_.CommandLine -like "*next*" }
if ($nextProcesses) {
    $nextProcesses | Stop-Process -Force
    Write-Host "✓ Frontend processes stopped" -ForegroundColor Green
} else {
    Write-Host "  No frontend processes found" -ForegroundColor Gray
}

# Alternative: Kill all node processes (more aggressive)
Write-Host ""
Write-Host "Do you want to stop ALL Node.js processes? (y/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ All Node.js processes stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " Servers Stopped" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
