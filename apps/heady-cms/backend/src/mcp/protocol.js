// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/mcp/protocol.js
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

import { v4 as uuidv4 } from 'uuid';
import auditLogger from '../audit/index.js';

export class MCPProtocol {
  constructor() {
    this.handlers = new Map();
    this.middleware = [];
    this.schemas = new Map();
  }

  registerHandler(method, handler, schema = null) {
    this.handlers.set(method, handler);
    if (schema) {
      this.schemas.set(method, schema);
    }
  }

  use(middleware) {
    this.middleware.push(middleware);
  }

  async handleRequest(request, context = {}) {
    const requestId = uuidv4();
    const startTime = Date.now();

    try {
      const validatedRequest = this.validateRequest(request);
      
      let processedContext = { ...context, requestId, startTime };
      for (const mw of this.middleware) {
        processedContext = await mw(validatedRequest, processedContext);
      }

      const handler = this.handlers.get(validatedRequest.method);
      if (!handler) {
        throw new Error(`Unknown method: ${validatedRequest.method}`);
      }

      if (this.schemas.has(validatedRequest.method)) {
        this.validateSchema(validatedRequest.params, this.schemas.get(validatedRequest.method));
      }

      const result = await handler(validatedRequest.params, processedContext);

      auditLogger.log({
        action: 'mcp_request',
        resource_type: 'mcp_protocol',
        resource_id: validatedRequest.method,
        metadata: {
          request_id: requestId,
          method: validatedRequest.method,
          duration_ms: Date.now() - startTime
        },
        severity: 'info'
      });

      return {
        jsonrpc: '2.0',
        id: validatedRequest.id,
        result
      };
    } catch (error) {
      auditLogger.logSystemEvent({
        event_type: 'mcp_error',
        component: 'mcp_protocol',
        severity: 'error',
        message: error.message,
        details: { request, requestId },
        stack_trace: error.stack
      });

      return {
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: error.code || -32603,
          message: error.message,
          data: error.data
        }
      };
    }
  }

  validateRequest(request) {
    if (!request || typeof request !== 'object') {
      throw new Error('Invalid request format');
    }

    if (request.jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC version');
    }

    if (!request.method || typeof request.method !== 'string') {
      throw new Error('Missing or invalid method');
    }

    return request;
  }

  validateSchema(params, schema) {
    if (typeof schema === 'function') {
      const result = schema(params);
      if (result.error) {
        throw new Error(`Schema validation failed: ${result.error.message}`);
      }
    }
  }

  createNotification(method, params) {
    return {
      jsonrpc: '2.0',
      method,
      params
    };
  }

  createRequest(method, params, id = uuidv4()) {
    return {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
  }
}

export class MCPServer extends MCPProtocol {
  constructor(name, version) {
    super();
    this.name = name;
    this.version = version;
    this.capabilities = new Set();
    this.setupCoreHandlers();
  }

  setupCoreHandlers() {
    this.registerHandler('initialize', async (params) => {
      return {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: this.name,
          version: this.version
        },
        capabilities: Array.from(this.capabilities)
      };
    });

    this.registerHandler('ping', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    this.registerHandler('shutdown', async () => {
      return { status: 'shutting_down' };
    });
  }

  addCapability(capability) {
    this.capabilities.add(capability);
  }
}

export class MCPClient extends MCPProtocol {
  constructor(serverUrl) {
    super();
    this.serverUrl = serverUrl;
    this.connected = false;
    this.requestQueue = [];
  }

  async connect() {
    const response = await this.sendRequest('initialize', {
      clientInfo: {
        name: 'heady-client',
        version: '1.0.0'
      }
    });

    this.connected = true;
    this.serverCapabilities = response.result.capabilities;
    return response.result;
  }

  async sendRequest(method, params) {
    const request = this.createRequest(method, params);
    
    return request;
  }

  disconnect() {
    this.connected = false;
  }
}

export default MCPProtocol;
