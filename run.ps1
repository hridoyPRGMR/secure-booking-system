<#
.SYNOPSIS
    Runs the SecureBooking API, frontend apps, and/or EF Core migration commands.

.DESCRIPTION
    Convenience runner for local development. Combines backend API, React web app,
    Angular admin panel, and EF Core migration commands into a unified workflow.

.EXAMPLE
    ./run-dev.ps1 -Api -Web
    Starts the API and customer React app in separate windows.

.EXAMPLE
    ./run-dev.ps1 -AddMigration "AddLoyaltyPoints" -UpdateDatabase
    Creates a new EF Core migration and applies it to the database.

.EXAMPLE
    ./run-dev.ps1 -UpdateDatabase -Api -Web -Admin
    Applies pending migrations, then starts API, Web app, and Admin panel.
#>

[CmdletBinding()]
param(
    [switch]$Api,
    [switch]$Web,
    [switch]$Admin,
    [string]$AddMigration,
    [switch]$RemoveMigration,
    [switch]$UpdateDatabase
)

$ErrorActionPreference = "Stop"

# Define Paths
$repoRoot       = $PSScriptRoot
$backendDir     = Join-Path $repoRoot "Backend"
$apiProject     = Join-Path $backendDir "SecureBooking.Api"
$infraProject   = Join-Path $backendDir "SecureBooking.Infrastructure"
$webDir         = Join-Path $repoRoot "Frontend\secure-booking-web"
$adminDir       = Join-Path $repoRoot "Frontend\admin-panel"

$migrationsOutputDir = "Persistence/Migrations"

# Dynamically pick PowerShell executable for child windows (pwsh vs powershell.exe)
$shellExe = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }

# Helper to verify dotnet-ef is installed globally/locally
function Assert-EfToolInstalled {
    if (-not (Get-Command dotnet-ef -ErrorAction SilentlyContinue)) {
        throw "EF Core CLI tool ('dotnet-ef') is not installed. Run: dotnet tool install --global dotnet-ef"
    }
}

# Helper to verify folder or project existence
function Assert-PathExists {
    param([string]$Path, [string]$Name)
    if (-not (Test-Path $Path)) {
        throw "Directory or project for $Name was not found at: '$Path'"
    }
}

function Invoke-EfCommand {
    param([string[]]$Arguments)

    Assert-EfToolInstalled
    Assert-PathExists -Path $infraProject -Name "Infrastructure Project"
    Assert-PathExists -Path $apiProject -Name "API Startup Project"

    # Explicitly bind Infrastructure as target project and API as startup project
    $fullArgs = $Arguments + @("--project", $infraProject, "--startup-project", $apiProject)
    
    Write-Host "> dotnet ef $($fullArgs -join ' ')" -ForegroundColor Cyan
    & dotnet ef @fullArgs

    if ($LASTEXITCODE -ne 0) {
        throw "dotnet ef $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

# --- Execution Pipeline ---

if ($AddMigration) {
    Write-Host "Adding Migration '$AddMigration'..." -ForegroundColor Yellow
    Invoke-EfCommand -Arguments @("migrations", "add", $AddMigration.Trim(), "--output-dir", $migrationsOutputDir)
}

if ($RemoveMigration) {
    Write-Host "Removing last migration..." -ForegroundColor Yellow
    Invoke-EfCommand -Arguments @("migrations", "remove")
}

if ($UpdateDatabase) {
    Write-Host "Updating Database..." -ForegroundColor Yellow
    Invoke-EfCommand -Arguments @("database", "update")
}

if ($Api) {
    Assert-PathExists -Path $apiProject -Name "API Project"
    Write-Host "Starting API (http://localhost:5212)..." -ForegroundColor Green
    Start-Process $shellExe -ArgumentList "-NoExit", "-Command", "dotnet run --project `"$apiProject`""
}

if ($Web) {
    Assert-PathExists -Path $webDir -Name "Web Frontend"
    Write-Host "Starting secure-booking-web (npm run dev)..." -ForegroundColor Green
    Start-Process $shellExe -ArgumentList "-NoExit", "-Command", "Set-Location `"$webDir`"; npm run dev"
}

if ($Admin) {
    Assert-PathExists -Path $adminDir -Name "Admin Panel"
    Write-Host "Starting admin-panel (ng serve)..." -ForegroundColor Green
    Start-Process $shellExe -ArgumentList "-NoExit", "-Command", "Set-Location `"$adminDir`"; npm start"
}

if (-not ($Api -or $Web -or $Admin -or $AddMigration -or $UpdateDatabase)) {
    Write-Host "Nothing to do. Pass -Api, -Web, -Admin, -AddMigration <name>, and/or -UpdateDatabase." -ForegroundColor Yellow
    Get-Help $PSCommandPath -Examples
}