# Test all admin endpoints

# Login first
$loginBody = @{username='admin'; password='admin123'} | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $loginBody
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret
Write-Host "ADMIN SECRET: $($secret.Substring(0, 16))..."

$headers = @{'x-admin-secret' = $secret}

# Test 1: List users
Write-Host "`n=== TEST 1: GET /api/admin/auth (list users) ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method GET -Headers $headers
  Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
  $users = $r.Content | ConvertFrom-Json
  Write-Host "Found $($users.Count) users"
} catch { Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red }

# Test 2: List reservations
Write-Host "`n=== TEST 2: GET /api/admin/reservations ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/reservations' -Method GET -Headers $headers
  Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
  $reservations = $r.Content | ConvertFrom-Json
  Write-Host "Found $($reservations.Count) reservations"
} catch { Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red }

# Test 3: List blocked dates
Write-Host "`n=== TEST 3: GET /api/admin/blocked-dates ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/blocked-dates' -Method GET -Headers $headers
  Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
  $blocked = $r.Content | ConvertFrom-Json
  Write-Host "Found $($blocked.Count) blocked dates"
} catch { Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red }

# Test 4: List seasonal pricing
Write-Host "`n=== TEST 4: GET /api/admin/seasonal-pricing ===" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/seasonal-pricing' -Method GET -Headers $headers
  Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
  $pricing = $r.Content | ConvertFrom-Json
  Write-Host "Found $($pricing.Count) pricing rules"
} catch { Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red }

Write-Host "`n=== ALL TESTS COMPLETE ===" -ForegroundColor Cyan
