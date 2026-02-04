// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/setup-environment.js
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
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const REQUIRED_SECRETS = [
  'HC_FIGMA_API_TOKEN',
  'HC_OPENAI_API_KEY',
  'HC_ANTHROPIC_API_KEY',
  'HC_GOOGLE_GEMINI_API_KEY',
  'HC_PERPLEXITY_API_KEY',
  'HC_GITHUB_TOKEN',
  'HC_JWT_SECRET',
  'HC_ENCRYPTION_KEY',
  'DATABASE_PASSWORD'
];

async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  const checks = [
    { name: 'Node.js', command: 'node --version', minVersion: '20.0.0' },
    { name: 'pnpm', command: 'pnpm --version', minVersion: '8.0.0' },
    { name: 'Docker', command: 'docker --version', optional: true },
    { name: 'Git', command: 'git --version' }
  ];

  for (const check of checks) {
    try {
      const result = execSync(check.command, { encoding: 'utf8' }).trim();
      console.log(`✅ ${check.name}: ${result}`);
    } catch (error) {
      if (check.optional) {
        console.log(`⚠️  ${check.name}: Not found (optional)`);
      } else {
        console.error(`❌ ${check.name}: Not found (required)`);
        console.log(`   Please install ${check.name} before continuing.`);
        process.exit(1);
      }
    }
  }
  console.log();
}

function generateSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function setupEnvironment() {
  console.log('🚀 Setting up HeadyEcosystem environment\n');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Keeping existing .env.local');
      return;
    }
  }
  
  // Read example env
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  let envContent = envExample;
  
  console.log('\n📝 Configuring environment variables...\n');
  
  // Generate secrets
  const secrets = {
    HC_JWT_SECRET: generateSecret(64),
    HC_ENCRYPTION_KEY: generateSecret(32),
    DATABASE_PASSWORD: generateSecret(16)
  };
  
  for (const [key, value] of Object.entries(secrets)) {
    envContent = envContent.replace(`${key}=`, `${key}=${value}`);
    console.log(`✅ Generated ${key}`);
  }
  
  // Optional: Ask for API keys
  const useApiKeys = await question('\nDo you have API keys to configure now? (y/N): ');
  if (useApiKeys.toLowerCase() === 'y') {
    for (const key of ['HC_OPENAI_API_KEY', 'HC_GITHUB_TOKEN']) {
      const value = await question(`Enter ${key} (or press Enter to skip): `);
      if (value) {
        envContent = envContent.replace(`${key}=`, `${key}=${value}`);
      }
    }
  }
  
  // Write env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Created .env.local file');
}

async function setupDatabase() {
  console.log('\n🗄️  Setting up database...\n');
  
  const useDocker = await question('Use Docker for PostgreSQL? (Y/n): ');
  if (useDocker.toLowerCase() !== 'n') {
    console.log('Starting PostgreSQL with Docker...');
    try {
      execSync('docker-compose up -d postgres redis', { stdio: 'inherit' });
      console.log('✅ Database services started');
      
      // Wait for database to be ready
      console.log('Waiting for database to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.log('⚠️  Could not start Docker services. Please start them manually.');
    }
  }
}

async function installDependencies() {
  console.log('\n📦 Installing dependencies...\n');
  
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

async function setupPrisma() {
  console.log('\n🔧 Setting up Prisma...\n');
  
  try {
    process.chdir(path.join(__dirname, '..', 'apps', 'api'));
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    const migrate = await question('Run database migrations? (Y/n): ');
    if (migrate.toLowerCase() !== 'n') {
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      console.log('✅ Database migrated');
    }
    
    process.chdir(path.join(__dirname, '..'));
  } catch (error) {
    console.log('⚠️  Prisma setup incomplete. Run manually later.');
  }
}

async function main() {
  console.log(`
╔══════════════════════════════════════╗
║     HeadyEcosystem Setup Wizard      ║
╚══════════════════════════════════════╝
`);
  
  await checkPrerequisites();
  await setupEnvironment();
  await installDependencies();
  await setupDatabase();
  await setupPrisma();
  
  console.log(`
╔══════════════════════════════════════╗
║      Setup Complete! 🎉              ║
╚══════════════════════════════════════╝

Next steps:
1. Review and update .env.local with your API keys
2. Run 'pnpm dev' to start development servers
3. Access services:
   - HeadyConnection: http://localhost:3000
   - HeadySystems: http://localhost:3001
   - API: http://localhost:8000

For desktop shortcuts: pnpm run setup:desktop
`);
  
  rl.close();
}

main().catch(console.error);
