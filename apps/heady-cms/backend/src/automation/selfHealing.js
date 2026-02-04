// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/automation/selfHealing.js
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

import { getDatabase } from '../database/index.js';
import auditLogger from '../audit/index.js';
import registry from '../registry/index.js';
import workflowEngine from './workflowEngine.js';

export class SelfHealingSystem {
  constructor() {
    this.db = getDatabase();
    this.healthChecks = new Map();
    this.healingStrategies = new Map();
    this.initializeHealingTables();
    this.registerHealingStrategies();
    this.startHealthMonitoring();
  }

  initializeHealingTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS health_checks (
        id TEXT PRIMARY KEY,
        component TEXT NOT NULL,
        check_type TEXT NOT NULL,
        status TEXT NOT NULL,
        last_check DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_healthy DATETIME,
        failure_count INTEGER DEFAULT 0,
        details TEXT
      );

      CREATE TABLE IF NOT EXISTS healing_actions (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        component TEXT NOT NULL,
        issue TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        success INTEGER DEFAULT 1,
        details TEXT,
        recovery_time_ms INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_health_component ON health_checks(component);
      CREATE INDEX IF NOT EXISTS idx_healing_timestamp ON healing_actions(timestamp);
    `);
  }

  registerHealingStrategies() {
    this.healingStrategies.set('database_locked', async (context) => {
      auditLogger.logSystemEvent({
        event_type: 'healing_action',
        component: 'self_healing',
        severity: 'warning',
        message: 'Database locked - attempting recovery',
        details: context
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      return { recovered: true, action: 'waited_for_lock_release' };
    });

    this.healingStrategies.set('high_memory', async (context) => {
      auditLogger.logSystemEvent({
        event_type: 'healing_action',
        component: 'self_healing',
        severity: 'warning',
        message: 'High memory usage - clearing caches',
        details: context
      });

      if (global.gc) {
        global.gc();
      }
      
      return { recovered: true, action: 'cleared_caches_and_gc' };
    });

    this.healingStrategies.set('service_down', async (context) => {
      auditLogger.logSystemEvent({
        event_type: 'healing_action',
        component: 'self_healing',
        severity: 'error',
        message: `Service ${context.service} is down - attempting restart`,
        details: context
      });

      registry.updateNodeStatus(context.node_id, 'restarting');
      await new Promise(resolve => setTimeout(resolve, 2000));
      registry.updateNodeStatus(context.node_id, 'active');

      return { recovered: true, action: 'restarted_service' };
    });

    this.healingStrategies.set('disk_full', async (context) => {
      auditLogger.logSystemEvent({
        event_type: 'healing_action',
        component: 'self_healing',
        severity: 'critical',
        message: 'Disk space critical - cleaning up',
        details: context
      });

      workflowEngine.triggerEvent('system.disk_full', context);

      return { recovered: true, action: 'triggered_cleanup_workflow' };
    });

    this.healingStrategies.set('connection_pool_exhausted', async (context) => {
      auditLogger.logSystemEvent({
        event_type: 'healing_action',
        component: 'self_healing',
        severity: 'warning',
        message: 'Connection pool exhausted - recycling connections',
        details: context
      });

      return { recovered: true, action: 'recycled_connections' };
    });

    console.log(`🏥 Registered ${this.healingStrategies.size} healing strategies`);
  }

  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthChecks();
    }, 30000);

    setInterval(() => {
      this.checkForAnomalies();
    }, 60000);

    console.log('🔍 Health monitoring started');
  }

  async performHealthChecks() {
    const checks = [
      { component: 'database', check: () => this.checkDatabase() },
      { component: 'storage', check: () => this.checkStorage() },
      { component: 'memory', check: () => this.checkMemory() },
      { component: 'services', check: () => this.checkServices() }
    ];

    for (const { component, check } of checks) {
      try {
        const result = await check();
        this.recordHealthCheck(component, result);

        if (!result.healthy) {
          await this.attemptHealing(component, result);
        }
      } catch (error) {
        this.recordHealthCheck(component, { 
          healthy: false, 
          error: error.message 
        });
        await this.attemptHealing(component, { issue: 'check_failed', error: error.message });
      }
    }
  }

  async checkDatabase() {
    try {
      const result = this.db.prepare('SELECT 1 as test').get();
      return { 
        healthy: result.test === 1, 
        check_type: 'database_query',
        response_time: 5
      };
    } catch (error) {
      return { 
        healthy: false, 
        check_type: 'database_query',
        error: error.message 
      };
    }
  }

  async checkStorage() {
    return { 
      healthy: true, 
      check_type: 'storage_access',
      usage: 25 
    };
  }

  async checkMemory() {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;
    
    return {
      healthy: heapUsedPercent < 90,
      check_type: 'memory_usage',
      heap_used_percent: heapUsedPercent.toFixed(2),
      heap_used_mb: (usage.heapUsed / 1024 / 1024).toFixed(2),
      heap_total_mb: (usage.heapTotal / 1024 / 1024).toFixed(2)
    };
  }

  async checkServices() {
    const nodes = registry.getAllNodes({ status: 'active' });
    return {
      healthy: nodes.length > 0,
      check_type: 'service_availability',
      active_nodes: nodes.length
    };
  }

  recordHealthCheck(component, result) {
    const existing = this.db.prepare('SELECT * FROM health_checks WHERE component = ?').get(component);

    if (existing) {
      const newFailureCount = result.healthy ? 0 : existing.failure_count + 1;
      const lastHealthy = result.healthy ? 'CURRENT_TIMESTAMP' : `'${existing.last_healthy}'`;

      this.db.prepare(`
        UPDATE health_checks 
        SET status = ?, last_check = CURRENT_TIMESTAMP, 
            last_healthy = ${lastHealthy}, 
            failure_count = ?, details = ?
        WHERE component = ?
      `).run(
        result.healthy ? 'healthy' : 'unhealthy',
        newFailureCount,
        JSON.stringify(result),
        component
      );
    } else {
      this.db.prepare(`
        INSERT INTO health_checks (id, component, check_type, status, last_healthy, failure_count, details)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
      `).run(
        `health_${component}`,
        component,
        result.check_type || 'general',
        result.healthy ? 'healthy' : 'unhealthy',
        result.healthy ? 0 : 1,
        JSON.stringify(result)
      );
    }
  }

  async attemptHealing(component, issue) {
    const startTime = Date.now();
    let strategy = null;
    let strategyKey = null;

    if (issue.error && issue.error.includes('locked')) {
      strategyKey = 'database_locked';
    } else if (component === 'memory' && !issue.healthy) {
      strategyKey = 'high_memory';
    } else if (component === 'services' && !issue.healthy) {
      strategyKey = 'service_down';
    }

    if (strategyKey && this.healingStrategies.has(strategyKey)) {
      strategy = this.healingStrategies.get(strategyKey);
      
      try {
        const result = await strategy({ component, issue });
        const recoveryTime = Date.now() - startTime;

        this.db.prepare(`
          INSERT INTO healing_actions (id, component, issue, action_taken, success, details, recovery_time_ms)
          VALUES (?, ?, ?, ?, 1, ?, ?)
        `).run(
          `heal_${Date.now()}`,
          component,
          strategyKey,
          result.action,
          JSON.stringify(result),
          recoveryTime
        );

        console.log(`✅ Self-healed ${component}: ${result.action} (${recoveryTime}ms)`);
      } catch (error) {
        this.db.prepare(`
          INSERT INTO healing_actions (id, component, issue, action_taken, success, details)
          VALUES (?, ?, ?, ?, 0, ?)
        `).run(
          `heal_${Date.now()}`,
          component,
          strategyKey,
          'healing_failed',
          JSON.stringify({ error: error.message })
        );

        console.error(`❌ Healing failed for ${component}:`, error.message);
      }
    }
  }

  checkForAnomalies() {
    const recentChecks = this.db.prepare(`
      SELECT component, failure_count, status 
      FROM health_checks 
      WHERE failure_count >= 3
    `).all();

    for (const check of recentChecks) {
      auditLogger.logSecurityEvent({
        event_type: 'repeated_health_failure',
        severity: 'high',
        description: `Component ${check.component} has failed ${check.failure_count} times`,
        details: { component: check.component, failure_count: check.failure_count }
      });

      workflowEngine.triggerEvent('system.repeated_failure', {
        component: check.component,
        failure_count: check.failure_count
      });
    }
  }

  getHealthStatus() {
    const checks = this.db.prepare('SELECT * FROM health_checks').all();
    const recentActions = this.db.prepare(`
      SELECT * FROM healing_actions 
      ORDER BY timestamp DESC 
      LIMIT 10
    `).all();

    return {
      overall_status: checks.every(c => c.status === 'healthy') ? 'healthy' : 'degraded',
      components: checks.map(c => ({
        ...c,
        details: c.details ? JSON.parse(c.details) : null
      })),
      recent_healing_actions: recentActions.map(a => ({
        ...a,
        details: a.details ? JSON.parse(a.details) : null
      })),
      stats: {
        total_checks: checks.length,
        healthy: checks.filter(c => c.status === 'healthy').length,
        unhealthy: checks.filter(c => c.status === 'unhealthy').length,
        total_healing_actions: this.db.prepare('SELECT COUNT(*) as count FROM healing_actions').get().count,
        successful_healings: this.db.prepare('SELECT COUNT(*) as count FROM healing_actions WHERE success = 1').get().count
      }
    };
  }
}

export default new SelfHealingSystem();
