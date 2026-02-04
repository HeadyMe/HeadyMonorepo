import { getDatabase } from '../database/index.js';
import auditLogger from '../audit/index.js';
import workflowEngine from '../automation/workflowEngine.js';
import { v4 as uuidv4 } from 'uuid';

export class PatternRecognizer {
  constructor() {
    this.db = getDatabase();
    this.patterns = new Map();
    this.urgencyLevels = new Map();
    this.elevatedStatus = true;
    this.initializePatternTables();
    this.startPatternAnalysis();
  }

  initializePatternTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS detected_patterns (
        id TEXT PRIMARY KEY,
        pattern_type TEXT NOT NULL,
        pattern_signature TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        urgency_level INTEGER DEFAULT 1,
        aggression_score REAL DEFAULT 0.0,
        auto_resolved INTEGER DEFAULT 0,
        resolution_action TEXT,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS pattern_occurrences (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        occurrence_data TEXT NOT NULL,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pattern_id) REFERENCES detected_patterns(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pattern_resolutions (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        resolution_type TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        success INTEGER DEFAULT 1,
        result TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pattern_id) REFERENCES detected_patterns(id)
      );

      CREATE TABLE IF NOT EXISTS urgency_escalations (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        previous_level INTEGER NOT NULL,
        new_level INTEGER NOT NULL,
        reason TEXT NOT NULL,
        auto_action_triggered INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pattern_id) REFERENCES detected_patterns(id)
      );

      CREATE INDEX IF NOT EXISTS idx_patterns_type ON detected_patterns(pattern_type);
      CREATE INDEX IF NOT EXISTS idx_patterns_urgency ON detected_patterns(urgency_level);
      CREATE INDEX IF NOT EXISTS idx_occurrences_pattern ON pattern_occurrences(pattern_id);
      CREATE INDEX IF NOT EXISTS idx_escalations_pattern ON urgency_escalations(pattern_id);
    `);

    console.log('🔍 Pattern recognition system initialized (ELEVATED STATUS)');
  }

  analyzeInput(input, context = {}) {
    const patterns = {
      repeated_request: this.detectRepeatedRequest(input, context),
      error_pattern: this.detectErrorPattern(input, context),
      urgency_escalation: this.detectUrgencyEscalation(input, context),
      frustration: this.detectFrustration(input, context),
      time_pressure: this.detectTimePressure(input, context),
      complexity_increase: this.detectComplexityIncrease(input, context)
    };

    const detectedPatterns = Object.entries(patterns)
      .filter(([_, detected]) => detected.detected)
      .map(([type, data]) => ({ type, ...data }));

    for (const pattern of detectedPatterns) {
      this.recordPattern(pattern, input, context);
    }

    return {
      patterns: detectedPatterns,
      highest_urgency: Math.max(...detectedPatterns.map(p => p.urgency_level || 1), 1),
      requires_immediate_action: detectedPatterns.some(p => p.urgency_level >= 8)
    };
  }

  detectRepeatedRequest(input, context) {
    const recentInputs = this.db.prepare(`
      SELECT occurrence_data FROM pattern_occurrences 
      WHERE timestamp > datetime('now', '-1 hour')
      ORDER BY timestamp DESC
      LIMIT 10
    `).all();

    const inputNormalized = this.normalizeInput(input);
    let repeatCount = 0;

    for (const record of recentInputs) {
      const data = JSON.parse(record.occurrence_data);
      if (this.normalizeInput(data.input) === inputNormalized) {
        repeatCount++;
      }
    }

    if (repeatCount >= 2) {
      return {
        detected: true,
        repeat_count: repeatCount + 1,
        urgency_level: Math.min(3 + repeatCount * 2, 10),
        message: `Request repeated ${repeatCount + 1} times - increasing urgency`,
        auto_action: repeatCount >= 3 ? 'escalate_and_resolve' : 'monitor'
      };
    }

    return { detected: false };
  }

  detectErrorPattern(input, context) {
    const errorKeywords = ['error', 'fail', 'broken', 'not working', 'issue', 'problem', 'bug'];
    const inputLower = input.toLowerCase();
    
    const errorCount = errorKeywords.filter(kw => inputLower.includes(kw)).length;

    if (errorCount > 0) {
      const recentErrors = this.db.prepare(`
        SELECT COUNT(*) as count FROM pattern_occurrences 
        WHERE occurrence_data LIKE '%error%' 
        AND timestamp > datetime('now', '-30 minutes')
      `).get();

      return {
        detected: true,
        error_indicators: errorCount,
        recent_error_count: recentErrors.count,
        urgency_level: Math.min(5 + recentErrors.count, 10),
        auto_action: recentErrors.count >= 3 ? 'trigger_self_healing' : 'log_and_monitor'
      };
    }

    return { detected: false };
  }

  detectUrgencyEscalation(input, context) {
    const urgencyMarkers = {
      low: ['please', 'when you can', 'eventually', 'sometime'],
      medium: ['need', 'want', 'should', 'could'],
      high: ['must', 'required', 'necessary', 'important'],
      critical: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'now']
    };

    const inputLower = input.toLowerCase();
    let detectedLevel = 1;
    let markers = [];

    if (urgencyMarkers.critical.some(m => inputLower.includes(m))) {
      detectedLevel = 10;
      markers = urgencyMarkers.critical.filter(m => inputLower.includes(m));
    } else if (urgencyMarkers.high.some(m => inputLower.includes(m))) {
      detectedLevel = 7;
      markers = urgencyMarkers.high.filter(m => inputLower.includes(m));
    } else if (urgencyMarkers.medium.some(m => inputLower.includes(m))) {
      detectedLevel = 4;
      markers = urgencyMarkers.medium.filter(m => inputLower.includes(m));
    }

    if (detectedLevel >= 7) {
      return {
        detected: true,
        urgency_level: detectedLevel,
        markers,
        auto_action: detectedLevel >= 10 ? 'immediate_execution' : 'prioritize'
      };
    }

    return { detected: false };
  }

  detectFrustration(input, context) {
    const frustrationIndicators = [
      'still', 'again', 'why', 'how many times', 'keep', 'always',
      'never works', 'not working', 'broken', 'frustrated', 'annoying'
    ];

    const inputLower = input.toLowerCase();
    const indicators = frustrationIndicators.filter(ind => inputLower.includes(ind));

    if (indicators.length >= 2) {
      return {
        detected: true,
        frustration_score: indicators.length / frustrationIndicators.length,
        indicators,
        urgency_level: 8,
        auto_action: 'escalate_priority_and_resolve'
      };
    }

    return { detected: false };
  }

  detectTimePressure(input, context) {
    const timePressureWords = ['now', 'immediately', 'asap', 'urgent', 'quick', 'fast', 'hurry'];
    const inputLower = input.toLowerCase();
    
    const pressureCount = timePressureWords.filter(w => inputLower.includes(w)).length;

    if (pressureCount > 0) {
      return {
        detected: true,
        pressure_score: pressureCount / timePressureWords.length,
        urgency_level: 7 + pressureCount,
        auto_action: 'immediate_execution'
      };
    }

    return { detected: false };
  }

  detectComplexityIncrease(input, context) {
    const recentInputs = this.db.prepare(`
      SELECT occurrence_data FROM pattern_occurrences 
      WHERE timestamp > datetime('now', '-30 minutes')
      ORDER BY timestamp DESC
      LIMIT 5
    `).all();

    if (recentInputs.length < 2) {
      return { detected: false };
    }

    const currentComplexity = this.calculateComplexity(input);
    const avgPreviousComplexity = recentInputs
      .map(r => this.calculateComplexity(JSON.parse(r.occurrence_data).input))
      .reduce((sum, c) => sum + c, 0) / recentInputs.length;

    if (currentComplexity > avgPreviousComplexity * 1.5) {
      return {
        detected: true,
        complexity_increase: ((currentComplexity / avgPreviousComplexity - 1) * 100).toFixed(0) + '%',
        urgency_level: 6,
        auto_action: 'break_down_and_execute'
      };
    }

    return { detected: false };
  }

  calculateComplexity(input) {
    const words = input.split(/\s+/).length;
    const sentences = input.split(/[.!?]+/).length;
    const conjunctions = (input.match(/\band\b|\bor\b|\bthen\b/gi) || []).length;
    
    return words + (sentences * 2) + (conjunctions * 3);
  }

  normalizeInput(input) {
    return input.toLowerCase().trim().replace(/[^\w\s]/g, '');
  }

  recordPattern(pattern, input, context) {
    const signature = this.generateSignature(pattern.type, input);
    
    const existing = this.db.prepare(`
      SELECT * FROM detected_patterns 
      WHERE pattern_type = ? AND pattern_signature = ?
    `).get(pattern.type, signature);

    let patternId;

    if (existing) {
      const newFrequency = existing.frequency + 1;
      const newUrgency = this.calculateEscalatedUrgency(
        existing.urgency_level,
        pattern.urgency_level || 1,
        newFrequency
      );

      const aggressionIncrease = this.calculateAggressionScore(
        existing.frequency,
        newFrequency,
        existing.urgency_level,
        newUrgency
      );

      this.db.prepare(`
        UPDATE detected_patterns 
        SET frequency = ?, last_seen = CURRENT_TIMESTAMP, 
            urgency_level = ?, aggression_score = ?,
            metadata = ?
        WHERE id = ?
      `).run(
        newFrequency,
        newUrgency,
        existing.aggression_score + aggressionIncrease,
        JSON.stringify({ ...JSON.parse(existing.metadata || '{}'), last_pattern: pattern }),
        existing.id
      );

      patternId = existing.id;

      if (newUrgency > existing.urgency_level) {
        this.escalateUrgency(existing.id, existing.urgency_level, newUrgency, 'frequency_increase');
      }

      if (existing.aggression_score + aggressionIncrease >= 0.7) {
        this.triggerAggressionResponse(existing.id, existing.aggression_score + aggressionIncrease);
      }
    } else {
      patternId = uuidv4();
      
      this.db.prepare(`
        INSERT INTO detected_patterns (id, pattern_type, pattern_signature, urgency_level, aggression_score, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        patternId,
        pattern.type,
        signature,
        pattern.urgency_level || 1,
        0.0,
        JSON.stringify(pattern)
      );
    }

    this.db.prepare(`
      INSERT INTO pattern_occurrences (id, pattern_id, occurrence_data, context)
      VALUES (?, ?, ?, ?)
    `).run(
      uuidv4(),
      patternId,
      JSON.stringify({ input, pattern }),
      JSON.stringify(context)
    );

    if (pattern.auto_action) {
      this.executeAutoAction(patternId, pattern.auto_action, { input, pattern, context });
    }

    return patternId;
  }

  generateSignature(type, input) {
    const normalized = this.normalizeInput(input);
    const words = normalized.split(/\s+/).slice(0, 5).join('_');
    return `${type}_${words}`;
  }

  calculateEscalatedUrgency(currentUrgency, patternUrgency, frequency) {
    const baseUrgency = Math.max(currentUrgency, patternUrgency);
    const frequencyBonus = Math.floor(frequency / 3);
    
    return Math.min(baseUrgency + frequencyBonus, 10);
  }

  calculateAggressionScore(oldFrequency, newFrequency, oldUrgency, newUrgency) {
    const frequencyRate = (newFrequency - oldFrequency) / Math.max(oldFrequency, 1);
    const urgencyRate = (newUrgency - oldUrgency) / Math.max(oldUrgency, 1);
    
    return (frequencyRate * 0.6 + urgencyRate * 0.4) * 0.1;
  }

  escalateUrgency(patternId, previousLevel, newLevel, reason) {
    const escalationId = uuidv4();

    this.db.prepare(`
      INSERT INTO urgency_escalations (id, pattern_id, previous_level, new_level, reason)
      VALUES (?, ?, ?, ?, ?)
    `).run(escalationId, patternId, previousLevel, newLevel, reason);

    auditLogger.logSystemEvent({
      event_type: 'urgency_escalated',
      component: 'pattern_recognizer',
      severity: newLevel >= 8 ? 'high' : 'warning',
      message: `Pattern urgency escalated from ${previousLevel} to ${newLevel}`,
      details: { pattern_id: patternId, reason, escalation_id: escalationId }
    });

    if (newLevel >= 8) {
      this.db.prepare(`
        UPDATE urgency_escalations 
        SET auto_action_triggered = 1 
        WHERE id = ?
      `).run(escalationId);

      this.triggerHighPriorityResolution(patternId, newLevel);
    }

    return escalationId;
  }

  triggerAggressionResponse(patternId, aggressionScore) {
    const pattern = this.db.prepare('SELECT * FROM detected_patterns WHERE id = ?').get(patternId);
    
    auditLogger.logSystemEvent({
      event_type: 'aggression_detected',
      component: 'pattern_recognizer',
      severity: 'high',
      message: `High aggression score detected: ${aggressionScore.toFixed(2)}`,
      details: {
        pattern_id: patternId,
        pattern_type: pattern.pattern_type,
        frequency: pattern.frequency,
        aggression_score: aggressionScore
      }
    });

    this.executeAutoAction(patternId, 'resolve_aggression', {
      pattern,
      aggression_score: aggressionScore
    });
  }

  async executeAutoAction(patternId, action, data) {
    const actions = {
      'monitor': () => this.monitorPattern(patternId),
      'log_and_monitor': () => this.logAndMonitor(patternId, data),
      'escalate_and_resolve': () => this.escalateAndResolve(patternId, data),
      'trigger_self_healing': () => this.triggerSelfHealing(patternId, data),
      'immediate_execution': () => this.immediateExecution(patternId, data),
      'prioritize': () => this.prioritizePattern(patternId, data),
      'escalate_priority_and_resolve': () => this.escalatePriorityAndResolve(patternId, data),
      'break_down_and_execute': () => this.breakDownAndExecute(patternId, data),
      'resolve_aggression': () => this.resolveAggression(patternId, data)
    };

    const handler = actions[action];
    if (!handler) {
      return { executed: false, reason: 'unknown_action' };
    }

    try {
      const result = await handler();

      this.db.prepare(`
        INSERT INTO pattern_resolutions (id, pattern_id, resolution_type, action_taken, success, result)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(
        uuidv4(),
        patternId,
        action,
        JSON.stringify(result.action || action),
        JSON.stringify(result)
      );

      this.db.prepare(`
        UPDATE detected_patterns 
        SET auto_resolved = 1, resolution_action = ?
        WHERE id = ?
      `).run(action, patternId);

      return result;
    } catch (error) {
      this.db.prepare(`
        INSERT INTO pattern_resolutions (id, pattern_id, resolution_type, action_taken, success, result)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(
        uuidv4(),
        patternId,
        action,
        'failed',
        JSON.stringify({ error: error.message })
      );

      return { executed: false, error: error.message };
    }
  }

  async monitorPattern(patternId) {
    return { action: 'monitoring', pattern_id: patternId };
  }

  async logAndMonitor(patternId, data) {
    auditLogger.logSystemEvent({
      event_type: 'pattern_logged',
      component: 'pattern_recognizer',
      severity: 'info',
      message: 'Pattern logged for monitoring',
      details: { pattern_id: patternId, data }
    });

    return { action: 'logged_and_monitoring', pattern_id: patternId };
  }

  async escalateAndResolve(patternId, data) {
    const pattern = this.db.prepare('SELECT * FROM detected_patterns WHERE id = ?').get(patternId);

    auditLogger.logSystemEvent({
      event_type: 'pattern_escalated',
      component: 'pattern_recognizer',
      severity: 'high',
      message: `Pattern escalated for immediate resolution: ${pattern.pattern_type}`,
      details: { pattern_id: patternId, frequency: pattern.frequency }
    });

    workflowEngine.triggerEvent('pattern.escalated', {
      pattern_id: patternId,
      pattern_type: pattern.pattern_type,
      urgency: pattern.urgency_level
    });

    return {
      action: 'escalated_and_workflow_triggered',
      pattern_id: patternId,
      urgency: pattern.urgency_level
    };
  }

  async triggerSelfHealing(patternId, data) {
    workflowEngine.triggerEvent('system.error_pattern', {
      pattern_id: patternId,
      data
    });

    return { action: 'self_healing_triggered', pattern_id: patternId };
  }

  async immediateExecution(patternId, data) {
    auditLogger.logSystemEvent({
      event_type: 'immediate_execution_triggered',
      component: 'pattern_recognizer',
      severity: 'high',
      message: 'Immediate execution triggered by pattern',
      details: { pattern_id: patternId }
    });

    return { action: 'immediate_execution', pattern_id: patternId, executed: true };
  }

  async prioritizePattern(patternId, data) {
    this.db.prepare(`
      UPDATE detected_patterns 
      SET urgency_level = urgency_level + 2
      WHERE id = ?
    `).run(patternId);

    return { action: 'prioritized', pattern_id: patternId };
  }

  async escalatePriorityAndResolve(patternId, data) {
    this.db.prepare(`
      UPDATE detected_patterns 
      SET urgency_level = 10
      WHERE id = ?
    `).run(patternId);

    await this.escalateAndResolve(patternId, data);

    return { action: 'priority_escalated_and_resolved', pattern_id: patternId };
  }

  async breakDownAndExecute(patternId, data) {
    auditLogger.logSystemEvent({
      event_type: 'complex_pattern_breakdown',
      component: 'pattern_recognizer',
      severity: 'info',
      message: 'Breaking down complex pattern for execution',
      details: { pattern_id: patternId }
    });

    return { action: 'broken_down_and_executing', pattern_id: patternId };
  }

  async resolveAggression(patternId, data) {
    const pattern = this.db.prepare('SELECT * FROM detected_patterns WHERE id = ?').get(patternId);

    auditLogger.logSystemEvent({
      event_type: 'aggression_resolution',
      component: 'pattern_recognizer',
      severity: 'critical',
      message: `Resolving high-aggression pattern: ${pattern.pattern_type}`,
      details: {
        pattern_id: patternId,
        aggression_score: data.aggression_score,
        frequency: pattern.frequency
      }
    });

    this.db.prepare(`
      UPDATE detected_patterns 
      SET urgency_level = 10, auto_resolved = 1
      WHERE id = ?
    `).run(patternId);

    workflowEngine.triggerEvent('pattern.high_aggression', {
      pattern_id: patternId,
      aggression_score: data.aggression_score,
      immediate_action_required: true
    });

    return {
      action: 'aggression_resolved',
      pattern_id: patternId,
      escalated_to_critical: true,
      workflow_triggered: true
    };
  }

  async triggerHighPriorityResolution(patternId, urgencyLevel) {
    const pattern = this.db.prepare('SELECT * FROM detected_patterns WHERE id = ?').get(patternId);

    auditLogger.logSystemEvent({
      event_type: 'high_priority_resolution',
      component: 'pattern_recognizer',
      severity: 'critical',
      message: `HIGH PRIORITY: Pattern requires immediate resolution`,
      details: {
        pattern_id: patternId,
        pattern_type: pattern.pattern_type,
        urgency_level: urgencyLevel,
        frequency: pattern.frequency
      }
    });

    workflowEngine.triggerEvent('pattern.critical', {
      pattern_id: patternId,
      pattern_type: pattern.pattern_type,
      urgency_level: urgencyLevel,
      immediate_resolution_required: true
    });

    return { triggered: true, urgency_level: urgencyLevel };
  }

  startPatternAnalysis() {
    setInterval(() => {
      this.analyzeSystemPatterns();
      this.detectAnomalies();
      this.cleanupOldPatterns();
    }, 60000);

    console.log('🔍 Pattern analysis started (continuous monitoring)');
  }

  analyzeSystemPatterns() {
    const highUrgencyPatterns = this.db.prepare(`
      SELECT * FROM detected_patterns 
      WHERE urgency_level >= 8 AND auto_resolved = 0
      ORDER BY urgency_level DESC, frequency DESC
    `).all();

    for (const pattern of highUrgencyPatterns) {
      this.triggerHighPriorityResolution(pattern.id, pattern.urgency_level);
    }

    const highAggressionPatterns = this.db.prepare(`
      SELECT * FROM detected_patterns 
      WHERE aggression_score >= 0.7 AND auto_resolved = 0
    `).all();

    for (const pattern of highAggressionPatterns) {
      this.triggerAggressionResponse(pattern.id, pattern.aggression_score);
    }
  }

  detectAnomalies() {
    const recentPatterns = this.db.prepare(`
      SELECT pattern_type, COUNT(*) as count 
      FROM pattern_occurrences 
      WHERE timestamp > datetime('now', '-1 hour')
      GROUP BY pattern_type
      HAVING count > 10
    `).all();

    for (const anomaly of recentPatterns) {
      auditLogger.logSystemEvent({
        event_type: 'pattern_anomaly_detected',
        component: 'pattern_recognizer',
        severity: 'warning',
        message: `Anomaly: ${anomaly.pattern_type} occurred ${anomaly.count} times in 1 hour`,
        details: anomaly
      });
    }
  }

  cleanupOldPatterns() {
    this.db.prepare(`
      DELETE FROM pattern_occurrences 
      WHERE timestamp < datetime('now', '-7 days')
    `).run();

    this.db.prepare(`
      DELETE FROM detected_patterns 
      WHERE last_seen < datetime('now', '-30 days') 
      AND frequency < 3
    `).run();
  }

  getPatternInsights() {
    const patterns = this.db.prepare(`
      SELECT * FROM detected_patterns 
      ORDER BY urgency_level DESC, frequency DESC, aggression_score DESC
      LIMIT 20
    `).all();

    const escalations = this.db.prepare(`
      SELECT * FROM urgency_escalations 
      ORDER BY timestamp DESC 
      LIMIT 10
    `).all();

    const resolutions = this.db.prepare(`
      SELECT pr.*, dp.pattern_type, dp.urgency_level
      FROM pattern_resolutions pr
      JOIN detected_patterns dp ON pr.pattern_id = dp.id
      ORDER BY pr.timestamp DESC
      LIMIT 10
    `).all();

    return {
      active_patterns: patterns.map(p => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null
      })),
      recent_escalations: escalations,
      recent_resolutions: resolutions.map(r => ({
        ...r,
        result: r.result ? JSON.parse(r.result) : null
      })),
      stats: {
        total_patterns: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns').get().count,
        high_urgency: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE urgency_level >= 8').get().count,
        high_aggression: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE aggression_score >= 0.7').get().count,
        auto_resolved: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE auto_resolved = 1').get().count,
        pending_resolution: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE urgency_level >= 8 AND auto_resolved = 0').get().count
      }
    };
  }

  getPatternsByUrgency(minUrgency = 5) {
    const patterns = this.db.prepare(`
      SELECT * FROM detected_patterns 
      WHERE urgency_level >= ?
      ORDER BY urgency_level DESC, aggression_score DESC
    `).all(minUrgency);

    return patterns.map(p => ({
      ...p,
      metadata: p.metadata ? JSON.parse(p.metadata) : null
    }));
  }

  getElevatedStatus() {
    return {
      elevated: this.elevatedStatus,
      active_monitoring: true,
      pattern_count: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns').get().count,
      high_priority_count: this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE urgency_level >= 8').get().count,
      auto_resolution_rate: this.calculateAutoResolutionRate()
    };
  }

  calculateAutoResolutionRate() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE urgency_level >= 5').get().count;
    const resolved = this.db.prepare('SELECT COUNT(*) as count FROM detected_patterns WHERE urgency_level >= 5 AND auto_resolved = 1').get().count;
    
    return total > 0 ? ((resolved / total) * 100).toFixed(2) : 0;
  }
}

export default new PatternRecognizer();
