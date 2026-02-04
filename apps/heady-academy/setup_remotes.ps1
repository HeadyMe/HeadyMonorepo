# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: apps/heady-academy/setup_remotes.ps1
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

# GIT REMOTE CONFIGURATION SCRIPT
# Sets up multiple remote repositories for HeadySystems

$remotes = @{
    "origin" = "https://github.com/HeadyMe/HeadySystems.git"
    "heady-me" = "https://github.com/HeadyMe/Heady.git"
    "heady-sys" = "https://github.com/HeadySystems/Heady.git"
    "sandbox" = "https://github.com/HeadySystems/sandbox.git"
    "connection" = "https://github.com/HeadySystems/HeadyConnection.git"
}

Write-Host "∞ CONFIGURING GIT REMOTES ∞" -ForegroundColor Cyan

foreach ($name in $remotes.Keys) {
    $url = $remotes[$name]
    try {
        git remote remove $name 2>$null
        git remote add $name $url
        Write-Host "  ✓ Added remote: $name" -ForegroundColor Green
    } catch {
        Write-Host "  ! Failed to add remote: $name" -ForegroundColor Red
    }
}

Write-Host "`nRemote repositories configured:" -ForegroundColor Cyan
git remote -v