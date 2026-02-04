# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: scripts/setup-git-lfs.ps1
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

# Setup Git LFS for Large Files
# Usage: .\scripts\setup-git-lfs.ps1

Write-Host "=== Setting up Git LFS ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git LFS is installed
try {
    $lfsVersion = git lfs version
    Write-Host "Git LFS is installed: $lfsVersion" -ForegroundColor Green
} catch {
    Write-Host "Git LFS is not installed!" -ForegroundColor Red
    Write-Host "Please install Git LFS from: https://git-lfs.github.com/" -ForegroundColor Yellow
    exit 1
}

# Initialize Git LFS
Write-Host "Initializing Git LFS..." -ForegroundColor Yellow
git lfs install

# Track large file types
Write-Host "Configuring LFS tracking for large files..." -ForegroundColor Yellow

$largeFileTypes = @(
    "*.vmdk",
    "*.vmem",
    "*.vmss",
    "*.vmsn",
    "*.exe",
    "*.iso",
    "*.bin",
    "*.dmg",
    "*.tmp"
)

foreach ($fileType in $largeFileTypes) {
    Write-Host "  Tracking: $fileType" -ForegroundColor Cyan
    git lfs track $fileType
}

# Add .gitattributes
if (Test-Path ".gitattributes") {
    Write-Host ""
    Write-Host ".gitattributes updated with LFS tracking rules" -ForegroundColor Green
    git add .gitattributes
    git commit -m "Configure Git LFS for large binary files"
} else {
    Write-Host ""
    Write-Host "Warning: .gitattributes not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Git LFS setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Large files in assets/ and vms/ directories are now tracked by LFS" -ForegroundColor Cyan
Write-Host "This will significantly reduce repository clone times." -ForegroundColor Cyan
