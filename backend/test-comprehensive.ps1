# Comprehensive test of all admin endpoints
$body = @{username = 'admin'; password = 'admin123' } | ConvertTo-Json
$res = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method POST -ContentType 'application/json' -Body $body
$data = $res.Content | ConvertFrom-Json
$secret = $data.data.secret

"=== Comprehensive API Test ==="
"Admin Secret: $($secret.Substring(0, 16))..."
$headers = @{'x-admin-secret' = $secret }

# Test 1: Create user
"TEST 1: Create User"
$createBody = @{username = "testadmin_$(Get-Random)"; password = 'TestPass9876' } | ConvertTo-Json
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth?action=create' -Method POST -ContentType 'application/json' -Headers $headers -Body $createBody
    $resp = $r.Content | ConvertFrom-Json
    "  Status: OK - Created $($resp.user.username)"
}
catch {
    "  Status: FAIL - $($_.Exception.Response.StatusCode)"
}

# Test 2: List users (should be array)
"TEST 2: List Users"
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth' -Method GET -Headers $headers
    $users = $r.Content | ConvertFrom-Json
    "  Status: OK - $($users.Count) users"
    if ($users[0].username) {
        "  Sample: $($users[0].username)"
    }
}
catch {
    "  Status: FAIL - $($_)"
}

# Test 3: List reservations (should be array)
"TEST 3: List Reservations"
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/reservations' -Method GET -Headers $headers
    $reservations = $r.Content | ConvertFrom-Json
    "  Status: OK - $($reservations.Count) reservations"
}
catch {
    "  Status: FAIL - $($_)"
}

# Test 4: List blocked dates (should be array)
"TEST 4: List Blocked Dates"
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/blocked-dates' -Method GET -Headers $headers
    $blocked = $r.Content | ConvertFrom-Json
    "  Status: OK - $($blocked.Count) blocked dates"
}
catch {
    "  Status: FAIL - $($_)"
}

# Test 5: List seasonal pricing (should be array)
"TEST 5: List Seasonal Pricing"
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/seasonal-pricing' -Method GET -Headers $headers
    $pricing = $r.Content | ConvertFrom-Json
    "  Status: OK - $($pricing.Count) pricing rules"
}
catch {
    "  Status: FAIL - $($_)"
}

# Test 6: Error handling (duplicate user)
"TEST 6: Error Handling (Duplicate User)"
$dupBody = @{username = 'admin'; password = 'SomePass1234' } | ConvertTo-Json
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/admin/auth?action=create' -Method POST -ContentType 'application/json' -Headers $headers -Body $dupBody
    "  Status: FAIL - Should have returned 409"
}
catch {
    if ($_.Exception.Response.StatusCode.Value -eq 409) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorData = $reader.ReadToEnd() | ConvertFrom-Json
        if ($errorData.error) {
            "  Status: OK - Got 409 with error: $($errorData.error)"
        }
        else {
            "  Status: FAIL - No error field in response"
        }
    }
    else {
        "  Status: FAIL - Got $($_.Exception.Response.StatusCode) instead of 409"
    }
}

"=== All Tests Complete ==="
