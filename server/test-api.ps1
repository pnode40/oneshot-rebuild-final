$body = @{
    fullName = "John Smith"
    email = "johnsmith@example.com"
    highSchool = "Central High"
    position = "Quarterback"
    gradYear = "2024"
    cityState = "Austin, TX"
    heightFt = "6"
    heightIn = "2"
    weight = "195"
    fortyYardDash = "4.8"
    benchPress = "225"
} | ConvertTo-Json

Write-Host "Testing POST to http://localhost:3001/api/profile"
Write-Host "With body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/profile" -Method Post -Body $body -ContentType "application/json"
    Write-Host "SUCCESS! Response received:"
    $response | ConvertTo-Json
} catch {
    Write-Host "ERROR: $_"
    Write-Host "StatusCode:" $_.Exception.Response.StatusCode.value__
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
} 