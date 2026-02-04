// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: infrastructure/cloudflare/supervisor-worker/src/index.js
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

/**
 * HeadySystems Cloud Supervisor - The Reflex
 * Cloudflare Worker for high-speed traffic interception and health monitoring
 */

// Environment variables - pulled from env object in handlers
let JWT_SECRET, GIST_ID, GIST_TOKEN, BRAIN_SERVICE_URL, WORKER_TOKEN;
let JULES_API_URL, JULES_API_KEY;
let PERPLEXITY_API_URL, PERPLEXITY_API_KEY;
let GEMINI_API_URL, GEMINI_API_KEY;
let AI_ANALYSIS_ENABLED, AI_PRIMARY_PROVIDER;

function initEnv(env) {
  JWT_SECRET = env.JWT_SECRET || 'heady-supervisor-secret-key';
  GIST_ID = env.HEADY_CONTEXT_GIST;
  GIST_TOKEN = env.HEADY_GIST_TOKEN;
  BRAIN_SERVICE_URL = env.BRAIN_SERVICE_URL;
  WORKER_TOKEN = env.HEADY_WORKER_TOKEN;
  
  // Multi-model AI configuration
  JULES_API_URL = env.JULES_API_URL || 'https://api.jules.ai/v1/chat/completions';
  JULES_API_KEY = env.JULES_API_KEY;
  PERPLEXITY_API_URL = env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';
  PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
  GEMINI_API_URL = env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
  GEMINI_API_KEY = env.GEMINI_API_KEY;
  
  AI_ANALYSIS_ENABLED = env.AI_ANALYSIS_ENABLED === 'true';
  AI_PRIMARY_PROVIDER = env.AI_PRIMARY_PROVIDER || 'jules'; // jules, perplexity, gemini
}

// Golden Ratio constants
const GOLDEN_RATIO = 1.618033988749895;
const HEALTH_CHECK_INTERVAL = 60 * 1000; // 60 seconds

// AI Provider registry
const AI_PROVIDERS = {
  jules: {
    name: 'Jules AI',
    models: ['jules-v1'],
    capabilities: ['analysis', 'incident-reports', 'code-review']
  },
  perplexity: {
    name: 'Perplexity AI',
    models: ['sonar', 'sonar-pro', 'sonar-reasoning-pro', 'sonar-deep-research'],
    capabilities: ['research', 'citations', 'real-time-data']
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-2.0-flash-thinking-exp'],
    capabilities: ['reasoning', 'multimodal', 'fast-response']
  }
};

// Durable Object for state management
export class SupervisorState {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/api/health':
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'supervisor-reflex',
          timestamp: new Date().toISOString(),
          uptime: this.state.uptime || 0
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      
      case '/api/verify-token':
        return this.verifyToken(request);
      
      case '/api/log-traffic':
        return this.logTraffic(request);
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  async verifyToken(request) {
    try {
      const { token } = await request.json();
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Basic token validation
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return new Response(JSON.stringify({ valid: false, error: 'Token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ valid: true, payload }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async logTraffic(request) {
    try {
      const logData = await request.json();
      
      // Store traffic log in Durable Object storage
      const logs = await this.state.storage.get('traffic_logs') || [];
      logs.push({
        ...logData,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      await this.state.storage.put('traffic_logs', logs);
      
      return new Response(JSON.stringify({ logged: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

// Main worker logic
export default {
  async fetch(request, env, ctx) {
    initEnv(env);
    const url = new URL(request.url);
    
    // Handle Durable Object requests
    if (url.pathname.startsWith('/api/state/')) {
      const id = env.SUPERVISOR_STATE.idFromName('global-state');
      const stub = env.SUPERVISOR_STATE.get(id);
      return stub.fetch(request);
    }

    // Handle different routes
    switch (url.pathname) {
      case '/api/health':
        return handleHealthCheck(request, env);
      
      case '/api/intercept':
        return handleTrafficInterception(request, env);
      
      case '/api/monitor-brain':
        return handleBrainMonitoring(request, env);
      
      case '/api/ai/analyze':
        return handleAIAnalysis(request, env);
      
      case '/api/ai/incident-report':
        return handleIncidentReport(request, env);
      
      case '/api/ai/providers':
        return handleListProviders(request, env);
      
      case '/api/ai/research':
        return handleAIResearch(request, env);
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  },

  async scheduled(event, env, ctx) {
    // Scheduled event for health monitoring
    if (event.cron === '*/1 * * * *') { // Every minute
      ctx.waitUntil(handleScheduledHealthCheck(env));
    }
  }
};

// List available AI providers
async function handleListProviders(request, env) {
  const providers = Object.entries(AI_PROVIDERS).map(([key, provider]) => ({
    id: key,
    ...provider,
    available: key === 'jules' ? !!JULES_API_KEY :
               key === 'perplexity' ? !!PERPLEXITY_API_KEY :
               key === 'gemini' ? !!GEMINI_API_KEY : false,
    primary: key === AI_PRIMARY_PROVIDER
  }));

  return new Response(JSON.stringify({ providers }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Health check endpoint
async function handleHealthCheck(request, env) {
  const healthData = {
    status: 'healthy',
    service: 'heady-supervisor-reflex',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    golden_ratio: GOLDEN_RATIO,
    ai_enabled: AI_ANALYSIS_ENABLED,
    ai_primary_provider: AI_PRIMARY_PROVIDER,
    ai_providers_available: {
      jules: !!JULES_API_KEY,
      perplexity: !!PERPLEXITY_API_KEY,
      gemini: !!GEMINI_API_KEY
    },
    provisionals: ['#3 Logic Engine', '#7 Integration Protocol'],
    endpoints: {
      health: '/api/health',
      intercept: '/api/intercept',
      monitor: '/api/monitor-brain',
      ai_analyze: '/api/ai/analyze',
      ai_incident: '/api/ai/incident-report',
      ai_providers: '/api/ai/providers',
      ai_research: '/api/ai/research',
      state: '/api/state/*'
    }
  };

  return new Response(JSON.stringify(healthData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Traffic interception and validation
async function handleTrafficInterception(request, env) {
  try {
    // Extract request metadata
    const headers = Object.fromEntries(request.headers.entries());
    const method = request.method;
    const url = request.url;
    const userAgent = headers['user-agent'] || 'unknown';
    
    // Validate required headers
    const nodeId = headers['x-heady-node-id'];
    const authToken = headers['authorization'];
    
    if (!nodeId || !authToken) {
      // Log unauthorized access attempt
      await logTrafficEvent(env, {
        type: 'unauthorized_access',
        method,
        url,
        userAgent,
        reason: 'Missing node ID or auth token',
        timestamp: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing X-Heady-Node-ID or Authorization header'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify JWT token
    try {
      const tokenPayload = verifyJWT(authToken.replace('Bearer ', ''));
      if (!tokenPayload || tokenPayload.node_id !== nodeId) {
        throw new Error('Invalid token');
      }
    } catch (tokenError) {
      await logTrafficEvent(env, {
        type: 'invalid_token',
        method,
        url,
        nodeId,
        reason: tokenError.message,
        timestamp: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log legitimate traffic
    await logTrafficEvent(env, {
      type: 'authorized_access',
      method,
      url,
      nodeId,
      userAgent,
      timestamp: new Date().toISOString()
    });

    // Apply golden ratio rate limiting
    const clientId = `${nodeId}-${Math.floor(Date.now() / (60 * 1000))}`; // Per minute
    const requestCount = await incrementRateLimit(env, clientId);
    
    if (requestCount > Math.floor(100 * GOLDEN_RATIO)) { // ~162 requests per minute
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests',
        limit: Math.floor(100 * GOLDEN_RATIO),
        current: requestCount
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': Math.floor(100 * GOLDEN_RATIO).toString(),
          'X-RateLimit-Remaining': Math.max(0, Math.floor(100 * GOLDEN_RATIO) - requestCount).toString()
        }
      });
    }

    // Return success with rate limit headers
    return new Response(JSON.stringify({
      status: 'authorized',
      nodeId,
      requestCount,
      remaining: Math.max(0, Math.floor(100 * GOLDEN_RATIO) - requestCount)
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': Math.floor(100 * GOLDEN_RATIO).toString(),
        'X-RateLimit-Remaining': Math.max(0, Math.floor(100 * GOLDEN_RATIO) - requestCount).toString()
      }
    });

  } catch (error) {
    console.error('Traffic interception error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Brain service health monitoring
async function handleBrainMonitoring(request, env) {
  try {
    if (!BRAIN_SERVICE_URL) {
      return new Response(JSON.stringify({
        error: 'Brain service URL not configured'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check brain service health
    const brainResponse = await fetch(`${BRAIN_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WORKER_TOKEN}`
      }
    });

    const brainHealthy = brainResponse.ok;
    const brainData = brainHealthy ? await brainResponse.json() : null;

    // Update system state based on brain health
    const systemStatus = brainHealthy ? 'operational' : 'degraded';
    const defconLevel = brainHealthy ? 4 : 2;

    // Update Gist with system status
    await updateSystemHealth(env, {
      brain: {
        status: systemStatus,
        last_check: new Date().toISOString(),
        response_time: brainData ? Date.now() - new Date(brainData.timestamp).getTime() : null,
        defcon_level: defconLevel
      }
    });

    return new Response(JSON.stringify({
      brain_healthy: brainHealthy,
      brain_status: systemStatus,
      defcon_level: defconLevel,
      brain_data: brainData,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Brain monitoring error:', error);
    
    // Mark brain as unhealthy
    await updateSystemHealth(env, {
      brain: {
        status: 'unhealthy',
        last_check: new Date().toISOString(),
        error: error.message,
        defcon_level: 1
      }
    });

    return new Response(JSON.stringify({
      brain_healthy: false,
      error: error.message,
      defcon_level: 1
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Scheduled health check
async function handleScheduledHealthCheck(env) {
  console.log('Running scheduled health check...');
  
  try {
    await handleBrainMonitoring(new Request('https://worker/api/monitor-brain'), env);
  } catch (error) {
    console.error('Scheduled health check failed:', error);
  }
}

// Helper functions
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp && payload.exp > Date.now() / 1000 ? payload : null;
  } catch (error) {
    return null;
  }
}

async function incrementRateLimit(env, clientId) {
  const id = env.SUPERVISOR_STATE.idFromName('rate-limits');
  const stub = env.SUPERVISOR_STATE.get(id);
  
  const response = await stub.fetch(new Request('https://worker/api/increment', {
    method: 'POST',
    body: JSON.stringify({ clientId })
  }));
  
  const result = await response.json();
  return result.count || 0;
}

async function logTrafficEvent(env, eventData) {
  const id = env.SUPERVISOR_STATE.idFromName('traffic-logs');
  const stub = env.SUPERVISOR_STATE.get(id);
  
  await stub.fetch(new Request('https://worker/api/log-traffic', {
    method: 'POST',
    body: JSON.stringify(eventData)
  }));
}

// Multi-provider AI request helper
async function callAIProvider(provider, systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.3, maxTokens = 1024 } = options;
  
  if (provider === 'perplexity' && PERPLEXITY_API_KEY) {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
        return_citations: true
      })
    });
    
    if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`);
    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content,
      model: data.model || options.model || 'sonar-pro',
      citations: data.citations || [],
      provider: 'perplexity'
    };
  }
  
  if (provider === 'gemini' && GEMINI_API_KEY) {
    const model = options.model || 'gemini-2.0-flash';
    const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    });
    
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text,
      model,
      provider: 'gemini'
    };
  }
  
  // Default to Jules
  if (JULES_API_KEY) {
    const response = await fetch(JULES_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JULES_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'jules-v1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) throw new Error(`Jules API error: ${response.status}`);
    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content,
      model: options.model || 'jules-v1',
      provider: 'jules'
    };
  }
  
  throw new Error('No AI provider configured');
}

// Multi-provider AI-assisted health analysis
async function handleAIAnalysis(request, env) {
  if (!AI_ANALYSIS_ENABLED) {
    return new Response(JSON.stringify({
      error: 'AI analysis not configured',
      message: 'Set AI_ANALYSIS_ENABLED=true and configure at least one AI provider'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const healthData = body.health_data || body;
    const preferredProvider = body.provider || AI_PRIMARY_PROVIDER;
    
    const systemPrompt = `You are a system health analyst for HeadySystems (aligned with Provisional #3: Logic Engine - AI Serving the User).
Analyze the provided health data and provide:
1. Overall system status (healthy/degraded/critical)
2. Key issues identified
3. Recommended actions
Be concise and actionable. Format as JSON.`;

    const userPrompt = `Analyze this system health data:\n${JSON.stringify(healthData, null, 2)}`;
    
    const result = await callAIProvider(preferredProvider, systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 1024
    });

    return new Response(JSON.stringify({
      analysis: result.content,
      health_data: healthData,
      ai_model: result.model,
      ai_provider: result.provider,
      citations: result.citations || [],
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return new Response(JSON.stringify({
      error: 'AI analysis failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// AI Research endpoint - uses Perplexity for real-time research
async function handleAIResearch(request, env) {
  if (!PERPLEXITY_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Research not available',
      message: 'Perplexity API key required for research capabilities'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { topic, depth = 'standard' } = await request.json();
    
    const modelMap = {
      quick: 'sonar',
      standard: 'sonar-pro',
      deep: 'sonar-reasoning-pro',
      comprehensive: 'sonar-deep-research'
    };
    
    const systemPrompt = `You are a research assistant for HeadySystems. Provide accurate, well-sourced information with citations when available.`;
    
    const result = await callAIProvider('perplexity', systemPrompt, topic, {
      model: modelMap[depth] || 'sonar-pro',
      temperature: 0.2,
      maxTokens: depth === 'comprehensive' ? 4096 : 2048
    });

    return new Response(JSON.stringify({
      research: result.content,
      topic,
      depth,
      model: result.model,
      citations: result.citations || [],
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI research error:', error);
    return new Response(JSON.stringify({
      error: 'Research failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Multi-provider AI-generated incident reports
async function handleIncidentReport(request, env) {
  if (!AI_ANALYSIS_ENABLED) {
    return new Response(JSON.stringify({
      error: 'AI incident reporting not configured'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const incidentData = body.incident_data || body;
    const preferredProvider = body.provider || AI_PRIMARY_PROVIDER;
    
    const systemPrompt = `You are an incident report generator for HeadySystems.
Create a structured incident report with:
- Incident ID (generate from timestamp)
- Severity level (P1-P5)
- Affected services
- Root cause analysis
- Resolution steps
- Prevention recommendations
Output as JSON format.`;

    const userPrompt = `Generate incident report for:\n${JSON.stringify(incidentData, null, 2)}`;
    
    const result = await callAIProvider(preferredProvider, systemPrompt, userPrompt, {
      temperature: 0.2,
      maxTokens: 2048
    });
    
    const report = result.content || 'Report generation failed';

    // Store incident in Durable Object
    const id = env.SUPERVISOR_STATE.idFromName('incidents');
    const stub = env.SUPERVISOR_STATE.get(id);
    await stub.fetch(new Request('https://worker/api/log-traffic', {
      method: 'POST',
      body: JSON.stringify({
        type: 'incident_report',
        report,
        raw_data: incidentData,
        timestamp: new Date().toISOString()
      })
    }));

    return new Response(JSON.stringify({
      incident_report: report,
      generated_at: new Date().toISOString(),
      ai_model: result.model,
      ai_provider: result.provider
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Incident report error:', error);
    return new Response(JSON.stringify({
      error: 'Incident report generation failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateSystemHealth(env, healthData) {
  if (!GIST_ID || !GIST_TOKEN) {
    console.log('Gist credentials not available, skipping health update');
    return;
  }

  try {
    // Read current state from Gist
    const gistResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    let state = {
      health_report: {},
      audit_logs: [],
      last_updated: new Date().toISOString(),
      system_defcon: 5
    };

    if (gistResponse.ok) {
      const gistData = await gistResponse.json();
      const stateFile = gistData.files['supervisor_state.json'];
      if (stateFile) {
        state = JSON.parse(stateFile.content);
      }
    }

    // Update health report
    state.health_report = { ...state.health_report, ...healthData };
    state.last_updated = new Date().toISOString();

    // Calculate system DEFCON level
    const defconLevels = Object.values(state.health_report)
      .map(health => health.defcon_level || 5)
      .sort((a, b) => a - b);
    
    state.system_defcon = defconLevels[0] || 5;

    // Write updated state back to Gist
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'HeadySystems Cloud Supervisor State',
        files: {
          'supervisor_state.json': {
            content: JSON.stringify(state, null, 2)
          }
        }
      })
    });

    console.log('System health updated in Gist');
  } catch (error) {
    console.error('Failed to update system health:', error);
  }
}
