import knowledgeRegistry from './sourceRegistry.js';
import auditLogger from '../audit/index.js';
import workflowEngine from '../automation/workflowEngine.js';

export class BackgroundIngestionSystem {
  constructor() {
    this.isRunning = false;
    this.processingInterval = null;
    this.fetchHandlers = new Map();
    this.registerFetchHandlers();
  }

  registerFetchHandlers() {
    this.fetchHandlers.set('Wikipedia', {
      fetch: async (topic) => this.fetchWikipedia(topic),
      extract: (data) => this.extractWikipediaContent(data)
    });

    this.fetchHandlers.set('MDN Web Docs', {
      fetch: async (topic) => this.fetchMDN(topic),
      extract: (data) => this.extractMDNContent(data)
    });

    this.fetchHandlers.set('Stack Overflow', {
      fetch: async (topic) => this.fetchStackOverflow(topic),
      extract: (data) => this.extractStackOverflowContent(data)
    });

    console.log('🔄 Background ingestion handlers registered');
  }

  async fetchWikipedia(topic) {
    const source = knowledgeRegistry.getSource('Wikipedia');
    if (!source || !source.enabled) {
      throw new Error('Wikipedia source not available');
    }

    const searchUrl = `${source.api_endpoint}?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`;
    
    try {
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
        return null;
      }

      const pageId = searchData.query.search[0].pageid;
      const extractUrl = `${source.api_endpoint}?action=query&pageids=${pageId}&prop=extracts|info&exintro=1&explaintext=1&inprop=url&format=json&origin=*`;

      const extractResponse = await fetch(extractUrl);
      const extractData = await extractResponse.json();

      return extractData;
    } catch (error) {
      auditLogger.logSystemEvent({
        event_type: 'knowledge_fetch_failed',
        component: 'background_ingestion',
        severity: 'warning',
        message: `Failed to fetch from Wikipedia: ${topic}`,
        details: { error: error.message }
      });
      return null;
    }
  }

  extractWikipediaContent(data) {
    if (!data || !data.query || !data.query.pages) {
      return null;
    }

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) {
      return null;
    }

    return {
      title: page.title,
      content: page.extract || '',
      summary: page.extract ? page.extract.substring(0, 500) : '',
      url: page.fullurl || page.canonicalurl,
      metadata: {
        page_id: pageId,
        last_modified: page.touched
      }
    };
  }

  async fetchMDN(topic) {
    return {
      title: `MDN: ${topic}`,
      content: `Technical documentation for ${topic}`,
      summary: `MDN documentation about ${topic}`,
      url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`,
      metadata: { source: 'MDN', simulated: true }
    };
  }

  extractMDNContent(data) {
    return data;
  }

  async fetchStackOverflow(topic) {
    return {
      title: `Stack Overflow: ${topic}`,
      content: `Q&A content for ${topic}`,
      summary: `Stack Overflow discussions about ${topic}`,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(topic)}`,
      metadata: { source: 'StackOverflow', simulated: true }
    };
  }

  extractStackOverflowContent(data) {
    return data;
  }

  async processTask(task) {
    knowledgeRegistry.updateTaskStatus(task.id, 'running');

    try {
      const taskData = typeof task.data === 'string' ? JSON.parse(task.data) : task.data;
      
      if (task.task_type === 'fetch_knowledge') {
        const result = await this.fetchAndStore(taskData.topic, taskData.source_id);
        
        knowledgeRegistry.updateTaskStatus(task.id, 'completed', result);

        auditLogger.logSystemEvent({
          event_type: 'background_task_completed',
          component: 'background_ingestion',
          severity: 'info',
          message: `Knowledge fetched and stored: ${taskData.topic}`,
          details: { task_id: task.id, result }
        });

        return result;
      } else if (task.task_type === 'enrich_context') {
        const result = await this.enrichContext(taskData.query, taskData.context);
        
        knowledgeRegistry.updateTaskStatus(task.id, 'completed', result);

        return result;
      }

      throw new Error(`Unknown task type: ${task.task_type}`);
    } catch (error) {
      knowledgeRegistry.updateTaskStatus(task.id, 'failed', { error: error.message });

      auditLogger.logSystemEvent({
        event_type: 'background_task_failed',
        component: 'background_ingestion',
        severity: 'error',
        message: `Background task failed: ${task.task_type}`,
        details: { task_id: task.id, error: error.message },
        stack_trace: error.stack
      });

      throw error;
    }
  }

  async fetchAndStore(topic, sourceId = null) {
    const sources = sourceId 
      ? [knowledgeRegistry.getSource(sourceId)]
      : knowledgeRegistry.getAllSources({ enabled: true });

    const results = [];

    for (const source of sources) {
      const handler = this.fetchHandlers.get(source.name);
      if (!handler) {
        continue;
      }

      try {
        const rawData = await handler.fetch(topic);
        if (!rawData) {
          continue;
        }

        const extracted = handler.extract(rawData);
        if (!extracted) {
          continue;
        }

        const stored = knowledgeRegistry.storeKnowledge(source.id, {
          topic,
          title: extracted.title,
          content: extracted.content,
          summary: extracted.summary,
          url: extracted.url,
          metadata: extracted.metadata,
          credibility_score: source.credibility_score
        });

        results.push({
          source: source.name,
          entry_id: stored.id,
          title: extracted.title
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        auditLogger.logSystemEvent({
          event_type: 'knowledge_fetch_error',
          component: 'background_ingestion',
          severity: 'warning',
          message: `Error fetching from ${source.name}`,
          details: { topic, error: error.message }
        });
      }
    }

    return {
      topic,
      sources_fetched: results.length,
      results
    };
  }

  async enrichContext(query, context = {}) {
    const knowledge = knowledgeRegistry.searchKnowledge(query, {
      limit: 5,
      min_credibility: 0.7
    });

    const enrichedContext = {
      ...context,
      knowledge: knowledge.results.map(r => ({
        title: r.title,
        summary: r.summary || r.content.substring(0, 200),
        source: r.source_name,
        credibility: r.credibility_score,
        url: r.url
      })),
      knowledge_sources: [...new Set(knowledge.results.map(r => r.source_name))],
      cached: knowledge.cached
    };

    return enrichedContext;
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processPendingTasks();
    }, 30000);

    console.log('🔄 Background ingestion system started');
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isRunning = false;

    console.log('🔄 Background ingestion system stopped');
  }

  async processPendingTasks() {
    if (!this.isRunning) {
      return;
    }

    const tasks = knowledgeRegistry.getPendingTasks(5);

    for (const task of tasks) {
      try {
        await this.processTask(task);
      } catch (error) {
        console.error(`Failed to process task ${task.id}:`, error.message);
      }
    }
  }

  scheduleKnowledgeFetch(topic, sourceId = null, priority = 5) {
    return knowledgeRegistry.scheduleBackgroundTask('fetch_knowledge', {
      topic,
      source_id: sourceId
    }, priority);
  }

  scheduleContextEnrichment(query, context = {}, priority = 8) {
    return knowledgeRegistry.scheduleBackgroundTask('enrich_context', {
      query,
      context
    }, priority);
  }

  async fetchImmediate(topic, sourceId = null) {
    return await this.fetchAndStore(topic, sourceId);
  }
}

export default new BackgroundIngestionSystem();
