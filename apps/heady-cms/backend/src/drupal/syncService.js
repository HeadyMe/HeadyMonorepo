// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/drupal/syncService.js
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

import drupalConnector from './connector.js';
import { getDatabase } from '../database/index.js';
import auditLogger from '../audit/index.js';
import workflowEngine from '../automation/workflowEngine.js';
import { v4 as uuidv4 } from 'uuid';

export class DrupalSyncService {
  constructor() {
    this.db = getDatabase();
    this.syncInterval = null;
    this.autoSyncEnabled = true;
  }

  async syncDrupalToHeady(instanceId, contentType) {
    const syncId = drupalConnector.logSync(instanceId, 'drupal_to_heady', 'inbound');

    try {
      const drupalContent = await drupalConnector.fetchDrupalContent(instanceId, contentType);

      if (!drupalContent.data || drupalContent.data.length === 0) {
        drupalConnector.updateSyncLog(syncId, 'completed', 0);
        return { synced: 0, message: 'No content to sync' };
      }

      let syncedCount = 0;

      for (const node of drupalContent.data) {
        const existing = drupalConnector.getMapping(node.id);

        if (existing) {
          await this.updateHeadyEntry(existing.heady_entry_id, node);
        } else {
          await this.createHeadyEntry(instanceId, node, contentType);
        }

        syncedCount++;
      }

      drupalConnector.updateSyncLog(syncId, 'completed', syncedCount);

      const instance = drupalConnector.getDrupalInstance(instanceId);
      this.db.prepare('UPDATE drupal_instances SET last_sync = CURRENT_TIMESTAMP WHERE id = ?').run(instanceId);

      auditLogger.logSystemEvent({
        event_type: 'drupal_sync_completed',
        component: 'drupal_sync',
        severity: 'info',
        message: `Synced ${syncedCount} items from Drupal to Heady`,
        details: { instance_id: instanceId, content_type: contentType, sync_id: syncId }
      });

      return { synced: syncedCount, sync_id: syncId };
    } catch (error) {
      drupalConnector.updateSyncLog(syncId, 'failed', 0, error.message);

      auditLogger.logSystemEvent({
        event_type: 'drupal_sync_failed',
        component: 'drupal_sync',
        severity: 'error',
        message: 'Drupal to Heady sync failed',
        details: { instance_id: instanceId, error: error.message },
        stack_trace: error.stack
      });

      throw error;
    }
  }

  async createHeadyEntry(instanceId, drupalNode, contentType) {
    const headyContentType = this.mapDrupalContentType(contentType);
    
    const headyData = this.transformDrupalToHeady(drupalNode);

    const entryId = uuidv4();
    this.db.prepare(`
      INSERT INTO content_entries (id, content_type_id, data, status, created_by)
      VALUES (?, ?, ?, ?, 'drupal_sync')
    `).run(
      entryId,
      headyContentType,
      JSON.stringify(headyData),
      drupalNode.attributes.status ? 'published' : 'draft'
    );

    drupalConnector.mapDrupalToHeady(
      instanceId,
      drupalNode.id,
      contentType,
      entryId,
      headyContentType
    );

    return entryId;
  }

  async updateHeadyEntry(headyEntryId, drupalNode) {
    const headyData = this.transformDrupalToHeady(drupalNode);

    this.db.prepare(`
      UPDATE content_entries 
      SET data = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      JSON.stringify(headyData),
      drupalNode.attributes.status ? 'published' : 'draft',
      headyEntryId
    );

    this.db.prepare(`
      UPDATE drupal_content_map 
      SET last_synced = CURRENT_TIMESTAMP
      WHERE heady_entry_id = ?
    `).run(headyEntryId);
  }

  async syncHeadyToDrupal(instanceId, headyContentType) {
    const syncId = drupalConnector.logSync(instanceId, 'heady_to_drupal', 'outbound');

    try {
      const headyEntries = this.db.prepare(`
        SELECT * FROM content_entries 
        WHERE content_type_id = ?
      `).all(headyContentType);

      let syncedCount = 0;

      for (const entry of headyEntries) {
        const existing = drupalConnector.getMappingByHeadyId(entry.id);

        if (!existing) {
          const drupalContentType = this.mapHeadyToDrupalContentType(headyContentType);
          const drupalData = this.transformHeadyToDrupal(entry);

          const result = await drupalConnector.createDrupalContent(
            instanceId,
            drupalContentType,
            drupalData
          );

          drupalConnector.mapDrupalToHeady(
            instanceId,
            result.data.id,
            drupalContentType,
            entry.id,
            headyContentType
          );

          syncedCount++;
        }
      }

      drupalConnector.updateSyncLog(syncId, 'completed', syncedCount);

      return { synced: syncedCount, sync_id: syncId };
    } catch (error) {
      drupalConnector.updateSyncLog(syncId, 'failed', 0, error.message);
      throw error;
    }
  }

  transformDrupalToHeady(drupalNode) {
    const attributes = drupalNode.attributes || {};
    
    return {
      title: attributes.title,
      body: attributes.body?.value || attributes.body,
      created: attributes.created,
      changed: attributes.changed,
      drupal_id: drupalNode.id,
      drupal_uuid: attributes.drupal_internal__nid,
      ...attributes
    };
  }

  transformHeadyToDrupal(headyEntry) {
    const data = JSON.parse(headyEntry.data);
    
    return {
      title: data.title,
      body: {
        value: data.body || data.content,
        format: 'basic_html'
      },
      status: headyEntry.status === 'published',
      heady_id: headyEntry.id
    };
  }

  mapDrupalContentType(drupalType) {
    const mapping = {
      'article': 'blog',
      'page': 'page',
      'blog_post': 'blog'
    };

    return mapping[drupalType] || drupalType;
  }

  mapHeadyToDrupalContentType(headyType) {
    const mapping = {
      'blog': 'article',
      'page': 'page'
    };

    return mapping[headyType] || headyType;
  }

  startAutoSync(intervalMinutes = 15) {
    if (this.syncInterval) {
      return { started: false, reason: 'already_running' };
    }

    this.syncInterval = setInterval(async () => {
      const instances = drupalConnector.getAllDrupalInstances();

      for (const instance of instances) {
        if (instance.enabled) {
          try {
            await this.syncDrupalToHeady(instance.id, 'article');
          } catch (error) {
            console.error(`Auto-sync failed for ${instance.name}:`, error.message);
          }
        }
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`🔄 Drupal auto-sync started (every ${intervalMinutes} minutes)`);

    return { started: true, interval_minutes: intervalMinutes };
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      return { stopped: true };
    }
    return { stopped: false, reason: 'not_running' };
  }
}

export default new DrupalSyncService();
