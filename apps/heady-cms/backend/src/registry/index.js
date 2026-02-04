// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/registry/index.js
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
import { v4 as uuidv4 } from 'uuid';

export class HeadyRegistry {
  constructor() {
    this.db = getDatabase();
    this.initializeRegistry();
  }

  initializeRegistry() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS registry_nodes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'inactive',
        endpoint TEXT,
        capabilities TEXT,
        metadata TEXT,
        health_check_url TEXT,
        last_heartbeat DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS registry_services (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        version TEXT NOT NULL,
        status TEXT DEFAULT 'stopped',
        config TEXT,
        dependencies TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (node_id) REFERENCES registry_nodes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS registry_connections (
        id TEXT PRIMARY KEY,
        source_node_id TEXT NOT NULL,
        target_node_id TEXT NOT NULL,
        connection_type TEXT NOT NULL,
        protocol TEXT NOT NULL,
        status TEXT DEFAULT 'disconnected',
        latency_ms INTEGER,
        last_verified DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_node_id) REFERENCES registry_nodes(id) ON DELETE CASCADE,
        FOREIGN KEY (target_node_id) REFERENCES registry_nodes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_nodes_status ON registry_nodes(status);
      CREATE INDEX IF NOT EXISTS idx_services_node ON registry_services(node_id);
      CREATE INDEX IF NOT EXISTS idx_connections_source ON registry_connections(source_node_id);
    `);
  }

  registerNode(nodeData) {
    const id = uuidv4();
    const { name, type, role, endpoint, capabilities, metadata, health_check_url } = nodeData;

    this.db.prepare(`
      INSERT INTO registry_nodes (id, name, type, role, endpoint, capabilities, metadata, health_check_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
      id,
      name,
      type,
      role,
      endpoint || null,
      JSON.stringify(capabilities || []),
      JSON.stringify(metadata || {}),
      health_check_url || null
    );

    return this.getNode(id);
  }

  getNode(id) {
    const node = this.db.prepare('SELECT * FROM registry_nodes WHERE id = ? OR name = ?').get(id, id);
    if (node) {
      node.capabilities = JSON.parse(node.capabilities);
      node.metadata = JSON.parse(node.metadata);
    }
    return node;
  }

  getAllNodes(filters = {}) {
    let query = 'SELECT * FROM registry_nodes WHERE 1=1';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const nodes = this.db.prepare(query).all(...params);
    return nodes.map(node => ({
      ...node,
      capabilities: JSON.parse(node.capabilities),
      metadata: JSON.parse(node.metadata)
    }));
  }

  updateNodeStatus(nodeId, status) {
    this.db.prepare(`
      UPDATE registry_nodes 
      SET status = ?, last_heartbeat = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, nodeId);
  }

  registerService(serviceData) {
    const id = uuidv4();
    const { node_id, service_name, service_type, version, config, dependencies } = serviceData;

    this.db.prepare(`
      INSERT INTO registry_services (id, node_id, service_name, service_type, version, config, dependencies, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'running')
    `).run(
      id,
      node_id,
      service_name,
      service_type,
      version,
      JSON.stringify(config || {}),
      JSON.stringify(dependencies || [])
    );

    return this.getService(id);
  }

  getService(id) {
    const service = this.db.prepare('SELECT * FROM registry_services WHERE id = ?').get(id);
    if (service) {
      service.config = JSON.parse(service.config);
      service.dependencies = JSON.parse(service.dependencies);
    }
    return service;
  }

  getNodeServices(nodeId) {
    const services = this.db.prepare('SELECT * FROM registry_services WHERE node_id = ?').all(nodeId);
    return services.map(service => ({
      ...service,
      config: JSON.parse(service.config),
      dependencies: JSON.parse(service.dependencies)
    }));
  }

  registerConnection(connectionData) {
    const id = uuidv4();
    const { source_node_id, target_node_id, connection_type, protocol } = connectionData;

    this.db.prepare(`
      INSERT INTO registry_connections (id, source_node_id, target_node_id, connection_type, protocol, status)
      VALUES (?, ?, ?, ?, ?, 'connected')
    `).run(id, source_node_id, target_node_id, connection_type, protocol);

    return this.getConnection(id);
  }

  getConnection(id) {
    return this.db.prepare('SELECT * FROM registry_connections WHERE id = ?').get(id);
  }

  getNodeConnections(nodeId) {
    return this.db.prepare(`
      SELECT * FROM registry_connections 
      WHERE source_node_id = ? OR target_node_id = ?
    `).all(nodeId, nodeId);
  }

  verifyConnection(connectionId, latencyMs) {
    this.db.prepare(`
      UPDATE registry_connections 
      SET latency_ms = ?, last_verified = CURRENT_TIMESTAMP, status = 'connected'
      WHERE id = ?
    `).run(latencyMs, connectionId);
  }

  getSystemTopology() {
    const nodes = this.getAllNodes();
    const connections = this.db.prepare('SELECT * FROM registry_connections').all();
    
    return {
      nodes,
      connections,
      stats: {
        total_nodes: nodes.length,
        active_nodes: nodes.filter(n => n.status === 'active').length,
        total_connections: connections.length,
        healthy_connections: connections.filter(c => c.status === 'connected').length
      }
    };
  }
}

export default new HeadyRegistry();
