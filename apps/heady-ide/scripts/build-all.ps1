# HeadyIDE Build Script
# Builds all packages in the correct order

Write-Host "=== HeadyIDE Build Process ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\erich\Projects\apps\ide\HeadyIDE"
Set-Location $projectRoot

# Build order (dependencies first)
$buildOrder = @(
    "packages\core",
    "packages\heady-services",
    "packages\theia-integration",
    "packages\vscode-integration",
    "extensions\heady-mcp",
    "apps\browser",
    "apps\electron"
)

foreach ($package in $buildOrder) {
    $packagePath = Join-Path $projectRoot $package
    
    if (Test-Path $packagePath) {
        Write-Host "Building $package..." -ForegroundColor Yellow
        Set-Location $packagePath
        
        if (Test-Path "package.json") {
            npm run build
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "ERROR: Failed to build $package" -ForegroundColor Red
                exit 1
            }
            
            Write-Host "✓ $package built successfully" -ForegroundColor Green
        } else {
            Write-Host "⊘ Skipping $package (no package.json)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⊘ Skipping $package (directory not found)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

Set-Location $projectRoot

Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "All packages built successfully!" -ForegroundColor Cyan
