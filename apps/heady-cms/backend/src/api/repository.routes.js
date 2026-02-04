// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/repository.routes.js
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
import autoSync from '../repository/autoSync.js';

const router = express.Router();

router.post('/commit', authenticate, async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await autoSync.autoCommit(message || 'Manual commit via API');
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/push', authenticate, async (req, res, next) => {
  try {
    const result = await autoSync.autoPush();
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/status', authenticate, async (req, res, next) => {
  try {
    const status = await autoSync.getGitStatus();
    const stats = autoSync.getStatistics();
    
    res.json({ ...status, ...stats });
  } catch (error) {
    next(error);
  }
});

router.get('/dependencies', authenticate, async (req, res, next) => {
  try {
    const deps = await autoSync.ensureDependencies();
    
    res.json(deps);
  } catch (error) {
    next(error);
  }
});

router.post('/dependencies/update', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { packages } = req.body;
    const result = await autoSync.updateDependencies(packages || []);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/sync/start', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const { interval_minutes } = req.body;
    const result = autoSync.startAutoSync(interval_minutes || 5);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/sync/stop', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const result = autoSync.stopAutoSync();
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/backup', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await autoSync.createBackup();
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticate, (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = autoSync.getSyncHistory(limit);
    
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const { auto_commit, auto_push } = req.body;
    
    const result = {};
    
    if (auto_commit !== undefined) {
      Object.assign(result, autoSync.setAutoCommit(auto_commit));
    }
    
    if (auto_push !== undefined) {
      Object.assign(result, autoSync.setAutoPush(auto_push));
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
