// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/automation/autoDiscovery.js
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
import registry from '../registry/index.js';
import auditLogger from '../audit/index.js';
import { v4 as uuidv4 } from 'uuid';

export class AutoDiscoverySystem {
  constructor() {
    this.db = getDatabase();
    this.discoveryProtocols = new Map();
    this.initializeDiscoveryTables();
    this.registerProtocols();
    this.startDiscovery();
  }

  initializeDiscoveryTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS discovered_services (
        id TEXT PRIMARY KEY,
        service_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        protocol TEXT NOT NULL,
        discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        metadata TEXT,
        auto_registered INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS discovery_scans (
        id TEXT PRIMARY KEY,
        scan_type TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        services_found INTEGER DEFAULT 0,
        services_registered INTEGER DEFAULT 0,
        details TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_discovered_status ON discovered_services(status);
      CREATE INDEX IF NOT EXISTS idx_scans_started ON discovery_scans(started_at);
    `);
  }

  registerProtocols() {
    this.discoveryProtocols.set('http', {
      scan: async (config) => this.scanHTTP(config),
      verify: async (endpoint) => this.verifyHTTP(endpoint)
    });

    this.discoveryProtocols.set('mcp', {
      scan: async (config) => this.scanMCP(config),
      verify: async (endpoint) => this.verifyMCP(endpoint)
    });

    this.discoveryProtocols.set('local', {
      scan: async (config) => this.scanLocal(config),
      verify: async (endpoint) => this.verifyLocal(endpoint)
    });

    console.log(`🔍 Registered ${this.discoveryProtocols.size} discovery protocols`);
  }

  startDiscovery() {
    setInterval(() => {
      this.performDiscoveryScan();
    }, 5 * 60 * 1000);

    this.performDiscoveryScan();

    console.log('🌐 Auto-discovery system started');
  }

  async performDiscoveryScan() {
    const scanId = uuidv4();
    
    this.db.prepare(`
      INSERT INTO discovery_scans (id, scan_type)
      VALUES (?, 'full_scan')
    `).run(scanId);

    let totalFound = 0;
    let totalRegistered = 0;

    for (const [protocol, handler] of this.discoveryProtocols.entries()) {
      try {
        const services = await handler.scan({ protocol });
        totalFound += services.length;

        for (const service of services) {
          const registered = await this.registerDiscoveredService(service);
          if (registered) totalRegistered++;
        }
      } catch (error) {
        auditLogger.logSystemEvent({
          event_type: 'discovery_error',
          component: 'auto_discovery',
          severity: 'warning',
          message: `Discovery scan failed for protocol ${protocol}`,
          details: { error: error.message }
        });
      }
    }

    this.db.prepare(`
      UPDATE discovery_scans 
      SET completed_at = CURRENT_TIMESTAMP, services_found = ?, services_registered = ?
      WHERE id = ?
    `).run(totalFound, totalRegistered, scanId);

    if (totalRegistered > 0) {
      console.log(`🎯 Discovery scan complete: Found ${totalFound}, registered ${totalRegistered} services`);
    }
  }

  async scanHTTP(config) {
    const services = [];
    
    const commonPorts = [3000, 3001, 8000, 8080, 5000];
    const localhost = 'localhost';

    for (const port of commonPorts) {
      try {
        const endpoint = `http://${localhost}:${port}`;
        const isAlive = await this.verifyHTTP(endpoint);
        
        if (isAlive) {
          services.push({
            service_name: `http-service-${port}`,
            service_type: 'http_api',
            endpoint,
            protocol: 'http',
            metadata: { port, host: localhost }
          });
        }
      } catch (error) {
      }
    }

    return services;
  }

  async scanMCP(config) {
    const services = [];
    
    const mcpEndpoints = [
      { name: 'mcp-server-1', endpoint: 'http://localhost:3100' },
      { name: 'mcp-server-2', endpoint: 'http://localhost:3101' }
    ];

    for (const mcp of mcpEndpoints) {
      try {
        const isAlive = await this.verifyMCP(mcp.endpoint);
        
        if (isAlive) {
          services.push({
            service_name: mcp.name,
            service_type: 'mcp_server',
            endpoint: mcp.endpoint,
            protocol: 'mcp',
            metadata: { mcp_version: '2024-11-05' }
          });
        }
      } catch (error) {
      }
    }

    return services;
  }

  async scanLocal(config) {
    const services = [];
    
    const existingNodes = registry.getAllNodes();
    
    for (const node of existingNodes) {
      if (node.endpoint) {
        services.push({
          service_name: node.name,
          service_type: node.type,
          endpoint: node.endpoint,
          protocol: 'local',
          metadata: { node_id: node.id, from_registry: true }
        });
      }
    }

    return services;
  }

  async verifyHTTP(endpoint) {
    return false;
  }

  async verifyMCP(endpoint) {
    return false;
  }

  async verifyLocal(endpoint) {
    return true;
  }

  async registerDiscoveredService(service) {
    const existing = this.db.prepare(`
      SELECT * FROM discovered_services 
      WHERE endpoint = ? AND protocol = ?
    `).get(service.endpoint, service.protocol);

    if (existing) {
      this.db.prepare(`
        UPDATE discovered_services 
        SET last_seen = CURRENT_TIMESTAMP, status = 'active'
        WHERE id = ?
      `).run(existing.id);
      return false;
    }

    const serviceId = uuidv4();
    
    this.db.prepare(`
      INSERT INTO discovered_services (id, service_name, service_type, endpoint, protocol, metadata, auto_registered)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(
      serviceId,
      service.service_name,
      service.service_type,
      service.endpoint,
      service.protocol,
      JSON.stringify(service.metadata || {})
    );

    const nodeId = registry.registerNode({
      name: service.service_name,
      type: service.service_type,
      role: 'discovered_service',
      endpoint: service.endpoint,
      capabilities: ['auto_discovered'],
      metadata: { ...service.metadata, discovery_id: serviceId }
    });

    auditLogger.logSystemEvent({
      event_type: 'service_discovered',
      component: 'auto_discovery',
      severity: 'info',
      message: `New service discovered and registered: ${service.service_name}`,
      details: { service_id: serviceId, node_id: nodeId.id }
    });

    return true;
  }

  getDiscoveredServices(filters = {}) {
    let query = 'SELECT * FROM discovered_services WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.protocol) {
      query += ' AND protocol = ?';
      params.push(filters.protocol);
    }

    query += ' ORDER BY last_seen DESC';

    const services = this.db.prepare(query).all(...params);
    return services.map(s => ({
      ...s,
      metadata: JSON.parse(s.metadata)
    }));
  }

  getDiscoveryHistory(limit = 20) {
    const scans = this.db.prepare(`
      SELECT * FROM discovery_scans 
      ORDER BY started_at DESC 
      LIMIT ?
    `).all(limit);

    return scans.map(scan => ({
      ...scan,
      details: scan.details ? JSON.parse(scan.details) : null
    }));
  }

  markServiceInactive(serviceId) {
    this.db.prepare(`
      UPDATE discovered_services 
      SET status = 'inactive' 
      WHERE id = ?
    `).run(serviceId);

    const service = this.db.prepare('SELECT * FROM discovered_services WHERE id = ?').get(serviceId);
    if (service) {
      const metadata = JSON.parse(service.metadata);
      if (metadata.node_id) {
        registry.updateNodeStatus(metadata.node_id, 'inactive');
      }
    }
  }

  autoConfigureService(serviceId) {
    const service = this.db.prepare('SELECT * FROM discovered_services WHERE id = ?').get(serviceId);
    if (!service) return { configured: false, reason: 'Service not found' };

    const metadata = JSON.parse(service.metadata);
    const config = {
      endpoint: service.endpoint,
      protocol: service.protocol,
      auto_retry: true,
      health_check_interval: 30000,
      timeout: 5000
    };

    auditLogger.log({
      action: 'service_auto_configured',
      resource_type: 'discovered_services',
      resource_id: serviceId,
      metadata: { config },
      severity: 'info'
    });

    return { configured: true, config };
  }
}

export default new AutoDiscoverySystem();
