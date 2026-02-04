// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/verify-deployment.js
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

#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

const SERVICES = [
  {
    name: 'API',
    url: 'http://localhost:8000/health',
    required: true
  },
  {
    name: 'HeadyConnection Web',
    url: 'http://localhost:3000',
    required: true
  },
  {
    name: 'HeadySystems Web',
    url: 'http://localhost:3001',
    required: true
  },
  {
    name: 'Browser Automation',
    url: 'http://localhost:9222/health',
    required: false
  },
  {
    name: 'PostgreSQL',
    command: 'docker exec heady-postgres pg_isready',
    type: 'command',
    required: true
  },
  {
    name: 'Redis',
    command: 'docker exec heady-redis redis-cli ping',
    type: 'command',
    required: true
  }
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => {
      resolve(false);
    });
  });
}

function checkCommand(command) {
  try {
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function verifyDeployment() {
  console.log(`
╔══════════════════════════════════════╗
║    HeadyEcosystem Deployment Check    ║
╚══════════════════════════════════════╝
`);

  let allPassed = true;
  let requiredPassed = true;
  
  for (const service of SERVICES) {
    process.stdout.write(`Checking ${service.name}...`.padEnd(35));
    
    let isHealthy = false;
    
    if (service.type === 'command') {
      isHealthy = checkCommand(service.command);
    } else {
      isHealthy = await checkUrl(service.url);
    }
    
    if (isHealthy) {
      console.log('✅ ONLINE');
    } else {
      console.log('❌ OFFLINE');
      allPassed = false;
      if (service.required) {
        requiredPassed = false;
      }
    }
  }
  
  console.log('\n' + '='.repeat(42));
  
  if (allPassed) {
    console.log('✅ All services are running successfully!');
  } else if (requiredPassed) {
    console.log('⚠️  Required services are running');
    console.log('   Some optional services are offline');
  } else {
    console.log('❌ Some required services are not running');
    console.log('\nTo start all services:');
    console.log('  1. Docker services: docker-compose up -d');
    console.log('  2. Development: pnpm dev');
  }
  
  // Check environment variables
  console.log('\n📋 Environment Configuration:');
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'HC_JWT_SECRET'
  ];
  
  let envConfigured = true;
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✅ ${envVar}: Configured`);
    } else {
      console.log(`  ❌ ${envVar}: Not set`);
      envConfigured = false;
    }
  }
  
  if (!envConfigured) {
    console.log('\n⚠️  Some environment variables are missing');
    console.log('   Run: pnpm run setup:env');
  }
  
  return allPassed && envConfigured;
}

// Run verification
verifyDeployment().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Error during verification:', error);
  process.exit(1);
});
