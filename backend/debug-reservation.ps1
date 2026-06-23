$headers = @{'x-admin-secret' = 'test123' }
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/reservations' -Method GET -Headers $headers
    $r.Content
}
catch {
    "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        "Response Body: $($reader.ReadToEnd())"
    }
}
