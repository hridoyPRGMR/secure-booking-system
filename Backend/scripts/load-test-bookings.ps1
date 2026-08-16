<#
.SYNOPSIS
    Fires N concurrent POST /api/bookings/mine requests for the same room/overlapping
    dates, to demonstrate the double-booking race condition in BookingsController.

.EXAMPLE
    ./load-test-bookings.ps1 -Concurrency 100
#>

param(
    [string]$BaseUrl = "http://localhost:5212/api",
    [string]$Email = "admin@gmail.com",
    [string]$Password = "Admin123!",
    [string]$RoomId,
    [int]$Concurrency = 50,
    [datetime]$CheckIn = (Get-Date).Date.AddDays(1),
    [int]$Nights = 2
)

$ErrorActionPreference = "Stop"

function Invoke-Login {
    param([string]$BaseUrl, [string]$Email, [string]$Password)

    $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" `
        -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)

    return $response.accessToken
}

function New-TestRoom {
    param([string]$BaseUrl, [string]$AccessToken)

    $headers = @{ Authorization = "Bearer $AccessToken" }
    $suffix = Get-Random

    $location = Invoke-RestMethod -Method Post -Uri "$BaseUrl/locations" -Headers $headers -ContentType "application/json" -Body (@{
        city      = "LoadTestCity$suffix"
        country   = "LoadTestCountry"
        address   = "1 Load Test Street"
        latitude  = 0
        longitude = 0
    } | ConvertTo-Json)

    $hotel = Invoke-RestMethod -Method Post -Uri "$BaseUrl/hotels" -Headers $headers -ContentType "application/json" -Body (@{
        name        = "LoadTestHotel$suffix"
        description = "Auto-provisioned by load-test-bookings.ps1"
        starRating  = 3
        imageUrl    = $null
        isActive    = $true
        locationId  = $location.id
    } | ConvertTo-Json)

    $room = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rooms" -Headers $headers -ContentType "application/json" -Body (@{
        name          = "LoadTestRoom$suffix"
        type          = "Standard"
        description   = "Auto-provisioned by load-test-bookings.ps1"
        capacity      = 2
        pricePerNight = 100
        imageUrl      = $null
        isActive      = $true
        hotelId       = $hotel.id
    } | ConvertTo-Json)

    return $room.id
}

Write-Host "Logging in as $Email ..."
$accessToken = Invoke-Login -BaseUrl $BaseUrl -Email $Email -Password $Password
Write-Host "Logged in."

if (-not $RoomId) {
    Write-Host "No -RoomId supplied, provisioning a throwaway Location/Hotel/Room ..."
    $RoomId = New-TestRoom -BaseUrl $BaseUrl -AccessToken $accessToken
    Write-Host "Provisioned RoomId: $RoomId"
}

$checkOut = $CheckIn.AddDays($Nights)
$bookingBody = @{
    roomId  = $RoomId
    checkIn = $CheckIn.ToString("o")
    checkOut = $checkOut.ToString("o")
    notes   = "Concurrency load test"
} | ConvertTo-Json

Write-Host "Firing $Concurrency concurrent bookings for room $RoomId ($CheckIn -> $checkOut) ..."

$results = 1..$Concurrency | ForEach-Object -Parallel {
    $index = $_
    $baseUrl = $using:BaseUrl
    $token = $using:accessToken
    $body = $using:bookingBody

    try {
        $response = Invoke-WebRequest -Method Post -Uri "$baseUrl/bookings/mine" `
            -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body

        [pscustomobject]@{ Index = $index; StatusCode = [int]$response.StatusCode }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { -1 }
        [pscustomobject]@{ Index = $index; StatusCode = $statusCode }
    }
} -ThrottleLimit $Concurrency

Write-Host ""
Write-Host "Results:"
$results | Group-Object StatusCode | Sort-Object Name | ForEach-Object {
    Write-Host ("  {0}: {1}" -f $_.Name, $_.Count)
}

$successCount = ($results | Where-Object { $_.StatusCode -eq 201 }).Count
Write-Host ""
if ($successCount -gt 1) {
    Write-Host "RACE CONFIRMED: $successCount overlapping bookings were created for the same room/dates." -ForegroundColor Red
}
elseif ($successCount -eq 1) {
    Write-Host "OK: exactly one booking succeeded, the rest were rejected (overlap correctly blocked)." -ForegroundColor Green
}
else {
    Write-Host "No booking succeeded - check RoomId/credentials/BaseUrl and re-run." -ForegroundColor Yellow
}
