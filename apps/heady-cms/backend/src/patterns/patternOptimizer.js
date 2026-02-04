// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/patterns/patternOptimizer.js
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

import patternRecognizer from './recognizer.js';
import auditLogger from '../audit/index.js';
import { getDatabase } from '../database/index.js';

export class PatternOptimizer {
  constructor() {
    this.db = getDatabase();
    this.optimizationRules = new Map();
    this.registerOptimizationRules();
  }

  registerOptimizationRules() {
    this.optimizationRules.set('repeated_request', {
      threshold: 3,
      action: async (pattern) => {
        return {
          optimization: 'create_shortcut',
          suggestion: `Create automated workflow for: ${pattern.pattern_signature}`,
          impact: 'high',
          saves_requests: pattern.frequency
        };
      }
    });

    this.optimizationRules.set('error_pattern', {
      threshold: 2,
      action: async (pattern) => {
        return {
          optimization: 'fix_root_cause',
          suggestion: `Investigate and fix recurring error pattern`,
          impact: 'critical',
          error_count: pattern.frequency
        };
      }
    });

    this.optimizationRules.set('frustration', {
      threshold: 1,
      action: async (pattern) => {
        return {
          optimization: 'improve_ux',
          suggestion: `User frustration detected - improve workflow or documentation`,
          impact: 'high',
          urgency: 'immediate'
        };
      }
    });

    this.optimizationRules.set('complexity_increase', {
      threshold: 2,
      action: async (pattern) => {
        return {
          optimization: 'simplify_interface',
          suggestion: `Requests becoming more complex - simplify or add helpers`,
          impact: 'medium'
        };
      }
    });

    console.log('⚡ Pattern optimizer rules registered');
  }

  async optimizeFromPatterns() {
    const patterns = this.db.prepare(`
      SELECT * FROM detected_patterns 
      WHERE auto_resolved = 0 
      ORDER BY urgency_level DESC, frequency DESC
    `).all();

    const optimizations = [];

    for (const pattern of patterns) {
      const rule = this.optimizationRules.get(pattern.pattern_type);
      
      if (rule && pattern.frequency >= rule.threshold) {
        const optimization = await rule.action(pattern);
        
        optimizations.push({
          pattern_id: pattern.id,
          pattern_type: pattern.pattern_type,
          ...optimization
        });

        auditLogger.logSystemEvent({
          event_type: 'pattern_optimization_suggested',
          component: 'pattern_optimizer',
          severity: 'info',
          message: optimization.suggestion,
          details: { pattern_id: pattern.id, optimization }
        });
      }
    }

    return optimizations;
  }

  async applyPatternBasedOptimizations() {
    const optimizations = await this.optimizeFromPatterns();
    const applied = [];

    for (const opt of optimizations) {
      if (opt.impact === 'critical' || opt.impact === 'high') {
        const result = await this.applyOptimization(opt);
        applied.push(result);
      }
    }

    return {
      total_optimizations: optimizations.length,
      applied: applied.length,
      results: applied
    };
  }

  async applyOptimization(optimization) {
    if (optimization.optimization === 'create_shortcut') {
      return { applied: true, action: 'workflow_created' };
    } else if (optimization.optimization === 'fix_root_cause') {
      return { applied: true, action: 'investigation_triggered' };
    } else if (optimization.optimization === 'improve_ux') {
      return { applied: true, action: 'ux_improvement_queued' };
    }

    return { applied: false, reason: 'unknown_optimization' };
  }

  breakDownToPatterns(data) {
    if (typeof data === 'string') {
      return {
        type: 'text',
        patterns: {
          words: data.split(/\s+/),
          sentences: data.split(/[.!?]+/),
          keywords: this.extractKeywords(data),
          intent_markers: this.extractIntentMarkers(data)
        }
      };
    }

    if (Array.isArray(data)) {
      return {
        type: 'array',
        patterns: {
          length: data.length,
          types: [...new Set(data.map(item => typeof item))],
          structure: this.detectArrayPattern(data)
        }
      };
    }

    if (typeof data === 'object' && data !== null) {
      return {
        type: 'object',
        patterns: {
          keys: Object.keys(data),
          structure: this.detectObjectPattern(data),
          nesting_depth: this.calculateNestingDepth(data)
        }
      };
    }

    return { type: typeof data, patterns: {} };
  }

  extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are'];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.filter(w => !stopWords.includes(w) && w.length > 2);
  }

  extractIntentMarkers(text) {
    const markers = {
      create: /create|add|new|make/i,
      read: /get|show|list|view|display/i,
      update: /update|edit|modify|change/i,
      delete: /delete|remove|trash/i,
      question: /what|why|how|when|where|who/i,
      command: /do|execute|run|perform/i
    };

    const detected = [];
    for (const [intent, pattern] of Object.entries(markers)) {
      if (pattern.test(text)) {
        detected.push(intent);
      }
    }

    return detected;
  }

  detectArrayPattern(arr) {
    if (arr.length === 0) return 'empty';
    
    const firstType = typeof arr[0];
    const allSameType = arr.every(item => typeof item === firstType);
    
    if (allSameType) {
      return `homogeneous_${firstType}`;
    }
    
    return 'heterogeneous';
  }

  detectObjectPattern(obj) {
    const keys = Object.keys(obj);
    
    if (keys.includes('id') && keys.includes('name')) {
      return 'entity';
    }
    if (keys.includes('type') && keys.includes('data')) {
      return 'typed_data';
    }
    if (keys.includes('status') && keys.includes('message')) {
      return 'response';
    }
    
    return 'generic';
  }

  calculateNestingDepth(obj, currentDepth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        const depth = this.calculateNestingDepth(value, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  findSimilarPatterns(pattern) {
    const similar = this.db.prepare(`
      SELECT * FROM detected_patterns 
      WHERE pattern_type = ? AND id != ?
      ORDER BY frequency DESC
      LIMIT 5
    `).all(pattern.pattern_type, pattern.id);

    return similar;
  }

  mergePatterns(patternIds) {
    if (patternIds.length < 2) {
      return { merged: false, reason: 'insufficient_patterns' };
    }

    const patterns = patternIds.map(id => 
      this.db.prepare('SELECT * FROM detected_patterns WHERE id = ?').get(id)
    );

    const totalFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0);
    const maxUrgency = Math.max(...patterns.map(p => p.urgency_level));
    const avgAggression = patterns.reduce((sum, p) => sum + p.aggression_score, 0) / patterns.length;

    const mergedId = patterns[0].id;

    this.db.prepare(`
      UPDATE detected_patterns 
      SET frequency = ?, urgency_level = ?, aggression_score = ?
      WHERE id = ?
    `).run(totalFrequency, maxUrgency, avgAggression, mergedId);

    for (let i = 1; i < patterns.length; i++) {
      this.db.prepare(`
        UPDATE pattern_occurrences 
        SET pattern_id = ? 
        WHERE pattern_id = ?
      `).run(mergedId, patterns[i].id);

      this.db.prepare('DELETE FROM detected_patterns WHERE id = ?').run(patterns[i].id);
    }

    return {
      merged: true,
      merged_id: mergedId,
      patterns_merged: patterns.length,
      total_frequency: totalFrequency
    };
  }
}

export default new PatternOptimizer();
