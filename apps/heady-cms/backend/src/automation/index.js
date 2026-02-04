import workflowEngine from './workflowEngine.js';
import autoScaler from './autoScaler.js';
import selfHealing from './selfHealing.js';
import intelligentSystem from './intelligentSystem.js';
import autoDiscovery from './autoDiscovery.js';

export class AutomationOrchestrator {
  constructor() {
    this.systems = {
      workflows: workflowEngine,
      scaling: autoScaler,
      healing: selfHealing,
      intelligence: intelligentSystem,
      discovery: autoDiscovery
    };
    
    this.setupIntegrations();
  }

  setupIntegrations() {
    workflowEngine.on('workflow.failed', (data) => {
      intelligentSystem.recordPattern('workflow_failure', data);
    });

    workflowEngine.on('system.disk_full', (data) => {
      selfHealing.attemptHealing('storage', { issue: 'disk_full', ...data });
    });

    workflowEngine.on('system.repeated_failure', (data) => {
      autoScaler.evaluateScaling();
    });

    console.log('🔗 Automation systems integrated and running');
  }

  getSystemStatus() {
    return {
      workflows: {
        active: workflowEngine.activeWorkflows.size,
        triggers: workflowEngine.triggers.size
      },
      scaling: autoScaler.getCurrentMetrics(),
      healing: selfHealing.getHealthStatus(),
      intelligence: intelligentSystem.getSystemIntelligence(),
      discovery: {
        services: autoDiscovery.getDiscoveredServices({ status: 'active' }).length
      }
    };
  }

  async initializeAllSystems() {
    console.log('🚀 Initializing all automation systems...');
    
    workflowEngine.startAutoExecution();
    
    console.log('✅ All automation systems initialized and running');
    
    return this.getSystemStatus();
  }

  shutdown() {
    console.log('🛑 Shutting down automation systems...');
    workflowEngine.stopAutoExecution();
    console.log('✅ Automation systems shut down gracefully');
  }
}

export default new AutomationOrchestrator();

export {
  workflowEngine,
  autoScaler,
  selfHealing,
  intelligentSystem,
  autoDiscovery
};
