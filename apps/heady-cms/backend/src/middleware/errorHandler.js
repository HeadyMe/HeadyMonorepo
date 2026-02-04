// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/middleware/errorHandler.js
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

import errorRecoverySystem from './errorRecovery.js';
import auditLogger from '../audit/index.js';

export const errorHandler = async (err, req, res, next) => {
  console.error('Error:', err);

  const context = {
    user: req.user,
    ip_address: req.ip || req.connection.remoteAddress,
    endpoint: req.path,
    method: req.method,
    user_agent: req.get('user-agent')
  };

  const recovery = await errorRecoverySystem.handleError(err, context);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details,
      recovery: recovery.action
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message
    });
  }
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }

  if (err.code === 'SQLITE_BUSY' && recovery.recovered) {
    return res.status(503).json({
      error: 'Service Temporarily Unavailable',
      message: 'Please retry your request',
      retry_after: 1
    });
  }
  
  auditLogger.logSystemEvent({
    event_type: 'unhandled_error',
    component: 'error_handler',
    severity: 'error',
    message: err.message,
    details: { context, recovery },
    stack_trace: err.stack
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    recovery: recovery.action,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
