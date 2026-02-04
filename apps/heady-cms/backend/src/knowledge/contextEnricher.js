// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/knowledge/contextEnricher.js
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

import knowledgeRegistry from './sourceRegistry.js';
import backgroundIngestion from './backgroundIngestion.js';
import auditLogger from '../audit/index.js';

export class ContextEnricher {
  constructor() {
    this.enrichmentStrategies = new Map();
    this.registerStrategies();
  }

  registerStrategies() {
    this.enrichmentStrategies.set('technical', {
      sources: ['MDN Web Docs', 'Stack Overflow', 'GitHub'],
      keywords: ['code', 'programming', 'api', 'function', 'library', 'framework'],
      minCredibility: 0.75
    });

    this.enrichmentStrategies.set('general', {
      sources: ['Wikipedia'],
      keywords: ['what', 'who', 'when', 'where', 'why', 'how'],
      minCredibility: 0.8
    });

    this.enrichmentStrategies.set('research', {
      sources: ['arXiv', 'Wikipedia'],
      keywords: ['research', 'study', 'paper', 'academic', 'science'],
      minCredibility: 0.85
    });

    console.log('🎯 Context enrichment strategies registered');
  }

  detectStrategy(query) {
    const lowerQuery = query.toLowerCase();

    for (const [strategy, config] of this.enrichmentStrategies.entries()) {
      const matches = config.keywords.filter(kw => lowerQuery.includes(kw));
      if (matches.length > 0) {
        return strategy;
      }
    }

    return 'general';
  }

  async enrichBeforeResponse(query, context = {}) {
    const startTime = Date.now();
    const strategy = this.detectStrategy(query);
    const strategyConfig = this.enrichmentStrategies.get(strategy);

    const searchResults = knowledgeRegistry.searchKnowledge(query, {
      limit: 5,
      min_credibility: strategyConfig.minCredibility
    });

    if (searchResults.results.length === 0) {
      const taskId = backgroundIngestion.scheduleKnowledgeFetch(query, null, 10);
      
      auditLogger.logSystemEvent({
        event_type: 'knowledge_fetch_scheduled',
        component: 'context_enricher',
        severity: 'info',
        message: `No knowledge found, scheduled background fetch: ${query}`,
        details: { task_id: taskId, strategy }
      });

      return {
        enriched: false,
        strategy,
        knowledge: [],
        message: 'Knowledge fetch scheduled in background',
        task_id: taskId
      };
    }

    const enrichedContext = {
      original_query: query,
      strategy,
      knowledge: searchResults.results.map(r => ({
        title: r.title,
        summary: r.summary || r.content.substring(0, 300),
        source: r.source_name,
        credibility: r.credibility_score,
        url: r.url,
        relevance: this.calculateRelevance(query, r.content)
      })).sort((a, b) => b.relevance - a.relevance),
      sources_used: [...new Set(searchResults.results.map(r => r.source_name))],
      cached: searchResults.cached,
      enrichment_time_ms: Date.now() - startTime,
      ...context
    };

    auditLogger.log({
      action: 'context_enriched',
      resource_type: 'context_enricher',
      metadata: {
        query,
        strategy,
        sources_count: enrichedContext.sources_used.length,
        knowledge_count: enrichedContext.knowledge.length,
        cached: searchResults.cached
      },
      severity: 'info'
    });

    return {
      enriched: true,
      ...enrichedContext
    };
  }

  calculateRelevance(query, content) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    for (const word of queryWords) {
      if (word.length > 2 && contentLower.includes(word)) {
        matches++;
      }
    }

    return matches / queryWords.length;
  }

  async enrichWithSources(query, sourceNames = []) {
    const sources = sourceNames.length > 0
      ? sourceNames.map(name => knowledgeRegistry.getSource(name)).filter(s => s)
      : knowledgeRegistry.getAllSources({ enabled: true });

    const results = [];

    for (const source of sources) {
      const knowledge = knowledgeRegistry.searchKnowledge(query, {
        source_id: source.id,
        limit: 3
      });

      if (knowledge.results.length > 0) {
        results.push({
          source: source.name,
          credibility: source.credibility_score,
          knowledge: knowledge.results.map(r => ({
            title: r.title,
            summary: r.summary,
            url: r.url
          }))
        });
      }
    }

    return {
      query,
      sources: results,
      total_results: results.reduce((sum, r) => sum + r.knowledge.length, 0)
    };
  }

  async preloadKnowledge(topics = []) {
    const tasks = [];

    for (const topic of topics) {
      const taskId = backgroundIngestion.scheduleKnowledgeFetch(topic, null, 5);
      tasks.push({ topic, task_id: taskId });
    }

    auditLogger.logSystemEvent({
      event_type: 'knowledge_preload_scheduled',
      component: 'context_enricher',
      severity: 'info',
      message: `Scheduled preload for ${topics.length} topics`,
      details: { topics, tasks }
    });

    return {
      scheduled: tasks.length,
      tasks
    };
  }

  async getEnrichedResponse(query, baseResponse, context = {}) {
    const enrichment = await this.enrichBeforeResponse(query, context);

    if (!enrichment.enriched) {
      return {
        response: baseResponse,
        enrichment_status: 'pending',
        message: enrichment.message
      };
    }

    const enhancedResponse = {
      response: baseResponse,
      supporting_knowledge: enrichment.knowledge,
      sources: enrichment.sources_used,
      credibility_range: {
        min: Math.min(...enrichment.knowledge.map(k => k.credibility)),
        max: Math.max(...enrichment.knowledge.map(k => k.credibility)),
        avg: enrichment.knowledge.reduce((sum, k) => sum + k.credibility, 0) / enrichment.knowledge.length
      },
      enrichment_metadata: {
        strategy: enrichment.strategy,
        cached: enrichment.cached,
        time_ms: enrichment.enrichment_time_ms
      }
    };

    return enhancedResponse;
  }
}

export default new ContextEnricher();
