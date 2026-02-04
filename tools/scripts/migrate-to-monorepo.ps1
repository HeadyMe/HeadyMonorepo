# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: tools/scripts/migrate-to-monorepo.ps1
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
<#
.SYNOPSIS
    Migrate Heady ecosystem to unified monorepo
.DESCRIPTION
    Automates the migration of all Heady projects into a single optimized monorepo
.PARAMETER Phase
    Migration phase to execute (all, foundation, migrate, validate)
.PARAMETER DryRun
    Preview changes without executing
#>

param(
    [Parameter()]
    [ValidateSet('all', 'foundation', 'migrate', 'validate', 'cleanup')]
    [string]$Phase = 'all',
    
    [Parameter()]
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$MonorepoRoot = "c:\Users\erich\CascadeProjects\HeadyMonorepo"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $missing = @()
    
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        $missing += "pnpm"
    }
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        $missing += "git"
    }
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        $missing += "docker"
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing prerequisites: $($missing -join ', ')"
        exit 1
    }
    
    Write-Success "All prerequisites installed"
}

function Initialize-Foundation {
    Write-Step "Initializing monorepo foundation..."
    
    if (-not (Test-Path $MonorepoRoot)) {
        Write-Error "Monorepo root not found: $MonorepoRoot"
        exit 1
    }
    
    Set-Location $MonorepoRoot
    
    # Create directory structure
    $dirs = @(
        'apps',
        'services',
        'packages',
        'infrastructure/docker',
        'infrastructure/cloudflare',
        'tools/cli',
        'tools/scripts',
        'docs/architecture',
        'docs/api',
        'docs/guides',
        '.heady/memory',
        '.heady/validations',
        'shared/config',
        'shared/state',
        '.windsurf/workflows'
    )
    
    foreach ($dir in $dirs) {
        $path = Join-Path $MonorepoRoot $dir
        if (-not (Test-Path $path)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $path -Force | Out-Null
            }
            Write-Success "Created: $dir"
        }
    }
    
    # Initialize git if needed
    if (-not (Test-Path ".git")) {
        if (-not $DryRun) {
            git init
            git add .
            git commit -m "chore: initialize monorepo foundation"
        }
        Write-Success "Initialized git repository"
    }
    
    Write-Success "Foundation initialized"
}

function Copy-WithStructure {
    param(
        [string]$Source,
        [string]$Destination,
        [string[]]$Exclude = @()
    )
    
    if (-not (Test-Path $Source)) {
        Write-Warning "Source not found: $Source"
        return
    }
    
    $excludePatterns = @(
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        '.turbo',
        '__pycache__',
        '.venv',
        'coverage'
    ) + $Exclude
    
    if (-not $DryRun) {
        robocopy $Source $Destination /E /XD $excludePatterns /XF ".DS_Store" "*.log" /NFL /NDL /NJH /NJS | Out-Null
    }
    
    Write-Success "Copied: $Source -> $Destination"
}

function Migrate-HeadyManager {
    Write-Step "Migrating Heady Manager..."
    
    $source = "c:\Users\erich\Heady"
    $dest = Join-Path $MonorepoRoot "apps\manager"
    
    if (Test-Path $source) {
        Copy-WithStructure -Source $source -Destination $dest
        
        # Update package.json
        $pkgPath = Join-Path $dest "package.json"
        if (Test-Path $pkgPath) {
            $pkg = Get-Content $pkgPath | ConvertFrom-Json
            $pkg.name = "@heady/manager"
            $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
        }
        
        Write-Success "Migrated Heady Manager"
    }
}

function Migrate-Services {
    Write-Step "Migrating services..."
    
    $servicesRoot = "c:\Users\erich\Projects\HeadySystems\services"
    $dest = Join-Path $MonorepoRoot "services"
    
    if (Test-Path $servicesRoot) {
        $services = Get-ChildItem $servicesRoot -Directory
        
        foreach ($service in $services) {
            $serviceDest = Join-Path $dest $service.Name
            Copy-WithStructure -Source $service.FullName -Destination $serviceDest
            Write-Success "Migrated service: $($service.Name)"
        }
    }
}

function Migrate-Infrastructure {
    Write-Step "Migrating infrastructure..."
    
    # Copy docker-compose
    $dockerCompose = "c:\Users\erich\Projects\HeadySystems\docker-compose.yml"
    if (Test-Path $dockerCompose) {
        Copy-Item $dockerCompose (Join-Path $MonorepoRoot "docker-compose.yml") -Force
        Write-Success "Copied docker-compose.yml"
    }
    
    # Copy Cloudflare workers
    $cfSource = "c:\Users\erich\Projects\HeadySystems\cloudflare"
    $cfDest = Join-Path $MonorepoRoot "infrastructure\cloudflare"
    if (Test-Path $cfSource) {
        Copy-WithStructure -Source $cfSource -Destination $cfDest
        Write-Success "Migrated Cloudflare infrastructure"
    }
}

function Migrate-SharedConfig {
    Write-Step "Migrating shared configuration..."
    
    $configSources = @(
        "c:\Users\erich\Projects\shared\config",
        "c:\Users\erich\Projects\HeadySystems\shared\config"
    )
    
    $dest = Join-Path $MonorepoRoot "shared\config"
    
    foreach ($source in $configSources) {
        if (Test-Path $source) {
            Copy-WithStructure -Source $source -Destination $dest
            Write-Success "Merged config from: $source"
        }
    }
}

function Create-SharedPackages {
    Write-Step "Creating shared packages..."
    
    # Core package
    $corePkg = @{
        name = "@heady/core"
        version = "1.0.0"
        main = "dist/index.js"
        types = "dist/index.d.ts"
        scripts = @{
            build = "tsc"
            dev = "tsc --watch"
            test = "jest"
        }
        dependencies = @{}
        devDependencies = @{
            typescript = "^5.3.3"
            "@types/node" = "^20.11.0"
        }
    }
    
    $corePath = Join-Path $MonorepoRoot "packages\core"
    if (-not (Test-Path $corePath)) {
        New-Item -ItemType Directory -Path $corePath -Force | Out-Null
        $corePkg | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $corePath "package.json")
        Write-Success "Created @heady/core package"
    }
    
    # Config package
    $configPkg = @{
        name = "@heady/config"
        version = "1.0.0"
        main = "dist/index.js"
        types = "dist/index.d.ts"
        scripts = @{
            build = "tsc"
            dev = "tsc --watch"
        }
    }
    
    $configPath = Join-Path $MonorepoRoot "packages\config"
    if (-not (Test-Path $configPath)) {
        New-Item -ItemType Directory -Path $configPath -Force | Out-Null
        $configPkg | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $configPath "package.json")
        Write-Success "Created @heady/config package"
    }
}

function Install-Dependencies {
    Write-Step "Installing dependencies..."
    
    Set-Location $MonorepoRoot
    
    if (-not $DryRun) {
        pnpm install
        Write-Success "Dependencies installed"
    } else {
        Write-Success "Would install dependencies"
    }
}

function Validate-Migration {
    Write-Step "Validating migration..."
    
    Set-Location $MonorepoRoot
    
    # Check structure
    $requiredDirs = @('apps', 'services', 'packages', 'infrastructure', 'tools')
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            Write-Error "Missing directory: $dir"
            return $false
        }
    }
    
    # Check files
    $requiredFiles = @('package.json', 'pnpm-workspace.yaml', 'turbo.json')
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Error "Missing file: $file"
            return $false
        }
    }
    
    # Validate package.json
    try {
        $pkg = Get-Content "package.json" | ConvertFrom-Json
        if ($pkg.name -ne "@heady/monorepo") {
            Write-Error "Invalid package name"
            return $false
        }
    } catch {
        Write-Error "Invalid package.json"
        return $false
    }
    
    Write-Success "Validation passed"
    return $true
}

function Show-Summary {
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "Migration Summary" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    $stats = @{
        Apps = (Get-ChildItem (Join-Path $MonorepoRoot "apps") -Directory -ErrorAction SilentlyContinue).Count
        Services = (Get-ChildItem (Join-Path $MonorepoRoot "services") -Directory -ErrorAction SilentlyContinue).Count
        Packages = (Get-ChildItem (Join-Path $MonorepoRoot "packages") -Directory -ErrorAction SilentlyContinue).Count
    }
    
    Write-Host "`nWorkspaces:" -ForegroundColor Yellow
    Write-Host "  Apps:     $($stats.Apps)"
    Write-Host "  Services: $($stats.Services)"
    Write-Host "  Packages: $($stats.Packages)"
    
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "  1. cd $MonorepoRoot"
    Write-Host "  2. pnpm install"
    Write-Host "  3. pnpm build"
    Write-Host "  4. pnpm dev"
    
    Write-Host "`n" -NoNewline
}

# Main execution
Write-Host "`nHeady Monorepo Migration" -ForegroundColor Magenta
Write-Host "========================`n" -ForegroundColor Magenta

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No changes will be made"
}

Test-Prerequisites

switch ($Phase) {
    'foundation' {
        Initialize-Foundation
    }
    'migrate' {
        Migrate-HeadyManager
        Migrate-Services
        Migrate-Infrastructure
        Migrate-SharedConfig
        Create-SharedPackages
    }
    'validate' {
        Validate-Migration
    }
    'cleanup' {
        Write-Step "Cleaning up..."
        if (-not $DryRun) {
            Set-Location $MonorepoRoot
            pnpm clean
        }
        Write-Success "Cleanup complete"
    }
    'all' {
        Initialize-Foundation
        Migrate-HeadyManager
        Migrate-Services
        Migrate-Infrastructure
        Migrate-SharedConfig
        Create-SharedPackages
        Install-Dependencies
        Validate-Migration
        Show-Summary
    }
}

Write-Host "`n✨ Migration complete!`n" -ForegroundColor Green
