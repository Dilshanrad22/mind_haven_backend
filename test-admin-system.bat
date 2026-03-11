@echo off
echo ====================================
echo Mind Haven - Admin System Tests
echo ====================================
echo.

echo 1. Testing Backend API...
echo.

echo Checking Backend Health...
curl -s "http://localhost:5000/api/health"
echo.
echo.

echo 2. Testing Admin Login...
curl -s -X POST "http://localhost:5000/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@mindhaven.lk\",\"password\":\"admin123\"}" > temp_login.json
echo Login response saved to temp_login.json
type temp_login.json
echo.
echo.

echo 3. Please follow these steps manually:
echo.
echo STEP 1: Open http://localhost:3000/pages/login in your browser
echo STEP 2: Login with:
echo    Email: admin@mindhaven.lk
echo    Password: admin123
echo STEP 3: You should be redirected to the admin dashboard
echo STEP 4: Open Browser DevTools (F12) and check Console for errors
echo STEP 5: Go to Network tab to see API calls
echo.
echo.

echo 4. If you don't see data, check:
echo    - Backend is running: http://localhost:5000/api/health
echo    - Frontend is running: http://localhost:3000
echo    - Check browser console (F12) for JavaScript errors
echo    - Check Network tab (F12) for failed API requests
echo.

pause
