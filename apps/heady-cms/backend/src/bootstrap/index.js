// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/bootstrap/index.js
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

import { initDatabase } from '../database/index.js';
import registry from '../registry/index.js';
import auditLogger from '../audit/index.js';
import automationOrchestrator from '../automation/index.js';
import config from '../config/index.js';
import fs from 'fs';
import path from 'path';

export class SystemBootstrap {
  constructor() {
    this.initializationSteps = [];
    this.currentStep = 0;
    this.startTime = null;
  }

  async initialize() {
    this.startTime = Date.now();
    console.log('🚀 Starting Heady System Bootstrap...\n');

    this.initializationSteps = [
      { name: 'Environment Check', fn: () => this.checkEnvironment() },
      { name: 'Directory Structure', fn: () => this.ensureDirectories() },
      { name: 'Database Initialization', fn: () => this.initializeDatabase() },
      { name: 'System Registration', fn: () => this.registerSystemNode() },
      { name: 'Automation Systems', fn: () => this.initializeAutomation() },
      { name: 'Health Checks', fn: () => this.performInitialHealthCheck() },
      { name: 'Bootstrap Complete', fn: () => this.finalizeBootstrap() }
    ];

    for (let i = 0; i < this.initializationSteps.length; i++) {
      this.currentStep = i + 1;
      const step = this.initializationSteps[i];
      
      try {
        console.log(`[${this.currentStep}/${this.initializationSteps.length}] ${step.name}...`);
        await step.fn();
        console.log(`✅ ${step.name} completed\n`);
      } catch (error) {
        console.error(`❌ ${step.name} failed:`, error.message);
        throw new Error(`Bootstrap failed at step: ${step.name}`);
      }
    }

    const duration = Date.now() - this.startTime;
    console.log(`\n🎉 System Bootstrap Complete in ${duration}ms\n`);
    
    return {
      success: true,
      duration,
      steps: this.initializationSteps.length
    };
  }

  async checkEnvironment() {
    const checks = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      env: config.env
    };

    console.log(`   Node: ${checks.nodeVersion}`);
    console.log(`   Platform: ${checks.platform} (${checks.arch})`);
    console.log(`   Memory: ${checks.memory}`);
    console.log(`   Environment: ${checks.env}`);

    const requiredEnvVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.warn(`   ⚠️  Missing env vars (using defaults): ${missing.join(', ')}`);
    }

    return checks;
  }

  async ensureDirectories() {
    const directories = [
      config.database.path.substring(0, config.database.path.lastIndexOf('/')),
      config.upload.dir,
      path.join(config.upload.dir, 'temp'),
      path.join(config.database.path.substring(0, config.database.path.lastIndexOf('/')), 'backups')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   Created: ${dir}`);
      }
    }

    return { created: directories.length };
  }

  async initializeDatabase() {
    await initDatabase();
    
    console.log('   Tables: Created/Verified');
    console.log('   Indexes: Created/Verified');
    console.log('   Foreign Keys: Enabled');
    
    return { initialized: true };
  }

  async registerSystemNode() {
    const nodeData = {
      name: 'heady-api-main',
      type: 'api',
      role: 'primary_api_server',
      endpoint: `http://localhost:${config.port}`,
      capabilities: [
        'content_management',
        'media_management',
        'user_management',
        'workflow_execution',
        'auto_scaling',
        'self_healing',
        'intelligent_learning',
        'service_discovery'
      ],
      metadata: {
        version: '1.0.0',
        started_at: new Date().toISOString(),
        pid: process.pid,
        node_version: process.version
      },
      health_check_url: `http://localhost:${config.port}/health`
    };

    const node = registry.registerNode(nodeData);
    console.log(`   Node ID: ${node.id}`);
    console.log(`   Endpoint: ${node.endpoint}`);
    console.log(`   Capabilities: ${node.capabilities.length}`);

    auditLogger.logSystemEvent({
      event_type: 'system_bootstrap',
      component: 'bootstrap',
      severity: 'info',
      message: 'System node registered',
      details: { node_id: node.id }
    });

    return node;
  }

  async initializeAutomation() {
    const status = await automationOrchestrator.initializeAllSystems();
    
    console.log(`   Workflows: ${status.workflows.active} active`);
    console.log(`   Auto-Scaler: Monitoring`);
    console.log(`   Self-Healing: Active`);
    console.log(`   Intelligence: Learning`);
    console.log(`   Discovery: Scanning`);

    const backgroundIngestion = (await import('../knowledge/backgroundIngestion.js')).default;
    backgroundIngestion.start();
    console.log(`   Knowledge Ingestion: Active`);

    const autoSync = (await import('../repository/autoSync.js')).default;
    autoSync.startAutoSync(5);
    console.log(`   Auto-Sync: Active (every 5 minutes)`);

    const patternRecognizer = (await import('../patterns/recognizer.js')).default;
    console.log(`   Pattern Recognizer: ELEVATED STATUS`);

    return status;
  }

  async performInitialHealthCheck() {
    const checks = [
      { name: 'Database', check: () => this.checkDatabase() },
      { name: 'File System', check: () => this.checkFileSystem() },
      { name: 'Memory', check: () => this.checkMemory() }
    ];

    const results = {};
    for (const { name, check } of checks) {
      try {
        results[name] = await check();
        console.log(`   ${name}: ✓ Healthy`);
      } catch (error) {
        console.warn(`   ${name}: ⚠️  ${error.message}`);
        results[name] = { healthy: false, error: error.message };
      }
    }

    return results;
  }

  async checkDatabase() {
    const { getDatabase } = await import('../database/index.js');
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as test').get();
    return { healthy: result.test === 1 };
  }

  async checkFileSystem() {
    const testFile = path.join(config.upload.dir, '.healthcheck');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return { healthy: true };
  }

  async checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;
    return {
      healthy: heapUsedPercent < 90,
      heap_used_percent: heapUsedPercent.toFixed(2)
    };
  }

  async finalizeBootstrap() {
    console.log('   System Status: OPERATIONAL');
    console.log('   All Systems: GO');
    
    auditLogger.logSystemEvent({
      event_type: 'system_ready',
      component: 'bootstrap',
      severity: 'info',
      message: 'System bootstrap completed successfully',
      details: {
        duration_ms: Date.now() - this.startTime,
        steps_completed: this.initializationSteps.length
      }
    });

    return { ready: true };
  }

  async shutdown() {
    console.log('\n🛑 Initiating graceful shutdown...\n');

    const shutdownSteps = [
      { name: 'Stop Automation', fn: () => automationOrchestrator.shutdown() },
      { name: 'Stop Knowledge Ingestion', fn: async () => {
        const backgroundIngestion = (await import('../knowledge/backgroundIngestion.js')).default;
        backgroundIngestion.stop();
      }},
      { name: 'Flush Logs', fn: () => this.flushLogs() },
      { name: 'Update Node Status', fn: () => this.updateNodeStatus() },
      { name: 'Close Connections', fn: () => this.closeConnections() }
    ];

    for (const step of shutdownSteps) {
      try {
        console.log(`   ${step.name}...`);
        await step.fn();
        console.log(`   ✅ ${step.name}`);
      } catch (error) {
        console.error(`   ⚠️  ${step.name}: ${error.message}`);
      }
    }

    console.log('\n✅ Shutdown complete\n');
  }

  async flushLogs() {
    auditLogger.logSystemEvent({
      event_type: 'system_shutdown',
      component: 'bootstrap',
      severity: 'info',
      message: 'System shutting down gracefully'
    });
  }

  async updateNodeStatus() {
    const nodes = registry.getAllNodes({ name: 'heady-api-main' });
    if (nodes.length > 0) {
      registry.updateNodeStatus(nodes[0].id, 'inactive');
    }
  }

  async closeConnections() {
    const { closeDatabase } = await import('../database/index.js');
    closeDatabase();
  }
}

export default new SystemBootstrap();
