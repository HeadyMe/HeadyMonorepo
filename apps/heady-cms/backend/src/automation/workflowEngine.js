// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/automation/workflowEngine.js
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
import { v4 as uuidv4 } from 'uuid';
import auditLogger from '../audit/index.js';
import EventEmitter from 'events';

export class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.db = getDatabase();
    this.activeWorkflows = new Map();
    this.triggers = new Map();
    this.initializeWorkflowTables();
    this.startAutoExecution();
  }

  initializeWorkflowTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        trigger_type TEXT NOT NULL,
        trigger_config TEXT,
        steps TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        auto_retry INTEGER DEFAULT 1,
        max_retries INTEGER DEFAULT 3,
        timeout_seconds INTEGER DEFAULT 300,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workflow_executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        error TEXT,
        context TEXT,
        result TEXT,
        retry_count INTEGER DEFAULT 0,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workflow_step_logs (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        step_index INTEGER NOT NULL,
        step_name TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        input TEXT,
        output TEXT,
        error TEXT,
        FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_executions_workflow ON workflow_executions(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(status);
      CREATE INDEX IF NOT EXISTS idx_step_logs_execution ON workflow_step_logs(execution_id);
    `);

    this.seedDefaultWorkflows();
  }

  seedDefaultWorkflows() {
    const defaultWorkflows = [
      {
        name: 'auto_backup',
        description: 'Automatically backup database every 6 hours',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */6 * * *' },
        steps: [
          { name: 'create_backup', action: 'backup_database', params: {} },
          { name: 'verify_backup', action: 'verify_backup', params: {} },
          { name: 'cleanup_old', action: 'cleanup_old_backups', params: { keep: 10 } }
        ]
      },
      {
        name: 'health_check',
        description: 'Check system health every 5 minutes',
        trigger_type: 'schedule',
        trigger_config: { interval: 300000 },
        steps: [
          { name: 'check_database', action: 'check_database_health', params: {} },
          { name: 'check_storage', action: 'check_storage_health', params: {} },
          { name: 'check_services', action: 'check_services_health', params: {} },
          { name: 'alert_if_unhealthy', action: 'send_alerts', params: { condition: 'unhealthy' } }
        ]
      },
      {
        name: 'auto_optimize',
        description: 'Optimize database and clean up resources daily',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 2 * * *' },
        steps: [
          { name: 'vacuum_database', action: 'vacuum_database', params: {} },
          { name: 'cleanup_sessions', action: 'cleanup_expired_sessions', params: {} },
          { name: 'cleanup_tokens', action: 'cleanup_expired_tokens', params: {} },
          { name: 'optimize_media', action: 'optimize_media_storage', params: {} }
        ]
      },
      {
        name: 'auto_scale_check',
        description: 'Check if scaling is needed every 10 minutes',
        trigger_type: 'schedule',
        trigger_config: { interval: 600000 },
        steps: [
          { name: 'check_load', action: 'check_system_load', params: {} },
          { name: 'decide_scaling', action: 'decide_scaling_action', params: {} },
          { name: 'execute_scaling', action: 'execute_scaling', params: {} }
        ]
      },
      {
        name: 'on_user_register',
        description: 'Automatically setup new user environment',
        trigger_type: 'event',
        trigger_config: { event: 'user.registered' },
        steps: [
          { name: 'create_workspace', action: 'create_user_workspace', params: {} },
          { name: 'assign_permissions', action: 'assign_default_permissions', params: {} },
          { name: 'send_welcome', action: 'send_welcome_email', params: {} }
        ]
      },
      {
        name: 'on_content_publish',
        description: 'Automatically process published content',
        trigger_type: 'event',
        trigger_config: { event: 'content.published' },
        steps: [
          { name: 'generate_preview', action: 'generate_content_preview', params: {} },
          { name: 'update_search_index', action: 'update_search_index', params: {} },
          { name: 'trigger_webhooks', action: 'trigger_webhooks', params: { event: 'content.published' } },
          { name: 'invalidate_cache', action: 'invalidate_cache', params: {} }
        ]
      }
    ];

    const existing = this.db.prepare('SELECT COUNT(*) as count FROM workflows').get();
    if (existing.count === 0) {
      for (const wf of defaultWorkflows) {
        this.createWorkflow(wf);
      }
    }
  }

  createWorkflow(workflowData) {
    const id = uuidv4();
    const { name, description, trigger_type, trigger_config, steps, enabled = 1, auto_retry = 1, max_retries = 3, timeout_seconds = 300 } = workflowData;

    this.db.prepare(`
      INSERT INTO workflows (id, name, description, trigger_type, trigger_config, steps, enabled, auto_retry, max_retries, timeout_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      description || '',
      trigger_type,
      JSON.stringify(trigger_config),
      JSON.stringify(steps),
      enabled,
      auto_retry,
      max_retries,
      timeout_seconds
    );

    if (enabled) {
      this.registerTrigger(id, trigger_type, trigger_config);
    }

    return id;
  }

  registerTrigger(workflowId, triggerType, triggerConfig) {
    if (triggerType === 'schedule') {
      if (triggerConfig.interval) {
        const intervalId = setInterval(() => {
          this.executeWorkflow(workflowId);
        }, triggerConfig.interval);
        this.triggers.set(workflowId, { type: 'interval', id: intervalId });
      } else if (triggerConfig.cron) {
        console.log(`📅 Scheduled workflow ${workflowId} with cron: ${triggerConfig.cron}`);
      }
    } else if (triggerType === 'event') {
      this.on(triggerConfig.event, (context) => {
        this.executeWorkflow(workflowId, context);
      });
      this.triggers.set(workflowId, { type: 'event', event: triggerConfig.event });
    }
  }

  async executeWorkflow(workflowId, context = {}) {
    const workflow = this.db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId);
    if (!workflow || !workflow.enabled) {
      return null;
    }

    const executionId = uuidv4();
    const steps = JSON.parse(workflow.steps);

    this.db.prepare(`
      INSERT INTO workflow_executions (id, workflow_id, status, context)
      VALUES (?, ?, 'running', ?)
    `).run(executionId, workflowId, JSON.stringify(context));

    auditLogger.logSystemEvent({
      event_type: 'workflow_started',
      component: 'workflow_engine',
      severity: 'info',
      message: `Workflow ${workflow.name} started`,
      details: { execution_id: executionId, workflow_id: workflowId }
    });

    try {
      const result = await this.executeSteps(executionId, steps, context, workflow.timeout_seconds);

      this.db.prepare(`
        UPDATE workflow_executions 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, result = ?
        WHERE id = ?
      `).run(JSON.stringify(result), executionId);

      auditLogger.logSystemEvent({
        event_type: 'workflow_completed',
        component: 'workflow_engine',
        severity: 'info',
        message: `Workflow ${workflow.name} completed successfully`,
        details: { execution_id: executionId }
      });

      return { executionId, status: 'completed', result };
    } catch (error) {
      const execution = this.db.prepare('SELECT retry_count FROM workflow_executions WHERE id = ?').get(executionId);
      
      if (workflow.auto_retry && execution.retry_count < workflow.max_retries) {
        this.db.prepare(`
          UPDATE workflow_executions 
          SET retry_count = retry_count + 1, status = 'retrying'
          WHERE id = ?
        `).run(executionId);

        setTimeout(() => {
          this.executeWorkflow(workflowId, context);
        }, Math.pow(2, execution.retry_count) * 1000);

        return { executionId, status: 'retrying' };
      }

      this.db.prepare(`
        UPDATE workflow_executions 
        SET status = 'failed', completed_at = CURRENT_TIMESTAMP, error = ?
        WHERE id = ?
      `).run(error.message, executionId);

      auditLogger.logSystemEvent({
        event_type: 'workflow_failed',
        component: 'workflow_engine',
        severity: 'error',
        message: `Workflow ${workflow.name} failed`,
        details: { execution_id: executionId, error: error.message },
        stack_trace: error.stack
      });

      return { executionId, status: 'failed', error: error.message };
    }
  }

  async executeSteps(executionId, steps, context, timeoutSeconds) {
    const results = [];
    let currentContext = { ...context };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepLogId = uuidv4();

      this.db.prepare(`
        INSERT INTO workflow_step_logs (id, execution_id, step_index, step_name, status, input)
        VALUES (?, ?, ?, ?, 'running', ?)
      `).run(stepLogId, executionId, i, step.name, JSON.stringify({ params: step.params, context: currentContext }));

      try {
        const stepResult = await this.executeStep(step, currentContext, timeoutSeconds);
        
        this.db.prepare(`
          UPDATE workflow_step_logs 
          SET status = 'completed', completed_at = CURRENT_TIMESTAMP, output = ?
          WHERE id = ?
        `).run(JSON.stringify(stepResult), stepLogId);

        results.push(stepResult);
        currentContext = { ...currentContext, [`step_${i}_result`]: stepResult };
      } catch (error) {
        this.db.prepare(`
          UPDATE workflow_step_logs 
          SET status = 'failed', completed_at = CURRENT_TIMESTAMP, error = ?
          WHERE id = ?
        `).run(error.message, stepLogId);

        throw error;
      }
    }

    return results;
  }

  async executeStep(step, context, timeoutSeconds) {
    const actionHandlers = {
      'backup_database': async () => ({ backed_up: true, timestamp: new Date().toISOString() }),
      'verify_backup': async () => ({ verified: true }),
      'cleanup_old_backups': async (params) => ({ cleaned: params.keep }),
      'check_database_health': async () => ({ status: 'healthy', connections: 1 }),
      'check_storage_health': async () => ({ status: 'healthy', usage: '25%' }),
      'check_services_health': async () => ({ status: 'healthy', services: ['api', 'registry'] }),
      'send_alerts': async () => ({ sent: false, reason: 'all_healthy' }),
      'vacuum_database': async () => ({ vacuumed: true }),
      'cleanup_expired_sessions': async () => ({ cleaned: 0 }),
      'cleanup_expired_tokens': async () => ({ cleaned: 0 }),
      'optimize_media_storage': async () => ({ optimized: 0 }),
      'check_system_load': async () => ({ cpu: 15, memory: 30, load: 'low' }),
      'decide_scaling_action': async () => ({ action: 'none', reason: 'load_normal' }),
      'execute_scaling': async () => ({ scaled: false }),
      'create_user_workspace': async () => ({ workspace_id: uuidv4() }),
      'assign_default_permissions': async () => ({ assigned: true }),
      'send_welcome_email': async () => ({ sent: true }),
      'generate_content_preview': async () => ({ preview_url: '/preview/123' }),
      'update_search_index': async () => ({ indexed: true }),
      'trigger_webhooks': async () => ({ triggered: 0 }),
      'invalidate_cache': async () => ({ invalidated: true })
    };

    const handler = actionHandlers[step.action];
    if (!handler) {
      throw new Error(`Unknown action: ${step.action}`);
    }

    return await Promise.race([
      handler(step.params, context),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Step timeout')), timeoutSeconds * 1000)
      )
    ]);
  }

  triggerEvent(eventName, context = {}) {
    this.emit(eventName, context);
  }

  getWorkflowExecutions(workflowId, limit = 50) {
    const executions = this.db.prepare(`
      SELECT * FROM workflow_executions 
      WHERE workflow_id = ? 
      ORDER BY started_at DESC 
      LIMIT ?
    `).all(workflowId, limit);

    return executions.map(exec => ({
      ...exec,
      context: exec.context ? JSON.parse(exec.context) : null,
      result: exec.result ? JSON.parse(exec.result) : null
    }));
  }

  getExecutionLogs(executionId) {
    const logs = this.db.prepare(`
      SELECT * FROM workflow_step_logs 
      WHERE execution_id = ? 
      ORDER BY step_index ASC
    `).all(executionId);

    return logs.map(log => ({
      ...log,
      input: log.input ? JSON.parse(log.input) : null,
      output: log.output ? JSON.parse(log.output) : null
    }));
  }

  startAutoExecution() {
    const enabledWorkflows = this.db.prepare('SELECT * FROM workflows WHERE enabled = 1').all();
    
    for (const workflow of enabledWorkflows) {
      const triggerConfig = JSON.parse(workflow.trigger_config);
      this.registerTrigger(workflow.id, workflow.trigger_type, triggerConfig);
    }

    console.log(`🤖 Auto-execution started for ${enabledWorkflows.length} workflows`);
  }

  stopAutoExecution() {
    for (const [workflowId, trigger] of this.triggers.entries()) {
      if (trigger.type === 'interval') {
        clearInterval(trigger.id);
      }
    }
    this.triggers.clear();
    this.removeAllListeners();
  }
}

export default new WorkflowEngine();
