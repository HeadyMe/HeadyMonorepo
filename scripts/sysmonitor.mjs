// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/sysmonitor.mjs
// LAYER: root
// 
//         _   _  _____    _  __   __
//        | | | || ____|  / \ \  / /
//        | |_| ||  _|   / _ \ \ V / 
//        |  _  || |___ / ___ \ | |  
//        |_| |_||_____/_/   \_\|_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

import chokidar from 'chokidar';
import chalk from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DEBOUNCE_MS = 1000;
let changeQueue = new Set();
let debounceTimer = null;
let isRunning = false;

console.log(chalk.blue('╔════════════════════════════════════════╗'));
console.log(chalk.blue('║      Heady System Intelligent Monitor  ║'));
console.log(chalk.blue('╚════════════════════════════════════════╝'));
console.log(chalk.gray(`Watching root: ${ROOT_DIR}`));

// Initialize Watcher
const watcher = chokidar.watch(ROOT_DIR, {
  ignored: [
    /(^|[\/\\])\../, // ignore dotfiles
    /node_modules/,
    /dist/,
    /build/,
    /coverage/,
    /tmp/,
    /\.log$/,
    /sysmonitor\.mjs/ // ignore self
  ],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

watcher
  .on('add', path => addToQueue(path, 'Added'))
  .on('change', path => addToQueue(path, 'Changed'))
  .on('unlink', path => addToQueue(path, 'Deleted'))
  .on('error', error => console.error(chalk.red(`Watcher error: ${error}`)));

function addToQueue(filePath, type) {
  const relPath = path.relative(ROOT_DIR, filePath);
  console.log(chalk.gray(`[${type}] ${relPath}`));
  changeQueue.add(filePath);
  
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processQueue, DEBOUNCE_MS);
}

async function processQueue() {
  if (isRunning) {
    // If already running, wait until done then check again
    // For simplicity, we just reschedule check
    debounceTimer = setTimeout(processQueue, DEBOUNCE_MS);
    return;
  }

  if (changeQueue.size === 0) return;

  isRunning = true;
  const files = Array.from(changeQueue);
  changeQueue.clear();

  console.log(chalk.yellow('\n──────────────────────────────────────────'));
  console.log(chalk.yellow(`Processing ${files.length} changes...`));

  try {
    const workspaces = identifyWorkspaces(files);
    
    // Report "working" status
    await updateStatus('degraded', `Processing ${files.length} changes`, { files });
    
    if (workspaces.size > 0) {
      await runIntegration(Array.from(workspaces));
    } else {
      console.log(chalk.gray('Changes detected outside of known workspaces. Running global check...'));
      // Optional: Run global check or just lint?
      // For now, assume if it's not in a workspace, we might verify root config or do nothing
    }
  } catch (err) {
    console.error(chalk.red('Error during processing:'), err);
    await updateStatus('unhealthy', `Error processing changes: ${err.message}`);
  } finally {
    isRunning = false;
    console.log(chalk.green('✔ System Idle'));
    console.log(chalk.yellow('──────────────────────────────────────────\n'));
    
    // Report "healthy" status
    await updateStatus('healthy', 'System Idle', { lastCheck: Date.now() });

    // If more changes came in while running
    if (changeQueue.size > 0) {
      debounceTimer = setTimeout(processQueue, 200);
    }
  }
}

function identifyWorkspaces(files) {
  const workspaces = new Set();
  
  files.forEach(file => {
    const rel = path.relative(ROOT_DIR, file);
    const parts = rel.split(path.sep);
    
    // Check for apps/* or packages/* or services/*
    if ((parts[0] === 'apps' || parts[0] === 'packages' || parts[0] === 'services') && parts[1]) {
      workspaces.add(parts[1]); // The folder name
    }
  });
  
  return workspaces;
}

async function runIntegration(workspaceNames) {
  console.log(chalk.cyan(`Targeting workspaces: ${workspaceNames.join(', ')}`));

  // Construct turbo filter
  // We want to build/test the changed package and anything that depends on it?
  // Or just the changed package? 
  // "Incorporated in the system intelligently" implies propagation. 
  // Turbo's default is usually to run tasks for the filtered scope. 
  // Adding '...' (dependents) might be too heavy for a quick watch, but let's try to be comprehensive.
  // Using --filter=...[workspace] includes dependencies.
  // Using --filter=[workspace]... includes dependents.
  
  const filterArgs = workspaceNames.map(name => `--filter=${name}...`).flat();
  
  // We'll run 'build' and 'lint' (and maybe 'test' if quick)
  // Let's run 'build' as it's the primary integration check.
  
  console.log(chalk.white('Running deterministic build & integration...'));
  
  const exitCode = await runCommand('npx', ['turbo', 'run', 'build', 'lint', ...filterArgs]);
  
  if (exitCode === 0) {
    console.log(chalk.greenBright('✔ Integration Successful'));
    await updateStatus('healthy', `Integration successful for: ${workspaceNames.join(', ')}`);
  } else {
    console.log(chalk.redBright('✘ Integration Failed'));
    await reportFailure(workspaceNames, filterArgs);
    await updateStatus('unhealthy', `Integration failed for: ${workspaceNames.join(', ')}`);
  }
}

// Ensure API is running on port 4100 (default for heady-automation-ide server)
const API_URL = process.env.HC_API_URL || 'http://localhost:4100/api';

async function updateStatus(status, message, metadata = {}) {
  try {
    await fetch(`${API_URL}/monitoring/services/watcher/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        message,
        metadata
      })
    });
  } catch (err) {
    // Silently fail if API is offline to avoid cluttering console
    // console.error(chalk.red(`Failed to update status: ${err.message}`));
  }
}

async function reportFailure(workspaces, args) {
  try {
    // Attempt to create a task in the system
    const title = `Integration Failed: ${workspaces.join(', ')}`;
    const description = `Automated build/lint failed for workspaces: ${workspaces.join(', ')}.\nArgs: ${args.join(' ')}\nPlease investigate immediately.`;
    
    console.log(chalk.yellow('Creating remediation task...'));
    
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        priority: 'HIGH',
        status: 'PENDING',
        type: 'remediation'
      })
    });
    
    if (response.ok) {
        const task = await response.json();
        console.log(chalk.green(`✔ Task created: ${task.id} - ${task.title}`));
    } else {
        console.log(chalk.red(`Failed to create task. API responded with ${response.status}`));
    }
  } catch (err) {
      console.log(chalk.red(`Could not create task (API likely offline): ${err.message}`));
  }
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      shell: true,
      env: { ...process.env, FORCE_COLOR: 'true' }
    });

    proc.on('close', (code) => {
      resolve(code);
    });
    
    proc.on('error', (err) => {
      console.error(chalk.red(`Failed to start subprocess: ${err}`));
      resolve(1);
    });
  });
}
