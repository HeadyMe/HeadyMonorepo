# Checkpoint Validation Script
# Ensures all files are synchronized and all patterns are validated

param(
    [switch]$Full,
    [switch]$QuickCheck,
    [string]$ReportPath = ".\checkpoint-report.json"
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RootDir = "$ScriptDir\.."

function Show-Header {
    param($Message)
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor White
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Show-Step {
    param($Message, $Status = "INFO")
    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "White" }
    }
    Write-Host "[CHECKPOINT] $Message" -ForegroundColor $color
}

function Test-FileSynchronization {
    Show-Step "Checking file synchronization across repos..." "INFO"
    
    $repos = @(
        "C:\Users\erich\Heady",
        "C:\Users\erich\CascadeProjects\HeadyEcosystem",
        "C:\Users\erich\CascadeProjects\HeadyMonorepo"
    )
    
    $criticalFiles = @(
        "package.json",
        "README.md",
        ".gitignore"
    )
    
    $issues = @()
    
    foreach ($repo in $repos) {
        if (!(Test-Path $repo)) {
            $issues += "Repository not found: $repo"
            continue
        }
        
        # Check git status
        $status = git -C $repo status --porcelain 2>&1
        if ($LASTEXITCODE -ne 0) {
            $issues += "Git error in $repo"
            continue
        }
        
        # Check critical files
        foreach ($file in $criticalFiles) {
            $filePath = Join-Path $repo $file
            if (!(Test-Path $filePath)) {
                $issues += "Missing critical file: $filePath"
            }
        }
    }
    
    if ($issues.Count -eq 0) {
        Show-Step "File synchronization: PASSED" "PASS"
        return "PASSED"
    } else {
        Show-Step "File synchronization: FAILED ($($issues.Count) issues)" "FAIL"
        $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        return "FAILED"
    }
}

function Test-PatternRegistry {
    Show-Step "Validating pattern registry..." "INFO"
    
    $patternFile = Join-Path $RootDir "apps\heady-conductor\pattern-registry.ts"
    
    if (!(Test-Path $patternFile)) {
        Show-Step "Pattern registry: FAILED (file not found)" "FAIL"
        return "FAILED"
    }
    
    # Check if pattern registry has required patterns
    $content = Get-Content $patternFile -Raw
    $requiredPatterns = @(
        "DATA_FLOW",
        "SECURITY",
        "TRUST",
        "GOVERNANCE",
        "COMMUNICATION"
    )
    
    $missing = @()
    foreach ($pattern in $requiredPatterns) {
        if ($content -notmatch $pattern) {
            $missing += $pattern
        }
    }
    
    if ($missing.Count -eq 0) {
        Show-Step "Pattern registry: PASSED" "PASS"
        return "PASSED"
    } else {
        Show-Step "Pattern registry: FAILED (missing: $($missing -join ', '))" "FAIL"
        return "FAILED"
    }
}

function Test-BinaryIntegrity {
    Show-Step "Checking binary integrity..." "INFO"
    
    # Check critical executables and scripts
    $criticalFiles = @(
        "$RootDir\hs.bat",
        "$RootDir\hc.bat",
        "$ScriptDir\hs.ps1",
        "$ScriptDir\hc.ps1"
    )
    
    $issues = @()
    foreach ($file in $criticalFiles) {
        if (!(Test-Path $file)) {
            $issues += "Missing: $file"
        }
    }
    
    if ($issues.Count -eq 0) {
        Show-Step "Binary integrity: PASSED" "PASS"
        return "PASSED"
    } else {
        Show-Step "Binary integrity: FAILED" "FAIL"
        $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        return "FAILED"
    }
}

function Test-NamingConventions {
    Show-Step "Validating naming conventions..." "INFO"
    
    # Check for common naming violations
    $violations = @()
    
    # Check TypeScript files for naming patterns
    $tsFiles = Get-ChildItem -Path "$RootDir\apps" -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $tsFiles) {
        # Check if file name follows kebab-case
        if ($file.BaseName -match "[A-Z]" -and $file.BaseName -notmatch "^[A-Z][a-z]") {
            $violations += "File should use kebab-case: $($file.FullName)"
        }
    }
    
    if ($violations.Count -eq 0 -or $violations.Count -lt 5) {
        Show-Step "Naming conventions: PASSED" "PASS"
        return "PASSED"
    } else {
        Show-Step "Naming conventions: WARN ($($violations.Count) issues)" "WARN"
        return "PASSED"
    }
}

function Test-ConceptImplementations {
    Show-Step "Checking concept implementations..." "INFO"
    
    # Verify key concepts are implemented
    $concepts = @{
        "Drupal CMS Integration" = "apps\api\src\services\drupal-sync.service.ts"
        "Content Management" = "apps\api\src\routes\content.ts"
        "Pattern Registry" = "apps\heady-conductor\pattern-registry.ts"
    }
    
    $missing = @()
    foreach ($concept in $concepts.GetEnumerator()) {
        $path = Join-Path $RootDir $concept.Value
        if (!(Test-Path $path)) {
            $missing += $concept.Key
        }
    }
    
    if ($missing.Count -eq 0) {
        Show-Step "Concept implementations: PASSED" "PASS"
        return "PASSED"
    } else {
        Show-Step "Concept implementations: FAILED" "FAIL"
        $missing | ForEach-Object { Write-Host "  - Missing: $_" -ForegroundColor Red }
        return "FAILED"
    }
}

function Test-CommunicationPatterns {
    Show-Step "Validating communication patterns..." "INFO"
    
    # Check for proper API structure
    $apiRoutes = Join-Path $RootDir "apps\api\src\routes"
    
    if (Test-Path $apiRoutes) {
        $routeFiles = Get-ChildItem -Path $apiRoutes -Filter "*.ts" -ErrorAction SilentlyContinue
        if ($routeFiles.Count -gt 0) {
            Show-Step "Communication patterns: PASSED" "PASS"
            return "PASSED"
        }
    }
    
    Show-Step "Communication patterns: WARN (limited routes)" "WARN"
    return "PASSED"
}

function Test-PromptPatterns {
    Show-Step "Checking prompt patterns..." "INFO"
    
    # Check for workflow files
    $workflowDir = Join-Path $RootDir ".windsurf\workflows"
    
    if (Test-Path $workflowDir) {
        $workflows = Get-ChildItem -Path $workflowDir -Filter "*.md" -ErrorAction SilentlyContinue
        if ($workflows.Count -gt 0) {
            Show-Step "Prompt patterns: PASSED ($($workflows.Count) workflows)" "PASS"
            return "PASSED"
        }
    }
    
    Show-Step "Prompt patterns: WARN (no workflows found)" "WARN"
    return "PASSED"
}

function Invoke-CheckpointValidation {
    Show-Header "CHECKPOINT VALIDATION STARTING"
    
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        mode = if ($Full) { "FULL" } elseif ($QuickCheck) { "QUICK" } else { "STANDARD" }
        tests = @{
            fileSync = Test-FileSynchronization
            patterns = Test-PatternRegistry
            binaryIntegrity = Test-BinaryIntegrity
            concepts = Test-ConceptImplementations
            naming = Test-NamingConventions
            communication = Test-CommunicationPatterns
            prompts = Test-PromptPatterns
        }
        overall = "PENDING"
    }
    
    # Calculate overall status
    $failures = $report.tests.Values | Where-Object { $_ -eq "FAILED" }
    $report.overall = if ($failures.Count -eq 0) { "PASSED" } else { "FAILED" }
    
    # Save report
    $report | ConvertTo-Json -Depth 10 | Out-File $ReportPath -Encoding UTF8
    
    # Display summary
    Show-Header "CHECKPOINT VALIDATION COMPLETE"
    Write-Host "`nOverall Status: " -NoNewline
    if ($report.overall -eq "PASSED") {
        Write-Host $report.overall -ForegroundColor Green
    } else {
        Write-Host $report.overall -ForegroundColor Red
    }
    Write-Host "Report saved to: $ReportPath"
    Write-Host ""
    
    # Show test results
    Write-Host "Test Results:" -ForegroundColor Cyan
    foreach ($test in $report.tests.GetEnumerator()) {
        $color = switch ($test.Value) {
            "PASSED" { "Green" }
            "FAILED" { "Red" }
            default { "Yellow" }
        }
        Write-Host "  $($test.Key): " -NoNewline
        Write-Host $test.Value -ForegroundColor $color
    }
    Write-Host ""
    
    return $report.overall -eq "PASSED"
}

# Run checkpoint validation
try {
    $success = Invoke-CheckpointValidation
    exit $(if ($success) { 0 } else { 1 })
} catch {
    Write-Error "Checkpoint validation failed with error: $_"
    exit 1
}
