# Local email testing script for PowerShell

Write-Host "Local Email Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check .env.local file
if (-not (Test-Path ".env.local")) {
    Write-Host "WARNING: .env.local file not found" -ForegroundColor Yellow
    Write-Host "Please create .env.local file with the following content:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "VITE_SUPABASE_URL=http://localhost:54321"
    Write-Host "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    Write-Host "RESEND_API_KEY=re_your_api_key_here"
    Write-Host ""
    exit 1
}

# Load environment variables from .env.local
$envContent = Get-Content ".env.local" -Encoding UTF8 | Where-Object { $_ -match '^[^#].*=' }
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "Environment variable set: $key" -ForegroundColor Green
    }
}

# Check Supabase status
Write-Host ""
Write-Host "Checking Supabase local environment status..." -ForegroundColor Yellow
$supabaseStatus = npx supabase status 2>&1

if ($LASTEXITCODE -ne 0 -or $supabaseStatus -match "not running") {
    Write-Host "WARNING: Supabase local environment is not running" -ForegroundColor Yellow
    Write-Host "Start it now? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "y") {
        Write-Host "Starting Supabase local environment..." -ForegroundColor Cyan
        npx supabase start
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to start Supabase" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK: Supabase local environment is running" -ForegroundColor Green
}

# Start Edge Function
Write-Host ""
Write-Host "Starting Edge Function..." -ForegroundColor Cyan
Write-Host "Please run 'npm run dev' in another terminal to start the frontend" -ForegroundColor Yellow
Write-Host ""

# Set environment variables for Edge Function
$env:SUPABASE_URL = "http://localhost:54321"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

if ($env:RESEND_API_KEY) {
    Write-Host "OK: RESEND_API_KEY is set" -ForegroundColor Green
} else {
    Write-Host "WARNING: RESEND_API_KEY is not set" -ForegroundColor Yellow
    Write-Host "Please set RESEND_API_KEY in .env.local file" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting send-appointment-email function..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npx supabase functions serve send-appointment-email --env-file .env.local
