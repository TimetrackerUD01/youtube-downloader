# YouTube Downloader Test Script
Write-Host "🧪 Testing YouTube Downloader API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$testPassed = 0
$testFailed = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "Testing $Name..." -NoNewline
    
    try {
        if ($Method -eq "POST" -and $Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json" -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 10
        }
        
        Write-Host " ✅ PASS" -ForegroundColor Green
        return $true
    } catch {
        Write-Host " ❌ FAIL" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test 1: Health Check
Write-Host "1️⃣ Health Check Test" -ForegroundColor Yellow
if (Test-Endpoint -Name "Health Endpoint" -Url "$baseUrl/health") {
    $testPassed++
} else {
    $testFailed++
}
Write-Host ""

# Test 2: Static Files
Write-Host "2️⃣ Static Files Test" -ForegroundColor Yellow
if (Test-Endpoint -Name "Main Page" -Url "$baseUrl/") {
    $testPassed++
} else {
    $testFailed++
}

if (Test-Endpoint -Name "Favicon" -Url "$baseUrl/favicon.ico") {
    $testPassed++
} else {
    $testFailed++
}

if (Test-Endpoint -Name "Robots.txt" -Url "$baseUrl/robots.txt") {
    $testPassed++
} else {
    $testFailed++
}
Write-Host ""

# Test 3: API Endpoints
Write-Host "3️⃣ API Endpoints Test" -ForegroundColor Yellow

# Test Video Info with a known working URL
$videoInfoBody = @{
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
if (Test-Endpoint -Name "Video Info API" -Url "$baseUrl/api/video-info" -Method "POST" -Body $videoInfoBody) {
    $testPassed++
} else {
    $testFailed++
}

# Test Search API
$searchBody = @{
    query = "test"
    limit = 3
}
if (Test-Endpoint -Name "Search API" -Url "$baseUrl/api/search" -Method "POST" -Body $searchBody) {
    $testPassed++
} else {
    $testFailed++
}

# Test Download URL API (New!)
$downloadUrlBody = @{
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    format = "video"
    quality = "highest"
}
if (Test-Endpoint -Name "Download URL API" -Url "$baseUrl/api/download-url" -Method "POST" -Body $downloadUrlBody) {
    $testPassed++
} else {
    $testFailed++
}
Write-Host ""

# Test 4: Error Handling
Write-Host "4️⃣ Error Handling Test" -ForegroundColor Yellow

$badUrlBody = @{
    url = "https://invalid-url.com"
}
Write-Host "Testing Invalid URL..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/video-info" -Method POST -Body ($badUrlBody | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
    Write-Host " ❌ FAIL (Should have returned error)" -ForegroundColor Red
    $testFailed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host " ✅ PASS (Correctly returned 400 error)" -ForegroundColor Green
        $testPassed++
    } else {
        Write-Host " ❌ FAIL (Wrong error code)" -ForegroundColor Red
        $testFailed++
    }
}
Write-Host ""

# Summary
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $testPassed" -ForegroundColor Green
Write-Host "❌ Failed: $testFailed" -ForegroundColor Red
Write-Host "📊 Total:  $($testPassed + $testFailed)" -ForegroundColor White
Write-Host ""

if ($testFailed -eq 0) {
    Write-Host "🎉 All tests passed! The API is working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Check the server logs and troubleshooting guide." -ForegroundColor Yellow
    Write-Host "💡 Run 'Get-Content TROUBLESHOOTING.md' for help" -ForegroundColor Cyan
    exit 1
}
