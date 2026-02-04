<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: MIGRATION.md -->
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

# Migration Guide

This document describes the migration from separate HeadyConnection and HeadyVM directories to the unified HeadyMonorepo structure.

## Migration Summary

**Date**: February 3, 2026  
**Source Directories**:
- `F:\HeadyConnection`
- `F:\HeadyVM`

**Target Directory**: `F:\HeadyMonorepo`

## Directory Mapping

### HeadyConnection → HeadyMonorepo

| Source | Destination | Notes |
|--------|-------------|-------|
| `F:\HeadyConnection\Config` | `packages/heady-connection/package.json` | Package configuration |
| `F:\HeadyConnection\Docs` | `docs/architecture/heady-architecture.md` | Architecture documentation |
| `F:\HeadyConnection\*.pdf` | `docs/` | PDF documentation |
| `F:\HeadyConnection\*.pem` | `.secrets/` | Security credentials |
| `F:\HeadyConnection\*.exe` | `assets/installers/` | Software installers |
| `F:\HeadyConnection\*.iso` | `assets/installers/` | OS images |
| `F:\HeadyConnection\Workspace 1` | `vms/HeadyConnection1/` | VM workspace |
| `F:\HeadyConnection\ableton_live_suite_12.3.2_64` | `assets/installers/ableton_live_suite_12.3.2_64/` | Ableton installer |
| `F:\HeadyConnection\Ableton` | `assets/media/Ableton/` | Ableton media files |

### HeadyVM → HeadyMonorepo

| Source | Destination | Notes |
|--------|-------------|-------|
| `F:\HeadyVM\HeadyConnection1` | `vms/HeadyConnection1-vm2/` | VM instance |
| `F:\HeadyVM\Virtual Machines\HeadySystems1` | `vms/HeadySystems1/` | Systems VM |
| `F:\HeadyVM\Logs` | `logs/vm-logs.txt` | VM logs |
| `F:\HeadyVM\VirtualMachines` | `vms/vm-registry.xml` | VM registry |
| `F:\HeadyVM\*.scoreboard` | `vms/` | VM scoreboards |

## New Monorepo Structure

```
HeadyMonorepo/
├── packages/
│   ├── heady-connection/      # HeadyConnection Foundation (non-profit)
│   └── heady-systems/         # HeadySystems Core (C-Corp)
├── vms/
│   ├── HeadyConnection1/      # Primary VM from Workspace 1
│   ├── HeadyConnection1-vm2/  # Secondary VM instance
│   ├── HeadySystems1/         # Systems VM
│   ├── vm-registry.xml        # VM registry
│   └── *.scoreboard           # VM scoreboards
├── assets/
│   ├── installers/            # Software installers, ISOs
│   ├── images/                # Image assets
│   └── media/                 # Media files (Ableton, etc.)
├── logs/
│   └── vm-logs.txt            # VM logs
├── docs/
│   ├── architecture/          # Architecture documentation
│   │   └── heady-architecture.md
│   └── *.pdf                  # PDF documentation
├── .secrets/                  # Credentials (gitignored)
│   └── *.pem                  # SSH keys
├── package.json               # Root monorepo config
├── .gitignore                 # Git ignore rules
└── README.md                  # Main documentation
```

## Post-Migration Steps

1. **Initialize Git Repository**
   ```bash
   cd F:\HeadyMonorepo
   git init
   git add .
   git commit -m "Initial monorepo structure"
   ```

2. **Add Remote Repositories**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Install Dependencies**
   ```bash
   npm run install:all
   ```

4. **Verify VM Configurations**
   - Update VM paths in `.vmx` files to reflect new locations
   - Test VM boot and connectivity

5. **Update Documentation**
   - Review and update any hardcoded paths in documentation
   - Update workflow files with new directory structure

## Rollback Plan

If needed, original directories remain at:
- `F:\HeadyConnection` (source files copied, not moved)
- `F:\HeadyVM` (source files copied, not moved)

Large binary files (executables, ISOs) were moved to save space.

## Benefits of Monorepo Structure

1. **Unified Version Control**: All components tracked in single repository
2. **Simplified Dependencies**: Shared dependencies managed at root level
3. **Better Organization**: Clear separation of code, VMs, assets, and logs
4. **Workspace Support**: NPM workspaces for multi-package management
5. **Consistent Tooling**: Unified build, test, and deployment scripts
6. **Improved Collaboration**: Single source of truth for all Heady components

## Next Steps

- Set up CI/CD pipelines for monorepo
- Configure workspace-specific build processes
- Implement cross-package dependency management
- Set up automated testing across workspaces
- Configure deployment strategies for each package
