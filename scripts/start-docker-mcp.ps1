# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: scripts/start-docker-mcp.ps1
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

#!/usr/bin/env pwsh

# Docker MCP Services Startup Script
# Starts all MCP services in Docker containers

Write-Host "🚀 Starting Docker MCP Services..." -ForegroundColor Cyan

# Start Docker Compose MCP services
docker-compose -f docker-compose.mcp.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
$services = @("mcp-filesystem", "mcp-postgres", "mcp-memory", "mcp-fetch", "postgres", "redis")

foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "table {{.Names}}\t{{.Status}}"
    if ($status -match $service) {
        Write-Host "✓ $service is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $service failed to start" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Docker MCP Services startup complete!" -ForegroundColor Green
Write-Host "Check logs with: docker-compose -f docker-compose.mcp.yml logs -f" -ForegroundColor Gray
