<#
.SYNOPSIS
    Heady Monorepo Distributed Sync Protocol
.DESCRIPTION
    Synchronizes HeadyMonorepo across all local and remote locations with full optimization
.EXAMPLE
    .\Sync-HeadyMonorepo.ps1 -Full
#>

param(
    [switch]$Full,
    [switch]$Force,
    [switch]$SkipRemotes
)

$ErrorActionPreference = "Continue"

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

$SourceRepo = "C:\Users\erich\CascadeProjects\HeadyMonorepo"
$LocalTargets = @(
    "F:\HeadyMonorepo"
)

$RemoteRepos = @{
    "origin" = "https://github.com/HeadyMe/HeadyMonorepo.git"
    "heady-sys" = "https://github.com/HeadySystems/HeadyMonorepo.git"
    "heady-connection" = "https://github.com/HeadyConnection/HeadyMonorepo.git"
}

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

function Write-HeadyHeader {
    param($Message)
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $Message" -ForegroundColor White
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Write-HeadyStep {
    param($Message, $Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host "[HEADY-SYNC] $Message" -ForegroundColor $color
}

function Sync-LocalRepository {
    param(
        [string]$Source,
        [string]$Target
    )
    
    Write-HeadyStep "Syncing to: $Target"
    
    # Create target parent directory if needed
    $targetParent = Split-Path -Parent $Target
    if (-not (Test-Path $targetParent)) {
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
    }
    
    # Remove existing target if Force is specified
    if ($Force -and (Test-Path $Target)) {
        Write-HeadyStep "Removing existing target (Force mode)" "WARNING"
        Remove-Item -Path $Target -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Clone or pull
    if (-not (Test-Path "$Target\.git")) {
        Write-HeadyStep "Cloning repository to $Target"
        git clone $Source $Target
        if ($LASTEXITCODE -eq 0) {
            Write-HeadyStep "Clone successful" "SUCCESS"
        } else {
            Write-HeadyStep "Clone failed" "ERROR"
            return $false
        }
    } else {
        Write-HeadyStep "Updating existing repository at $Target"
        Push-Location $Target
        git fetch --all --prune
        git pull origin main --rebase
        Pop-Location
        if ($LASTEXITCODE -eq 0) {
            Write-HeadyStep "Update successful" "SUCCESS"
        } else {
            Write-HeadyStep "Update failed" "ERROR"
            return $false
        }
    }
    
    return $true
}

function Configure-GitRemotes {
    param([string]$RepoPath)
    
    Write-HeadyStep "Configuring git remotes for: $RepoPath"
    Push-Location $RepoPath
    
    foreach ($remote in $RemoteRepos.GetEnumerator()) {
        $remoteName = $remote.Key
        $remoteUrl = $remote.Value
        
        # Check if remote exists
        $existingRemote = git remote get-url $remoteName 2>$null
        
        if ($existingRemote) {
            if ($existingRemote -ne $remoteUrl) {
                Write-HeadyStep "Updating remote $remoteName" "WARNING"
                git remote set-url $remoteName $remoteUrl
            } else {
                Write-HeadyStep "Remote $remoteName already configured" "INFO"
            }
        } else {
            Write-HeadyStep "Adding remote $remoteName" "INFO"
            git remote add $remoteName $remoteUrl
        }
    }
    
    Pop-Location
}

function Push-ToAllRemotes {
    param([string]$RepoPath)
    
    Write-HeadyStep "Pushing to all configured remotes"
    Push-Location $RepoPath
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "main"
    }
    
    foreach ($remote in $RemoteRepos.Keys) {
        Write-HeadyStep "Pushing to $remote..."
        
        if ($Force) {
            git push $remote $currentBranch --force 2>&1 | Out-Null
        } else {
            git push $remote $currentBranch 2>&1 | Out-Null
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-HeadyStep "✅ Pushed to $remote" "SUCCESS"
        } else {
            Write-HeadyStep "⚠️ Failed to push to $remote (may need authentication)" "WARNING"
        }
    }
    
    Pop-Location
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

Write-HeadyHeader "HEADY MONOREPO DISTRIBUTED SYNC PROTOCOL"
Write-Host "Made with Love by HeadyConnection & HeadySystems Team`n" -ForegroundColor Magenta

# Verify source repository exists
if (-not (Test-Path $SourceRepo)) {
    Write-HeadyStep "Source repository not found: $SourceRepo" "ERROR"
    exit 1
}

Write-HeadyStep "Source: $SourceRepo" "INFO"
Write-HeadyStep "Timestamp: $Timestamp" "INFO"

# STEP 1: Configure remotes in source repository
Write-HeadyHeader "STEP 1: CONFIGURE SOURCE REPOSITORY REMOTES"
Configure-GitRemotes -RepoPath $SourceRepo

# STEP 2: Commit any pending changes in source
Write-HeadyHeader "STEP 2: COMMIT PENDING CHANGES"
Push-Location $SourceRepo

$status = git status --porcelain
if ($status) {
    Write-HeadyStep "Detected uncommitted changes, committing..."
    git add .
    git commit -m "HeadyMonorepo Sync [$Timestamp]: Distributed optimization update"
    Write-HeadyStep "Changes committed" "SUCCESS"
} else {
    Write-HeadyStep "No pending changes to commit" "INFO"
}

Pop-Location

# STEP 3: Sync to local targets
Write-HeadyHeader "STEP 3: SYNC TO LOCAL TARGETS"
foreach ($target in $LocalTargets) {
    $success = Sync-LocalRepository -Source $SourceRepo -Target $target
    if ($success) {
        # Configure remotes for local target too
        Configure-GitRemotes -RepoPath $target
    }
}

# STEP 4: Push to remote repositories
if (-not $SkipRemotes) {
    Write-HeadyHeader "STEP 4: PUSH TO REMOTE REPOSITORIES"
    Push-ToAllRemotes -RepoPath $SourceRepo
    
    # Also push from F:\ if it exists
    if (Test-Path "F:\HeadyMonorepo\.git") {
        Write-HeadyStep "Also pushing from F:\HeadyMonorepo"
        Push-ToAllRemotes -RepoPath "F:\HeadyMonorepo"
    }
}

# STEP 5: Verify synchronization
Write-HeadyHeader "STEP 5: VERIFICATION"
Write-HeadyStep "Source: $SourceRepo" "SUCCESS"
foreach ($target in $LocalTargets) {
    if (Test-Path "$target\.git") {
        Write-HeadyStep "Local: $target" "SUCCESS"
    } else {
        Write-HeadyStep "Local: $target (NOT SYNCED)" "ERROR"
    }
}

Write-HeadyHeader "SYNC COMPLETE"
Write-Host "`nMade with Love by HeadyConnection & HeadySystems Team" -ForegroundColor Magenta
Write-Host "Sacred Geometry - AI Sovereignty - Data Harmony`n" -ForegroundColor Cyan
