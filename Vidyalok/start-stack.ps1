param(
    [string]$MongoDataPath = "C:\\data\\db",
    [switch]$SkipPrismaStudio,
    [switch]$ForceMongoRestart
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Assert-Command {
    param([string]$Command)
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Required command '$Command' was not found on PATH. Install it or update PATH before running this script."
    }
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        Write-Host "Creating MongoDB data directory: $Path" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Wait-ForMongo {
    param([int]$TimeoutSeconds = 30)
    for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
        try {
            $ping = & mongosh "mongodb://127.0.0.1:27017" --quiet --eval "db.runCommand({ ping: 1 }).ok" 2>$null
            if ($LASTEXITCODE -eq 0 -and $ping -eq 1) {
                return
            }
        } catch {
            Start-Sleep -Seconds 1
        }
        Start-Sleep -Seconds 1
    }
    throw "MongoDB did not respond within $TimeoutSeconds seconds."
}

function Initialize-ReplicaSet {
    $status = & mongosh "mongodb://127.0.0.1:27017" --quiet --eval "try { rs.status().ok } catch (e) { 0 }"
    if ($LASTEXITCODE -eq 0 -and [int]$status -eq 1) {
        Write-Host "Replica set already initialized." -ForegroundColor DarkGreen
        return
    }

    Write-Host "Initializing replica set 'vidyalok-rs'." -ForegroundColor Cyan
    $init = & mongosh "mongodb://127.0.0.1:27017" --quiet --eval "rs.initiate({_id:'vidyalok-rs', members:[{_id:0, host:'127.0.0.1:27017'}]})"
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize replica set: $init"
    }
}

function Wait-ForReplicaPrimary {
    param([int]$TimeoutSeconds = 60)

    Write-Host "Waiting for replica set primary election..." -ForegroundColor Cyan
    for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
        try {
            $isPrimary = & mongosh "mongodb://127.0.0.1:27017" --quiet --eval "!!db.hello().isWritablePrimary" 2>$null
            if ($LASTEXITCODE -eq 0 -and $isPrimary -eq "true") {
                Write-Host "Replica set primary is ready." -ForegroundColor DarkGreen
                return
            }
        } catch {
            # swallow and retry
        }
        Start-Sleep -Seconds 1
    }

    throw "Replica set did not become PRIMARY within $TimeoutSeconds seconds."
}

function Start-MongoServer {
    $existingMongo = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($existingMongo) {
        if ($ForceMongoRestart) {
            try {
                Write-Host "Stopping MongoDB Windows service (if running)..." -ForegroundColor Yellow
                & sudo net stop MongoDB | Out-Null
            } catch {
                Write-Host "Skipping service stop: sudo/net not available or insufficient rights." -ForegroundColor DarkYellow
            }

            try {
                $existingMongo | ForEach-Object {
                    Write-Host "Stopping existing mongod process (PID: $($_.Id))." -ForegroundColor Yellow
                    Stop-Process -Id $_.Id -Force -ErrorAction Stop
                }
            } catch {
                throw "Failed to stop the running mongod process. Run this script from an elevated PowerShell session or stop MongoDB manually, then retry. Details: $($_.Exception.Message)"
            }

            $retryStop = 0
            while ((Get-Process -Name "mongod" -ErrorAction SilentlyContinue) -and $retryStop -lt 20) {
                Start-Sleep -Milliseconds 250
                $retryStop++
            }

            if (Get-Process -Name "mongod" -ErrorAction SilentlyContinue) {
                throw "Unable to terminate existing mongod process. Close it manually (or stop the MongoDB service) and rerun the script."
            }
        } else {
            Write-Host "mongod already running; skipping start. Use -ForceMongoRestart to restart MongoDB." -ForegroundColor Yellow
            return
        }
    }

    Ensure-Directory -Path $MongoDataPath

    $mongoCommand = "mongod --dbpath `"$MongoDataPath`" --replSet vidyalok-rs --bind_ip 127.0.0.1"
    Write-Host "Starting MongoDB with: $mongoCommand" -ForegroundColor Cyan
    Start-DevProcess -Title "MongoDB Server" -Command $mongoCommand

    Write-Host "Waiting for MongoDB to accept connections..." -ForegroundColor Cyan
    Wait-ForMongo

    if (-not (Get-Process -Name "mongod" -ErrorAction SilentlyContinue)) {
        throw "MongoDB process did not remain running after launch. Check the MongoDB window for errors."
    }

    Initialize-ReplicaSet
    Wait-ForReplicaPrimary
    Write-Host "MongoDB server is ready." -ForegroundColor DarkGreen
}

function Start-DevProcess {
    param(
        [string]$Title,
        [string]$Command
    )

    $escapedRoot = $projectRoot.Replace("'", "''")
    $fullCommand = "Set-Location '$escapedRoot'; $Command"
    Write-Host "Launching $Title -> $Command" -ForegroundColor Cyan
    Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit','-Command',$fullCommand -WindowStyle Normal | Out-Null
}

try {
    Assert-Command -Command "mongod"
    Assert-Command -Command "mongosh"
    Assert-Command -Command "npm"
    if (-not $SkipPrismaStudio) {
        Assert-Command -Command "npx"
    }

    Start-MongoServer
    Start-DevProcess -Title "Next.js dev server" -Command "npm run dev"

    if (-not $SkipPrismaStudio) {
        Start-DevProcess -Title "Prisma Studio" -Command "npx prisma studio"
    }

    Write-Host ""; Write-Host "VidyaLok dev stack is starting." -ForegroundColor Green
    Write-Host "MongoDB replica set: mongodb://127.0.0.1:27017 (rs=vidyalok-rs)" -ForegroundColor Green
    Write-Host "Next.js app:       http://127.0.0.1:3000" -ForegroundColor Green
    if (-not $SkipPrismaStudio) {
        Write-Host "Prisma Studio:    http://localhost:5555" -ForegroundColor Green
    }
    Write-Host "Close the spawned PowerShell windows to stop each service." -ForegroundColor Yellow

} catch {
    Write-Error $_
    exit 1
}
