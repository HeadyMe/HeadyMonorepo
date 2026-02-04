import { getDatabase } from '../database/index.js';
import auditLogger from '../audit/index.js';
import registry from '../registry/index.js';
import os from 'os';

export class AutoScaler {
  constructor() {
    this.db = getDatabase();
    this.metrics = {
      cpu: [],
      memory: [],
      requests: [],
      responseTime: []
    };
    this.thresholds = {
      cpu: { scale_up: 70, scale_down: 30 },
      memory: { scale_up: 75, scale_down: 40 },
      requests_per_min: { scale_up: 1000, scale_down: 100 }
    };
    this.scalingCooldown = 5 * 60 * 1000;
    this.lastScalingAction = null;
    this.initializeScalingTables();
    this.startMonitoring();
  }

  initializeScalingTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scaling_events (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL,
        reason TEXT NOT NULL,
        metrics TEXT NOT NULL,
        from_instances INTEGER,
        to_instances INTEGER,
        success INTEGER DEFAULT 1,
        error TEXT
      );

      CREATE TABLE IF NOT EXISTS system_metrics (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        cpu_usage REAL,
        memory_usage REAL,
        disk_usage REAL,
        active_connections INTEGER,
        requests_per_minute INTEGER,
        avg_response_time REAL
      );

      CREATE INDEX IF NOT EXISTS idx_scaling_timestamp ON scaling_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON system_metrics(timestamp);
    `);
  }

  startMonitoring() {
    setInterval(() => {
      this.collectMetrics();
      this.evaluateScaling();
    }, 60000);

    setInterval(() => {
      this.collectMetrics();
    }, 10000);

    console.log('📊 Auto-scaler monitoring started');
  }

  collectMetrics() {
    const cpuUsage = this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const diskUsage = this.getDiskUsage();

    this.metrics.cpu.push(cpuUsage);
    this.metrics.memory.push(memoryUsage);

    if (this.metrics.cpu.length > 60) this.metrics.cpu.shift();
    if (this.metrics.memory.length > 60) this.metrics.memory.shift();

    this.db.prepare(`
      INSERT INTO system_metrics (id, cpu_usage, memory_usage, disk_usage, active_connections, requests_per_minute, avg_response_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `metric_${Date.now()}`,
      cpuUsage,
      memoryUsage,
      diskUsage,
      this.getActiveConnections(),
      this.getRequestsPerMinute(),
      this.getAvgResponseTime()
    );

    this.cleanupOldMetrics();
  }

  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return ((1 - totalIdle / totalTick) * 100).toFixed(2);
  }

  getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return (((totalMem - freeMem) / totalMem) * 100).toFixed(2);
  }

  getDiskUsage() {
    return 25.5;
  }

  getActiveConnections() {
    return 1;
  }

  getRequestsPerMinute() {
    return this.metrics.requests.length;
  }

  getAvgResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return (sum / this.metrics.responseTime.length).toFixed(2);
  }

  evaluateScaling() {
    if (this.isInCooldown()) {
      return;
    }

    const avgCPU = this.getAverage(this.metrics.cpu);
    const avgMemory = this.getAverage(this.metrics.memory);
    const requestsPerMin = this.getRequestsPerMinute();

    const currentNodes = registry.getAllNodes({ status: 'active' }).length;

    if (avgCPU > this.thresholds.cpu.scale_up || 
        avgMemory > this.thresholds.memory.scale_up ||
        requestsPerMin > this.thresholds.requests_per_min.scale_up) {
      
      this.scaleUp({
        cpu: avgCPU,
        memory: avgMemory,
        requests: requestsPerMin,
        current_nodes: currentNodes
      });
    } else if (avgCPU < this.thresholds.cpu.scale_down && 
               avgMemory < this.thresholds.memory.scale_down &&
               requestsPerMin < this.thresholds.requests_per_min.scale_down &&
               currentNodes > 1) {
      
      this.scaleDown({
        cpu: avgCPU,
        memory: avgMemory,
        requests: requestsPerMin,
        current_nodes: currentNodes
      });
    }
  }

  scaleUp(metrics) {
    const currentNodes = metrics.current_nodes;
    const targetNodes = Math.min(currentNodes + 1, 10);

    auditLogger.logSystemEvent({
      event_type: 'auto_scale_up',
      component: 'auto_scaler',
      severity: 'info',
      message: `Scaling up from ${currentNodes} to ${targetNodes} nodes`,
      details: metrics
    });

    try {
      const newNodeId = registry.registerNode({
        name: `auto-node-${Date.now()}`,
        type: 'worker',
        role: 'content_processor',
        capabilities: ['content_processing', 'media_processing'],
        metadata: { auto_scaled: true, created_by: 'auto_scaler' }
      });

      this.db.prepare(`
        INSERT INTO scaling_events (id, action, reason, metrics, from_instances, to_instances, success)
        VALUES (?, 'scale_up', 'high_load', ?, ?, ?, 1)
      `).run(
        `scale_${Date.now()}`,
        JSON.stringify(metrics),
        currentNodes,
        targetNodes
      );

      this.lastScalingAction = Date.now();

      console.log(`⬆️ Scaled up: Added node ${newNodeId.id}`);
    } catch (error) {
      this.db.prepare(`
        INSERT INTO scaling_events (id, action, reason, metrics, from_instances, to_instances, success, error)
        VALUES (?, 'scale_up', 'high_load', ?, ?, ?, 0, ?)
      `).run(
        `scale_${Date.now()}`,
        JSON.stringify(metrics),
        currentNodes,
        targetNodes,
        error.message
      );
    }
  }

  scaleDown(metrics) {
    const currentNodes = metrics.current_nodes;
    const targetNodes = Math.max(currentNodes - 1, 1);

    auditLogger.logSystemEvent({
      event_type: 'auto_scale_down',
      component: 'auto_scaler',
      severity: 'info',
      message: `Scaling down from ${currentNodes} to ${targetNodes} nodes`,
      details: metrics
    });

    try {
      const nodes = registry.getAllNodes({ status: 'active' });
      const autoScaledNodes = nodes.filter(n => n.metadata?.auto_scaled);
      
      if (autoScaledNodes.length > 0) {
        const nodeToRemove = autoScaledNodes[0];
        registry.updateNodeStatus(nodeToRemove.id, 'inactive');

        this.db.prepare(`
          INSERT INTO scaling_events (id, action, reason, metrics, from_instances, to_instances, success)
          VALUES (?, 'scale_down', 'low_load', ?, ?, ?, 1)
        `).run(
          `scale_${Date.now()}`,
          JSON.stringify(metrics),
          currentNodes,
          targetNodes
        );

        this.lastScalingAction = Date.now();

        console.log(`⬇️ Scaled down: Removed node ${nodeToRemove.id}`);
      }
    } catch (error) {
      this.db.prepare(`
        INSERT INTO scaling_events (id, action, reason, metrics, from_instances, to_instances, success, error)
        VALUES (?, 'scale_down', 'low_load', ?, ?, ?, 0, ?)
      `).run(
        `scale_${Date.now()}`,
        JSON.stringify(metrics),
        currentNodes,
        targetNodes,
        error.message
      );
    }
  }

  isInCooldown() {
    if (!this.lastScalingAction) return false;
    return (Date.now() - this.lastScalingAction) < this.scalingCooldown;
  }

  getAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / arr.length;
  }

  cleanupOldMetrics() {
    this.db.prepare(`
      DELETE FROM system_metrics 
      WHERE timestamp < datetime('now', '-7 days')
    `).run();
  }

  getScalingHistory(limit = 50) {
    const events = this.db.prepare(`
      SELECT * FROM scaling_events 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(limit);

    return events.map(event => ({
      ...event,
      metrics: JSON.parse(event.metrics)
    }));
  }

  getCurrentMetrics() {
    return {
      cpu: this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      disk: this.getDiskUsage(),
      connections: this.getActiveConnections(),
      requests_per_minute: this.getRequestsPerMinute(),
      avg_response_time: this.getAvgResponseTime(),
      active_nodes: registry.getAllNodes({ status: 'active' }).length
    };
  }
}

export default new AutoScaler();
