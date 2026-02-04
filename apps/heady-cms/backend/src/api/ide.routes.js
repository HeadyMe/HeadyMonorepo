// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/ide.routes.js
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
import { authenticate } from '../middleware/auth.js';
import headyAutoIDE from '../ide/HeadyAutoIDE.js';

const router = express.Router();

router.post('/process', authenticate, async (req, res, next) => {
  try {
    const { input, type, command, file_path } = req.body;

    const context = {
      user: req.user,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    };

    const request = {
      input,
      type: type || 'natural_language',
      command,
      file_path
    };

    const result = await headyAutoIDE.processIDERequest(request, context);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/execute', authenticate, async (req, res, next) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const context = {
      user: req.user,
      ip_address: req.ip
    };

    const result = await headyAutoIDE.handleNaturalLanguageInput(input, context);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/status', authenticate, (req, res, next) => {
  try {
    const status = headyAutoIDE.isReady();
    
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.get('/statistics', authenticate, (req, res, next) => {
  try {
    const stats = headyAutoIDE.getStatistics();
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/settings', authenticate, (req, res, next) => {
  try {
    const settings = {
      auto_approval_enabled: headyAutoIDE.getSetting('auto_approval_enabled'),
      auto_commit_enabled: headyAutoIDE.getSetting('auto_commit_enabled'),
      auto_push_enabled: headyAutoIDE.getSetting('auto_push_enabled'),
      pattern_recognition_enabled: headyAutoIDE.getSetting('pattern_recognition_enabled')
    };
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/settings/:key', authenticate, (req, res, next) => {
  try {
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const result = headyAutoIDE.setSetting(req.params.key, value);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
