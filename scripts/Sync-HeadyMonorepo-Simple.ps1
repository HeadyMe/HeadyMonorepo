# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: scripts/Sync-HeadyMonorepo-Simple.ps1
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

<#
.SYNOPSIS
    Heady Monorepo Distributed Sync Protocol
.DESCRIPTION
    Synchronizes HeadyMonorepo across all local and remote locations
#>

param(
    [switch]$Full,
    [switch]$Force,
    [switch]$SkipRemotes
)

$ErrorActionPreference = "Continue"

$SourceRepo = "C:\Users\erich\CascadeProjects\HeadyMonorepo"
$LocalTargets = @("F:\HeadyMonorepo")

$RemoteRepos = @{
    "origin" = "https://github.com/HeadyMe/HeadyMonorepo.git"
    "heady-sys" = "https://github.com/HeadySystems/HeadyMonorepo.git"
    "heady-connection" = "https://github.com/HeadyConnection/HeadyMonorepo.git"
}

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HEADY MONOREPO DISTRIBUTED SYNC" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Made with Love by HeadyConnection & HeadySystems Team`n" -ForegroundColor Magenta

if (-not (Test-Path $SourceRepo)) {
    Write-Host "[ERROR] Source repository not found: $SourceRepo" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Source: $SourceRepo" -ForegroundColor Cyan
Write-Host "[INFO] Timestamp: $Timestamp`n" -ForegroundColor Cyan

# STEP 1: Configure remotes in source
Write-Host "`n[STEP 1] Configuring source repository remotes..." -ForegroundColor Yellow
Push-Location $SourceRepo

foreach ($remote in $RemoteRepos.GetEnumerator()) {
    $remoteName = $remote.Key
    $remoteUrl = $remote.Value
    
    $existingRemote = git remote get-url $remoteName 2>$null
    
    if ($existingRemote) {
        if ($existingRemote -ne $remoteUrl) {
            Write-Host "[UPDATE] Remote: $remoteName" -ForegroundColor Yellow
            git remote set-url $remoteName $remoteUrl
        } else {
            Write-Host "[OK] Remote: $remoteName" -ForegroundColor Green
        }
    } else {
        Write-Host "[ADD] Remote: $remoteName" -ForegroundColor Cyan
        git remote add $remoteName $remoteUrl
    }
}

Pop-Location

# STEP 2: Commit pending changes
Write-Host "`n[STEP 2] Checking for uncommitted changes..." -ForegroundColor Yellow
Push-Location $SourceRepo

$status = git status --porcelain
if ($status) {
    Write-Host "[COMMIT] Committing changes..." -ForegroundColor Cyan
    git add .
    git commit -m "HeadyMonorepo Sync [$Timestamp]: Distributed optimization update"
    Write-Host "[SUCCESS] Changes committed" -ForegroundColor Green
} else {
    Write-Host "[INFO] No pending changes" -ForegroundColor Cyan
}

Pop-Location

# STEP 3: Sync to F:\HeadyMonorepo
Write-Host "`n[STEP 3] Syncing to local targets..." -ForegroundColor Yellow

foreach ($target in $LocalTargets) {
    Write-Host "[SYNC] Target: $target" -ForegroundColor Cyan
    
    $targetParent = Split-Path -Parent $target
    if (-not (Test-Path $targetParent)) {
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
    }
    
    if ($Force -and (Test-Path $target)) {
        Write-Host "[FORCE] Removing existing target" -ForegroundColor Yellow
        Remove-Item -Path $target -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (-not (Test-Path "$target\.git")) {
        Write-Host "[CLONE] Cloning to $target" -ForegroundColor Cyan
        git clone $SourceRepo $target
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Clone completed" -ForegroundColor Green
            
            # Configure remotes for the cloned repo
            Push-Location $target
            foreach ($remote in $RemoteRepos.GetEnumerator()) {
                $remoteName = $remote.Key
                $remoteUrl = $remote.Value
                $existingRemote = git remote get-url $remoteName 2>$null
                if (-not $existingRemote) {
                    git remote add $remoteName $remoteUrl
                }
            }
            Pop-Location
        } else {
            Write-Host "[ERROR] Clone failed" -ForegroundColor Red
        }
    } else {
        Write-Host "[UPDATE] Updating existing repository" -ForegroundColor Cyan
        Push-Location $target
        git fetch --all --prune
        git pull origin main --rebase
        Pop-Location
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Update completed" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Update failed" -ForegroundColor Red
        }
    }
}

# STEP 4: Push to remotes
if (-not $SkipRemotes) {
    Write-Host "`n[STEP 4] Pushing to remote repositories..." -ForegroundColor Yellow
    Push-Location $SourceRepo
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "main"
    }
    
    foreach ($remote in $RemoteRepos.Keys) {
        Write-Host "[PUSH] Remote: $remote" -ForegroundColor Cyan
        
        if ($Force) {
            git push $remote $currentBranch --force 2>&1 | Out-Null
        } else {
            git push $remote $currentBranch 2>&1 | Out-Null
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Pushed to $remote" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Failed to push to $remote (may need auth)" -ForegroundColor Yellow
        }
    }
    
    Pop-Location
}

# STEP 5: Verification
Write-Host "`n[STEP 5] Verification..." -ForegroundColor Yellow
Write-Host "[OK] Source: $SourceRepo" -ForegroundColor Green

foreach ($target in $LocalTargets) {
    if (Test-Path "$target\.git") {
        Write-Host "[OK] Local: $target" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Local: $target (NOT SYNCED)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SYNC COMPLETE" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Made with Love by HeadyConnection & HeadySystems Team" -ForegroundColor Magenta
Write-Host "Sacred Geometry - AI Sovereignty - Data Harmony`n" -ForegroundColor Cyan
