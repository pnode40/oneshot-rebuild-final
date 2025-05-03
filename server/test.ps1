Write-Host "Testing GET http://localhost:3001/test-insert"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/test-insert" -Method Get
    Write-Host "Status code: $($response.StatusCode)"
    Write-Host "Response content:"
    $response.Content
} catch {
    Write-Host "Error: $_"
} 