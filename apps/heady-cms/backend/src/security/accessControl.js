// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/security/accessControl.js
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

export class AccessControlMatrix {
  constructor() {
    this.db = getDatabase();
    this.initializeACL();
    this.roleHierarchy = {
      'super_admin': ['admin', 'editor', 'viewer'],
      'admin': ['editor', 'viewer'],
      'editor': ['viewer'],
      'viewer': []
    };
  }

  initializeACL() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS acl_permissions (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        conditions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, resource, action)
      );

      CREATE TABLE IF NOT EXISTS acl_user_permissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resource TEXT NOT NULL,
        action TEXT NOT NULL,
        granted INTEGER DEFAULT 1,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS acl_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        permissions_snapshot TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_acl_role ON acl_permissions(role);
      CREATE INDEX IF NOT EXISTS idx_acl_user ON acl_user_permissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_acl_session ON acl_sessions(session_token);
    `);

    this.seedDefaultPermissions();
  }

  seedDefaultPermissions() {
    const defaultPermissions = [
      { role: 'super_admin', resource: '*', action: '*' },
      { role: 'admin', resource: 'content_types', action: '*' },
      { role: 'admin', resource: 'entries', action: '*' },
      { role: 'admin', resource: 'media', action: '*' },
      { role: 'admin', resource: 'users', action: 'read' },
      { role: 'admin', resource: 'users', action: 'update' },
      { role: 'editor', resource: 'entries', action: 'create' },
      { role: 'editor', resource: 'entries', action: 'read' },
      { role: 'editor', resource: 'entries', action: 'update' },
      { role: 'editor', resource: 'media', action: 'create' },
      { role: 'editor', resource: 'media', action: 'read' },
      { role: 'viewer', resource: 'entries', action: 'read' },
      { role: 'viewer', resource: 'media', action: 'read' }
    ];

    const existing = this.db.prepare('SELECT COUNT(*) as count FROM acl_permissions').get();
    if (existing.count === 0) {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO acl_permissions (id, role, resource, action)
        VALUES (?, ?, ?, ?)
      `);

      for (const perm of defaultPermissions) {
        const id = `${perm.role}_${perm.resource}_${perm.action}`;
        stmt.run(id, perm.role, perm.resource, perm.action);
      }
    }
  }

  can(user, action, resource, context = {}) {
    const userRole = user.role || 'viewer';
    const applicableRoles = [userRole, ...this.getInheritedRoles(userRole)];

    for (const role of applicableRoles) {
      if (this.hasRolePermission(role, resource, action)) {
        auditLogger.log({
          user_id: user.userId,
          user_email: user.email,
          action: 'access_granted',
          resource_type: resource,
          metadata: { requested_action: action, granted_role: role },
          severity: 'info'
        });
        return true;
      }
    }

    const hasUserPermission = this.hasUserPermission(user.userId, resource, action);
    if (hasUserPermission) {
      auditLogger.log({
        user_id: user.userId,
        user_email: user.email,
        action: 'access_granted',
        resource_type: resource,
        metadata: { requested_action: action, granted_via: 'user_permission' },
        severity: 'info'
      });
      return true;
    }

    auditLogger.logSecurityEvent({
      event_type: 'access_denied',
      severity: 'warning',
      user_id: user.userId,
      ip_address: context.ip_address,
      description: `Access denied for ${action} on ${resource}`,
      details: { user_role: userRole, resource, action }
    });

    return false;
  }

  hasRolePermission(role, resource, action) {
    const permission = this.db.prepare(`
      SELECT * FROM acl_permissions 
      WHERE role = ? AND (resource = ? OR resource = '*') AND (action = ? OR action = '*')
    `).get(role, resource, action);

    return !!permission;
  }

  hasUserPermission(userId, resource, action) {
    const permission = this.db.prepare(`
      SELECT * FROM acl_user_permissions 
      WHERE user_id = ? AND resource = ? AND action = ? AND granted = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `).get(userId, resource, action);

    return !!permission;
  }

  getInheritedRoles(role) {
    return this.roleHierarchy[role] || [];
  }

  grantUserPermission(userId, resource, action, expiresAt = null) {
    const id = `${userId}_${resource}_${action}`;
    this.db.prepare(`
      INSERT OR REPLACE INTO acl_user_permissions (id, user_id, resource, action, granted, expires_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(id, userId, resource, action, expiresAt);

    auditLogger.log({
      user_id: userId,
      action: 'permission_granted',
      resource_type: 'acl_user_permissions',
      metadata: { resource, action, expires_at: expiresAt },
      severity: 'info'
    });
  }

  revokeUserPermission(userId, resource, action) {
    this.db.prepare(`
      UPDATE acl_user_permissions 
      SET granted = 0 
      WHERE user_id = ? AND resource = ? AND action = ?
    `).run(userId, resource, action);

    auditLogger.log({
      user_id: userId,
      action: 'permission_revoked',
      resource_type: 'acl_user_permissions',
      metadata: { resource, action },
      severity: 'warning'
    });
  }

  getUserPermissions(userId) {
    const user = this.db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
    if (!user) return [];

    const rolePermissions = this.db.prepare(`
      SELECT resource, action FROM acl_permissions WHERE role = ?
    `).all(user.role);

    const userPermissions = this.db.prepare(`
      SELECT resource, action FROM acl_user_permissions 
      WHERE user_id = ? AND granted = 1 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `).all(userId);

    return [...rolePermissions, ...userPermissions];
  }

  createSession(userId, sessionToken, metadata = {}) {
    const permissions = this.getUserPermissions(userId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    this.db.prepare(`
      INSERT INTO acl_sessions (id, user_id, session_token, ip_address, user_agent, permissions_snapshot, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionToken,
      userId,
      sessionToken,
      metadata.ip_address || null,
      metadata.user_agent || null,
      JSON.stringify(permissions),
      expiresAt.toISOString()
    );

    return sessionToken;
  }

  validateSession(sessionToken) {
    const session = this.db.prepare(`
      SELECT * FROM acl_sessions 
      WHERE session_token = ? AND expires_at > datetime('now')
    `).get(sessionToken);

    return session;
  }

  revokeSession(sessionToken) {
    this.db.prepare('DELETE FROM acl_sessions WHERE session_token = ?').run(sessionToken);
  }
}

export default new AccessControlMatrix();
