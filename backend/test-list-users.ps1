$body = @{username='admin'; password='admin123'} | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $body
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret
"=== Test 1: List Users ==="
"Getting users with secret: $($secret.Substring(0, 16))..."
try {
  $listRes = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method GET -Headers @{'x-admin-secret'=$secret}
  "OK - GET /auth successful: $($listRes.StatusCode)"
  $users = $listRes.Content | ConvertFrom-Json
  "Users: $($users.Count) found"
  $users | ForEach-Object { "  - $($_.username) (ID: $($_.id))" }
} catch {
  "FAILED - GET /auth failed"
}
