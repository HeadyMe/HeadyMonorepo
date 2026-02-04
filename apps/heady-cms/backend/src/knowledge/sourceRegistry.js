// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/knowledge/sourceRegistry.js
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

export class KnowledgeSourceRegistry {
  constructor() {
    this.db = getDatabase();
    this.initializeKnowledgeTables();
    this.registerDefaultSources();
  }

  initializeKnowledgeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_sources (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        base_url TEXT NOT NULL,
        api_endpoint TEXT,
        credibility_score REAL DEFAULT 0.8,
        enabled INTEGER DEFAULT 1,
        rate_limit_per_hour INTEGER DEFAULT 100,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_entries (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        url TEXT,
        metadata TEXT,
        credibility_score REAL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES knowledge_sources(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS knowledge_queries (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        source_id TEXT,
        results_count INTEGER DEFAULT 0,
        cached INTEGER DEFAULT 0,
        execution_time_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES knowledge_sources(id)
      );

      CREATE TABLE IF NOT EXISTS knowledge_cache (
        id TEXT PRIMARY KEY,
        query_hash TEXT UNIQUE NOT NULL,
        query TEXT NOT NULL,
        results TEXT NOT NULL,
        source_ids TEXT,
        expires_at DATETIME NOT NULL,
        hit_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS background_tasks (
        id TEXT PRIMARY KEY,
        task_type TEXT NOT NULL,
        source_id TEXT,
        topic TEXT,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 5,
        data TEXT,
        result TEXT,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_id) REFERENCES knowledge_sources(id)
      );

      CREATE INDEX IF NOT EXISTS idx_knowledge_topic ON knowledge_entries(topic);
      CREATE INDEX IF NOT EXISTS idx_knowledge_source ON knowledge_entries(source_id);
      CREATE INDEX IF NOT EXISTS idx_cache_hash ON knowledge_cache(query_hash);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON background_tasks(status);
    `);
  }

  registerDefaultSources() {
    const defaultSources = [
      {
        name: 'Wikipedia',
        type: 'encyclopedia',
        base_url: 'https://en.wikipedia.org',
        api_endpoint: 'https://en.wikipedia.org/w/api.php',
        credibility_score: 0.85,
        rate_limit_per_hour: 200,
        metadata: {
          language: 'en',
          format: 'json',
          supports_search: true,
          supports_extract: true
        }
      },
      {
        name: 'MDN Web Docs',
        type: 'technical_documentation',
        base_url: 'https://developer.mozilla.org',
        api_endpoint: 'https://developer.mozilla.org/api/v1',
        credibility_score: 0.95,
        rate_limit_per_hour: 100,
        metadata: {
          topics: ['web', 'javascript', 'css', 'html', 'api'],
          format: 'json'
        }
      },
      {
        name: 'Stack Overflow',
        type: 'qa_platform',
        base_url: 'https://stackoverflow.com',
        api_endpoint: 'https://api.stackexchange.com/2.3',
        credibility_score: 0.75,
        rate_limit_per_hour: 300,
        metadata: {
          requires_key: false,
          topics: ['programming', 'development'],
          format: 'json'
        }
      },
      {
        name: 'GitHub',
        type: 'code_repository',
        base_url: 'https://github.com',
        api_endpoint: 'https://api.github.com',
        credibility_score: 0.8,
        rate_limit_per_hour: 60,
        metadata: {
          requires_auth: true,
          topics: ['code', 'open-source'],
          format: 'json'
        }
      },
      {
        name: 'arXiv',
        type: 'research_papers',
        base_url: 'https://arxiv.org',
        api_endpoint: 'http://export.arxiv.org/api/query',
        credibility_score: 0.9,
        rate_limit_per_hour: 100,
        metadata: {
          topics: ['science', 'research', 'academic'],
          format: 'xml'
        }
      }
    ];

    for (const source of defaultSources) {
      const existing = this.db.prepare('SELECT id FROM knowledge_sources WHERE name = ?').get(source.name);
      if (!existing) {
        this.registerSource(source);
      }
    }

    console.log('📚 Knowledge sources registered');
  }

  registerSource(sourceData) {
    const id = uuidv4();
    const { name, type, base_url, api_endpoint, credibility_score, rate_limit_per_hour, metadata } = sourceData;

    this.db.prepare(`
      INSERT INTO knowledge_sources (id, name, type, base_url, api_endpoint, credibility_score, rate_limit_per_hour, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      type,
      base_url,
      api_endpoint || null,
      credibility_score || 0.8,
      rate_limit_per_hour || 100,
      JSON.stringify(metadata || {})
    );

    auditLogger.logSystemEvent({
      event_type: 'knowledge_source_registered',
      component: 'knowledge_registry',
      severity: 'info',
      message: `Knowledge source registered: ${name}`,
      details: { source_id: id, type }
    });

    return this.getSource(id);
  }

  getSource(id) {
    const source = this.db.prepare('SELECT * FROM knowledge_sources WHERE id = ? OR name = ?').get(id, id);
    if (source) {
      source.metadata = JSON.parse(source.metadata);
    }
    return source;
  }

  getAllSources(filters = {}) {
    let query = 'SELECT * FROM knowledge_sources WHERE 1=1';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.enabled !== undefined) {
      query += ' AND enabled = ?';
      params.push(filters.enabled ? 1 : 0);
    }

    query += ' ORDER BY credibility_score DESC';

    const sources = this.db.prepare(query).all(...params);
    return sources.map(s => ({
      ...s,
      metadata: JSON.parse(s.metadata)
    }));
  }

  updateSource(id, updates) {
    const source = this.getSource(id);
    if (!source) {
      throw new Error('Source not found');
    }

    const fields = [];
    const values = [];

    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }

    if (updates.credibility_score !== undefined) {
      fields.push('credibility_score = ?');
      values.push(updates.credibility_score);
    }

    if (updates.rate_limit_per_hour !== undefined) {
      fields.push('rate_limit_per_hour = ?');
      values.push(updates.rate_limit_per_hour);
    }

    if (updates.metadata) {
      fields.push('metadata = ?');
      values.push(JSON.stringify({ ...source.metadata, ...updates.metadata }));
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(source.id);

      this.db.prepare(`
        UPDATE knowledge_sources 
        SET ${fields.join(', ')}
        WHERE id = ?
      `).run(...values);
    }

    return this.getSource(id);
  }

  storeKnowledge(sourceId, knowledgeData) {
    const id = uuidv4();
    const { topic, title, content, summary, url, metadata, credibility_score } = knowledgeData;

    const source = this.getSource(sourceId);
    if (!source) {
      throw new Error('Source not found');
    }

    this.db.prepare(`
      INSERT INTO knowledge_entries (id, source_id, topic, title, content, summary, url, metadata, credibility_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sourceId,
      topic,
      title,
      content,
      summary || null,
      url || null,
      JSON.stringify(metadata || {}),
      credibility_score || source.credibility_score
    );

    return this.getKnowledge(id);
  }

  getKnowledge(id) {
    const entry = this.db.prepare('SELECT * FROM knowledge_entries WHERE id = ?').get(id);
    if (entry) {
      entry.metadata = JSON.parse(entry.metadata);
    }
    return entry;
  }

  searchKnowledge(query, options = {}) {
    const startTime = Date.now();
    const queryHash = this.hashQuery(query);

    const cached = this.getCachedResults(queryHash);
    if (cached) {
      this.recordQuery(query, null, cached.length, true, Date.now() - startTime);
      return {
        results: cached,
        cached: true,
        executionTime: Date.now() - startTime
      };
    }

    let sql = `
      SELECT ke.*, ks.name as source_name, ks.credibility_score as source_credibility
      FROM knowledge_entries ke
      JOIN knowledge_sources ks ON ke.source_id = ks.id
      WHERE ks.enabled = 1
      AND (
        ke.topic LIKE ? OR 
        ke.title LIKE ? OR 
        ke.content LIKE ? OR
        ke.summary LIKE ?
      )
    `;

    const searchTerm = `%${query}%`;
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (options.source_id) {
      sql += ' AND ke.source_id = ?';
      params.push(options.source_id);
    }

    if (options.min_credibility) {
      sql += ' AND ke.credibility_score >= ?';
      params.push(options.min_credibility);
    }

    sql += ' ORDER BY ke.credibility_score DESC, ke.last_updated DESC LIMIT ?';
    params.push(options.limit || 10);

    const results = this.db.prepare(sql).all(...params);
    const parsedResults = results.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata)
    }));

    this.cacheResults(queryHash, query, parsedResults);
    this.recordQuery(query, options.source_id, results.length, false, Date.now() - startTime);

    return {
      results: parsedResults,
      cached: false,
      executionTime: Date.now() - startTime
    };
  }

  hashQuery(query) {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  getCachedResults(queryHash) {
    const cached = this.db.prepare(`
      SELECT * FROM knowledge_cache 
      WHERE query_hash = ? AND expires_at > datetime('now')
    `).get(queryHash);

    if (cached) {
      this.db.prepare(`
        UPDATE knowledge_cache 
        SET hit_count = hit_count + 1, last_accessed = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cached.id);

      return JSON.parse(cached.results);
    }

    return null;
  }

  cacheResults(queryHash, query, results, ttlHours = 24) {
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_cache (id, query_hash, query, results, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      queryHash,
      query,
      JSON.stringify(results),
      expiresAt.toISOString()
    );
  }

  recordQuery(query, sourceId, resultsCount, cached, executionTime) {
    this.db.prepare(`
      INSERT INTO knowledge_queries (id, query, source_id, results_count, cached, execution_time_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      query,
      sourceId || null,
      resultsCount,
      cached ? 1 : 0,
      executionTime
    );
  }

  scheduleBackgroundTask(taskType, data, priority = 5) {
    const id = uuidv4();

    this.db.prepare(`
      INSERT INTO background_tasks (id, task_type, source_id, topic, data, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      id,
      taskType,
      data.source_id || null,
      data.topic || null,
      JSON.stringify(data),
      priority
    );

    auditLogger.logSystemEvent({
      event_type: 'background_task_scheduled',
      component: 'knowledge_registry',
      severity: 'info',
      message: `Background task scheduled: ${taskType}`,
      details: { task_id: id, priority }
    });

    return id;
  }

  getPendingTasks(limit = 10) {
    return this.db.prepare(`
      SELECT * FROM background_tasks 
      WHERE status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT ?
    `).all(limit).map(t => ({
      ...t,
      data: JSON.parse(t.data),
      result: t.result ? JSON.parse(t.result) : null
    }));
  }

  updateTaskStatus(taskId, status, result = null) {
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];

    if (status === 'running') {
      updates.push('started_at = CURRENT_TIMESTAMP');
    } else if (status === 'completed' || status === 'failed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }

    if (result) {
      updates.push('result = ?');
      params.push(JSON.stringify(result));
    }

    params.push(taskId);

    this.db.prepare(`
      UPDATE background_tasks 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  getStatistics() {
    return {
      total_sources: this.db.prepare('SELECT COUNT(*) as count FROM knowledge_sources').get().count,
      enabled_sources: this.db.prepare('SELECT COUNT(*) as count FROM knowledge_sources WHERE enabled = 1').get().count,
      total_entries: this.db.prepare('SELECT COUNT(*) as count FROM knowledge_entries').get().count,
      total_queries: this.db.prepare('SELECT COUNT(*) as count FROM knowledge_queries').get().count,
      cache_hit_rate: this.calculateCacheHitRate(),
      pending_tasks: this.db.prepare('SELECT COUNT(*) as count FROM background_tasks WHERE status = "pending"').get().count,
      avg_query_time: this.db.prepare('SELECT AVG(execution_time_ms) as avg FROM knowledge_queries WHERE cached = 0').get().avg || 0
    };
  }

  calculateCacheHitRate() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_queries').get().count;
    const cached = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_queries WHERE cached = 1').get().count;
    return total > 0 ? ((cached / total) * 100).toFixed(2) : 0;
  }

  cleanupExpiredCache() {
    const deleted = this.db.prepare(`
      DELETE FROM knowledge_cache 
      WHERE expires_at < datetime('now')
    `).run();

    return deleted.changes;
  }
}

export default new KnowledgeSourceRegistry();
