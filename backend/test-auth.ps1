#!/usr/bin/env pwsh

$body = @{
    username = 'admin'
    password = 'admin123'
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri 'http://localhost:4000/api/admin/auth' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response:`n$($response.Content)"
