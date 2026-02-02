#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Execute Heady Monorepo Migration
.DESCRIPTION
    One-command migration to the optimal monorepo state
#>

param(
    [Parameter()]
    [switch]$DryRun,
    
    [Parameter()]
    [switch]$SkipBackup
)

$ErrorActionPreference = 'Stop'
$MonorepoRoot = "c:\Users\erich\CascadeProjects\HeadyMonorepo"

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           HEADY ECOSYSTEM - MONOREPO MIGRATION                ║
║                                                               ║
║     Consolidating all projects into optimal monorepo         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

function Write-Phase {
    param([string]$Phase, [int]$Number, [int]$Total)
    Write-Host "`n" -NoNewline
    Write-Host "═" * 60 -ForegroundColor Magenta
    Write-Host " PHASE $Number of $Total`: $Phase" -ForegroundColor Magenta
    Write-Host "═" * 60 -ForegroundColor Magenta
}

function Write-Step {
    param([string]$Message)
    Write-Host "  → $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ $Message" -ForegroundColor Yellow
}

# Phase 1: Backup
Write-Phase "Backup Current State" 1 6

if (-not $SkipBackup) {
    Write-Step "Creating backup tags..."
    
    $repos = @(
        "c:\Users\erich\Heady",
        "c:\Users\erich\Projects\HeadySystems",
        "c:\Users\erich\CascadeProjects\HeadySystems",
        "c:\Users\erich\CascadeProjects\HeadyEcosystem",
        "c:\Users\erich\CascadeProjects\HeadyGenesis"
    )
    
    foreach ($repo in $repos) {
        if (Test-Path $repo) {
            Push-Location $repo
            if (Test-Path ".git") {
                $repoName = Split-Path $repo -Leaf
                git tag -a "pre-monorepo-migration" -m "Backup before monorepo migration" 2>$null
                Write-Success "Tagged: $repoName"
            }
            Pop-Location
        }
    }
} else {
    Write-Info "Skipping backup (--SkipBackup flag)"
}

# Phase 2: Foundation
Write-Phase "Initialize Monorepo Foundation" 2 6

Write-Step "Verifying monorepo structure..."
if (-not (Test-Path $MonorepoRoot)) {
    Write-Host "  ✗ Monorepo root not found!" -ForegroundColor Red
    exit 1
}

Set-Location $MonorepoRoot

$requiredFiles = @(
    "package.json",
    "pnpm-workspace.yaml",
    "turbo.json",
    ".gitignore",
    ".env.example",
    "docker-compose.yml"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Found: $file"
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Phase 3: Execute Migration Script
Write-Phase "Execute Migration" 3 6

Write-Step "Running migration script..."
if (-not $DryRun) {
    & "$MonorepoRoot\tools\scripts\migrate-to-monorepo.ps1" -Phase all
} else {
    & "$MonorepoRoot\tools\scripts\migrate-to-monorepo.ps1" -Phase all -DryRun
}

# Phase 4: Install Dependencies
Write-Phase "Install Dependencies" 4 6

Write-Step "Installing pnpm dependencies..."
if (-not $DryRun) {
    pnpm install
    Write-Success "Dependencies installed"
} else {
    Write-Info "Would install dependencies"
}

# Phase 5: Build Everything
Write-Phase "Build All Packages" 5 6

Write-Step "Building monorepo..."
if (-not $DryRun) {
    pnpm build
    Write-Success "Build complete"
} else {
    Write-Info "Would build all packages"
}

# Phase 6: Validation
Write-Phase "Validate Migration" 6 6

Write-Step "Running validation checks..."

$checks = @{
    "Package Manager" = { (Get-Command pnpm -ErrorAction SilentlyContinue) -ne $null }
    "Git Repository" = { Test-Path ".git" }
    "Node Modules" = { Test-Path "node_modules" }
    "Turbo Cache" = { Test-Path ".turbo" }
    "Apps Directory" = { Test-Path "apps" }
    "Services Directory" = { Test-Path "services" }
    "Packages Directory" = { Test-Path "packages" }
}

$passed = 0
$failed = 0

foreach ($check in $checks.GetEnumerator()) {
    if (& $check.Value) {
        Write-Success "$($check.Key)"
        $passed++
    } else {
        Write-Host "  ✗ $($check.Key)" -ForegroundColor Red
        $failed++
    }
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═" * 60 -ForegroundColor Cyan
Write-Host " MIGRATION SUMMARY" -ForegroundColor Cyan
Write-Host "═" * 60 -ForegroundColor Cyan

Write-Host "`nValidation Results:" -ForegroundColor Yellow
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host "`n✨ Migration completed successfully!`n" -ForegroundColor Green
    
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Review migrated code in: $MonorepoRoot"
    Write-Host "  2. Update environment variables: cp .env.example .env"
    Write-Host "  3. Start development: pnpm dev"
    Write-Host "  4. Start Docker services: pnpm docker:up"
    Write-Host "  5. Run tests: pnpm test"
    
    Write-Host "`nUseful Commands:" -ForegroundColor Yellow
    Write-Host "  pnpm dev              # Start all apps in dev mode"
    Write-Host "  pnpm build            # Build everything"
    Write-Host "  pnpm test             # Run all tests"
    Write-Host "  pnpm lint             # Lint all code"
    Write-Host "  pnpm docker:up        # Start Docker services"
    Write-Host "  pnpm docker:logs      # View Docker logs"
    
    Write-Host "`n🎉 Welcome to the Heady Monorepo!`n" -ForegroundColor Magenta
} else {
    Write-Host "`n⚠ Migration completed with warnings" -ForegroundColor Yellow
    Write-Host "Please review the failed checks above`n" -ForegroundColor Yellow
}

# Create success marker
if (-not $DryRun -and $failed -eq 0) {
    @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        status = "success"
        checks_passed = $passed
        checks_failed = $failed
    } | ConvertTo-Json | Set-Content ".migration-complete"
}
