# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: scripts/kill-process.ps1
# LAYER: root
# 
#         _   _  _____    _  __   __
#        | | | || ____|  / \ \  / /
#        | |_| ||  _|   / _ \ \ V / 
#        |  _  || |___ / ___ \ | |  
#        |_| |_||_____/_/   \_\|_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

<#
.SYNOPSIS
    Terminates processes using specified ports
.DESCRIPTION
    Safely stops processes occupying required ports
.EXAMPLE
    .\kill-process.ps1 -Ports 3304
#>

param(
    [Parameter(Mandatory=$true)]
    [int[]]$Ports
)

$ErrorActionPreference = 'Stop'

foreach ($port in $Ports) {
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop | 
            Select-Object -ExpandProperty OwningProcess -Unique
        
        if ($processes) {
            foreach ($processId in $processes) {
                $procInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
                Write-Host "Stopping process $processId ($($procInfo.Name)) using port $port" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "Process $processId stopped" -ForegroundColor Green
            }
        } else {
            Write-Host "No processes found using port $port" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "Error terminating process on port ${port}: $($_.Exception.Message)" -ForegroundColor Red
    }
}
