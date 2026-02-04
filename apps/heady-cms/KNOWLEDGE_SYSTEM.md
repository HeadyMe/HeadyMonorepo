# Heady System - Knowledge & Context Enrichment

## 🎯 Your Request

> "Is there a way to notify the system of credible sources such as Wikipedia, so that background tasks can be performed to put all valuable data and store it properly for easy and always system access before intelligently responding?"

**Answer: Yes! Now fully implemented.**

## 📚 Knowledge System Overview

The system now automatically:
1. **Registers credible sources** (Wikipedia, MDN, Stack Overflow, GitHub, arXiv)
2. **Fetches data in background** when topics are mentioned
3. **Stores knowledge** in structured, searchable format
4. **Enriches responses** with relevant context before responding
5. **Caches results** for instant access
6. **Learns** which sources are most valuable

## 🔄 How It Works

### **Automatic Knowledge Flow**

```
User Query → Intent Detection → Context Enrichment → Response
                                        ↓
                              Background Knowledge Fetch
                                        ↓
                              Store in Knowledge Base
                                        ↓
                              Available for Future Queries
```

### **Example Scenario**

**User asks:** "What is React?"

**System automatically:**
1. Searches local knowledge base for "React"
2. If not found → Schedules background fetch from Wikipedia, MDN, Stack Overflow
3. Fetches and stores knowledge
4. Enriches response with credible information
5. Next time someone asks → Instant response from cache

## 📊 Registered Knowledge Sources

### **Default Sources (Pre-configured)**

| Source | Type | Credibility | Rate Limit | Topics |
|--------|------|-------------|------------|--------|
| **Wikipedia** | Encyclopedia | 0.85 | 200/hour | General knowledge |
| **MDN Web Docs** | Technical Docs | 0.95 | 100/hour | Web, JavaScript, CSS, HTML |
| **Stack Overflow** | Q&A Platform | 0.75 | 300/hour | Programming, Development |
| **GitHub** | Code Repository | 0.80 | 60/hour | Code, Open Source |
| **arXiv** | Research Papers | 0.90 | 100/hour | Science, Research, Academic |

### **Add Custom Sources**

```bash
POST /api/v1/knowledge/sources
```

**Request:**
```json
{
  "name": "Your Custom Source",
  "type": "documentation",
  "base_url": "https://example.com",
  "api_endpoint": "https://api.example.com",
  "credibility_score": 0.85,
  "rate_limit_per_hour": 100,
  "metadata": {
    "topics": ["your", "topics"],
    "format": "json"
  }
}
```

## 🚀 API Endpoints

### **1. Search Knowledge Base**

```bash
GET /api/v1/knowledge/search?query=react&min_credibility=0.7&limit=10
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "React (JavaScript library)",
      "summary": "React is a free and open-source front-end JavaScript library...",
      "content": "Full content here...",
      "source_name": "Wikipedia",
      "credibility_score": 0.85,
      "url": "https://en.wikipedia.org/wiki/React_(JavaScript_library)"
    }
  ],
  "cached": true,
  "executionTime": 5
}
```

### **2. Fetch Knowledge (Background)**

```bash
POST /api/v1/knowledge/fetch
```

**Request:**
```json
{
  "topic": "machine learning",
  "source_id": "wikipedia-id",
  "immediate": false
}
```

**Response:**
```json
{
  "scheduled": true,
  "task_id": "task-uuid",
  "message": "Knowledge fetch scheduled"
}
```

### **3. Enrich Context Before Response**

```bash
POST /api/v1/knowledge/enrich
```

**Request:**
```json
{
  "query": "explain neural networks",
  "context": {
    "user_level": "beginner"
  }
}
```

**Response:**
```json
{
  "enriched": true,
  "strategy": "research",
  "knowledge": [
    {
      "title": "Neural Network",
      "summary": "A neural network is a series of algorithms...",
      "source": "Wikipedia",
      "credibility": 0.85,
      "url": "https://...",
      "relevance": 0.92
    }
  ],
  "sources_used": ["Wikipedia", "arXiv"],
  "cached": false,
  "enrichment_time_ms": 45
}
```

### **4. Get Enriched Response**

```bash
POST /api/v1/knowledge/enrich-response
```

**Request:**
```json
{
  "query": "what is react",
  "response": "React is a JavaScript library for building user interfaces",
  "context": {}
}
```

**Response:**
```json
{
  "response": "React is a JavaScript library for building user interfaces",
  "supporting_knowledge": [
    {
      "title": "React (JavaScript library)",
      "summary": "React is a free and open-source front-end JavaScript library...",
      "source": "Wikipedia",
      "credibility": 0.85,
      "url": "https://en.wikipedia.org/wiki/React_(JavaScript_library)"
    },
    {
      "title": "React - MDN",
      "summary": "React is a declarative, efficient, and flexible JavaScript library...",
      "source": "MDN Web Docs",
      "credibility": 0.95,
      "url": "https://developer.mozilla.org/..."
    }
  ],
  "sources": ["Wikipedia", "MDN Web Docs"],
  "credibility_range": {
    "min": 0.85,
    "max": 0.95,
    "avg": 0.9
  },
  "enrichment_metadata": {
    "strategy": "technical",
    "cached": true,
    "time_ms": 12
  }
}
```

### **5. Preload Knowledge Topics**

```bash
POST /api/v1/knowledge/preload
```

**Request:**
```json
{
  "topics": [
    "artificial intelligence",
    "machine learning",
    "neural networks",
    "deep learning"
  ]
}
```

**Response:**
```json
{
  "scheduled": 4,
  "tasks": [
    { "topic": "artificial intelligence", "task_id": "task-1" },
    { "topic": "machine learning", "task_id": "task-2" },
    { "topic": "neural networks", "task_id": "task-3" },
    { "topic": "deep learning", "task_id": "task-4" }
  ]
}
```

### **6. View Background Tasks**

```bash
GET /api/v1/knowledge/tasks?limit=10
```

**Response:**
```json
[
  {
    "id": "task-uuid",
    "task_type": "fetch_knowledge",
    "topic": "react",
    "status": "completed",
    "priority": 8,
    "result": {
      "topic": "react",
      "sources_fetched": 2,
      "results": [...]
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "completed_at": "2024-01-01T00:00:05.000Z"
  }
]
```

### **7. Knowledge Statistics**

```bash
GET /api/v1/knowledge/statistics
```

**Response:**
```json
{
  "total_sources": 5,
  "enabled_sources": 5,
  "total_entries": 1247,
  "total_queries": 3542,
  "cache_hit_rate": "87.50",
  "pending_tasks": 3,
  "avg_query_time": 23.5
}
```

## 🧠 Enrichment Strategies

The system automatically selects the best strategy based on your query:

### **Technical Strategy**
- **Triggers:** code, programming, api, function, library, framework
- **Sources:** MDN Web Docs, Stack Overflow, GitHub
- **Min Credibility:** 0.75

### **General Strategy**
- **Triggers:** what, who, when, where, why, how
- **Sources:** Wikipedia
- **Min Credibility:** 0.80

### **Research Strategy**
- **Triggers:** research, study, paper, academic, science
- **Sources:** arXiv, Wikipedia
- **Min Credibility:** 0.85

## 🔄 Background Processing

### **Automatic Background Tasks**

The system runs background tasks every 30 seconds to:
1. Process pending knowledge fetches
2. Enrich contexts for queued queries
3. Update knowledge from sources
4. Clean up expired cache

### **Task Priorities**

- **10** - Immediate user request
- **8** - User-triggered fetch
- **5** - Preload/scheduled fetch
- **3** - Maintenance/cleanup
- **1** - Low priority background

## 💾 Knowledge Storage

### **Structured Storage**

```sql
knowledge_entries:
  - id (unique identifier)
  - source_id (which source it came from)
  - topic (categorization)
  - title (entry title)
  - content (full content)
  - summary (brief summary)
  - url (original source URL)
  - credibility_score (0.0 - 1.0)
  - metadata (additional data)
  - last_updated (freshness)
```

### **Intelligent Caching**

- **Cache Duration:** 24 hours (configurable)
- **Cache Key:** Query hash
- **Hit Tracking:** Tracks cache hits for optimization
- **Auto-Cleanup:** Removes expired cache automatically

## 🎯 Real-World Usage

### **Scenario 1: User Asks Technical Question**

```javascript
// User query
POST /api/v1/intelligence/process
{
  "input": "explain how React hooks work"
}

// System automatically:
// 1. Detects intent: "technical_question"
// 2. Enriches context from MDN, Stack Overflow
// 3. Finds cached knowledge about React hooks
// 4. Returns enriched response with sources

// Response includes:
{
  "success": true,
  "response": "...",
  "supporting_knowledge": [
    { "source": "MDN Web Docs", "credibility": 0.95, ... },
    { "source": "Stack Overflow", "credibility": 0.75, ... }
  ],
  "sources": ["MDN Web Docs", "Stack Overflow"]
}
```

### **Scenario 2: Preload Knowledge for Common Topics**

```bash
# Admin preloads knowledge for common questions
POST /api/v1/knowledge/preload
{
  "topics": [
    "JavaScript basics",
    "React fundamentals",
    "Node.js",
    "Database design",
    "API development"
  ]
}

# System fetches in background
# Future queries are instant (from cache)
```

### **Scenario 3: Add Company Documentation**

```bash
# Add your internal docs as a knowledge source
POST /api/v1/knowledge/sources
{
  "name": "Company Wiki",
  "type": "internal_documentation",
  "base_url": "https://wiki.company.com",
  "credibility_score": 1.0,
  "metadata": {
    "internal": true,
    "topics": ["company", "processes", "guidelines"]
  }
}

# Now system can reference company docs in responses
```

## 📊 Knowledge Quality

### **Credibility Scoring**

- **0.95+** - Highly authoritative (MDN, Official Docs)
- **0.85-0.94** - Very reliable (Wikipedia, arXiv)
- **0.75-0.84** - Generally reliable (GitHub, Stack Overflow)
- **0.60-0.74** - Moderately reliable (Community sources)
- **<0.60** - Use with caution

### **Relevance Calculation**

The system calculates relevance by:
1. Matching query keywords to content
2. Considering source credibility
3. Factoring in content freshness
4. Analyzing context similarity

## 🔐 Security & Rate Limiting

### **Rate Limiting**

Each source has configurable rate limits:
- Wikipedia: 200 requests/hour
- MDN: 100 requests/hour
- Stack Overflow: 300 requests/hour
- GitHub: 60 requests/hour (API limit)
- arXiv: 100 requests/hour

### **Safe Fetching**

- Respects robots.txt
- Implements exponential backoff
- Handles errors gracefully
- Logs all fetch attempts

## 🎓 Benefits

### **For Users**
✅ **Instant Answers** - Cached knowledge for common questions
✅ **Credible Sources** - Only high-quality, verified information
✅ **Context-Aware** - Responses enriched with relevant knowledge
✅ **Always Learning** - System gets smarter over time

### **For System**
✅ **Reduced Latency** - Cached results = instant responses
✅ **Better Responses** - Context enrichment improves quality
✅ **Scalable** - Background processing doesn't block requests
✅ **Auditable** - Complete trail of knowledge sources

## 📝 Summary

**Your requirement met:**
- ✅ Register credible sources (Wikipedia, MDN, etc.)
- ✅ Background tasks fetch and store data
- ✅ Proper storage for easy access
- ✅ Intelligent context enrichment before responses
- ✅ Automatic caching and optimization
- ✅ Complete audit trail

**The system now automatically enriches all responses with credible, cached knowledge from trusted sources!** 🎉
