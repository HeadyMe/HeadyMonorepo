<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-cms/OPERATIONS.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _  __   __ -->
<!--        | | | || ____|  / \ \  / / -->
<!--        | |_| ||  _|   / _ \ \ V /  -->
<!--        |  _  || |___ / ___ \ | |   -->
<!--        |_| |_||_____/_/   \_\|_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# Heady System - Operations Guide

## 🚀 System Initialization

### First-Time Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Initialize database (creates tables, default user, sample data)
npm run db:init

# 5. Start the server
npm run dev
```

**What happens during initialization:**
1. ✅ Database tables created
2. ✅ Indexes and foreign keys set up
3. ✅ Default admin user created (`admin@heady.local` / `admin123`)
4. ✅ Sample content types created (Blog, Page)
5. ✅ Default workflows registered
6. ✅ Automation systems initialized
7. ✅ Health monitoring started
8. ✅ Auto-scaling activated
9. ✅ Self-healing enabled
10. ✅ Service discovery started

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

## 📊 Monitoring & Health Checks

### Check System Status

```bash
# Overall automation status
curl http://localhost:3000/api/v1/automation/status

# Health status
curl http://localhost:3000/api/v1/automation/health

# Current metrics
curl http://localhost:3000/api/v1/automation/scaling/metrics

# System topology
curl http://localhost:3000/api/v1/automation/registry/topology
```

### View Logs

```bash
# Audit logs (requires admin token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/logs?limit=50"

# Security events
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/security-events"

# Audit statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/statistics?timeRange=24h"
```

## 🔧 Common Operations

### 1. Manual Workflow Execution

```bash
# Get list of workflows
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/workflows

# Execute a workflow manually
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"context": {"manual": true}}' \
  http://localhost:3000/api/v1/automation/workflows/WORKFLOW_ID/execute

# View workflow execution history
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/workflows/WORKFLOW_ID/executions
```

### 2. Force Service Discovery

```bash
# Trigger manual discovery scan
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/discovery/scan

# View discovered services
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/discovery/services
```

### 3. Apply Optimization Suggestions

```bash
# Get pending suggestions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/intelligence/suggestions

# Apply a suggestion (admin only)
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/intelligence/suggestions/SUGGESTION_ID/apply
```

### 4. Node Management

```bash
# Register a new node
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "worker-1",
    "type": "worker",
    "role": "content_processor",
    "endpoint": "http://localhost:3001",
    "capabilities": ["content_processing"]
  }' \
  http://localhost:3000/api/v1/automation/registry/nodes

# Send heartbeat
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/registry/nodes/NODE_ID/heartbeat
```

## 🔐 Security Operations

### User Management

```bash
# Create new user
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "name": "New User"
  }' \
  http://localhost:3000/api/v1/auth/register

# Login
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@heady.local",
    "password": "admin123"
  }' \
  http://localhost:3000/api/v1/auth/login
```

### Review Security Events

```bash
# Get unresolved security events
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/security-events?resolved=false"

# Get critical security events
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/security-events?severity=critical"
```

## 📈 Performance Tuning

### Database Optimization

The system automatically optimizes the database daily at 2 AM via the `auto_optimize` workflow. To run manually:

```bash
# Trigger optimization workflow
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/workflows/auto_optimize/execute
```

**What it does:**
- Vacuums database (VACUUM)
- Cleans expired sessions
- Cleans expired tokens
- Optimizes media storage

### Scaling Configuration

Edit `backend/src/automation/autoScaler.js` to adjust thresholds:

```javascript
this.thresholds = {
  cpu: { scale_up: 70, scale_down: 30 },      // CPU percentage
  memory: { scale_up: 75, scale_down: 40 },   // Memory percentage
  requests_per_min: { scale_up: 1000, scale_down: 100 }
};
```

### Workflow Scheduling

Edit `backend/src/automation/workflowEngine.js` to adjust schedules:

```javascript
{
  name: 'auto_backup',
  trigger_config: { cron: '0 */6 * * *' }  // Every 6 hours
}
```

## 🛠️ Troubleshooting

### System Not Starting

**Check logs:**
```bash
cd backend
npm run dev
```

**Common issues:**
1. Port 3000 already in use → Change `PORT` in `.env`
2. Database locked → Delete `backend/data/` and run `npm run db:init`
3. Missing dependencies → Run `npm install`

### Automation Not Running

**Check automation status:**
```bash
curl http://localhost:3000/api/v1/automation/status
```

**Verify workflows:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/workflows
```

**Check for errors in logs**

### High Memory Usage

The self-healing system automatically handles this, but you can manually trigger:

```bash
# The system will automatically:
# 1. Clear caches
# 2. Run garbage collection
# 3. Log the healing action
```

### Database Issues

**Reinitialize database (WARNING: Deletes all data):**
```bash
cd backend
rm -rf data/
npm run db:init
```

**Backup database:**
```bash
# Trigger backup workflow
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/workflows/auto_backup/execute
```

## 📦 Backup & Recovery

### Automatic Backups

Backups run automatically every 6 hours via the `auto_backup` workflow.

**Backup location:** `backend/data/backups/`

### Manual Backup

```bash
# Copy database file
cp backend/data/heady.db backend/data/heady-backup-$(date +%Y%m%d-%H%M%S).db

# Or trigger backup workflow
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/workflows/auto_backup/execute
```

### Restore from Backup

```bash
# Stop the server
# Replace current database
cp backend/data/heady-backup-TIMESTAMP.db backend/data/heady.db
# Restart the server
npm run dev
```

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Clear Caches

```bash
# Clear old metrics (keeps last 7 days)
# This happens automatically, but to force:
DELETE FROM system_metrics WHERE timestamp < datetime('now', '-7 days');
```

### Clean Up Old Audit Logs

```bash
# Keep last 90 days (example)
DELETE FROM audit_logs WHERE timestamp < datetime('now', '-90 days');
```

## 📊 Metrics & Analytics

### View System Metrics

```bash
# Current metrics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/scaling/metrics

# Scaling history
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/scaling/history?limit=50
```

### Audit Statistics

```bash
# Last 24 hours
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/statistics?timeRange=24h"

# Last 7 days
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/audit/statistics?timeRange=7d"
```

### Intelligence Insights

```bash
# Get behavioral insights
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/automation/intelligence/insights

# Get high-priority insights
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/automation/intelligence/insights?priority=high"
```

## 🚨 Emergency Procedures

### System Unresponsive

1. Check if process is running: `ps aux | grep node`
2. Check port availability: `lsof -i :3000`
3. Restart server: `npm run dev`
4. Check logs for errors

### Database Corruption

1. Stop the server
2. Restore from latest backup
3. Run integrity check: `sqlite3 heady.db "PRAGMA integrity_check;"`
4. Restart server

### High Load / DDoS

The system auto-scales, but for immediate relief:

1. Check current load: `curl http://localhost:3000/api/v1/automation/scaling/metrics`
2. Review recent requests: Check audit logs
3. Enable rate limiting (already enabled by default)
4. Block suspicious IPs at firewall level

## 📞 Support & Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### API Documentation

Visit: `http://localhost:3000/api-docs`

### System Status Dashboard

```bash
curl http://localhost:3000/api/v1/automation/status
```

## 🎯 Best Practices

1. **Monitor regularly** - Check `/automation/status` daily
2. **Review audit logs** - Weekly security review
3. **Apply optimizations** - Review and apply suggestions monthly
4. **Update dependencies** - Monthly security updates
5. **Test backups** - Quarterly restore tests
6. **Review metrics** - Monitor scaling patterns
7. **Clean old data** - Quarterly cleanup of old logs/metrics
8. **Document changes** - Keep operational log

## 📝 Operational Checklist

### Daily
- [ ] Check system health status
- [ ] Review critical security events
- [ ] Monitor auto-scaling activity

### Weekly
- [ ] Review audit logs
- [ ] Check optimization suggestions
- [ ] Review workflow execution history
- [ ] Monitor disk usage

### Monthly
- [ ] Update dependencies
- [ ] Review and apply optimizations
- [ ] Clean up old audit logs
- [ ] Test backup restoration
- [ ] Review access control policies

### Quarterly
- [ ] Full system audit
- [ ] Performance review
- [ ] Security assessment
- [ ] Capacity planning
- [ ] Documentation update

---

**The system is designed to be self-managing, but regular monitoring ensures optimal performance and security.**
