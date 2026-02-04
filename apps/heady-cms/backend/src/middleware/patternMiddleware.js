// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/middleware/patternMiddleware.js
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

import patternRecognizer from '../patterns/recognizer.js';

export const patternAnalysisMiddleware = (req, res, next) => {
  if (req.body && (req.body.input || req.body.query)) {
    const input = req.body.input || req.body.query;
    
    const context = {
      user: req.user,
      ip_address: req.ip || req.connection.remoteAddress,
      endpoint: req.path,
      method: req.method
    };

    const analysis = patternRecognizer.analyzeInput(input, context);

    req.patternAnalysis = analysis;

    if (analysis.requires_immediate_action) {
      req.priority = 'critical';
      req.urgency_level = analysis.highest_urgency;
    }
  }

  next();
};

export const patternResponseEnhancer = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    if (req.patternAnalysis) {
      const enhanced = {
        ...data,
        pattern_analysis: {
          patterns_detected: req.patternAnalysis.patterns.length,
          urgency_level: req.patternAnalysis.highest_urgency,
          immediate_action: req.patternAnalysis.requires_immediate_action
        }
      };

      if (req.patternAnalysis.requires_immediate_action) {
        enhanced.priority = 'CRITICAL';
        enhanced.message = 'High urgency detected - executing with elevated priority';
      }

      return originalJson(enhanced);
    }

    return originalJson(data);
  };

  next();
};
