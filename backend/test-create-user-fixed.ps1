$body = @{username='admin'; password='admin123'} | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $body
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret

"=== Testing Create User Endpoint ==="
"Getting auth secret: $($secret.Substring(0, 16))..."

# Try to create a user with a unique name
$uniqueName = "testuser_$(Get-Random)"
"Creating user: $uniqueName"
$createBody = @{username=$uniqueName; password='TestPass1234'} | ConvertTo-Json
try {
  $createRes = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth?action=create' `
    -Method POST `
    -ContentType 'application/json' `
    -Headers @{'x-admin-secret'=$secret} `
    -Body $createBody
  
  "Status: $($createRes.StatusCode)"
  $response = $createRes.Content | ConvertFrom-Json
  "Response: $($response | ConvertTo-Json)"
  
  if ($response.user) {
    "Success! Created user: $($response.user.username)"
  } else {
    "Error: user field not found"
  }
} catch {
  "Request failed: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    "Error response: $errorBody"
  }
}
