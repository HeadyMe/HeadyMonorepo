// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/intelligence.routes.js
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

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import autoExecutor from '../intelligence/autoExecutor.js';
import intentRouter from '../intelligence/intentRouter.js';

const router = express.Router();

router.post('/process', authenticate, async (req, res, next) => {
  try {
    const { input, data } = req.body;
    
    const context = {
      user: req.user,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent')
    };

    let result;
    
    if (input && typeof input === 'string') {
      result = await intentRouter.processRequest(input, context);
    } else if (data && data.intent) {
      result = await intentRouter.processRequest(data, context);
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Provide either "input" (string) or "data" (object with intent)'
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/execute', authenticate, async (req, res, next) => {
  try {
    const { intent, data } = req.body;
    
    if (!intent) {
      return res.status(400).json({ error: 'Intent is required' });
    }

    const context = {
      user: req.user,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent')
    };

    const result = await autoExecutor.execute(intent, data || {}, context);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/pending-approvals', authenticate, (req, res, next) => {
  try {
    const userId = req.query.all === 'true' ? null : req.user.userId;
    const approvals = autoExecutor.getPendingApprovals(userId);
    
    res.json(approvals);
  } catch (error) {
    next(error);
  }
});

router.post('/approve/:executionId', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await autoExecutor.approveExecution(req.params.executionId, req.user.userId);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/feedback/:executionId', authenticate, async (req, res, next) => {
  try {
    const { wasCorrect, feedback } = req.body;
    
    await autoExecutor.recordFeedback(
      req.params.executionId,
      wasCorrect,
      feedback
    );
    
    res.json({ recorded: true });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticate, (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = autoExecutor.getExecutionHistory(limit);
    
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const context = {
      user: req.user,
      ip_address: req.ip || req.connection.remoteAddress
    };

    const analysis = await autoExecutor.analyzeIntent(input, context);
    const decision = await autoExecutor.shouldAutoExecute(analysis.intent, context);
    
    res.json({
      ...analysis,
      decision
    });
  } catch (error) {
    next(error);
  }
});

export default router;
