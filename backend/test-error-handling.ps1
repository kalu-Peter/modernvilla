$body = @{username='admin'; password='admin123'} | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $body
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret

"=== Testing Duplicate User Error ==="

# Try to create user with existing username
$createBody = @{username='admin'; password='SomePassword123'} | ConvertTo-Json
try {
  $createRes = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth?action=create' `
    -Method POST `
    -ContentType 'application/json' `
    -Headers @{'x-admin-secret'=$secret} `
    -Body $createBody
  "Unexpected success"
} catch {
  "Status: $($_.Exception.Response.StatusCode.Value)"
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  $errorBody = $reader.ReadToEnd()
  "Error response: $errorBody"
  
  $errorData = $errorBody | ConvertFrom-Json
  if ($errorData.error) {
    "OK - error field present: $($errorData.error)"
  } else {
    "FAIL - error field missing"
  }
}

"=== Testing Short Password Error ==="
$createBody = @{username='newuser'; password='short'} | ConvertTo-Json
try {
  $createRes = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth?action=create' `
    -Method POST `
    -ContentType 'application/json' `
    -Headers @{'x-admin-secret'=$secret} `
    -Body $createBody
  "Unexpected success"
} catch {
  "Status: $($_.Exception.Response.StatusCode.Value)"
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  $errorBody = $reader.ReadToEnd()
  "Error response: $errorBody"
}
