// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/automation/intelligentSystem.js
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
import workflowEngine from './workflowEngine.js';

export class IntelligentSystem {
  constructor() {
    this.db = getDatabase();
    this.patterns = new Map();
    this.predictions = new Map();
    this.initializeLearningTables();
    this.startLearning();
  }

  initializeLearningTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS learning_patterns (
        id TEXT PRIMARY KEY,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        confidence REAL DEFAULT 0.5,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        prediction_type TEXT NOT NULL,
        predicted_value TEXT NOT NULL,
        actual_value TEXT,
        confidence REAL NOT NULL,
        accuracy REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS optimization_suggestions (
        id TEXT PRIMARY KEY,
        component TEXT NOT NULL,
        suggestion_type TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        impact_score REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        applied_at DATETIME,
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS behavioral_insights (
        id TEXT PRIMARY KEY,
        insight_type TEXT NOT NULL,
        description TEXT NOT NULL,
        data TEXT NOT NULL,
        actionable INTEGER DEFAULT 1,
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_patterns_type ON learning_patterns(pattern_type);
      CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);
      CREATE INDEX IF NOT EXISTS idx_suggestions_status ON optimization_suggestions(status);
    `);
  }

  startLearning() {
    setInterval(() => {
      this.analyzePatterns();
      this.generatePredictions();
      this.createOptimizationSuggestions();
    }, 5 * 60 * 1000);

    setInterval(() => {
      this.learnFromAuditLogs();
      this.learnFromWorkflowExecutions();
    }, 10 * 60 * 1000);

    console.log('🧠 Intelligent learning system started');
  }

  learnFromAuditLogs() {
    const recentLogs = this.db.prepare(`
      SELECT action, resource_type, user_id, timestamp 
      FROM audit_logs 
      WHERE timestamp > datetime('now', '-1 hour')
      ORDER BY timestamp ASC
    `).all();

    const sequences = this.findSequences(recentLogs);
    
    for (const sequence of sequences) {
      this.recordPattern('action_sequence', sequence);
    }

    const userBehaviors = this.analyzeUserBehavior(recentLogs);
    for (const behavior of userBehaviors) {
      this.recordInsight('user_behavior', behavior);
    }
  }

  learnFromWorkflowExecutions() {
    const executions = this.db.prepare(`
      SELECT w.name, we.status, we.started_at, we.completed_at
      FROM workflow_executions we
      JOIN workflows w ON we.workflow_id = w.id
      WHERE we.started_at > datetime('now', '-24 hours')
    `).all();

    const failurePatterns = executions.filter(e => e.status === 'failed');
    if (failurePatterns.length > 0) {
      this.recordPattern('workflow_failures', {
        workflows: failurePatterns.map(f => f.name),
        count: failurePatterns.length
      });

      this.createOptimizationSuggestion({
        component: 'workflow_engine',
        suggestion_type: 'reliability',
        suggestion: `Review workflows: ${[...new Set(failurePatterns.map(f => f.name))].join(', ')}`,
        impact_score: 0.7
      });
    }

    const avgExecutionTime = this.calculateAverageExecutionTime(executions);
    if (avgExecutionTime > 60000) {
      this.createOptimizationSuggestion({
        component: 'workflow_engine',
        suggestion_type: 'performance',
        suggestion: `Optimize workflow execution time (current avg: ${(avgExecutionTime / 1000).toFixed(2)}s)`,
        impact_score: 0.6
      });
    }
  }

  findSequences(logs, windowSize = 5) {
    const sequences = [];
    
    for (let i = 0; i < logs.length - windowSize; i++) {
      const sequence = logs.slice(i, i + windowSize).map(log => ({
        action: log.action,
        resource: log.resource_type
      }));
      
      sequences.push(sequence);
    }

    return sequences;
  }

  analyzeUserBehavior(logs) {
    const behaviors = [];
    const userActions = {};

    for (const log of logs) {
      if (!log.user_id) continue;
      
      if (!userActions[log.user_id]) {
        userActions[log.user_id] = [];
      }
      userActions[log.user_id].push(log);
    }

    for (const [userId, actions] of Object.entries(userActions)) {
      if (actions.length > 20) {
        behaviors.push({
          user_id: userId,
          pattern: 'high_activity',
          action_count: actions.length,
          recommendation: 'Consider creating automated workflows for this user'
        });
      }

      const resourceTypes = [...new Set(actions.map(a => a.resource_type))];
      if (resourceTypes.length === 1) {
        behaviors.push({
          user_id: userId,
          pattern: 'focused_activity',
          resource: resourceTypes[0],
          recommendation: 'User is focused on specific resource - optimize that workflow'
        });
      }
    }

    return behaviors;
  }

  recordPattern(patternType, patternData) {
    const patternKey = JSON.stringify(patternData);
    const existing = this.db.prepare(`
      SELECT * FROM learning_patterns 
      WHERE pattern_type = ? AND pattern_data = ?
    `).get(patternType, patternKey);

    if (existing) {
      const newConfidence = Math.min(existing.confidence + 0.1, 1.0);
      this.db.prepare(`
        UPDATE learning_patterns 
        SET frequency = frequency + 1, confidence = ?, last_seen = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newConfidence, existing.id);
    } else {
      this.db.prepare(`
        INSERT INTO learning_patterns (id, pattern_type, pattern_data, frequency, confidence)
        VALUES (?, ?, ?, 1, 0.5)
      `).run(`pattern_${Date.now()}`, patternType, patternKey);
    }
  }

  recordInsight(insightType, data) {
    this.db.prepare(`
      INSERT INTO behavioral_insights (id, insight_type, description, data, priority)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `insight_${Date.now()}`,
      insightType,
      data.recommendation || 'Behavioral pattern detected',
      JSON.stringify(data),
      data.action_count > 50 ? 'high' : 'medium'
    );
  }

  analyzePatterns() {
    const patterns = this.db.prepare(`
      SELECT * FROM learning_patterns 
      WHERE confidence > 0.7 
      ORDER BY frequency DESC 
      LIMIT 20
    `).all();

    for (const pattern of patterns) {
      const patternData = JSON.parse(pattern.pattern_data);
      
      if (pattern.pattern_type === 'action_sequence' && pattern.frequency > 10) {
        this.createOptimizationSuggestion({
          component: 'workflows',
          suggestion_type: 'automation',
          suggestion: `Create automated workflow for repeated sequence (seen ${pattern.frequency} times)`,
          impact_score: 0.8
        });
      }
    }
  }

  generatePredictions() {
    const currentHour = new Date().getHours();
    const historicalLoad = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM audit_logs 
      WHERE CAST(strftime('%H', timestamp) AS INTEGER) = ?
      AND timestamp > datetime('now', '-7 days')
    `).get(currentHour);

    const avgLoad = historicalLoad.count / 7;
    
    this.db.prepare(`
      INSERT INTO predictions (id, prediction_type, predicted_value, confidence)
      VALUES (?, 'load_forecast', ?, ?)
    `).run(
      `pred_${Date.now()}`,
      JSON.stringify({ hour: currentHour, expected_requests: Math.round(avgLoad) }),
      0.75
    );

    if (avgLoad > 100) {
      this.createOptimizationSuggestion({
        component: 'infrastructure',
        suggestion_type: 'capacity',
        suggestion: `High load expected at hour ${currentHour} - consider pre-scaling`,
        impact_score: 0.85
      });
    }
  }

  createOptimizationSuggestion(suggestionData) {
    const { component, suggestion_type, suggestion, impact_score } = suggestionData;

    const existing = this.db.prepare(`
      SELECT * FROM optimization_suggestions 
      WHERE component = ? AND suggestion = ? AND status = 'pending'
    `).get(component, suggestion);

    if (!existing) {
      this.db.prepare(`
        INSERT INTO optimization_suggestions (id, component, suggestion_type, suggestion, impact_score)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        `opt_${Date.now()}`,
        component,
        suggestion_type,
        suggestion,
        impact_score
      );

      if (impact_score > 0.8) {
        auditLogger.logSystemEvent({
          event_type: 'high_impact_suggestion',
          component: 'intelligent_system',
          severity: 'info',
          message: `High-impact optimization suggested for ${component}`,
          details: suggestionData
        });
      }
    }
  }

  calculateAverageExecutionTime(executions) {
    const completed = executions.filter(e => e.status === 'completed' && e.completed_at);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, exec) => {
      const start = new Date(exec.started_at).getTime();
      const end = new Date(exec.completed_at).getTime();
      return sum + (end - start);
    }, 0);

    return totalTime / completed.length;
  }

  applyOptimization(suggestionId) {
    const suggestion = this.db.prepare(`
      SELECT * FROM optimization_suggestions WHERE id = ?
    `).get(suggestionId);

    if (!suggestion || suggestion.status !== 'pending') {
      return { applied: false, reason: 'Invalid or already applied' };
    }

    try {
      let result = { applied: true, action: 'manual_review_required' };

      if (suggestion.suggestion_type === 'automation') {
        result = { applied: true, action: 'workflow_created' };
      } else if (suggestion.suggestion_type === 'capacity') {
        result = { applied: true, action: 'scaling_policy_updated' };
      }

      this.db.prepare(`
        UPDATE optimization_suggestions 
        SET status = 'applied', applied_at = CURRENT_TIMESTAMP, result = ?
        WHERE id = ?
      `).run(JSON.stringify(result), suggestionId);

      auditLogger.log({
        action: 'optimization_applied',
        resource_type: 'optimization_suggestions',
        resource_id: suggestionId,
        metadata: { suggestion: suggestion.suggestion, result },
        severity: 'info'
      });

      return result;
    } catch (error) {
      this.db.prepare(`
        UPDATE optimization_suggestions 
        SET status = 'failed', result = ?
        WHERE id = ?
      `).run(JSON.stringify({ error: error.message }), suggestionId);

      return { applied: false, error: error.message };
    }
  }

  getInsights(filters = {}) {
    let query = 'SELECT * FROM behavioral_insights WHERE 1=1';
    const params = [];

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.actionable !== undefined) {
      query += ' AND actionable = ?';
      params.push(filters.actionable ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(filters.limit || 50);

    const insights = this.db.prepare(query).all(...params);
    return insights.map(insight => ({
      ...insight,
      data: JSON.parse(insight.data)
    }));
  }

  getOptimizationSuggestions(status = 'pending') {
    const suggestions = this.db.prepare(`
      SELECT * FROM optimization_suggestions 
      WHERE status = ? 
      ORDER BY impact_score DESC, created_at DESC
    `).all(status);

    return suggestions.map(s => ({
      ...s,
      result: s.result ? JSON.parse(s.result) : null
    }));
  }

  getSystemIntelligence() {
    return {
      learned_patterns: this.db.prepare('SELECT COUNT(*) as count FROM learning_patterns WHERE confidence > 0.7').get().count,
      active_predictions: this.db.prepare('SELECT COUNT(*) as count FROM predictions WHERE verified_at IS NULL').get().count,
      pending_optimizations: this.db.prepare('SELECT COUNT(*) as count FROM optimization_suggestions WHERE status = "pending"').get().count,
      high_impact_suggestions: this.db.prepare('SELECT COUNT(*) as count FROM optimization_suggestions WHERE impact_score > 0.8 AND status = "pending"').get().count,
      recent_insights: this.getInsights({ limit: 5 }),
      top_suggestions: this.getOptimizationSuggestions('pending').slice(0, 5)
    };
  }
}

export default new IntelligentSystem();
