// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/middleware/auditMiddleware.js
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

import auditLogger from '../audit/index.js';

export const auditMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    res.send = originalSend;
    
    const duration = Date.now() - startTime;
    
    if (req.user) {
      const action = getActionFromMethod(req.method);
      const resourceType = getResourceTypeFromPath(req.path);
      const resourceId = getResourceIdFromPath(req.path);

      auditLogger.log({
        user_id: req.user.userId,
        user_email: req.user.email,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        method: req.method,
        endpoint: req.path,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
        status_code: res.statusCode,
        metadata: {
          duration_ms: duration,
          query: req.query,
          body_size: req.get('content-length')
        },
        severity: getSeverityFromStatus(res.statusCode)
      });
    }

    return res.send(data);
  };

  next();
};

function getActionFromMethod(method) {
  const actions = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };
  return actions[method] || 'unknown';
}

function getResourceTypeFromPath(path) {
  const parts = path.split('/').filter(p => p);
  
  if (parts.includes('content-types')) return 'content_types';
  if (parts.includes('entries')) return 'content_entries';
  if (parts.includes('media')) return 'media';
  if (parts.includes('users')) return 'users';
  if (parts.includes('auth')) return 'authentication';
  if (parts.includes('automation')) return 'automation';
  
  return parts[parts.length - 1] || 'unknown';
}

function getResourceIdFromPath(path) {
  const parts = path.split('/').filter(p => p);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  for (let i = parts.length - 1; i >= 0; i--) {
    if (uuidPattern.test(parts[i]) || /^\d+$/.test(parts[i])) {
      return parts[i];
    }
  }
  
  return null;
}

function getSeverityFromStatus(statusCode) {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warning';
  if (statusCode >= 300) return 'info';
  return 'info';
}

export const trackChanges = (oldData, newData) => {
  const changes = {};
  
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  
  for (const key of allKeys) {
    if (JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])) {
      changes[key] = {
        old: oldData?.[key],
        new: newData?.[key]
      };
    }
  }
  
  return changes;
};
