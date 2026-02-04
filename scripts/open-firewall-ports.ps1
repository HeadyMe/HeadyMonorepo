$ports = @(3000, 3300, 3400, 8080)

foreach ($port in $ports) {
    $ruleName = "HeadyMonorepo-Port-$port"
    if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow
        Write-Host "Opened port $port"
    } else {
        Write-Host "Port $port is already open"
    }
}
