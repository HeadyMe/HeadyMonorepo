// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/knowledge.routes.js
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
import knowledgeRegistry from '../knowledge/sourceRegistry.js';
import backgroundIngestion from '../knowledge/backgroundIngestion.js';
import contextEnricher from '../knowledge/contextEnricher.js';

const router = express.Router();

router.get('/sources', authenticate, (req, res, next) => {
  try {
    const sources = knowledgeRegistry.getAllSources({
      type: req.query.type,
      enabled: req.query.enabled === 'true'
    });
    
    res.json(sources);
  } catch (error) {
    next(error);
  }
});

router.post('/sources', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const source = knowledgeRegistry.registerSource(req.body);
    
    res.status(201).json(source);
  } catch (error) {
    next(error);
  }
});

router.put('/sources/:id', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const source = knowledgeRegistry.updateSource(req.params.id, req.body);
    
    res.json(source);
  } catch (error) {
    next(error);
  }
});

router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { query, source_id, min_credibility, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = knowledgeRegistry.searchKnowledge(query, {
      source_id,
      min_credibility: min_credibility ? parseFloat(min_credibility) : undefined,
      limit: limit ? parseInt(limit) : 10
    });
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.post('/fetch', authenticate, async (req, res, next) => {
  try {
    const { topic, source_id, immediate } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (immediate) {
      const result = await backgroundIngestion.fetchImmediate(topic, source_id);
      return res.json(result);
    }

    const taskId = backgroundIngestion.scheduleKnowledgeFetch(topic, source_id, 8);
    
    res.json({
      scheduled: true,
      task_id: taskId,
      message: 'Knowledge fetch scheduled'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/enrich', authenticate, async (req, res, next) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const enriched = await contextEnricher.enrichBeforeResponse(query, context || {});
    
    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

router.post('/enrich-response', authenticate, async (req, res, next) => {
  try {
    const { query, response, context } = req.body;
    
    if (!query || !response) {
      return res.status(400).json({ error: 'Query and response are required' });
    }

    const enrichedResponse = await contextEnricher.getEnrichedResponse(query, response, context || {});
    
    res.json(enrichedResponse);
  } catch (error) {
    next(error);
  }
});

router.post('/preload', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { topics } = req.body;
    
    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'Topics array is required' });
    }

    const result = await contextEnricher.preloadKnowledge(topics);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', authenticate, (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tasks = knowledgeRegistry.getPendingTasks(limit);
    
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/statistics', authenticate, (req, res, next) => {
  try {
    const stats = knowledgeRegistry.getStatistics();
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.post('/cache/cleanup', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const deleted = knowledgeRegistry.cleanupExpiredCache();
    
    res.json({
      cleaned: true,
      entries_deleted: deleted
    });
  } catch (error) {
    next(error);
  }
});

export default router;
