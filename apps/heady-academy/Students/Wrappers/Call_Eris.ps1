# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: apps/heady-academy/Students/Wrappers/Call_Eris.ps1
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

param(
    [Parameter(Mandatory=$false)]
    [string]$Target = ".",

    [Parameter(Mandatory=$false)]
    [switch]$OpenReport
)

$ACADEMY_ROOT = Resolve-Path "$PSScriptRoot\..\.."
$TOOL_PATH = "$ACADEMY_ROOT\Tools\Heady_Chaos.py"

Write-Host "[ERIS] Summoning HeadyChaos Entropy Engine..." -ForegroundColor Magenta

if (Test-Path $TOOL_PATH) {
    python $TOOL_PATH --target $Target
} else {
    Write-Host "[ERROR] Heady_Chaos.py not found at $TOOL_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "[ERIS] Chaos analysis complete." -ForegroundColor Magenta
if ($OpenReport) {
    $reportFiles = Get-ChildItem -Path $ACADEMY_ROOT -Filter "*chaos*report*.md" -Recurse -ErrorAction SilentlyContinue | 
                   Sort-Object LastWriteTime -Descending | 
                   Select-Object -First 1
    
    if ($reportFiles) {
        Write-Host "[ERIS] Opening chaos report: $($reportFiles.FullName)" -ForegroundColor Cyan
        Start-Process $reportFiles.FullName
    } else {
        Write-Host "[WARN] No chaos report found to open" -ForegroundColor Yellow
    }
}
exit 0
