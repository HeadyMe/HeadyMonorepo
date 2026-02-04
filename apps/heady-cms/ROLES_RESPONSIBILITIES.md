<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-cms/ROLES_RESPONSIBILITIES.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# Heady System - Roles & Responsibilities

## 🎯 System Architecture Overview

The Heady system is organized into **specialized components** with clear roles and responsibilities. Each component is autonomous yet interconnected through well-defined interfaces.

## 📊 Component Roles

### 1. **Core API Layer**
**Location:** `backend/src/index.js`, `backend/src/api/`

**Responsibilities:**
- Handle HTTP requests and responses
- Route requests to appropriate handlers
- Enforce authentication and authorization
- Apply rate limiting and security headers
- Serve API documentation
- Manage CORS policies

**Interfaces:**
- Exposes RESTful API endpoints
- Integrates with all backend services
- Communicates with frontend via HTTP/JSON

**Dependencies:**
- Database layer
- Authentication system
- Automation orchestrator
- Audit logger

---

### 2. **Database Layer**
**Location:** `backend/src/database/`

**Responsibilities:**
- Manage SQLite database connections
- Execute queries and transactions
- Maintain database schema
- Handle migrations and initialization
- Ensure data integrity with foreign keys
- Optimize with indexes and WAL mode

**Interfaces:**
- Provides `getDatabase()` for connection access
- Exposes `initDatabase()` for setup
- Used by all data-dependent services

**Dependencies:**
- better-sqlite3 library
- File system for database storage

---

### 3. **Authentication & Authorization**
**Location:** `backend/src/auth/`, `backend/src/middleware/auth.js`, `backend/src/security/`

**Responsibilities:**
- Generate and verify JWT tokens
- Manage refresh tokens
- Enforce role-based access control (RBAC)
- Maintain access control matrix
- Track user sessions
- Validate permissions for resources

**Roles Hierarchy:**
```
super_admin → admin → editor → viewer
```

**Interfaces:**
- Middleware: `authenticate()`, `authorize()`
- JWT functions: `generateAccessToken()`, `verifyAccessToken()`
- ACL: `can(user, action, resource)`

**Dependencies:**
- Database for user and permission storage
- JWT library for token operations
- Audit logger for access tracking

---

### 4. **Audit & Logging System**
**Location:** `backend/src/audit/`

**Responsibilities:**
- Log all user actions with full context
- Track security events (access denied, suspicious activity)
- Record system events (errors, warnings, info)
- Maintain audit trail for compliance
- Generate audit statistics and reports
- Support forensic analysis

**Log Types:**
1. **Audit Logs** - User actions (who, what, when, where, how)
2. **Security Events** - Security-related incidents
3. **System Events** - Application events and errors

**Interfaces:**
- `auditLogger.log(data)` - Log user action
- `auditLogger.logSecurityEvent(data)` - Log security event
- `auditLogger.logSystemEvent(data)` - Log system event
- `auditLogger.getAuditLogs(filters)` - Query logs

**Dependencies:**
- Database for log storage
- None (standalone to avoid circular dependencies)

---

### 5. **Registry System**
**Location:** `backend/src/registry/`

**Responsibilities:**
- Register and track all nodes (services, workers, APIs)
- Manage service metadata and capabilities
- Track node health via heartbeats
- Map connections between nodes
- Provide system topology view
- Support service discovery

**Node Types:**
- `api` - API servers
- `worker` - Background workers
- `mcp_server` - MCP protocol servers
- `storage` - Storage nodes
- `cache` - Cache nodes

**Interfaces:**
- `registry.registerNode(data)` - Register new node
- `registry.getNode(id)` - Get node details
- `registry.getAllNodes(filters)` - Query nodes
- `registry.updateNodeStatus(id, status)` - Update health
- `registry.getSystemTopology()` - Get full topology

**Dependencies:**
- Database for registry storage
- Audit logger for tracking

---

### 6. **Workflow Engine**
**Location:** `backend/src/automation/workflowEngine.js`

**Responsibilities:**
- Execute scheduled workflows (cron, interval)
- Respond to event-driven workflows
- Manage workflow execution lifecycle
- Retry failed workflows automatically
- Log workflow execution history
- Support multi-step workflows with context passing

**Built-in Workflows:**
- `auto_backup` - Database backups
- `health_check` - System health monitoring
- `auto_optimize` - Database optimization
- `auto_scale_check` - Scaling evaluation
- `on_user_register` - User onboarding
- `on_content_publish` - Content processing

**Interfaces:**
- `workflowEngine.executeWorkflow(id, context)` - Execute workflow
- `workflowEngine.triggerEvent(event, context)` - Trigger event
- `workflowEngine.createWorkflow(data)` - Create workflow
- Event emitter for workflow events

**Dependencies:**
- Database for workflow storage
- Audit logger for execution tracking
- All action handlers (backup, cleanup, etc.)

---

### 7. **Auto-Scaler**
**Location:** `backend/src/automation/autoScaler.js`

**Responsibilities:**
- Monitor system metrics (CPU, memory, disk, requests)
- Evaluate scaling needs based on thresholds
- Scale up when load is high
- Scale down when load is low
- Respect cooldown periods
- Track scaling events and metrics

**Scaling Triggers:**
- CPU > 70% → Scale up
- Memory > 75% → Scale up
- Requests/min > 1000 → Scale up
- CPU < 30% AND Memory < 40% → Scale down

**Interfaces:**
- `autoScaler.getCurrentMetrics()` - Get current metrics
- `autoScaler.getScalingHistory()` - Get scaling events
- Auto-executes every 60 seconds

**Dependencies:**
- Registry for node management
- Database for metrics storage
- Audit logger for event tracking
- OS metrics (CPU, memory)

---

### 8. **Self-Healing System**
**Location:** `backend/src/automation/selfHealing.js`

**Responsibilities:**
- Monitor component health continuously
- Detect failures and anomalies
- Apply healing strategies automatically
- Restart failed services
- Clear caches when memory is high
- Trigger cleanup workflows
- Track healing actions and success rates

**Healing Strategies:**
- `database_locked` → Wait and retry
- `high_memory` → Clear caches, run GC
- `service_down` → Restart service
- `disk_full` → Trigger cleanup
- `connection_pool_exhausted` → Recycle connections

**Interfaces:**
- `selfHealing.getHealthStatus()` - Get health status
- Auto-executes health checks every 30 seconds
- Auto-applies healing strategies

**Dependencies:**
- Database for health tracking
- Registry for service management
- Workflow engine for cleanup triggers
- Audit logger for event tracking

---

### 9. **Intelligent System**
**Location:** `backend/src/automation/intelligentSystem.js`

**Responsibilities:**
- Learn usage patterns from audit logs
- Detect repeated action sequences
- Analyze user behavior
- Generate predictions (load forecasting)
- Create optimization suggestions
- Track pattern confidence
- Apply optimizations automatically or suggest to admins

**Learning Sources:**
- Audit logs (action sequences, user behavior)
- Workflow executions (failures, performance)
- System metrics (load patterns)

**Interfaces:**
- `intelligentSystem.getInsights(filters)` - Get behavioral insights
- `intelligentSystem.getOptimizationSuggestions()` - Get suggestions
- `intelligentSystem.applyOptimization(id)` - Apply suggestion
- Auto-learns every 5-10 minutes

**Dependencies:**
- Database for pattern storage
- Audit logger for data source
- Workflow engine for learning from executions

---

### 10. **Auto-Discovery System**
**Location:** `backend/src/automation/autoDiscovery.js`

**Responsibilities:**
- Scan for new services automatically
- Discover HTTP APIs, MCP servers, local services
- Register discovered services
- Verify service health
- Auto-configure new services
- Track discovery history

**Discovery Protocols:**
- HTTP (ports: 3000, 3001, 8000, 8080, 5000)
- MCP (Model Context Protocol)
- Local (registry nodes)

**Interfaces:**
- `autoDiscovery.getDiscoveredServices(filters)` - Get services
- `autoDiscovery.performDiscoveryScan()` - Manual scan
- Auto-scans every 5 minutes

**Dependencies:**
- Registry for service registration
- Database for discovery tracking
- Audit logger for event tracking

---

### 11. **MCP Protocol Handler**
**Location:** `backend/src/mcp/protocol.js`

**Responsibilities:**
- Handle MCP (Model Context Protocol) requests
- Validate JSON-RPC 2.0 format
- Route requests to appropriate handlers
- Apply middleware pipeline
- Generate responses and errors
- Support notifications and requests

**Protocol Support:**
- JSON-RPC 2.0
- Request/response pattern
- Notification pattern
- Error handling

**Interfaces:**
- `MCPProtocol.handleRequest(request, context)` - Handle request
- `MCPProtocol.registerHandler(method, handler)` - Register handler
- `MCPServer` - Server implementation
- `MCPClient` - Client implementation

**Dependencies:**
- Audit logger for request tracking
- None (protocol-level component)

---

### 12. **Content Management**
**Location:** `backend/src/api/contentTypes.routes.js`, `backend/src/api/entries.routes.js`

**Responsibilities:**
- Manage content type schemas
- CRUD operations for content types
- CRUD operations for content entries
- Validate content against schemas
- Track content status (draft, published, archived)
- Support dynamic content structures

**Content Lifecycle:**
```
draft → published → archived
```

**Interfaces:**
- REST API endpoints for content types and entries
- Schema validation
- Status management

**Dependencies:**
- Database for content storage
- Authentication for access control
- Audit logger for change tracking
- Workflow engine for publish events

---

### 13. **Media Management**
**Location:** `backend/src/api/media.routes.js`

**Responsibilities:**
- Handle file uploads
- Process images (resize, optimize)
- Store files locally
- Track media metadata
- Serve uploaded files
- Delete media and cleanup storage

**Supported Operations:**
- Upload with optional resize
- List with filtering
- Retrieve metadata
- Delete with file cleanup

**Interfaces:**
- REST API endpoints for media operations
- Multer for file handling
- Sharp for image processing

**Dependencies:**
- File system for storage
- Database for metadata
- Authentication for access control
- Audit logger for tracking

---

## 🔄 System Interactions

### Request Flow Example: User Creates Content

```
1. User → API Layer
   POST /api/v1/entries/blog

2. API Layer → Authentication
   Verify JWT token

3. Authentication → Access Control
   Check if user can create blog entries

4. API Layer → Validation
   Validate request body against schema

5. API Layer → Database
   Insert new entry

6. API Layer → Audit Logger
   Log content creation

7. API Layer → Workflow Engine
   Trigger 'content.created' event

8. Workflow Engine → Multiple Actions
   - Generate preview
   - Update search index
   - Trigger webhooks
   - Invalidate cache

9. API Layer → User
   Return created entry
```

### Automatic Scaling Flow

```
1. Auto-Scaler (every 60s)
   Collect metrics (CPU, memory, requests)

2. Auto-Scaler
   Evaluate against thresholds

3. If high load → Auto-Scaler
   Scale up decision

4. Auto-Scaler → Registry
   Register new node

5. Auto-Scaler → Database
   Log scaling event

6. Auto-Scaler → Audit Logger
   Log scaling action
```

### Self-Healing Flow

```
1. Self-Healing (every 30s)
   Check component health

2. Self-Healing → Database
   Query health status

3. If unhealthy → Self-Healing
   Identify healing strategy

4. Self-Healing → Execute Strategy
   Apply healing action (restart, clear cache, etc.)

5. Self-Healing → Database
   Record healing action

6. Self-Healing → Audit Logger
   Log healing event

7. If repeated failures → Workflow Engine
   Trigger 'system.repeated_failure' event
```

## 📋 Operational Responsibilities

### **System Administrator**
- Monitor overall system health
- Review audit logs and security events
- Apply optimization suggestions
- Manage user roles and permissions
- Configure scaling thresholds
- Review and approve high-impact changes

### **Content Manager (Admin Role)**
- Create and manage content types
- Manage all content entries
- Upload and organize media
- Configure workflows
- Review content analytics

### **Content Editor (Editor Role)**
- Create and edit content entries
- Upload media files
- Publish content
- View own content

### **Content Viewer (Viewer Role)**
- View published content
- View media files
- Read-only access

## 🔐 Security Responsibilities

### **Access Control Matrix**
- Enforces role-based permissions
- Tracks user sessions
- Validates every request
- Logs access attempts
- Supports temporary permissions

### **Audit System**
- Logs all actions for compliance
- Tracks security events
- Supports forensic analysis
- Generates compliance reports
- Maintains immutable audit trail

### **Authentication System**
- Manages JWT tokens
- Handles refresh tokens
- Enforces password policies
- Tracks login attempts
- Supports session management

## 📊 Monitoring Responsibilities

### **Health Monitoring**
- Checks all components every 30 seconds
- Detects failures immediately
- Auto-heals when possible
- Alerts on critical issues
- Tracks health history

### **Metrics Collection**
- Collects system metrics every 10 seconds
- Stores metrics for 7 days
- Provides real-time metrics API
- Supports historical analysis
- Enables capacity planning

### **Audit Trail**
- Logs every action with full context
- Supports compliance requirements
- Enables security analysis
- Provides user activity tracking
- Maintains data integrity

## 🎯 Component Dependencies Matrix

| Component | Depends On | Used By |
|-----------|-----------|---------|
| Database | File System | All components |
| Audit Logger | Database | All components |
| Authentication | Database, Audit | API Layer, All routes |
| Access Control | Database, Audit | Authentication, API |
| Registry | Database, Audit | Auto-Scaler, Discovery |
| Workflow Engine | Database, Audit | Self-Healing, Intelligence |
| Auto-Scaler | Registry, Database, Audit | None (autonomous) |
| Self-Healing | Database, Registry, Workflow, Audit | None (autonomous) |
| Intelligence | Database, Audit, Workflow | None (autonomous) |
| Auto-Discovery | Registry, Database, Audit | None (autonomous) |
| MCP Protocol | Audit | API Layer (future) |
| Content Management | Database, Auth, Audit, Workflow | API Layer |
| Media Management | Database, Auth, Audit, File System | API Layer |

## 🚀 Startup Sequence

1. **Initialize Database** - Create tables, indexes
2. **Load Configuration** - Environment variables
3. **Initialize Audit Logger** - Set up logging
4. **Initialize Registry** - Prepare node tracking
5. **Initialize Authentication** - Set up JWT, ACL
6. **Initialize Automation Systems** - Start all automation
7. **Start API Server** - Begin accepting requests
8. **Register Self** - Register API server in registry
9. **Start Health Checks** - Begin monitoring
10. **Ready** - System fully operational

## 🛑 Shutdown Sequence

1. **Stop Accepting Requests** - Close HTTP server
2. **Stop Automation Systems** - Graceful shutdown
3. **Complete In-Flight Requests** - Wait for completion
4. **Flush Audit Logs** - Ensure all logs written
5. **Close Database Connections** - Clean shutdown
6. **Exit** - Process terminates

---

**All components are designed to be:**
- ✅ **Autonomous** - Self-managing within their domain
- ✅ **Observable** - Full logging and monitoring
- ✅ **Resilient** - Handle failures gracefully
- ✅ **Scalable** - Support horizontal scaling
- ✅ **Secure** - Enforce access control
- ✅ **Auditable** - Complete action trail
