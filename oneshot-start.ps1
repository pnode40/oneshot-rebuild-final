#!/usr/bin/env pwsh
# OneShot Development Environment - Bulletproof Startup
# Version 2.0 - Fixed for Windows PowerShell

param(
    [switch]$SkipCleanup,
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "`n===== OneShot Development Environment =====" -ForegroundColor Cyan
Write-Host "Version: 2.0 (Windows PowerShell Edition)" -ForegroundColor Gray
Write-Host "==========================================`n" -ForegroundColor Cyan

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to kill processes using a port
function Stop-ProcessOnPort {
    param($Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique |
                 Where-Object { $_ -ne 0 }
    
    if ($processes) {
        foreach ($pid in $processes) {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  Stopping $($proc.ProcessName) (PID: $pid) on port $Port" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force
            }
        }
        Start-Sleep -Seconds 2
    }
}

# Step 1: Clean up if not skipped
if (-not $SkipCleanup) {
    Write-Host "Step 1: Cleaning up existing processes..." -ForegroundColor Yellow
    
    # Kill all Node processes
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "  Found $($nodeProcesses.Count) Node process(es). Terminating..." -ForegroundColor Yellow
        Stop-Process -Name node -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  No Node processes found." -ForegroundColor Green
    }
    
    # Check and free ports
    if (Test-Port 3001) {
        Write-Host "  Port 3001 is in use. Freeing..." -ForegroundColor Yellow
        Stop-ProcessOnPort 3001
    }
    
    if (Test-Port 5173) {
        Write-Host "  Port 5173 is in use. Freeing..." -ForegroundColor Yellow
        Stop-ProcessOnPort 5173
    }
}

# Step 2: Verify ports are free
Write-Host "`nStep 2: Verifying port availability..." -ForegroundColor Yellow
$port3001Free = -not (Test-Port 3001)
$port5173Free = -not (Test-Port 5173)

if ($port3001Free) {
    Write-Host "  Port 3001: FREE" -ForegroundColor Green
} else {
    Write-Host "  Port 3001: BLOCKED" -ForegroundColor Red
    Write-Host "  Cannot continue. Please manually check what's using port 3001." -ForegroundColor Red
    exit 1
}

if ($port5173Free) {
    Write-Host "  Port 5173: FREE" -ForegroundColor Green
} else {
    Write-Host "  Port 5173: BLOCKED" -ForegroundColor Red
}

# Step 3: Set up environment variables
Write-Host "`nStep 3: Setting up environment..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://OneShotMay25_owner:npg_OPr6NdBp0QVH@ep-wispy-lab-a5ldd1qu-pooler.us-east-2.aws.neon.tech/OneShotMay25?sslmode=require"
$env:JWT_SECRET = "oneshot_dev_secret_key"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"
Write-Host "  Environment variables set" -ForegroundColor Green

# Step 4: Start servers
Write-Host "`nStep 4: Starting servers..." -ForegroundColor Yellow

# Start backend if not frontend-only
if (-not $Frontend) {
    Write-Host "`n  Starting Backend Server (Port 3001)..." -ForegroundColor Cyan
    $backendPath = Join-Path $PSScriptRoot "server"
    
    if (Test-Path $backendPath) {
        $backendJob = Start-Job -Name "OneShot-Backend" -ScriptBlock {
            param($Path, $DbUrl, $JwtSecret)
            Set-Location $Path
            $env:DATABASE_URL = $DbUrl
            $env:JWT_SECRET = $JwtSecret
            & npm run dev 2>&1
        } -ArgumentList $backendPath, $env:DATABASE_URL, $env:JWT_SECRET
        
        Write-Host "  Backend server starting... (Job ID: $($backendJob.Id))" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Server directory not found at $backendPath" -ForegroundColor Red
    }
}

# Start frontend if not backend-only
if (-not $Backend) {
    Write-Host "`n  Starting Frontend Server (Port 5173)..." -ForegroundColor Cyan
    $frontendPath = Join-Path $PSScriptRoot "client"
    
    if (Test-Path $frontendPath) {
        $frontendJob = Start-Job -Name "OneShot-Frontend" -ScriptBlock {
            param($Path)
            Set-Location $Path
            & npm run dev 2>&1
        } -ArgumentList $frontendPath
        
        Write-Host "  Frontend server starting... (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Client directory not found at $frontendPath" -ForegroundColor Red
    }
}

# Step 5: Wait for servers to start
Write-Host "`nStep 5: Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if servers are running
$backendRunning = Test-Port 3001
$frontendRunning = Test-Port 5173

Write-Host "`n===== Server Status =====" -ForegroundColor Green
if ($backendRunning) {
    Write-Host "  Backend:  RUNNING on http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "  Backend:  NOT RUNNING" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "  Frontend: RUNNING on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  Frontend: NOT RUNNING" -ForegroundColor Red
}

# Show useful commands
Write-Host "`n===== Useful Commands =====" -ForegroundColor Cyan
Write-Host "  View logs:        Get-Job | Receive-Job" -ForegroundColor Gray
Write-Host "  Backend logs:     Receive-Job -Name 'OneShot-Backend'" -ForegroundColor Gray
Write-Host "  Frontend logs:    Receive-Job -Name 'OneShot-Frontend'" -ForegroundColor Gray
Write-Host "  Stop servers:     .\oneshot-stop.ps1" -ForegroundColor Gray
Write-Host "  Check status:     Get-Job" -ForegroundColor Gray

# Open browser if both servers are running
if ($backendRunning -and $frontendRunning) {
    Write-Host "`nOpening browser..." -ForegroundColor Green
    Start-Process "http://localhost:5173"
}

Write-Host "`nServers are running in background jobs. Press Ctrl+C to exit this script." -ForegroundColor Yellow
Write-Host "The servers will continue running. Use .\oneshot-stop.ps1 to stop them.`n" -ForegroundColor Yellow 