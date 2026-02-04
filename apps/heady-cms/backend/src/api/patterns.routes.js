// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/patterns.routes.js
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

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import patternRecognizer from '../patterns/recognizer.js';
import patternOptimizer from '../patterns/patternOptimizer.js';

const router = express.Router();

router.post('/analyze', authenticate, (req, res, next) => {
  try {
    const { input, context } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const analysis = patternRecognizer.analyzeInput(input, {
      ...context,
      user: req.user,
      ip_address: req.ip
    });
    
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

router.get('/insights', authenticate, (req, res, next) => {
  try {
    const insights = patternRecognizer.getPatternInsights();
    
    res.json(insights);
  } catch (error) {
    next(error);
  }
});

router.get('/urgent', authenticate, (req, res, next) => {
  try {
    const minUrgency = parseInt(req.query.min_urgency) || 5;
    const patterns = patternRecognizer.getPatternsByUrgency(minUrgency);
    
    res.json(patterns);
  } catch (error) {
    next(error);
  }
});

router.get('/status', authenticate, (req, res, next) => {
  try {
    const status = patternRecognizer.getElevatedStatus();
    
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.post('/optimize', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await patternOptimizer.applyPatternBasedOptimizations();
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/optimizations', authenticate, async (req, res, next) => {
  try {
    const optimizations = await patternOptimizer.optimizeFromPatterns();
    
    res.json(optimizations);
  } catch (error) {
    next(error);
  }
});

router.post('/breakdown', authenticate, (req, res, next) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const breakdown = patternOptimizer.breakDownToPatterns(data);
    
    res.json(breakdown);
  } catch (error) {
    next(error);
  }
});

router.post('/merge', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const { pattern_ids } = req.body;
    
    if (!Array.isArray(pattern_ids) || pattern_ids.length < 2) {
      return res.status(400).json({ error: 'At least 2 pattern IDs required' });
    }

    const result = patternOptimizer.mergePatterns(pattern_ids);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
