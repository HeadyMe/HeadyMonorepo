// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: standby-orchestrator/index.js
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

const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const services = process.env.SERVICES.split(',');
const idleTimeout = parseInt(process.env.IDLE_TIMEOUT || '300') * 1000; // in milliseconds

let lastActivity = Date.now();

// Function to stop services
async function stopServices() {
  for (const service of services) {
    const containers = await docker.listContainers({ all: true, filters: { name: [`${service}`] } });
    for (const containerInfo of containers) {
      const container = docker.getContainer(containerInfo.Id);
      if (containerInfo.State === 'running') {
        await container.stop();
        console.log(`Stopped container ${containerInfo.Names[0]}`);
      }
    }
  }
}

// Function to start services
async function startServices() {
  for (const service of services) {
    const containers = await docker.listContainers({ all: true, filters: { name: [`${service}`] } });
    for (const containerInfo of containers) {
      const container = docker.getContainer(containerInfo.Id);
      if (containerInfo.State !== 'running') {
        await container.start();
        console.log(`Started container ${containerInfo.Names[0]}`);
      }
    }
  }
}

// Check for idle state
setInterval(() => {
  const now = Date.now();
  if (now - lastActivity > idleTimeout) {
    stopServices();
  }
}, 60000); // Check every minute

// Start services initially
startServices();

console.log('Standby Orchestrator started. Monitoring for activity...');
