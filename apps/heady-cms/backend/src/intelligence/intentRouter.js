// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/intelligence/intentRouter.js
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

import autoExecutor from './autoExecutor.js';
import auditLogger from '../audit/index.js';
import { getDatabase } from '../database/index.js';

export class IntentRouter {
  constructor() {
    this.db = getDatabase();
    this.routes = new Map();
    this.registerRoutes();
  }

  registerRoutes() {
    this.routes.set('create_content', {
      handler: async (data, context) => {
        const { getDatabase } = await import('../database/index.js');
        const db = getDatabase();
        const { v4: uuidv4 } = await import('uuid');
        
        const contentTypeId = data.content_type_id || data.contentType;
        const entryData = data.data || data;
        const status = data.status || 'draft';
        
        const id = uuidv4();
        db.prepare(`
          INSERT INTO content_entries (id, content_type_id, data, status, created_by)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, contentTypeId, JSON.stringify(entryData), status, context.user?.userId || 'system');
        
        return { id, created: true, status };
      },
      requiresAuth: true,
      allowedRoles: ['admin', 'editor']
    });

    this.routes.set('upload_media', {
      handler: async (data, context) => {
        return { uploaded: true, message: 'Media upload would be processed here' };
      },
      requiresAuth: true,
      allowedRoles: ['admin', 'editor']
    });

    this.routes.set('publish_content', {
      handler: async (data, context) => {
        const { getDatabase } = await import('../database/index.js');
        const db = getDatabase();
        
        const entryId = data.entry_id || data.id;
        db.prepare(`
          UPDATE content_entries 
          SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(entryId);
        
        const workflowEngine = (await import('../automation/workflowEngine.js')).default;
        workflowEngine.triggerEvent('content.published', { entry_id: entryId });
        
        return { published: true, entry_id: entryId };
      },
      requiresAuth: true,
      allowedRoles: ['admin', 'editor']
    });

    this.routes.set('create_user', {
      handler: async (data, context) => {
        const bcrypt = await import('bcryptjs');
        const { v4: uuidv4 } = await import('uuid');
        const { getDatabase } = await import('../database/index.js');
        const db = getDatabase();
        
        const hashedPassword = await bcrypt.default.hash(data.password, 10);
        const id = uuidv4();
        
        db.prepare(`
          INSERT INTO users (id, email, password, name, role)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, data.email, hashedPassword, data.name, data.role || 'editor');
        
        return { id, created: true, email: data.email };
      },
      requiresAuth: true,
      allowedRoles: ['admin'],
      requiresApproval: false
    });

    this.routes.set('delete_content', {
      handler: async (data, context) => {
        const { getDatabase } = await import('../database/index.js');
        const db = getDatabase();
        
        const entryId = data.entry_id || data.id;
        db.prepare('DELETE FROM content_entries WHERE id = ?').run(entryId);
        
        return { deleted: true, entry_id: entryId };
      },
      requiresAuth: true,
      allowedRoles: ['admin'],
      requiresApproval: false
    });

    this.routes.set('create_content_type', {
      handler: async (data, context) => {
        const { v4: uuidv4 } = await import('uuid');
        const { getDatabase } = await import('../database/index.js');
        const db = getDatabase();
        
        const id = uuidv4();
        db.prepare(`
          INSERT INTO content_types (id, name, display_name, description, schema)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          id,
          data.name,
          data.display_name,
          data.description || '',
          JSON.stringify(data.schema)
        );
        
        return { id, created: true, name: data.name };
      },
      requiresAuth: true,
      allowedRoles: ['admin'],
      requiresApproval: false
    });

    this.routes.set('optimize_system', {
      handler: async (data, context) => {
        const workflowEngine = (await import('../automation/workflowEngine.js')).default;
        const result = await workflowEngine.executeWorkflow('auto_optimize', context);
        return result;
      },
      requiresAuth: false,
      allowedRoles: []
    });

    this.routes.set('backup_database', {
      handler: async (data, context) => {
        const workflowEngine = (await import('../automation/workflowEngine.js')).default;
        const result = await workflowEngine.executeWorkflow('auto_backup', context);
        return result;
      },
      requiresAuth: false,
      allowedRoles: []
    });

    this.routes.set('apply_optimization', {
      handler: async (data, context) => {
        const intelligentSystem = (await import('../automation/intelligentSystem.js')).default;
        const result = intelligentSystem.applyOptimization(data.suggestion_id);
        return result;
      },
      requiresAuth: true,
      allowedRoles: ['admin'],
      requiresApproval: false
    });

    console.log(`🎯 Intent router registered ${this.routes.size} routes`);
  }

  async route(intent, data, context = {}) {
    const route = this.routes.get(intent);
    
    if (!route) {
      throw new Error(`No route registered for intent: ${intent}`);
    }

    if (route.requiresAuth && !context.user) {
      throw new Error('Authentication required');
    }

    if (route.allowedRoles.length > 0 && context.user) {
      if (!route.allowedRoles.includes(context.user.role)) {
        throw new Error(`Insufficient permissions. Required roles: ${route.allowedRoles.join(', ')}`);
      }
    }

    if (route.requiresApproval) {
      return {
        requiresApproval: true,
        intent,
        data,
        message: 'This action requires approval before execution'
      };
    }

    try {
      const result = await route.handler(data, context);
      
      auditLogger.log({
        action: 'intent_routed',
        resource_type: 'intent_router',
        user_id: context.user?.userId,
        metadata: { intent, result },
        severity: 'info'
      });

      return result;
    } catch (error) {
      auditLogger.logSystemEvent({
        event_type: 'intent_routing_failed',
        component: 'intent_router',
        severity: 'error',
        message: `Failed to route intent: ${intent}`,
        details: { error: error.message, data },
        stack_trace: error.stack
      });

      throw error;
    }
  }

  async processRequest(request, context = {}) {
    if (typeof request === 'string') {
      const analysis = await autoExecutor.analyzeIntent(request, context);
      
      if (!analysis.intent || analysis.confidence < 0.7) {
        return {
          success: false,
          message: 'Could not understand the request',
          confidence: analysis.confidence,
          suggestion: 'Please provide more specific instructions'
        };
      }

      const decision = await autoExecutor.shouldAutoExecute(analysis.intent, context);
      
      if (!decision.autoExecute) {
        return {
          success: false,
          intent: analysis.intent,
          reason: decision.reason,
          requiresApproval: decision.requiresApproval
        };
      }

      try {
        const result = await this.route(analysis.intent, { input: request }, context);
        
        return {
          success: true,
          intent: analysis.intent,
          confidence: analysis.confidence,
          result,
          autoExecuted: !result.requiresApproval
        };
      } catch (error) {
        return {
          success: false,
          intent: analysis.intent,
          error: error.message
        };
      }
    }

    if (request.intent) {
      try {
        const result = await this.route(request.intent, request.data || {}, context);
        
        return {
          success: true,
          intent: request.intent,
          result,
          autoExecuted: !result.requiresApproval
        };
      } catch (error) {
        return {
          success: false,
          intent: request.intent,
          error: error.message
        };
      }
    }

    return {
      success: false,
      message: 'Invalid request format'
    };
  }
}

export default new IntentRouter();
