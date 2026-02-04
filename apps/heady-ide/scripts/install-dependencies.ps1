# HeadyIDE Dependency Installation Script
# Installs all required dependencies for the hybrid IDE

Write-Host "=== HeadyIDE Dependency Installation ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Navigate to project root
$projectRoot = "c:\Users\erich\Projects\apps\ide\HeadyIDE"
Set-Location $projectRoot

Write-Host ""
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Installing core package dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\packages\core"
npm install inversify reflect-metadata ws @types/ws @types/node

Write-Host ""
Write-Host "Installing HeadyMCP extension dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\extensions\heady-mcp"
npm install @types/vscode @types/node @types/ws ws vsce

Write-Host ""
Write-Host "Installing Theia dependencies..." -ForegroundColor Yellow
Set-Location $projectRoot
npm install @theia/core @theia/filesystem @theia/editor @theia/monaco @theia/terminal @theia/git @theia/plugin-ext @theia/workspace

Write-Host ""
Write-Host "Installing Lerna..." -ForegroundColor Yellow
npm install -g lerna

Write-Host ""
Write-Host "Bootstrapping packages with Lerna..." -ForegroundColor Yellow
npx lerna bootstrap

Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build all packages: npm run build" -ForegroundColor White
Write-Host "2. Start Heady Manager: cd c:\Users\erich\Heady && npm start" -ForegroundColor White
Write-Host "3. Start HeadyIDE: npm run dev" -ForegroundColor White
