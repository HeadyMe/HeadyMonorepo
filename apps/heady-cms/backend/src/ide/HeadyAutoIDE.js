// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/ide/HeadyAutoIDE.js
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

import { getDatabase } from '../database/index.js';
import auditLogger from '../audit/index.js';
import patternRecognizer from '../patterns/recognizer.js';
import autoExecutor from '../intelligence/autoExecutor.js';
import intentRouter from '../intelligence/intentRouter.js';
import { v4 as uuidv4 } from 'uuid';

export class HeadyAutoIDE {
  constructor() {
    this.db = getDatabase();
    this.autoApprovalEnabled = true;
    this.safeOperations = new Set();
    this.initializeIDETables();
    this.registerSafeOperations();
  }

  initializeIDETables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ide_operations (
        id TEXT PRIMARY KEY,
        operation_type TEXT NOT NULL,
        command TEXT,
        file_path TEXT,
        auto_approved INTEGER DEFAULT 0,
        executed INTEGER DEFAULT 0,
        result TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ide_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS safe_commands (
        id TEXT PRIMARY KEY,
        command_pattern TEXT UNIQUE NOT NULL,
        description TEXT,
        auto_approve INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_operations_type ON ide_operations(operation_type);
    `);

    this.initializeSettings();
  }

  initializeSettings() {
    const defaultSettings = {
      auto_approval_enabled: 'true',
      auto_commit_enabled: 'true',
      auto_push_enabled: 'true',
      safe_mode: 'false',
      pattern_recognition_enabled: 'true'
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      const existing = this.db.prepare('SELECT * FROM ide_settings WHERE key = ?').get(key);
      if (!existing) {
        this.db.prepare('INSERT INTO ide_settings (key, value) VALUES (?, ?)').run(key, value);
      }
    }
  }

  registerSafeOperations() {
    const safeCommands = [
      { pattern: '^git status', description: 'Check git status' },
      { pattern: '^git log', description: 'View git history' },
      { pattern: '^git diff', description: 'View changes' },
      { pattern: '^git add', description: 'Stage files' },
      { pattern: '^git commit', description: 'Commit changes' },
      { pattern: '^git push', description: 'Push to remote' },
      { pattern: '^npm install', description: 'Install dependencies' },
      { pattern: '^npm update', description: 'Update dependencies' },
      { pattern: '^npm run', description: 'Run npm scripts' },
      { pattern: '^node ', description: 'Run node scripts' },
      { pattern: '^mkdir', description: 'Create directory' },
      { pattern: '^ls', description: 'List files' },
      { pattern: '^dir', description: 'List files (Windows)' },
      { pattern: '^cat', description: 'Read file' },
      { pattern: '^type', description: 'Read file (Windows)' }
    ];

    for (const cmd of safeCommands) {
      const existing = this.db.prepare('SELECT * FROM safe_commands WHERE command_pattern = ?').get(cmd.pattern);
      if (!existing) {
        this.db.prepare(`
          INSERT INTO safe_commands (id, command_pattern, description)
          VALUES (?, ?, ?)
        `).run(uuidv4(), cmd.pattern, cmd.description);
        this.safeOperations.add(cmd.pattern);
      }
    }

    console.log('🔧 HeadyAutoIDE: Safe operations registered');
  }

  isSafeOperation(command) {
    for (const pattern of this.safeOperations) {
      if (new RegExp(pattern).test(command)) {
        return true;
      }
    }

    const destructivePatterns = [
      /rm -rf/,
      /del \/s/,
      /format/,
      /shutdown/,
      /reboot/
    ];

    return !destructivePatterns.some(pattern => pattern.test(command));
  }

  async processIDERequest(request, context = {}) {
    const operationId = uuidv4();

    const patternAnalysis = patternRecognizer.analyzeInput(
      request.input || request.command || '',
      context
    );

    const autoApprove = this.shouldAutoApprove(request, patternAnalysis);

    this.db.prepare(`
      INSERT INTO ide_operations (id, operation_type, command, file_path, auto_approved)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      operationId,
      request.type || 'command',
      request.command || null,
      request.file_path || null,
      autoApprove ? 1 : 0
    );

    if (!autoApprove) {
      return {
        approved: false,
        operation_id: operationId,
        reason: 'requires_manual_approval',
        message: 'Operation requires manual approval for safety'
      };
    }

    try {
      const result = await this.executeOperation(request, context);

      this.db.prepare(`
        UPDATE ide_operations 
        SET executed = 1, result = ?
        WHERE id = ?
      `).run(JSON.stringify(result), operationId);

      auditLogger.log({
        action: 'ide_operation_executed',
        resource_type: 'ide_operations',
        resource_id: operationId,
        metadata: {
          operation_type: request.type,
          auto_approved: true,
          pattern_analysis: patternAnalysis
        },
        severity: 'info'
      });

      return {
        approved: true,
        executed: true,
        operation_id: operationId,
        result
      };
    } catch (error) {
      this.db.prepare(`
        UPDATE ide_operations 
        SET result = ?
        WHERE id = ?
      `).run(JSON.stringify({ error: error.message }), operationId);

      return {
        approved: true,
        executed: false,
        error: error.message
      };
    }
  }

  shouldAutoApprove(request, patternAnalysis) {
    const setting = this.db.prepare('SELECT value FROM ide_settings WHERE key = ?').get('auto_approval_enabled');
    if (!setting || setting.value !== 'true') {
      return false;
    }

    if (request.type === 'command' && request.command) {
      return this.isSafeOperation(request.command);
    }

    if (request.type === 'file_write' || request.type === 'file_create') {
      return true;
    }

    if (request.type === 'git_operation') {
      return true;
    }

    if (patternAnalysis.highest_urgency >= 8) {
      return true;
    }

    return false;
  }

  async executeOperation(request, context) {
    if (request.type === 'command') {
      return { executed: true, type: 'command', command: request.command };
    }

    if (request.type === 'natural_language') {
      const result = await intentRouter.processRequest(request.input, context);
      return result;
    }

    if (request.type === 'file_write') {
      return { executed: true, type: 'file_write', path: request.file_path };
    }

    return { executed: true, type: request.type };
  }

  async handleNaturalLanguageInput(input, context = {}) {
    const patternAnalysis = patternRecognizer.analyzeInput(input, context);

    if (patternAnalysis.requires_immediate_action) {
      auditLogger.logSystemEvent({
        event_type: 'critical_pattern_detected',
        component: 'heady_auto_ide',
        severity: 'high',
        message: 'Critical pattern detected - executing with highest priority',
        details: { pattern_analysis: patternAnalysis }
      });
    }

    const result = await intentRouter.processRequest(input, {
      ...context,
      pattern_analysis: patternAnalysis,
      priority: patternAnalysis.highest_urgency >= 8 ? 'critical' : 'normal'
    });

    return {
      ...result,
      pattern_analysis: {
        patterns: patternAnalysis.patterns.length,
        urgency: patternAnalysis.highest_urgency,
        immediate_action: patternAnalysis.requires_immediate_action
      }
    };
  }

  getSetting(key) {
    const setting = this.db.prepare('SELECT value FROM ide_settings WHERE key = ?').get(key);
    return setting ? setting.value : null;
  }

  setSetting(key, value) {
    this.db.prepare(`
      INSERT OR REPLACE INTO ide_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, value);

    if (key === 'auto_approval_enabled') {
      this.autoApprovalEnabled = value === 'true';
    }

    return { key, value };
  }

  getStatistics() {
    return {
      total_operations: this.db.prepare('SELECT COUNT(*) as count FROM ide_operations').get().count,
      auto_approved: this.db.prepare('SELECT COUNT(*) as count FROM ide_operations WHERE auto_approved = 1').get().count,
      executed: this.db.prepare('SELECT COUNT(*) as count FROM ide_operations WHERE executed = 1').get().count,
      safe_commands: this.db.prepare('SELECT COUNT(*) as count FROM safe_commands').get().count,
      auto_approval_enabled: this.autoApprovalEnabled,
      auto_approval_rate: this.calculateAutoApprovalRate()
    };
  }

  calculateAutoApprovalRate() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM ide_operations').get().count;
    const approved = this.db.prepare('SELECT COUNT(*) as count FROM ide_operations WHERE auto_approved = 1').get().count;
    
    return total > 0 ? ((approved / total) * 100).toFixed(2) : 0;
  }

  isReady() {
    return {
      ready: true,
      version: '1.0.0',
      features: {
        auto_approval: this.autoApprovalEnabled,
        pattern_recognition: true,
        natural_language: true,
        auto_execution: true,
        safe_operations: this.safeOperations.size,
        elevated_status: true
      },
      statistics: this.getStatistics()
    };
  }
}

export default new HeadyAutoIDE();
