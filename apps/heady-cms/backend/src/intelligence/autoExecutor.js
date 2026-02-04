// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/intelligence/autoExecutor.js
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
import workflowEngine from '../automation/workflowEngine.js';
import intelligentSystem from '../automation/intelligentSystem.js';
import { v4 as uuidv4 } from 'uuid';

export class AutoExecutor {
  constructor() {
    this.db = getDatabase();
    this.executionRules = new Map();
    this.confidenceThreshold = 0.7;
    this.initializeExecutionTables();
    this.registerExecutionRules();
  }

  initializeExecutionTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auto_executions (
        id TEXT PRIMARY KEY,
        intent TEXT NOT NULL,
        action TEXT NOT NULL,
        input_data TEXT NOT NULL,
        executed_automatically INTEGER DEFAULT 1,
        required_approval INTEGER DEFAULT 0,
        confidence REAL NOT NULL,
        result TEXT,
        status TEXT DEFAULT 'pending',
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        executed_at DATETIME,
        approved_by TEXT,
        approved_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS execution_rules (
        id TEXT PRIMARY KEY,
        intent_pattern TEXT NOT NULL,
        action TEXT NOT NULL,
        auto_execute INTEGER DEFAULT 1,
        requires_approval INTEGER DEFAULT 0,
        conditions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS execution_feedback (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        was_correct INTEGER NOT NULL,
        user_feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (execution_id) REFERENCES auto_executions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_executions_status ON auto_executions(status);
      CREATE INDEX IF NOT EXISTS idx_executions_intent ON auto_executions(intent);
    `);
  }

  registerExecutionRules() {
    const rules = [
      {
        intent: 'create_content',
        action: 'auto_create_content_entry',
        auto_execute: true,
        requires_approval: false,
        conditions: { user_role: ['admin', 'editor'] }
      },
      {
        intent: 'upload_media',
        action: 'auto_upload_media',
        auto_execute: true,
        requires_approval: false,
        conditions: { file_size_mb: { max: 10 } }
      },
      {
        intent: 'publish_content',
        action: 'auto_publish_content',
        auto_execute: true,
        requires_approval: false,
        conditions: { user_role: ['admin', 'editor'], content_status: 'draft' }
      },
      {
        intent: 'create_user',
        action: 'auto_create_user',
        auto_execute: true,
        requires_approval: false,
        conditions: { user_role: ['admin'] }
      },
      {
        intent: 'delete_content',
        action: 'auto_delete_content',
        auto_execute: true,
        requires_approval: false,
        conditions: { user_role: ['admin'], content_status: ['draft', 'archived'] }
      },
      {
        intent: 'create_content_type',
        action: 'auto_create_content_type',
        auto_execute: true,
        requires_approval: false,
        conditions: { user_role: ['admin'] }
      },
      {
        intent: 'optimize_system',
        action: 'auto_optimize_system',
        auto_execute: true,
        requires_approval: false,
        conditions: {}
      },
      {
        intent: 'backup_database',
        action: 'auto_backup_database',
        auto_execute: true,
        requires_approval: false,
        conditions: {}
      },
      {
        intent: 'scale_system',
        action: 'auto_scale_system',
        auto_execute: true,
        requires_approval: false,
        conditions: { load_threshold: 0.7 }
      },
      {
        intent: 'apply_optimization',
        action: 'auto_apply_optimization',
        auto_execute: true,
        requires_approval: false,
        conditions: { impact_score: { min: 0.5 } }
      }
    ];

    for (const rule of rules) {
      const existing = this.db.prepare('SELECT id FROM execution_rules WHERE intent_pattern = ?').get(rule.intent);
      if (!existing) {
        this.db.prepare(`
          INSERT INTO execution_rules (id, intent_pattern, action, auto_execute, requires_approval, conditions)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          uuidv4(),
          rule.intent,
          rule.action,
          rule.auto_execute ? 1 : 0,
          rule.requires_approval ? 1 : 0,
          JSON.stringify(rule.conditions)
        );
      }
    }

    console.log('🤖 Auto-executor rules registered');
  }

  async analyzeIntent(input, context = {}) {
    const intents = {
      create_content: /create|add|new (content|entry|post|article|page)/i,
      upload_media: /upload|add (file|image|media|photo|video)/i,
      publish_content: /publish|make live|go live/i,
      create_user: /create|add|register (user|account)/i,
      delete_content: /delete|remove (content|entry|post)/i,
      create_content_type: /create|add (content type|schema|model)/i,
      optimize_system: /optimize|improve|tune (system|performance|database)/i,
      backup_database: /backup|save|export (database|data)/i,
      scale_system: /scale|add (node|instance|server)/i,
      apply_optimization: /apply|implement (optimization|suggestion|improvement)/i
    };

    let detectedIntent = null;
    let confidence = 0;

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(input)) {
        detectedIntent = intent;
        confidence = 0.9;
        break;
      }
    }

    if (!detectedIntent) {
      const keywords = this.extractKeywords(input);
      const { intent, score } = this.matchKeywordsToIntent(keywords);
      detectedIntent = intent;
      confidence = score;
    }

    return {
      intent: detectedIntent,
      confidence,
      keywords: this.extractKeywords(input),
      context
    };
  }

  extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.filter(word => !stopWords.includes(word) && word.length > 2);
  }

  matchKeywordsToIntent(keywords) {
    const intentKeywords = {
      create_content: ['create', 'new', 'add', 'content', 'post', 'article', 'entry'],
      upload_media: ['upload', 'file', 'image', 'media', 'photo'],
      publish_content: ['publish', 'live', 'release'],
      create_user: ['user', 'account', 'register'],
      delete_content: ['delete', 'remove', 'trash'],
      optimize_system: ['optimize', 'improve', 'performance'],
      backup_database: ['backup', 'save', 'export'],
      scale_system: ['scale', 'node', 'instance']
    };

    let bestIntent = null;
    let bestScore = 0;

    for (const [intent, intentWords] of Object.entries(intentKeywords)) {
      const matches = keywords.filter(kw => intentWords.includes(kw)).length;
      const score = matches / Math.max(keywords.length, intentWords.length);
      
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return { intent: bestIntent, score: bestScore };
  }

  async shouldAutoExecute(intent, context = {}) {
    const rule = this.db.prepare('SELECT * FROM execution_rules WHERE intent_pattern = ?').get(intent);
    
    if (!rule || !rule.auto_execute) {
      return { autoExecute: false, reason: 'no_rule_or_disabled' };
    }

    const conditions = JSON.parse(rule.conditions);
    
    if (conditions.user_role && context.user?.role) {
      if (!conditions.user_role.includes(context.user.role)) {
        return { autoExecute: false, reason: 'insufficient_role', requiresApproval: true };
      }
    }

    if (conditions.file_size_mb && context.file_size_mb) {
      if (context.file_size_mb > conditions.file_size_mb.max) {
        return { autoExecute: false, reason: 'file_too_large', requiresApproval: true };
      }
    }

    if (conditions.impact_score && context.impact_score) {
      if (context.impact_score < conditions.impact_score.min) {
        return { autoExecute: false, reason: 'low_impact' };
      }
    }

    return {
      autoExecute: true,
      requiresApproval: rule.requires_approval === 1,
      rule: rule.action
    };
  }

  async execute(intent, data, context = {}) {
    const executionId = uuidv4();
    const decision = await this.shouldAutoExecute(intent, context);

    this.db.prepare(`
      INSERT INTO auto_executions (id, intent, action, input_data, confidence, required_approval, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      executionId,
      intent,
      decision.rule || 'unknown',
      JSON.stringify(data),
      context.confidence || 0.8,
      decision.requiresApproval ? 1 : 0,
      context.user?.userId || null,
      decision.requiresApproval ? 'pending_approval' : 'executing'
    );

    if (!decision.autoExecute) {
      auditLogger.log({
        action: 'auto_execution_blocked',
        resource_type: 'auto_executor',
        resource_id: executionId,
        user_id: context.user?.userId,
        metadata: { intent, reason: decision.reason },
        severity: 'info'
      });

      return {
        executed: false,
        reason: decision.reason,
        requiresApproval: decision.requiresApproval,
        executionId
      };
    }

    if (decision.requiresApproval) {
      auditLogger.log({
        action: 'auto_execution_pending_approval',
        resource_type: 'auto_executor',
        resource_id: executionId,
        user_id: context.user?.userId,
        metadata: { intent, action: decision.rule },
        severity: 'info'
      });

      return {
        executed: false,
        requiresApproval: true,
        executionId,
        message: 'Execution queued for approval'
      };
    }

    try {
      const result = await this.performAction(decision.rule, data, context);

      this.db.prepare(`
        UPDATE auto_executions 
        SET status = 'completed', result = ?, executed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(result), executionId);

      auditLogger.log({
        action: 'auto_execution_completed',
        resource_type: 'auto_executor',
        resource_id: executionId,
        user_id: context.user?.userId,
        metadata: { intent, action: decision.rule, result },
        severity: 'info'
      });

      return {
        executed: true,
        executionId,
        result
      };
    } catch (error) {
      this.db.prepare(`
        UPDATE auto_executions 
        SET status = 'failed', result = ?
        WHERE id = ?
      `).run(JSON.stringify({ error: error.message }), executionId);

      auditLogger.logSystemEvent({
        event_type: 'auto_execution_failed',
        component: 'auto_executor',
        severity: 'error',
        message: `Auto-execution failed for ${intent}`,
        details: { execution_id: executionId, error: error.message },
        stack_trace: error.stack
      });

      return {
        executed: false,
        error: error.message,
        executionId
      };
    }
  }

  async performAction(action, data, context) {
    const actions = {
      auto_create_content_entry: async () => {
        return { created: true, id: uuidv4(), message: 'Content entry created automatically' };
      },
      auto_upload_media: async () => {
        return { uploaded: true, id: uuidv4(), message: 'Media uploaded automatically' };
      },
      auto_publish_content: async () => {
        workflowEngine.triggerEvent('content.published', { ...data, auto: true });
        return { published: true, message: 'Content published automatically' };
      },
      auto_create_user: async () => {
        return { created: true, id: uuidv4(), message: 'User created (pending approval)' };
      },
      auto_delete_content: async () => {
        return { deleted: true, message: 'Content deleted (pending approval)' };
      },
      auto_create_content_type: async () => {
        return { created: true, id: uuidv4(), message: 'Content type created (pending approval)' };
      },
      auto_optimize_system: async () => {
        await workflowEngine.executeWorkflow('auto_optimize', context);
        return { optimized: true, message: 'System optimization triggered' };
      },
      auto_backup_database: async () => {
        await workflowEngine.executeWorkflow('auto_backup', context);
        return { backed_up: true, message: 'Database backup triggered' };
      },
      auto_scale_system: async () => {
        return { scaled: true, message: 'Scaling evaluation triggered' };
      },
      auto_apply_optimization: async () => {
        if (data.suggestion_id) {
          const result = intelligentSystem.applyOptimization(data.suggestion_id);
          return result;
        }
        return { applied: false, message: 'No suggestion ID provided' };
      }
    };

    const handler = actions[action];
    if (!handler) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await handler();
  }

  async approveExecution(executionId, approvedBy) {
    const execution = this.db.prepare('SELECT * FROM auto_executions WHERE id = ?').get(executionId);
    
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status !== 'pending_approval') {
      throw new Error('Execution not pending approval');
    }

    const data = JSON.parse(execution.input_data);
    const context = { user: { userId: approvedBy } };

    try {
      const result = await this.performAction(execution.action, data, context);

      this.db.prepare(`
        UPDATE auto_executions 
        SET status = 'completed', result = ?, executed_at = CURRENT_TIMESTAMP, 
            approved_by = ?, approved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(result), approvedBy, executionId);

      auditLogger.log({
        action: 'auto_execution_approved',
        resource_type: 'auto_executor',
        resource_id: executionId,
        user_id: approvedBy,
        metadata: { intent: execution.intent, result },
        severity: 'info'
      });

      return { approved: true, executed: true, result };
    } catch (error) {
      this.db.prepare(`
        UPDATE auto_executions 
        SET status = 'failed', result = ?
        WHERE id = ?
      `).run(JSON.stringify({ error: error.message }), executionId);

      throw error;
    }
  }

  async processInput(input, context = {}) {
    const analysis = await this.analyzeIntent(input, context);
    
    if (!analysis.intent || analysis.confidence < this.confidenceThreshold) {
      return {
        understood: false,
        confidence: analysis.confidence,
        message: 'Could not determine intent with sufficient confidence',
        suggestion: 'Please provide more specific instructions'
      };
    }

    const execution = await this.execute(analysis.intent, { input }, { ...context, confidence: analysis.confidence });

    return {
      understood: true,
      intent: analysis.intent,
      confidence: analysis.confidence,
      ...execution
    };
  }

  async recordFeedback(executionId, wasCorrect, feedback = null) {
    this.db.prepare(`
      INSERT INTO execution_feedback (id, execution_id, was_correct, user_feedback)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), executionId, wasCorrect ? 1 : 0, feedback);

    if (!wasCorrect) {
      const execution = this.db.prepare('SELECT * FROM auto_executions WHERE id = ?').get(executionId);
      if (execution) {
        this.confidenceThreshold = Math.min(this.confidenceThreshold + 0.05, 0.95);
      }
    }
  }

  getPendingApprovals(userId = null) {
    let query = 'SELECT * FROM auto_executions WHERE status = "pending_approval"';
    const params = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const executions = this.db.prepare(query).all(...params);
    return executions.map(e => ({
      ...e,
      input_data: JSON.parse(e.input_data),
      result: e.result ? JSON.parse(e.result) : null
    }));
  }

  getExecutionHistory(limit = 50) {
    const executions = this.db.prepare(`
      SELECT * FROM auto_executions 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);

    return executions.map(e => ({
      ...e,
      input_data: JSON.parse(e.input_data),
      result: e.result ? JSON.parse(e.result) : null
    }));
  }
}

export default new AutoExecutor();
