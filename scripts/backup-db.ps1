<#
.SYNOPSIS
    NutriCore Automated PostgreSQL Backup Script for Windows Server / Local
.DESCRIPTION
    Creates compressed PostgreSQL dump via Docker container or pg_dump CLI,
    generates SHA-256 verification hash, and enforces retention cleanup.
#>

param(
    [string]$BackupDir = ".\backups",
    [int]$RetentionDays = 30,
    [string]$DockerContainer = "fit_db_prod",
    [string]$PostgresUser = "postgres",
    [string]$PostgresDb = "fit_management_db"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$SqlFile = Join-Path $BackupDir "nutricore_db_$Timestamp.sql"
$ZipFile = "$SqlFile.zip"

Write-Host "[$(Get-Date -Format o)] Starting PostgreSQL backup..." -ForegroundColor Cyan

$DatabaseUrl = $env:DATABASE_URL
$DockerRunning = $null
try {
    $DockerRunning = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -eq $DockerContainer }
} catch {}

if ($DatabaseUrl) {
    Write-Host "Mode: Direct pg_dump via DATABASE_URL"
    pg_dump $DatabaseUrl --no-owner --no-acl --clean --if-exists -f $SqlFile
} elseif ($DockerRunning) {
    Write-Host "Mode: Docker container ($DockerContainer)"
    docker exec $DockerContainer pg_dump -U $PostgresUser -d $PostgresDb --no-owner --no-acl --clean --if-exists | Out-File -FilePath $SqlFile -Encoding utf8
} else {
    Write-Error "Neither DATABASE_URL env var is set nor Docker container '$DockerContainer' is running."
    exit 1
}

if (-not (Test-Path $SqlFile) -or (Get-Item $SqlFile).Length -eq 0) {
    Write-Error "SQL dump file is empty or missing!"
    exit 1
}

# Compress and remove raw .sql
Compress-Archive -Path $SqlFile -DestinationPath $ZipFile -Force
Remove-Item $SqlFile -Force

# Compute SHA-256 checksum
$Hash = (Get-FileHash -Path $ZipFile -Algorithm SHA256).Hash
"$Hash  $(Split-Path $ZipFile -Leaf)" | Out-File -FilePath "$ZipFile.sha256" -Encoding ascii

$FileSizeMB = [math]::Round((Get-Item $ZipFile).Length / 1MB, 2)
Write-Host "[$(Get-Date -Format o)] Backup completed: $ZipFile ($FileSizeMB MB)" -ForegroundColor Green

# Prune old backups
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldFiles = Get-ChildItem -Path $BackupDir -Filter "nutricore_db_*.zip*" | Where-Object { $_.LastWriteTime -lt $CutoffDate }
foreach ($file in $OldFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "Pruned old backup: $($file.Name)" -ForegroundColor Yellow
}

