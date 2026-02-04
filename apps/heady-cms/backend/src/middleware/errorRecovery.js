import auditLogger from '../audit/index.js';
import workflowEngine from '../automation/workflowEngine.js';

export class ErrorRecoverySystem {
  constructor() {
    this.errorPatterns = new Map();
    this.recoveryStrategies = new Map();
    this.registerRecoveryStrategies();
  }

  registerRecoveryStrategies() {
    this.recoveryStrategies.set('SQLITE_BUSY', {
      name: 'Database Busy',
      retry: true,
      maxRetries: 3,
      backoff: 'exponential',
      action: async (error, context) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { recovered: true, action: 'retry_after_delay' };
      }
    });

    this.recoveryStrategies.set('ECONNREFUSED', {
      name: 'Connection Refused',
      retry: true,
      maxRetries: 5,
      backoff: 'exponential',
      action: async (error, context) => {
        workflowEngine.triggerEvent('connection.refused', { error, context });
        return { recovered: false, action: 'service_unavailable' };
      }
    });

    this.recoveryStrategies.set('ENOMEM', {
      name: 'Out of Memory',
      retry: false,
      action: async (error, context) => {
        if (global.gc) {
          global.gc();
        }
        workflowEngine.triggerEvent('system.low_memory', { error, context });
        return { recovered: true, action: 'garbage_collection' };
      }
    });

    this.recoveryStrategies.set('ENOSPC', {
      name: 'No Space Left',
      retry: false,
      action: async (error, context) => {
        workflowEngine.triggerEvent('system.disk_full', { error, context });
        return { recovered: false, action: 'cleanup_triggered' };
      }
    });

    this.recoveryStrategies.set('ValidationError', {
      name: 'Validation Error',
      retry: false,
      action: async (error, context) => {
        return { recovered: false, action: 'return_validation_errors' };
      }
    });

    this.recoveryStrategies.set('UnauthorizedError', {
      name: 'Unauthorized',
      retry: false,
      action: async (error, context) => {
        auditLogger.logSecurityEvent({
          event_type: 'unauthorized_access',
          severity: 'warning',
          user_id: context.user?.userId,
          ip_address: context.ip_address,
          description: 'Unauthorized access attempt',
          details: { error: error.message, endpoint: context.endpoint }
        });
        return { recovered: false, action: 'deny_access' };
      }
    });
  }

  async handleError(error, context = {}, retryCount = 0) {
    const errorCode = this.identifyErrorCode(error);
    const strategy = this.recoveryStrategies.get(errorCode);

    this.trackErrorPattern(errorCode, context);

    if (!strategy) {
      auditLogger.logSystemEvent({
        event_type: 'unhandled_error',
        component: 'error_recovery',
        severity: 'error',
        message: error.message,
        details: { error_code: errorCode, context },
        stack_trace: error.stack
      });

      return {
        recovered: false,
        error: error.message,
        action: 'unhandled'
      };
    }

    if (strategy.retry && retryCount < (strategy.maxRetries || 3)) {
      const delay = this.calculateBackoff(strategy.backoff, retryCount);
      
      auditLogger.logSystemEvent({
        event_type: 'error_retry',
        component: 'error_recovery',
        severity: 'warning',
        message: `Retrying after ${strategy.name}`,
        details: {
          error_code: errorCode,
          retry_count: retryCount + 1,
          max_retries: strategy.maxRetries,
          delay_ms: delay
        }
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const result = await strategy.action(error, context);
        
        if (result.recovered) {
          auditLogger.logSystemEvent({
            event_type: 'error_recovered',
            component: 'error_recovery',
            severity: 'info',
            message: `Recovered from ${strategy.name}`,
            details: { error_code: errorCode, action: result.action }
          });
        }
        
        return result;
      } catch (retryError) {
        return this.handleError(retryError, context, retryCount + 1);
      }
    }

    try {
      const result = await strategy.action(error, context);
      
      auditLogger.logSystemEvent({
        event_type: result.recovered ? 'error_recovered' : 'error_handled',
        component: 'error_recovery',
        severity: result.recovered ? 'info' : 'error',
        message: `${result.recovered ? 'Recovered from' : 'Handled'} ${strategy.name}`,
        details: { error_code: errorCode, action: result.action }
      });

      return result;
    } catch (handlerError) {
      auditLogger.logSystemEvent({
        event_type: 'recovery_failed',
        component: 'error_recovery',
        severity: 'critical',
        message: 'Error recovery strategy failed',
        details: { error_code: errorCode, original_error: error.message, handler_error: handlerError.message },
        stack_trace: handlerError.stack
      });

      return {
        recovered: false,
        error: error.message,
        action: 'recovery_failed'
      };
    }
  }

  identifyErrorCode(error) {
    if (error.code) return error.code;
    if (error.name) return error.name;
    if (error.message) {
      if (error.message.includes('SQLITE_BUSY')) return 'SQLITE_BUSY';
      if (error.message.includes('locked')) return 'SQLITE_BUSY';
      if (error.message.includes('validation')) return 'ValidationError';
      if (error.message.includes('unauthorized')) return 'UnauthorizedError';
    }
    return 'UNKNOWN';
  }

  calculateBackoff(strategy, retryCount) {
    if (strategy === 'exponential') {
      return Math.min(1000 * Math.pow(2, retryCount), 10000);
    }
    if (strategy === 'linear') {
      return 1000 * (retryCount + 1);
    }
    return 1000;
  }

  trackErrorPattern(errorCode, context) {
    const key = `${errorCode}_${context.endpoint || 'unknown'}`;
    const pattern = this.errorPatterns.get(key) || { count: 0, first_seen: Date.now(), last_seen: Date.now() };
    
    pattern.count++;
    pattern.last_seen = Date.now();
    
    this.errorPatterns.set(key, pattern);

    if (pattern.count > 10 && (pattern.last_seen - pattern.first_seen) < 60000) {
      auditLogger.logSecurityEvent({
        event_type: 'error_pattern_detected',
        severity: 'high',
        description: `High frequency of ${errorCode} errors detected`,
        details: {
          error_code: errorCode,
          count: pattern.count,
          duration_ms: pattern.last_seen - pattern.first_seen,
          endpoint: context.endpoint
        }
      });

      workflowEngine.triggerEvent('system.error_pattern', {
        error_code: errorCode,
        pattern
      });
    }
  }

  getErrorStatistics() {
    const stats = {
      total_patterns: this.errorPatterns.size,
      patterns: []
    };

    for (const [key, pattern] of this.errorPatterns.entries()) {
      stats.patterns.push({
        key,
        count: pattern.count,
        duration_ms: pattern.last_seen - pattern.first_seen,
        first_seen: new Date(pattern.first_seen).toISOString(),
        last_seen: new Date(pattern.last_seen).toISOString()
      });
    }

    stats.patterns.sort((a, b) => b.count - a.count);

    return stats;
  }

  clearErrorPatterns() {
    this.errorPatterns.clear();
  }
}

export default new ErrorRecoverySystem();

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      const context = {
        user: req.user,
        ip_address: req.ip || req.connection.remoteAddress,
        endpoint: req.path,
        method: req.method
      };

      const recovery = await errorRecoverySystem.handleError(error, context);

      if (recovery.recovered && recovery.action === 'retry_after_delay') {
        try {
          await fn(req, res, next);
        } catch (retryError) {
          next(retryError);
        }
      } else {
        next(error);
      }
    }
  };
};

const errorRecoverySystem = new ErrorRecoverySystem();
