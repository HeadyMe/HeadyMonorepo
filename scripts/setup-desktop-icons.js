// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/setup-desktop-icons.js
// LAYER: root
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PROJECT_NAME = 'HeadyEcosystem';

function getDesktopPath() {
  switch (os.platform()) {
    case 'win32':
      return path.join(os.homedir(), 'Desktop');
    case 'darwin':
      return path.join(os.homedir(), 'Desktop');
    case 'linux':
      return path.join(os.homedir(), 'Desktop');
    default:
      return os.homedir();
  }
}

function createWindowsShortcuts() {
  const desktopPath = getDesktopPath();
  
  // Create batch file launcher
  const batchContent = `@echo off
title HeadyEcosystem Launcher
color 0A
echo ========================================
echo     HeadyEcosystem Control Panel
echo ========================================
echo.
echo Select an option:
echo 1. Start IDE Mode (Development)
echo 2. Start Browser Automation (Headless)
echo 3. Start Browser Automation (Interactive)
echo 4. Start Docker Environment
echo 5. Open Project in VS Code
echo 6. View Logs
echo 7. Exit
echo.
set /p choice=Enter your choice (1-7): 

if "%choice%"=="1" goto ide
if "%choice%"=="2" goto headless
if "%choice%"=="3" goto interactive
if "%choice%"=="4" goto docker
if "%choice%"=="5" goto vscode
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto end

:ide
echo Starting IDE Mode...
cd /d "${PROJECT_ROOT}"
start cmd /k "pnpm dev"
goto end

:headless
echo Starting Headless Browser Automation...
cd /d "${PROJECT_ROOT}"
start cmd /k "pnpm run browser:headless"
goto end

:interactive
echo Starting Interactive Browser Automation...
cd /d "${PROJECT_ROOT}"
start cmd /k "pnpm run browser:interactive"
goto end

:docker
echo Starting Docker Environment...
cd /d "${PROJECT_ROOT}"
start cmd /k "docker-compose up"
goto end

:vscode
echo Opening in VS Code...
cd /d "${PROJECT_ROOT}"
code .
goto end

:logs
echo Viewing logs...
cd /d "${PROJECT_ROOT}"
start cmd /k "docker-compose logs -f"
pause
goto end

:end
`;

  const batchPath = path.join(desktopPath, `${PROJECT_NAME}.bat`);
  fs.writeFileSync(batchPath, batchContent);
  console.log(`✅ Created Windows launcher: ${batchPath}`);
  
  // Create PowerShell shortcut creator
  const ps1Content = `
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut("$Home\\Desktop\\${PROJECT_NAME}.lnk")
$Shortcut.TargetPath = "${batchPath}"
$Shortcut.WorkingDirectory = "${PROJECT_ROOT}"
$Shortcut.IconLocation = "C:\\Windows\\System32\\cmd.exe"
$Shortcut.Description = "HeadyEcosystem Development Environment"
$Shortcut.Save()
`;

  const ps1Path = path.join(os.tmpdir(), 'create-shortcut.ps1');
  fs.writeFileSync(ps1Path, ps1Content);
  
  try {
    execSync(`powershell -ExecutionPolicy Bypass -File "${ps1Path}"`, { stdio: 'inherit' });
    console.log(`✅ Created Windows desktop shortcut`);
  } catch (error) {
    console.log('⚠️  Could not create .lnk shortcut, but .bat file is available');
  }
}

function createMacLinuxShortcuts() {
  const desktopPath = getDesktopPath();
  const platform = os.platform();
  
  // Create shell script launcher
  const scriptContent = `#!/bin/bash

# HeadyEcosystem Launcher
PROJECT_ROOT="${PROJECT_ROOT}"

# Colors for terminal
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

clear
echo -e "\${CYAN}========================================\${NC}"
echo -e "\${CYAN}     HeadyEcosystem Control Panel      \${NC}"
echo -e "\${CYAN}========================================\${NC}"
echo ""
echo "Select an option:"
echo "1. Start IDE Mode (Development)"
echo "2. Start Browser Automation (Headless)"
echo "3. Start Browser Automation (Interactive)"
echo "4. Start Docker Environment"
echo "5. Open Project in Code Editor"
echo "6. View Logs"
echo "7. Setup Environment"
echo "8. Exit"
echo ""
read -p "Enter your choice (1-8): " choice

case $choice in
  1)
    echo -e "\${GREEN}Starting IDE Mode...\${NC}"
    cd "$PROJECT_ROOT"
    pnpm dev
    ;;
  2)
    echo -e "\${GREEN}Starting Headless Browser Automation...\${NC}"
    cd "$PROJECT_ROOT"
    pnpm run browser:headless
    ;;
  3)
    echo -e "\${GREEN}Starting Interactive Browser Automation...\${NC}"
    cd "$PROJECT_ROOT"
    pnpm run browser:interactive
    ;;
  4)
    echo -e "\${GREEN}Starting Docker Environment...\${NC}"
    cd "$PROJECT_ROOT"
    docker-compose up
    ;;
  5)
    echo -e "\${GREEN}Opening in Code Editor...\${NC}"
    cd "$PROJECT_ROOT"
    if command -v code &> /dev/null; then
      code .
    elif command -v subl &> /dev/null; then
      subl .
    else
      echo -e "\${RED}No supported editor found\${NC}"
    fi
    ;;
  6)
    echo -e "\${GREEN}Viewing logs...\${NC}"
    cd "$PROJECT_ROOT"
    docker-compose logs -f
    ;;
  7)
    echo -e "\${GREEN}Setting up environment...\${NC}"
    cd "$PROJECT_ROOT"
    pnpm run setup:env
    ;;
  8)
    echo -e "\${BLUE}Goodbye!\${NC}"
    exit 0
    ;;
  *)
    echo -e "\${RED}Invalid option\${NC}"
    ;;
esac
`;

  const scriptPath = path.join(desktopPath, `${PROJECT_NAME}.sh`);
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  console.log(`✅ Created shell script launcher: ${scriptPath}`);
  
  // Create .desktop file for Linux
  if (platform === 'linux') {
    const desktopContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=HeadyEcosystem
Comment=HeadySystems Development Environment
Exec=${scriptPath}
Icon=utilities-terminal
Terminal=true
Categories=Development;IDE;
Actions=IDE;Browser;Docker;

[Desktop Action IDE]
Name=Start IDE Mode
Exec=bash -c "cd ${PROJECT_ROOT} && pnpm dev"

[Desktop Action Browser]
Name=Start Browser Automation
Exec=bash -c "cd ${PROJECT_ROOT} && pnpm run browser:interactive"

[Desktop Action Docker]
Name=Start Docker Environment
Exec=bash -c "cd ${PROJECT_ROOT} && docker-compose up"
`;

    const desktopFilePath = path.join(desktopPath, `${PROJECT_NAME}.desktop`);
    fs.writeFileSync(desktopFilePath, desktopContent);
    fs.chmodSync(desktopFilePath, '755');
    console.log(`✅ Created Linux desktop entry: ${desktopFilePath}`);
  }
}

function createUniversalLauncher() {
  // Create a Node.js-based launcher that works on all platforms
  const launcherContent = `#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PROJECT_ROOT = '${PROJECT_ROOT}';

console.log(\`
╔══════════════════════════════════════╗
║     HeadyEcosystem Launcher          ║
╚══════════════════════════════════════╝

1. Start Development (IDE Mode)
2. Browser Automation (Headless)
3. Browser Automation (Interactive)
4. Docker Environment
5. Setup Environment
6. Exit
\`);

rl.question('Select an option (1-6): ', (answer) => {
  process.chdir(PROJECT_ROOT);
  
  let command;
  switch(answer) {
    case '1':
      command = 'pnpm dev';
      break;
    case '2':
      command = 'pnpm run browser:headless';
      break;
    case '3':
      command = 'pnpm run browser:interactive';
      break;
    case '4':
      command = 'docker-compose up';
      break;
    case '5':
      command = 'pnpm run setup:env';
      break;
    case '6':
      console.log('Goodbye!');
      process.exit(0);
    default:
      console.log('Invalid option');
      process.exit(1);
  }
  
  console.log(\`Running: \${command}\`);
  const child = spawn(command, { shell: true, stdio: 'inherit' });
  
  child.on('exit', (code) => {
    process.exit(code);
  });
  
  rl.close();
});
`;

  const launcherPath = path.join(PROJECT_ROOT, 'launcher.js');
  fs.writeFileSync(launcherPath, launcherContent);
  fs.chmodSync(launcherPath, '755');
  console.log(`✅ Created universal launcher: ${launcherPath}`);
}

function main() {
  console.log('🎯 Setting up HeadyEcosystem desktop shortcuts...\n');
  
  const platform = os.platform();
  
  try {
    // Create universal launcher
    createUniversalLauncher();
    
    // Create platform-specific shortcuts
    if (platform === 'win32') {
      createWindowsShortcuts();
    } else {
      createMacLinuxShortcuts();
    }
    
    console.log(`
╔══════════════════════════════════════╗
║   Desktop Icons Created Successfully  ║
╚══════════════════════════════════════╝

✅ Shortcuts created on your desktop
✅ Universal launcher created at project root

To launch HeadyEcosystem:
- Desktop: Double-click the HeadyEcosystem icon
- Terminal: node launcher.js
- Direct: pnpm dev
`);
  } catch (error) {
    console.error('❌ Error creating desktop shortcuts:', error);
    process.exit(1);
  }
}

main();
