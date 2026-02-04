---
description: Automated stage, commit, verify, push, and sync workflow
---

# Automated Deploy Workflow

## Purpose
Single command to stage changes, commit, verify with checkpoint validation, push to all remotes, and run HeadySync. Replaces manual sequence of commands.

## Usage

```bash
# Run automated deploy
hc -a deploy

# With custom commit message
hc -a deploy -m "feat: your changes"

# Force deploy (skip validation)
hc -a deploy -Force
```

## Steps

### 1. Stage All Changes
// turbo
Stage all modified, new, and deleted files:
```bash
git add -A
```

### 2. Commit Changes
Commit with conventional commit message:
```bash
# If message provided
git commit -m "$MESSAGE"

# If no message, prompt user
git commit
```

### 3. Verify with Checkpoint
Run comprehensive checkpoint validation:
```bash
hs -Checkpoint
```

This validates:
- File synchronization
- Pattern registry (13 categories)
- Binary integrity
- Concept implementations
- Naming conventions
- Communication patterns
- Prompt patterns
- **Documentation visuals** (Mermaid, Figma, Canva)
- **Workflow patterns** (no repetitive commands)
- Comprehensive pattern scan (6 external sources)

### 4. Push to All Remotes
// turbo
Push to all configured Git remotes:
```bash
git push origin master
git push heady-sys master
git push heady-me master
# ... all configured remotes
```

### 5. Run HeadySync
// turbo
Final synchronization across all repos:
```bash
hs
```

This ensures:
- All repos fetched
- Worktrees pruned
- Linting fixed
- Optimizations run
- All remotes synchronized

### 6. Post-Deploy Verification
Verify deployment success:
```bash
# Check remote status
git remote update
git status -uno

# Health checks
curl http://localhost:8000/health
curl http://localhost:3400/status
```

## Success Criteria

✅ All changes staged  
✅ Commit created with conventional format  
✅ Checkpoint validation passed  
✅ All remotes pushed successfully  
✅ HeadySync completed  
✅ Services healthy  

## Error Handling

**If staging fails:**
- Check for merge conflicts
- Resolve conflicts and retry

**If commit fails:**
- Verify commit message format
- Check for pre-commit hooks
- Fix issues and retry

**If checkpoint validation fails:**
- Review validation report
- Fix pattern violations
- Use `-Force` to override (not recommended)

**If push fails:**
- Check remote configuration
- Verify GitHub repository exists
- Check authentication (SSH keys)
- Verify network connectivity

**If HeadySync fails:**
- Review sync logs
- Check remote status
- Fix issues and retry

## Implementation

**Script Location:** `C:\Users\erich\Heady\scripts\deploy.ps1`

```powershell
param(
    [string]$Message,
    [switch]$Force
)

# 1. Stage
git add -A

# 2. Commit
if ($Message) {
    git commit -m $Message
} else {
    git commit
}

# 3. Verify
if (!$Force) {
    & "$PSScriptRoot\checkpoint-validation.ps1" -Full
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Checkpoint validation failed. Use -Force to override."
        exit 1
    }
}

# 4. Push
$remotes = @("origin", "heady-sys", "heady-me")
foreach ($remote in $remotes) {
    git push $remote master
}

# 5. Sync
& "$PSScriptRoot\hs.ps1"
```

## Benefits

✅ **Single command** - No repetitive manual steps  
✅ **Validation built-in** - Catches issues before push  
✅ **Consistent process** - Same steps every time  
✅ **Error handling** - Clear feedback on failures  
✅ **Audit trail** - All steps logged  
✅ **Time-saving** - Automates 5+ manual commands  

## Pattern Compliance

This workflow follows the **UI-Based Workflows** pattern (workflow-001):
- ✅ Replaces repetitive manual commands
- ✅ Provides clear feedback at each step
- ✅ Includes validation and error handling
- ✅ Available in UI (Windsurf workflows)
- ✅ Prevents anti-pattern of "hc -a hb then hc -a hs"

---

**Use `/automated-deploy` in Windsurf UI for best experience!**
