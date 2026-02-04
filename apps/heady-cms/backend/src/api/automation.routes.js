import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import automationOrchestrator, { workflowEngine, autoScaler, selfHealing, intelligentSystem, autoDiscovery } from '../automation/index.js';
import registry from '../registry/index.js';
import auditLogger from '../audit/index.js';

const router = express.Router();

router.get('/status', authenticate, (req, res, next) => {
  try {
    const status = automationOrchestrator.getSystemStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.get('/workflows', authenticate, (req, res, next) => {
  try {
    const workflows = req.app.locals.db.prepare('SELECT * FROM workflows ORDER BY created_at DESC').all();
    res.json(workflows.map(w => ({
      ...w,
      trigger_config: JSON.parse(w.trigger_config),
      steps: JSON.parse(w.steps)
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/workflows/:id/execute', authenticate, async (req, res, next) => {
  try {
    const result = await workflowEngine.executeWorkflow(req.params.id, req.body.context || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/workflows/:id/executions', authenticate, (req, res, next) => {
  try {
    const executions = workflowEngine.getWorkflowExecutions(req.params.id);
    res.json(executions);
  } catch (error) {
    next(error);
  }
});

router.get('/executions/:id/logs', authenticate, (req, res, next) => {
  try {
    const logs = workflowEngine.getExecutionLogs(req.params.id);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.get('/scaling/metrics', authenticate, (req, res, next) => {
  try {
    const metrics = autoScaler.getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

router.get('/scaling/history', authenticate, (req, res, next) => {
  try {
    const history = autoScaler.getScalingHistory(parseInt(req.query.limit) || 50);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/health', authenticate, (req, res, next) => {
  try {
    const health = selfHealing.getHealthStatus();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

router.get('/intelligence/insights', authenticate, (req, res, next) => {
  try {
    const insights = intelligentSystem.getInsights({
      priority: req.query.priority,
      actionable: req.query.actionable === 'true',
      limit: parseInt(req.query.limit) || 50
    });
    res.json(insights);
  } catch (error) {
    next(error);
  }
});

router.get('/intelligence/suggestions', authenticate, (req, res, next) => {
  try {
    const suggestions = intelligentSystem.getOptimizationSuggestions(req.query.status || 'pending');
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

router.post('/intelligence/suggestions/:id/apply', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const result = intelligentSystem.applyOptimization(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/discovery/services', authenticate, (req, res, next) => {
  try {
    const services = autoDiscovery.getDiscoveredServices({
      status: req.query.status,
      protocol: req.query.protocol
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

router.get('/discovery/history', authenticate, (req, res, next) => {
  try {
    const history = autoDiscovery.getDiscoveryHistory(parseInt(req.query.limit) || 20);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.post('/discovery/scan', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await autoDiscovery.performDiscoveryScan();
    res.json({ status: 'scan_initiated' });
  } catch (error) {
    next(error);
  }
});

router.get('/registry/nodes', authenticate, (req, res, next) => {
  try {
    const nodes = registry.getAllNodes(req.query);
    res.json(nodes);
  } catch (error) {
    next(error);
  }
});

router.get('/registry/topology', authenticate, (req, res, next) => {
  try {
    const topology = registry.getSystemTopology();
    res.json(topology);
  } catch (error) {
    next(error);
  }
});

router.post('/registry/nodes/:id/heartbeat', authenticate, (req, res, next) => {
  try {
    registry.updateNodeStatus(req.params.id, 'active');
    res.json({ status: 'heartbeat_received' });
  } catch (error) {
    next(error);
  }
});

router.get('/audit/logs', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const logs = auditLogger.getAuditLogs({
      user_id: req.query.user_id,
      resource_type: req.query.resource_type,
      action: req.query.action,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: parseInt(req.query.limit) || 100
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.get('/audit/security-events', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const events = auditLogger.getSecurityEvents({
      severity: req.query.severity,
      resolved: req.query.resolved === 'true',
      limit: parseInt(req.query.limit) || 100
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.get('/audit/statistics', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const stats = auditLogger.getAuditStatistics(req.query.timeRange || '24h');
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/audit/trail/:resourceType/:resourceId', authenticate, (req, res, next) => {
  try {
    const trail = auditLogger.getAuditTrail(req.params.resourceType, req.params.resourceId);
    res.json(trail);
  } catch (error) {
    next(error);
  }
});

export default router;
