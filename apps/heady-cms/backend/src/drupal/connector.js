// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/drupal/connector.js
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
import { v4 as uuidv4 } from 'uuid';

export class DrupalConnector {
  constructor() {
    this.db = getDatabase();
    this.drupalInstances = new Map();
    this.initializeDrupalTables();
  }

  initializeDrupalTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS drupal_instances (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        base_url TEXT NOT NULL,
        jsonapi_endpoint TEXT NOT NULL,
        auth_type TEXT DEFAULT 'oauth',
        credentials TEXT,
        enabled INTEGER DEFAULT 1,
        last_sync DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS drupal_content_map (
        id TEXT PRIMARY KEY,
        drupal_instance_id TEXT NOT NULL,
        drupal_node_id TEXT NOT NULL,
        drupal_content_type TEXT NOT NULL,
        heady_entry_id TEXT,
        heady_content_type TEXT,
        sync_direction TEXT DEFAULT 'both',
        last_synced DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drupal_instance_id) REFERENCES drupal_instances(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS drupal_sync_log (
        id TEXT PRIMARY KEY,
        drupal_instance_id TEXT NOT NULL,
        sync_type TEXT NOT NULL,
        direction TEXT NOT NULL,
        items_synced INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        error TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (drupal_instance_id) REFERENCES drupal_instances(id)
      );

      CREATE INDEX IF NOT EXISTS idx_content_map_drupal ON drupal_content_map(drupal_node_id);
      CREATE INDEX IF NOT EXISTS idx_content_map_heady ON drupal_content_map(heady_entry_id);
      CREATE INDEX IF NOT EXISTS idx_sync_log_instance ON drupal_sync_log(drupal_instance_id);
    `);
  }

  registerDrupalInstance(instanceData) {
    const id = uuidv4();
    const { name, base_url, auth_type, credentials } = instanceData;

    const jsonapi_endpoint = `${base_url}/jsonapi`;

    this.db.prepare(`
      INSERT INTO drupal_instances (id, name, base_url, jsonapi_endpoint, auth_type, credentials)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      base_url,
      jsonapi_endpoint,
      auth_type || 'oauth',
      credentials ? JSON.stringify(credentials) : null
    );

    this.drupalInstances.set(id, {
      id,
      name,
      base_url,
      jsonapi_endpoint,
      auth_type
    });

    auditLogger.logSystemEvent({
      event_type: 'drupal_instance_registered',
      component: 'drupal_connector',
      severity: 'info',
      message: `Drupal instance registered: ${name}`,
      details: { instance_id: id, base_url }
    });

    return this.getDrupalInstance(id);
  }

  getDrupalInstance(id) {
    const instance = this.db.prepare('SELECT * FROM drupal_instances WHERE id = ? OR name = ?').get(id, id);
    if (instance && instance.credentials) {
      instance.credentials = JSON.parse(instance.credentials);
    }
    return instance;
  }

  getAllDrupalInstances() {
    const instances = this.db.prepare('SELECT * FROM drupal_instances').all();
    return instances.map(i => ({
      ...i,
      credentials: i.credentials ? JSON.parse(i.credentials) : null
    }));
  }

  async fetchDrupalContent(instanceId, contentType, options = {}) {
    const instance = this.getDrupalInstance(instanceId);
    if (!instance) {
      throw new Error('Drupal instance not found');
    }

    const url = `${instance.jsonapi_endpoint}/node/${contentType}`;
    const params = new URLSearchParams();
    
    if (options.filter) {
      params.append('filter', JSON.stringify(options.filter));
    }
    if (options.include) {
      params.append('include', options.include);
    }
    if (options.page) {
      params.append('page[limit]', options.page.limit || 50);
      params.append('page[offset]', options.page.offset || 0);
    }

    const fullUrl = `${url}?${params.toString()}`;

    try {
      const response = await fetch(fullUrl, {
        headers: this.getAuthHeaders(instance)
      });

      if (!response.ok) {
        throw new Error(`Drupal API error: ${response.status}`);
      }

      const data = await response.json();

      auditLogger.log({
        action: 'drupal_content_fetched',
        resource_type: 'drupal_content',
        metadata: {
          instance_id: instanceId,
          content_type: contentType,
          items_count: data.data?.length || 0
        },
        severity: 'info'
      });

      return data;
    } catch (error) {
      auditLogger.logSystemEvent({
        event_type: 'drupal_fetch_failed',
        component: 'drupal_connector',
        severity: 'error',
        message: `Failed to fetch from Drupal: ${contentType}`,
        details: { instance_id: instanceId, error: error.message },
        stack_trace: error.stack
      });

      throw error;
    }
  }

  async createDrupalContent(instanceId, contentType, data) {
    const instance = this.getDrupalInstance(instanceId);
    if (!instance) {
      throw new Error('Drupal instance not found');
    }

    const url = `${instance.jsonapi_endpoint}/node/${contentType}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(instance),
          'Content-Type': 'application/vnd.api+json'
        },
        body: JSON.stringify({
          data: {
            type: `node--${contentType}`,
            attributes: data
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Drupal API error: ${response.status}`);
      }

      const result = await response.json();

      auditLogger.log({
        action: 'drupal_content_created',
        resource_type: 'drupal_content',
        metadata: {
          instance_id: instanceId,
          content_type: contentType,
          drupal_id: result.data?.id
        },
        severity: 'info'
      });

      return result;
    } catch (error) {
      auditLogger.logSystemEvent({
        event_type: 'drupal_create_failed',
        component: 'drupal_connector',
        severity: 'error',
        message: `Failed to create Drupal content: ${contentType}`,
        details: { instance_id: instanceId, error: error.message },
        stack_trace: error.stack
      });

      throw error;
    }
  }

  getAuthHeaders(instance) {
    const headers = {
      'Accept': 'application/vnd.api+json'
    };

    if (instance.auth_type === 'basic' && instance.credentials) {
      const { username, password } = instance.credentials;
      const encoded = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
    } else if (instance.auth_type === 'oauth' && instance.credentials) {
      headers['Authorization'] = `Bearer ${instance.credentials.access_token}`;
    }

    return headers;
  }

  mapDrupalToHeady(drupalInstanceId, drupalNodeId, drupalContentType, headyEntryId, headyContentType) {
    const id = uuidv4();

    this.db.prepare(`
      INSERT INTO drupal_content_map (id, drupal_instance_id, drupal_node_id, drupal_content_type, heady_entry_id, heady_content_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, drupalInstanceId, drupalNodeId, drupalContentType, headyEntryId, headyContentType);

    return id;
  }

  getMapping(drupalNodeId) {
    return this.db.prepare('SELECT * FROM drupal_content_map WHERE drupal_node_id = ?').get(drupalNodeId);
  }

  getMappingByHeadyId(headyEntryId) {
    return this.db.prepare('SELECT * FROM drupal_content_map WHERE heady_entry_id = ?').get(headyEntryId);
  }

  logSync(instanceId, syncType, direction) {
    const id = uuidv4();

    this.db.prepare(`
      INSERT INTO drupal_sync_log (id, drupal_instance_id, sync_type, direction, status)
      VALUES (?, ?, ?, ?, 'running')
    `).run(id, instanceId, syncType, direction);

    return id;
  }

  updateSyncLog(syncId, status, itemsSynced = 0, error = null) {
    this.db.prepare(`
      UPDATE drupal_sync_log 
      SET status = ?, items_synced = ?, error = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, itemsSynced, error, syncId);
  }

  getSyncHistory(instanceId, limit = 50) {
    return this.db.prepare(`
      SELECT * FROM drupal_sync_log 
      WHERE drupal_instance_id = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(instanceId, limit);
  }

  getStatistics(instanceId) {
    return {
      total_syncs: this.db.prepare('SELECT COUNT(*) as count FROM drupal_sync_log WHERE drupal_instance_id = ?').get(instanceId).count,
      successful_syncs: this.db.prepare('SELECT COUNT(*) as count FROM drupal_sync_log WHERE drupal_instance_id = ? AND status = "completed"').get(instanceId).count,
      failed_syncs: this.db.prepare('SELECT COUNT(*) as count FROM drupal_sync_log WHERE drupal_instance_id = ? AND status = "failed"').get(instanceId).count,
      mapped_content: this.db.prepare('SELECT COUNT(*) as count FROM drupal_content_map WHERE drupal_instance_id = ?').get(instanceId).count,
      last_sync: this.db.prepare('SELECT last_sync FROM drupal_instances WHERE id = ?').get(instanceId)?.last_sync
    };
  }
}

export default new DrupalConnector();
