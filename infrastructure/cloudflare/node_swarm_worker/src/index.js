// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: infrastructure/cloudflare/node_swarm_worker/src/index.js
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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

function maybeOptions(request) {
  if (request.method !== 'OPTIONS') return null;
  return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
}

function authRequired(env) {
  const token = env.HEADY_NODE_SWARM_TOKEN || env.NODE_SWARM_TOKEN;
  return typeof token === 'string' && token.length > 0;
}

function isAuthorized(request, env) {
  const token = env.HEADY_NODE_SWARM_TOKEN || env.NODE_SWARM_TOKEN;
  if (!token) return true;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  return auth.slice('Bearer '.length) === token;
}

export default {
  async fetch(request, env) {
    const opt = maybeOptions(request);
    if (opt) return opt;

    const url = new URL(request.url);

    if (url.pathname.startsWith('/internal/')) {
      return jsonResponse({ success: false, error: 'not_found' }, 404);
    }

    if (authRequired(env) && !isAuthorized(request, env)) {
      return jsonResponse({ success: false, error: 'unauthorized' }, 401, {
        'WWW-Authenticate': 'Bearer'
      });
    }

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return jsonResponse({ ok: true, service: 'heady-node-swarm-worker' });
    }

    if (!url.pathname.startsWith('/api/')) {
      return jsonResponse({ success: false, error: 'not_found' }, 404);
    }

    const registryId = env.NODE_REGISTRY.idFromName('registry');
    const registry = env.NODE_REGISTRY.get(registryId);
    return registry.fetch(request);
  }
};

export class NodeRegistry {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const opt = maybeOptions(request);
    if (opt) return opt;

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health' || path === '/api/health') {
      return jsonResponse({ ok: true, service: 'heady-node-registry' });
    }

    if (path === '/api/nodes' && request.method === 'GET') {
      const nodes = await this._listNodes();
      return jsonResponse({ success: true, nodes });
    }

    if (path === '/api/nodes/allocate' && request.method === 'POST') {
      const body = await safeJson(request);
      const allocation = await this._allocate(body || {});
      return jsonResponse({ success: true, allocation });
    }

    const nodeDispatchMatch = path.match(/^\/api\/nodes\/([^\/]+)\/dispatch$/);
    if (nodeDispatchMatch && request.method === 'POST') {
      const nodeId = decodeURIComponent(nodeDispatchMatch[1]);
      const body = await safeJson(request);
      const result = await this._dispatch(nodeId, body || {});
      return jsonResponse({ success: true, ...result });
    }

    const nodeGetMatch = path.match(/^\/api\/nodes\/([^\/]+)$/);
    if (nodeGetMatch && request.method === 'GET') {
      const nodeId = decodeURIComponent(nodeGetMatch[1]);
      const info = await this._getNode(nodeId);
      if (!info) return jsonResponse({ success: false, error: 'node_not_found' }, 404);
      return jsonResponse({ success: true, node: info });
    }

    const nodeReleaseMatch = path.match(/^\/api\/nodes\/([^\/]+)\/release$/);
    if (nodeReleaseMatch && request.method === 'POST') {
      const nodeId = decodeURIComponent(nodeReleaseMatch[1]);
      const released = await this._release(nodeId);
      if (!released) return jsonResponse({ success: false, error: 'node_not_found' }, 404);
      return jsonResponse({ success: true, node: released });
    }

    if (path === '/internal/node_status' && request.method === 'POST') {
      const body = await safeJson(request);
      const updated = await this._updateNodeStatus(body || {});
      return jsonResponse({ success: true, node: updated });
    }

    return jsonResponse({ success: false, error: 'not_found' }, 404);
  }

  async _loadNodes() {
    const nodes = await this.state.storage.get('nodes');
    if (!nodes || typeof nodes !== 'object') return {};
    return nodes;
  }

  async _saveNodes(nodes) {
    await this.state.storage.put('nodes', nodes);
  }

  async _listNodes() {
    const nodes = await this._loadNodes();
    return Object.values(nodes).sort((a, b) => {
      const at = Date.parse(a.created_at || 0) || 0;
      const bt = Date.parse(b.created_at || 0) || 0;
      return bt - at;
    });
  }

  async _allocate(body) {
    const reuse = body.reuse !== undefined ? Boolean(body.reuse) : true;
    const requestedId = typeof body.node_id === 'string' && body.node_id.trim() ? body.node_id.trim() : null;

    const now = new Date().toISOString();
    const nodes = await this._loadNodes();

    if (requestedId) {
      if (!nodes[requestedId]) {
        nodes[requestedId] = {
          id: requestedId,
          status: 'IDLE',
          created_at: now,
          updated_at: now,
          last_seen_at: now,
          tasks_total: 0
        };
        await this._saveNodes(nodes);
      }
      await this._initNode(requestedId);
      return { node: nodes[requestedId] };
    }

    if (reuse) {
      const idle = Object.values(nodes).find(n => n && n.status === 'IDLE');
      if (idle && idle.id) {
        idle.updated_at = now;
        await this._saveNodes(nodes);
        return { node: idle, reused: true };
      }
    }

    const nodeId = `node-${crypto.randomUUID()}`;
    nodes[nodeId] = {
      id: nodeId,
      status: 'IDLE',
      created_at: now,
      updated_at: now,
      last_seen_at: now,
      tasks_total: 0
    };
    await this._saveNodes(nodes);
    await this._initNode(nodeId);
    return { node: nodes[nodeId], reused: false };
  }

  async _initNode(nodeId) {
    const nodeStub = this.env.NODE.get(this.env.NODE.idFromName(nodeId));
    await nodeStub.fetch('https://node.internal/internal/init', {
      method: 'POST',
      headers: {
        'X-Node-Id': nodeId
      }
    });
  }

  async _dispatch(nodeId, body) {
    const nodes = await this._loadNodes();
    const node = nodes[nodeId];
    if (!node) return { success: false, error: 'node_not_found' };

    const taskId = typeof body.task_id === 'string' && body.task_id.trim() ? body.task_id.trim() : crypto.randomUUID();
    const task = {
      id: taskId,
      instruction: body.instruction || null,
      payload: body.payload || null,
      created_at: new Date().toISOString()
    };

    node.status = 'BUSY';
    node.updated_at = new Date().toISOString();
    node.last_task_id = taskId;
    node.tasks_total = Number.isFinite(Number(node.tasks_total)) ? Number(node.tasks_total) + 1 : 1;
    await this._saveNodes(nodes);

    const nodeStub = this.env.NODE.get(this.env.NODE.idFromName(nodeId));
    const resp = await nodeStub.fetch('https://node.internal/api/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Node-Id': nodeId
      },
      body: JSON.stringify(task)
    });

    const nodeResp = await safeJsonResponse(resp);
    return { node_id: nodeId, task_id: taskId, node_response: nodeResp };
  }

  async _getNode(nodeId) {
    const nodes = await this._loadNodes();
    const node = nodes[nodeId];
    if (!node) return null;

    const nodeStub = this.env.NODE.get(this.env.NODE.idFromName(nodeId));
    const resp = await nodeStub.fetch('https://node.internal/api/state', {
      method: 'GET',
      headers: {
        'X-Node-Id': nodeId
      }
    });
    const state = await safeJsonResponse(resp);
    return { ...node, state };
  }

  async _release(nodeId) {
    const nodes = await this._loadNodes();
    const node = nodes[nodeId];
    if (!node) return null;

    node.status = 'RELEASED';
    node.updated_at = new Date().toISOString();
    await this._saveNodes(nodes);

    const nodeStub = this.env.NODE.get(this.env.NODE.idFromName(nodeId));
    await nodeStub.fetch('https://node.internal/internal/release', {
      method: 'POST',
      headers: {
        'X-Node-Id': nodeId
      }
    });

    return node;
  }

  async _updateNodeStatus(body) {
    const nodeId = typeof body.node_id === 'string' ? body.node_id : null;
    if (!nodeId) return null;

    const nodes = await this._loadNodes();
    const now = new Date().toISOString();
    const node = nodes[nodeId] || { id: nodeId, created_at: now, tasks_total: 0 };

    if (typeof body.status === 'string' && body.status) {
      node.status = body.status;
    }

    node.updated_at = now;
    node.last_seen_at = now;

    if (typeof body.last_task_id === 'string') {
      node.last_task_id = body.last_task_id;
    }

    nodes[nodeId] = node;
    await this._saveNodes(nodes);
    return node;
  }
}

export class HeadyNode {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const opt = maybeOptions(request);
    if (opt) return opt;

    const url = new URL(request.url);
    const path = url.pathname;
    const nodeId = request.headers.get('X-Node-Id') || url.searchParams.get('node_id') || null;

    if (path === '/internal/init' && request.method === 'POST') {
      const meta = await this._ensureMeta(nodeId);
      await this._notifyRegistry(nodeId, meta.status, meta.last_task_id || null);
      return jsonResponse({ success: true, node_id: meta.id, status: meta.status });
    }

    if (path === '/internal/release' && request.method === 'POST') {
      const meta = await this._ensureMeta(nodeId);
      meta.status = 'RELEASED';
      meta.updated_at = new Date().toISOString();
      await this.state.storage.put('meta', meta);
      await this._notifyRegistry(meta.id, meta.status, meta.last_task_id || null);
      return jsonResponse({ success: true, node_id: meta.id, status: meta.status });
    }

    if (path === '/api/state' && request.method === 'GET') {
      const meta = await this._ensureMeta(nodeId);
      const tasks = await this.state.storage.get('tasks');
      return jsonResponse({ success: true, node_id: meta.id, meta, tasks: Array.isArray(tasks) ? tasks : [] });
    }

    if (path === '/api/dispatch' && request.method === 'POST') {
      const meta = await this._ensureMeta(nodeId);
      const task = await safeJson(request);
      if (!task || typeof task !== 'object') {
        return jsonResponse({ success: false, error: 'invalid_task' }, 400);
      }

      meta.status = 'BUSY';
      meta.updated_at = new Date().toISOString();
      meta.last_task_id = typeof task.id === 'string' ? task.id : meta.last_task_id || null;
      meta.tasks_total = Number.isFinite(Number(meta.tasks_total)) ? Number(meta.tasks_total) + 1 : 1;
      await this.state.storage.put('meta', meta);

      const tasks = await this.state.storage.get('tasks');
      const list = Array.isArray(tasks) ? tasks : [];
      list.push({
        ...task,
        status: 'QUEUED',
        queued_at: new Date().toISOString()
      });
      const trimmed = list.slice(-100);
      await this.state.storage.put('tasks', trimmed);

      await this._notifyRegistry(meta.id, meta.status, meta.last_task_id || null);
      await this.state.storage.setAlarm(Date.now() + 100);

      return jsonResponse({ success: true, node_id: meta.id, accepted: true, task_id: meta.last_task_id });
    }

    return jsonResponse({ success: false, error: 'not_found' }, 404);
  }

  async alarm() {
    const meta = await this.state.storage.get('meta');
    if (!meta || typeof meta !== 'object') return;

    const tasks = await this.state.storage.get('tasks');
    const list = Array.isArray(tasks) ? tasks : [];

    let changed = false;
    for (const t of list) {
      if (t && t.status === 'QUEUED') {
        t.status = 'COMPLETE';
        t.completed_at = new Date().toISOString();
        changed = true;
        break;
      }
    }

    if (!changed) {
      if (meta.status !== 'IDLE') {
        meta.status = 'IDLE';
        meta.updated_at = new Date().toISOString();
        await this.state.storage.put('meta', meta);
        await this._notifyRegistry(meta.id, meta.status, meta.last_task_id || null);
      }
      return;
    }

    const stillQueued = list.some(t => t && t.status === 'QUEUED');
    meta.status = stillQueued ? 'BUSY' : 'IDLE';
    meta.updated_at = new Date().toISOString();

    await this.state.storage.put('tasks', list.slice(-100));
    await this.state.storage.put('meta', meta);
    await this._notifyRegistry(meta.id, meta.status, meta.last_task_id || null);

    if (stillQueued) {
      await this.state.storage.setAlarm(Date.now() + 100);
    }
  }

  async _ensureMeta(nodeId) {
    const existing = await this.state.storage.get('meta');
    if (existing && typeof existing === 'object' && existing.id) return existing;

    const now = new Date().toISOString();
    const id = nodeId || `node-${crypto.randomUUID()}`;
    const meta = {
      id,
      status: 'IDLE',
      created_at: now,
      updated_at: now,
      tasks_total: 0
    };

    await this.state.storage.put('meta', meta);
    return meta;
  }

  async _notifyRegistry(nodeId, status, lastTaskId) {
    if (!nodeId) return;
    const registryId = this.env.NODE_REGISTRY.idFromName('registry');
    const registry = this.env.NODE_REGISTRY.get(registryId);
    await registry.fetch('https://registry.internal/internal/node_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        node_id: nodeId,
        status,
        last_task_id: lastTaskId
      })
    });
  }
}

async function safeJson(request) {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function safeJsonResponse(response) {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
