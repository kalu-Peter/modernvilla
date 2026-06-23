$response = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -Headers @{'Content-Type' = 'application/json' } -Body '{"username":"admin","password":"admin123"}' -ErrorAction Continue

Write-Host "Status: $($response.StatusCode)"
Write-Host "Content:"
Write-Host $response.Content
