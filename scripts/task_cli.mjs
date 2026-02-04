// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/task_cli.mjs
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

// import fetch from 'node-fetch'; // Native fetch in Node 18+
import chalk from 'chalk';

const API_URL = process.env.HC_API_URL || 'http://localhost:8002/api';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      await listTasks();
      break;
    case 'create':
      const title = args[1];
      if (!title) {
        console.log(chalk.red('Please provide a title for the task'));
        process.exit(1);
      }
      await createTask(title, args.slice(2).join(' '));
      break;
    default:
      console.log('Usage:');
      console.log('  hc tasks list');
      console.log('  hc tasks create <title> [description]');
  }
}

async function listTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`);
    const tasks = await res.json();
    
    if (!Array.isArray(tasks)) {
        console.log(chalk.red('Failed to fetch tasks'));
        return;
    }

    console.log(chalk.blue('╔════════════════════════════════════════╗'));
    console.log(chalk.blue('║            Current Tasks               ║'));
    console.log(chalk.blue('╚════════════════════════════════════════╝'));

    tasks.forEach(task => {
      const statusColor = task.status === 'COMPLETED' ? chalk.green : 
                         task.status === 'IN_PROGRESS' ? chalk.yellow : chalk.white;
      
      console.log(`${chalk.gray(task.id.slice(0,8))} ${statusColor(task.status.padEnd(12))} ${task.title}`);
    });
    console.log('');
  } catch (error) {
    console.error(chalk.red('Error connecting to API:'), error.message);
  }
}

async function createTask(title, description) {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        projectId: 'default', // TODO: Handle projects
        status: 'PENDING'
      })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
        console.error(chalk.red(`Error (${res.status}):`), data.error || JSON.stringify(data));
        return;
    }
    
    console.log(chalk.green(`✔ Task created: ${data.id}`));
    console.log(chalk.gray(`  Title: ${data.title}`));
  } catch (error) {
    console.error(chalk.red('Error creating task:'), error.message);
  }
}

main();
