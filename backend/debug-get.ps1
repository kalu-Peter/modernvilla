$body = @{username='admin'; password='admin123'} | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $body
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret
"Secret: $($secret.Substring(0, 16))..."
try {
  $listRes = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method GET -Headers @{'x-admin-secret'=$secret}
  "GET successful: $($listRes.StatusCode)"
  $listRes.Content
} catch {
  "Error: $($_.Exception.Message)"
  "Status: $($_.Exception.Response.StatusCode)"
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    "Response: $body"
  }
}
