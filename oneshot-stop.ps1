#!/usr/bin/env pwsh
# OneShot Development Environment - Stop Script
# Companion to oneshot-start.ps1

Write-Host "`n===== Stopping OneShot Servers =====" -ForegroundColor Red

# Stop background jobs
$jobs = Get-Job -Name "OneShot-*" -ErrorAction SilentlyContinue
if ($jobs) {
    Write-Host "Found $($jobs.Count) OneShot job(s) to stop:" -ForegroundColor Yellow
    foreach ($job in $jobs) {
        Write-Host "  - $($job.Name) (State: $($job.State))" -ForegroundColor Gray
        Stop-Job -Job $job
        Remove-Job -Job $job -Force
    }
} else {
    Write-Host "No OneShot jobs found." -ForegroundColor Yellow
}

# Kill any remaining Node processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "`nKilling $($nodeProcesses.Count) Node process(es)..." -ForegroundColor Yellow
    Stop-Process -Name node -Force
}

# Verify ports are free
Start-Sleep -Seconds 2
$port3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue

Write-Host "`n===== Port Status =====" -ForegroundColor Cyan
if (-not $port3001) {
    Write-Host "  Port 3001: FREE" -ForegroundColor Green
} else {
    Write-Host "  Port 3001: STILL IN USE" -ForegroundColor Red
}

if (-not $port5173) {
    Write-Host "  Port 5173: FREE" -ForegroundColor Green
} else {
    Write-Host "  Port 5173: STILL IN USE" -ForegroundColor Red
}

Write-Host "`nServers stopped." -ForegroundColor Green 