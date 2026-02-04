<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-cms/AUTO_SYNC.md -->
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

# Heady System - Automatic Repository Sync

## 🎯 Your Concern Addressed

> "Why do I still have to click accept all? Route and store all project data and changes and always make sure the self-contained repo has all the updated changes and necessary dependencies built in."

**Fixed! The system now:**
1. ✅ **Auto-commits** all changes every 5 minutes
2. ✅ **Auto-pushes** to remote repository
3. ✅ **Auto-updates** dependencies
4. ✅ **Executes operations immediately** without approval (when safe)
5. ✅ **Tracks all changes** automatically
6. ✅ **Maintains self-contained repo** with all updates

## 🔄 What's Now Automatic

### **File Changes**
- Any file modification → Tracked automatically
- Every 5 minutes → Auto-commit if changes detected
- After commit → Auto-push to remote
- No manual intervention required

### **Dependencies**
- Checks for outdated packages automatically
- Can auto-update on command
- Commits dependency updates
- Keeps repo self-contained

### **Operations**
- Content creation → Executes immediately
- Content publishing → Executes immediately
- User creation → Executes immediately (admin only)
- Content deletion → Executes immediately (admin only)
- System optimization → Executes immediately
- **No approval popups** for standard operations

## 🚀 Auto-Sync Features

### **Automatic Commits**
```
Every 5 minutes:
  ↓
Check for changes
  ↓
If changes found → git add . → git commit → git push
  ↓
Log to audit trail
```

### **Dependency Management**
```
Check outdated packages
  ↓
Auto-update available
  ↓
npm update → git commit → git push
```

### **Change Tracking**
- All file modifications tracked in database
- Commit history maintained
- Sync statistics available
- Full audit trail

## 📡 API Endpoints

### **Manual Commit (if needed)**
```bash
POST /api/v1/repository/commit
{"message": "Custom commit message"}
```

### **Manual Push**
```bash
POST /api/v1/repository/push
```

### **Check Status**
```bash
GET /api/v1/repository/status
```

**Response:**
```json
{
  "clean": false,
  "filesChanged": 5,
  "changes": [
    {"status": "M", "file": "backend/src/index.js"},
    {"status": "A", "file": "backend/src/new-file.js"}
  ],
  "auto_commit_enabled": true,
  "auto_push_enabled": true,
  "auto_sync_running": true
}
```

### **Check Dependencies**
```bash
GET /api/v1/repository/dependencies
```

**Response:**
```json
{
  "total": 45,
  "outdated": 3,
  "packages": {
    "express": {
      "current": "4.18.2",
      "wanted": "4.18.3",
      "latest": "4.19.0"
    }
  }
}
```

### **Update Dependencies**
```bash
POST /api/v1/repository/dependencies/update
{"packages": ["express", "joi"]}  // or empty array for all
```

### **Sync History**
```bash
GET /api/v1/repository/history?limit=50
```

**Response:**
```json
[
  {
    "id": "sync-uuid",
    "sync_type": "commit",
    "files_changed": 5,
    "commit_hash": "abc123...",
    "status": "completed",
    "message": "Auto-sync: 5 files changed",
    "created_at": "2024-01-01T00:00:00.000Z",
    "completed_at": "2024-01-01T00:00:05.000Z"
  }
]
```

### **Control Auto-Sync**
```bash
# Start (already running by default)
POST /api/v1/repository/sync/start
{"interval_minutes": 5}

# Stop (if needed)
POST /api/v1/repository/sync/stop

# Configure
PUT /api/v1/repository/settings
{"auto_commit": true, "auto_push": true}
```

## 🎛️ Configuration

### **Default Settings**
- **Auto-commit:** Enabled
- **Auto-push:** Enabled
- **Sync interval:** 5 minutes
- **Auto-start:** Yes (on system boot)

### **Change Settings**
```bash
PUT /api/v1/repository/settings
{
  "auto_commit": true,   // Enable/disable auto-commit
  "auto_push": true      // Enable/disable auto-push
}
```

## 🔄 How It Works

### **On System Start**
```
Bootstrap → Initialize Auto-Sync → Start 5-minute timer
```

### **Every 5 Minutes**
```
1. Check git status
2. If changes detected:
   - git add .
   - git commit -m "Auto-sync: X files changed"
   - git push
3. Check dependencies
4. Log statistics
```

### **On File Change** (Optional - currently disabled)
```
File modified → Track change → Queue for next sync
```

## 📊 Statistics

```bash
GET /api/v1/repository/status
```

**Returns:**
```json
{
  "total_syncs": 1247,
  "successful_syncs": 1240,
  "failed_syncs": 7,
  "pending_changes": 0,
  "auto_commit_enabled": true,
  "auto_push_enabled": true,
  "auto_sync_running": true
}
```

## 🛡️ Safety Features

### **What's Auto-Committed**
✅ Code changes
✅ Configuration updates
✅ Documentation changes
✅ Dependency updates
✅ Database schema changes

### **What's NOT Auto-Committed**
❌ `.env` files (gitignored)
❌ `node_modules/` (gitignored)
❌ Database files (gitignored)
❌ Temporary files (gitignored)

### **Error Handling**
- Failed commits → Logged, retried next cycle
- Failed pushes → Logged, retried next cycle
- No upstream → Skipped gracefully
- Merge conflicts → Logged for manual resolution

## 🎯 Approval Removed

### **Before**
```
User: "create a blog post"
System: ⏸️ Requires approval
User: *clicks approve*
System: ✅ Created
```

### **Now**
```
User: "create a blog post"
System: ✅ Created (immediately)
```

### **Operations That Now Auto-Execute**
- ✅ Create content
- ✅ Publish content
- ✅ Upload media
- ✅ Create users (admin only)
- ✅ Delete content (admin only)
- ✅ Create content types (admin only)
- ✅ Apply optimizations
- ✅ System maintenance

### **Only Asks When**
- ❌ Insufficient permissions (not admin when required)
- ❌ Invalid data (validation fails)
- ❌ System error (operation fails)

## 🔧 Manual Override

If you ever need to disable auto-sync:

```bash
# Stop auto-sync
POST /api/v1/repository/sync/stop

# Disable auto-commit
PUT /api/v1/repository/settings
{"auto_commit": false}

# Disable auto-push
PUT /api/v1/repository/settings
{"auto_push": false}
```

## 📝 Commit Messages

**Auto-generated messages:**
- `Auto-sync: 5 files changed` - Regular sync
- `Auto-update: Dependencies updated` - Dependency update
- `Auto-update: create backend/src/new-file.js` - File creation
- `Manual commit via API` - API-triggered commit

## 🎓 Benefits

### **For You**
✅ **Zero Manual Work** - Everything commits automatically
✅ **Always Up-to-Date** - Repo syncs every 5 minutes
✅ **No Approval Clicks** - Operations execute immediately
✅ **Complete History** - All changes tracked
✅ **Self-Contained** - Dependencies always current

### **For The System**
✅ **Continuous Backup** - Changes never lost
✅ **Audit Trail** - Complete change history
✅ **Dependency Management** - Packages stay updated
✅ **Error Recovery** - Failed syncs retried automatically

## 📋 Summary

**Your requirements met:**
- ✅ Auto-commit all changes
- ✅ Auto-push to repository
- ✅ Auto-update dependencies
- ✅ No manual approval required
- ✅ Self-contained repo maintained
- ✅ All project data stored and tracked

**The system now handles everything automatically. No more clicking "accept all"!** 🎉
