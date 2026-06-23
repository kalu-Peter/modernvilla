$body = @{username='admin'; password='admin123'} | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $body
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret
"Secret obtained: $($secret.Substring(0, 16))..."
"Creating user..."
$createBody = @{username='testuser2'; password='TestPass123'} | ConvertTo-Json
try {
  $createRes = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth?action=create' -Method POST -ContentType 'application/json' -Headers @{'x-admin-secret'=$secret} -Body $createBody
  "CREATE SUCCESS: $($createRes.StatusCode)"
  $createRes.Content
} catch {
  "CREATE FAILED: $($_.Exception.Response.StatusCode)"
  $_.Exception.Response.Content.ReadAsStream() | Select-Object -ExpandProperty BaseStream
}
