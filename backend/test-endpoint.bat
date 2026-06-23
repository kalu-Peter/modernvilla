@echo off
REM Test the admin login endpoint directly

echo Testing POST /api/admin/auth endpoint...
echo.

curl -X POST http://localhost:4000/api/admin/auth ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" ^
  -v

echo.
echo.
pause
