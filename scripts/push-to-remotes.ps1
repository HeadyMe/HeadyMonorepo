# Push to Remote Repositories Script
# Usage: .\scripts\push-to-remotes.ps1

param(
    [string]$RemoteUrl = "",
    [string]$Branch = "main"
)

Write-Host "=== Heady Monorepo - Push to Remotes ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# If no remote URL provided, show current remotes
if ([string]::IsNullOrEmpty($RemoteUrl)) {
    Write-Host "Current remotes:" -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    Write-Host "Usage examples:" -ForegroundColor Green
    Write-Host "  .\scripts\push-to-remotes.ps1 -RemoteUrl 'https://github.com/yourusername/HeadyMonorepo.git'"
    Write-Host "  .\scripts\push-to-remotes.ps1 -RemoteUrl 'git@github.com:yourusername/HeadyMonorepo.git'"
    Write-Host ""
    Write-Host "To add a remote manually:" -ForegroundColor Green
    Write-Host "  git remote add origin <your-repo-url>"
    Write-Host "  git branch -M main"
    Write-Host "  git push -u origin main"
    exit 0
}

# Add remote if it doesn't exist
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $RemoteUrl
} else {
    Write-Host "Remote 'origin' already exists. Updating URL..." -ForegroundColor Yellow
    git remote set-url origin $RemoteUrl
}

# Rename branch to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne $Branch) {
    Write-Host "Renaming branch '$currentBranch' to '$Branch'..." -ForegroundColor Yellow
    git branch -M $Branch
}

# Push to remote
Write-Host "Pushing to remote..." -ForegroundColor Yellow
git push -u origin $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Successfully pushed to remote!" -ForegroundColor Green
    Write-Host "Repository URL: $RemoteUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Failed to push to remote. Please check your credentials and URL." -ForegroundColor Red
    exit 1
}
