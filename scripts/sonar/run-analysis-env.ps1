# Script to run SonarQube analysis with environment variable configuration
# This script reads the token from .env or environment variable and runs the analysis

param(
    [string]$EnvFile = ".env",
    [switch]$AutoFix = $false
)

# Try to load token from .env file if it exists
if (Test-Path $EnvFile) {
    Write-Host "Loading configuration from $EnvFile..." -ForegroundColor Yellow
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^SONAR_TOKEN=(.+)$") {
            $env:SONAR_TOKEN = $matches[1]
            Write-Host "SONAR_TOKEN configured from .env file" -ForegroundColor Green
        }
    }
}

# Verify that the token is configured
if (-not $env:SONAR_TOKEN) {
    Write-Host "ERROR: SONAR_TOKEN is not configured." -ForegroundColor Red
    Write-Host "Please configure the SONAR_TOKEN environment variable or add SONAR_TOKEN=your_token to the .env file" -ForegroundColor Red
    exit 1
}

Write-Host "Running SonarQube analysis..." -ForegroundColor Green
npm run sonar:scan

if ($LASTEXITCODE -eq 0) {
    Write-Host "Analysis completed successfully." -ForegroundColor Green
    
    if ($AutoFix) {
        Write-Host "`nRunning auto-fix for issues..." -ForegroundColor Cyan
        node scripts/sonar/sonar-safe-fix.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Auto-fix completed. Running second analysis..." -ForegroundColor Cyan
            npm run sonar:scan
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Second analysis completed successfully." -ForegroundColor Green
            } else {
                Write-Host "Error in second SonarQube analysis." -ForegroundColor Red
                exit $LASTEXITCODE
            }
        } else {
            Write-Host "Error in auto-fix." -ForegroundColor Red
        }
    }
} else {
    Write-Host "Error in SonarQube analysis." -ForegroundColor Red
    exit $LASTEXITCODE
}