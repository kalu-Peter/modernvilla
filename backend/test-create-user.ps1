#!/usr/bin/env pwsh

# Step 1: Login to get secret token
Write-Host "Logging in to get admin secret..." -ForegroundColor Cyan
$loginBody = @{
    username = 'admin'
    password = 'admin123'
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri 'http://localhost:4000/api/admin/auth' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $loginBody

$loginData = $loginResponse.Content | ConvertFrom-Json
$secret = $loginData.data.secret
Write-Host "✓ Login successful. Secret: $($secret.Substring(0,8))..." -ForegroundColor Green

# Step 2: Create a new user with the secret
Write-Host "`nCreating new admin user..." -ForegroundColor Cyan
$createBody = @{
    username = 'newadmin'
    password = 'SecurePass123'
} | ConvertTo-Json

$createResponse = Invoke-WebRequest `
    -Uri 'http://localhost:4000/api/admin/auth?action=create' `
    -Method POST `
    -ContentType 'application/json' `
    -Headers @{ 'x-admin-secret' = $secret } `
    -Body $createBody

$createData = $createResponse.Content | ConvertFrom-Json
Write-Host "Status: $($createResponse.StatusCode)" -ForegroundColor Green
Write-Host "Response:`n$($createData | ConvertTo-Json)" -ForegroundColor Green

# Step 3: Try to login with the new user
Write-Host "`nLogging in with new user..." -ForegroundColor Cyan
$newLoginBody = @{
    username = 'newadmin'
    password = 'SecurePass123'
} | ConvertTo-Json

$newLoginResponse = Invoke-WebRequest `
    -Uri 'http://localhost:4000/api/admin/auth' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $newLoginBody

$newLoginData = $newLoginResponse.Content | ConvertFrom-Json
Write-Host "✓ New user login successful!" -ForegroundColor Green
Write-Host "Response:`n$($newLoginData | ConvertTo-Json)" -ForegroundColor Green
