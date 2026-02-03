# Heady Monorepo

**Sacred Geometry Ecosystem - Unified Repository**

This monorepo consolidates all Heady project components into a single, organized structure.

## Structure

```
HeadyMonorepo/
├── packages/           # Code packages and workspaces
│   ├── heady-connection/   # HeadyConnection Foundation (non-profit, "The Why")
│   └── heady-systems/      # HeadySystems Core (C-Corp, "The How")
├── vms/               # Virtual machines and VM configurations
│   ├── HeadyConnection1/   # Primary VM instance
│   └── HeadySystems1/      # Systems VM instance
├── assets/            # Binary assets, installers, ISOs
│   ├── installers/         # Software installers
│   ├── images/             # Image assets
│   └── media/              # Media files
├── logs/              # System logs and audit trails
├── docs/              # Documentation and specifications
│   ├── architecture/       # Architecture documents
│   ├── workflows/          # Workflow definitions
│   └── guides/             # User guides
└── .secrets/          # Secrets and credentials (gitignored)

```

## Packages

### heady-connection
HeadyConnection Foundation - Defines "The Why" of the Heady Directive. Establishes interfaces, schemas, and policies for the sovereign AI ecosystem.

### heady-systems
HeadySystems Core - Implements "The How". Hardened implementation of the Heady architecture.

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Build all packages
npm run build:all

# Run tests
npm run test:all
```

## Virtual Machines

VM configurations and instances are stored in `vms/` directory. Each VM has its own subdirectory with:
- `.vmx` configuration files
- `.vmdk` disk images
- Log files
- Snapshots

## Assets

Large binary files, installers, and media assets are stored in `assets/` directory to keep the main codebase clean.

## Documentation

All project documentation is centralized in `docs/` directory, including:
- Architecture blueprints
- Workflow definitions
- API specifications
- User guides

## Security

Secrets and credentials are stored in `.secrets/` directory and are excluded from version control.

## License

MIT License - See individual packages for specific licensing.
