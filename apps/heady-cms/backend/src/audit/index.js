// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/audit/index.js
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
import { v4 as uuidv4 } from 'uuid';

export class AuditLogger {
  constructor() {
    this.db = getDatabase();
    this.initializeAuditTables();
  }

  initializeAuditTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT,
        user_email TEXT,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        method TEXT,
        endpoint TEXT,
        ip_address TEXT,
        user_agent TEXT,
        status_code INTEGER,
        changes TEXT,
        metadata TEXT,
        severity TEXT DEFAULT 'info',
        session_id TEXT
      );

      CREATE TABLE IF NOT EXISTS security_events (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        user_id TEXT,
        ip_address TEXT,
        description TEXT NOT NULL,
        details TEXT,
        resolved INTEGER DEFAULT 0,
        resolved_at DATETIME,
        resolved_by TEXT
      );

      CREATE TABLE IF NOT EXISTS system_events (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT NOT NULL,
        component TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        details TEXT,
        stack_trace TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_security_timestamp ON security_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_security_severity ON security_events(severity);
      CREATE INDEX IF NOT EXISTS idx_system_timestamp ON system_events(timestamp);
    `);
  }

  log(auditData) {
    const id = uuidv4();
    const {
      user_id,
      user_email,
      action,
      resource_type,
      resource_id,
      method,
      endpoint,
      ip_address,
      user_agent,
      status_code,
      changes,
      metadata,
      severity = 'info',
      session_id
    } = auditData;

    this.db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, user_email, action, resource_type, resource_id,
        method, endpoint, ip_address, user_agent, status_code,
        changes, metadata, severity, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user_id || null,
      user_email || null,
      action,
      resource_type,
      resource_id || null,
      method || null,
      endpoint || null,
      ip_address || null,
      user_agent || null,
      status_code || null,
      changes ? JSON.stringify(changes) : null,
      metadata ? JSON.stringify(metadata) : null,
      severity,
      session_id || null
    );

    return id;
  }

  logSecurityEvent(eventData) {
    const id = uuidv4();
    const { event_type, severity, user_id, ip_address, description, details } = eventData;

    this.db.prepare(`
      INSERT INTO security_events (id, event_type, severity, user_id, ip_address, description, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event_type,
      severity,
      user_id || null,
      ip_address || null,
      description,
      details ? JSON.stringify(details) : null
    );

    if (severity === 'critical' || severity === 'high') {
      console.error(`🚨 SECURITY EVENT [${severity}]: ${description}`);
    }

    return id;
  }

  logSystemEvent(eventData) {
    const id = uuidv4();
    const { event_type, component, severity, message, details, stack_trace } = eventData;

    this.db.prepare(`
      INSERT INTO system_events (id, event_type, component, severity, message, details, stack_trace)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event_type,
      component,
      severity,
      message,
      details ? JSON.stringify(details) : null,
      stack_trace || null
    );

    return id;
  }

  getAuditLogs(filters = {}) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }
    if (filters.resource_type) {
      query += ' AND resource_type = ?';
      params.push(filters.resource_type);
    }
    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.start_date) {
      query += ' AND timestamp >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND timestamp <= ?';
      params.push(filters.end_date);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    const logs = this.db.prepare(query).all(...params);
    return logs.map(log => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));
  }

  getSecurityEvents(filters = {}) {
    let query = 'SELECT * FROM security_events WHERE 1=1';
    const params = [];

    if (filters.severity) {
      query += ' AND severity = ?';
      params.push(filters.severity);
    }
    if (filters.resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(filters.resolved ? 1 : 0);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    const events = this.db.prepare(query).all(...params);
    return events.map(event => ({
      ...event,
      details: event.details ? JSON.parse(event.details) : null
    }));
  }

  resolveSecurityEvent(eventId, resolvedBy) {
    this.db.prepare(`
      UPDATE security_events 
      SET resolved = 1, resolved_at = CURRENT_TIMESTAMP, resolved_by = ?
      WHERE id = ?
    `).run(resolvedBy, eventId);
  }

  getAuditTrail(resourceType, resourceId) {
    const logs = this.db.prepare(`
      SELECT * FROM audit_logs 
      WHERE resource_type = ? AND resource_id = ?
      ORDER BY timestamp ASC
    `).all(resourceType, resourceId);

    return logs.map(log => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));
  }

  getAuditStatistics(timeRange = '24h') {
    const timeCondition = this.getTimeCondition(timeRange);
    
    const stats = {
      total_actions: this.db.prepare(`SELECT COUNT(*) as count FROM audit_logs WHERE ${timeCondition}`).get().count,
      unique_users: this.db.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM audit_logs WHERE ${timeCondition}`).get().count,
      security_events: this.db.prepare(`SELECT COUNT(*) as count FROM security_events WHERE ${timeCondition}`).get().count,
      critical_events: this.db.prepare(`SELECT COUNT(*) as count FROM security_events WHERE severity = 'critical' AND ${timeCondition}`).get().count,
      by_action: this.db.prepare(`
        SELECT action, COUNT(*) as count 
        FROM audit_logs 
        WHERE ${timeCondition}
        GROUP BY action 
        ORDER BY count DESC 
        LIMIT 10
      `).all(),
      by_resource: this.db.prepare(`
        SELECT resource_type, COUNT(*) as count 
        FROM audit_logs 
        WHERE ${timeCondition}
        GROUP BY resource_type 
        ORDER BY count DESC
      `).all()
    };

    return stats;
  }

  getTimeCondition(timeRange) {
    const ranges = {
      '1h': "timestamp >= datetime('now', '-1 hour')",
      '24h': "timestamp >= datetime('now', '-24 hours')",
      '7d': "timestamp >= datetime('now', '-7 days')",
      '30d': "timestamp >= datetime('now', '-30 days')"
    };
    return ranges[timeRange] || ranges['24h'];
  }
}

export default new AuditLogger();
