---
description: Build all packages and sync to all remotes with validation
---

# Build and Sync Workflow

## Purpose
Automated workflow to build all packages, validate patterns, and sync to all configured Git remotes. This replaces the manual sequence of `hc -a hb` then `hc -a hs`.

## Steps

### 1. Pre-Build Validation
Check that the system is ready for build:
- Verify all repos are clean or changes are committed
- Check for merge conflicts
- Validate environment configuration

### 2. Build All Packages
// turbo
Run HeadyBuild to compile all packages:
```bash
hc -a hb
```

This will:
- Verify system intelligence
- Install dependencies in all repos
- Build all packages
- Run tests (if configured)
- Generate build reports

### 3. Apply Branding
// turbo
Ensure all files have Sacred Geometry branding:
```bash
node scripts/brand_headers.js --fix
```

### 4. Checkpoint Validation
Run comprehensive validation before sync:
```bash
hs -Checkpoint
```

This validates:
- File synchronization across repos
- Pattern registry completeness
- Binary integrity
- Concept implementations
- Naming conventions
- Communication patterns
- Prompt patterns
- Documentation visuals (Mermaid, Figma, Canva)
- **Comprehensive pattern scan** (internal + public domain)

### 5. Commit Changes
If validation passes and there are changes:
```bash
git add -A
git commit -m "build: automated build and sync - $(date)"
```

### 6. Sync to All Remotes
// turbo
Run HeadySync to push to all configured remotes:
```bash
hc -a hs
```

This will:
- Fetch all remotes
- Prune stale worktrees
- Fix linting errors
- Run optimizations
- Push to all configured Git remotes
- Verify sync status

### 7. Post-Sync Verification
Verify all remotes are synchronized:
```bash
git remote update
git status -uno
```

### 8. Health Check
Verify services are healthy:
```bash
curl http://localhost:8000/health
curl http://localhost:3300/status
```

## Success Criteria

✅ All packages built successfully  
✅ All files branded with Sacred Geometry headers  
✅ Checkpoint validation passed  
✅ All changes committed  
✅ All remotes synchronized  
✅ Services healthy  

## Error Handling

**If build fails:**
- Review build logs
- Fix compilation errors
- Re-run workflow

**If validation fails:**
- Review checkpoint report
- Fix pattern violations
- Use `hs -Force` to override (not recommended)

**If sync fails:**
- Check remote configuration
- Verify network connectivity
- Check GitHub repository exists
- Review authentication (SSH keys)

## UI Integration

This workflow should be available in the Heady UI as:
- **Menu:** Tools → Build and Sync
- **Keyboard Shortcut:** Ctrl+Shift+B
- **Status:** Shows progress for each step
- **Logs:** Real-time output in UI panel
- **Notifications:** Success/failure alerts

## Benefits

✅ **No repetitive commands** - Single workflow replaces multiple manual steps  
✅ **Validation built-in** - Catches issues before sync  
✅ **Consistent process** - Same steps every time  
✅ **Error handling** - Clear feedback on failures  
✅ **UI-driven** - Click button instead of typing commands  
✅ **Audit trail** - All steps logged  

---

**Pattern Recognizer Note:** This workflow pattern prevents the anti-pattern of repetitive manual commands (hc -a hb then hc -a hs). The pattern recognizer now detects this and suggests using the UI workflow instead!
