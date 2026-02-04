<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-ide/README.md -->
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

# HeadyIDE - Hybrid Eclipse Theia + VS Code OSS

## Architecture Overview

HeadyIDE is a hybrid IDE combining the best of:
- **Eclipse Theia**: Cloud & Desktop IDE platform
- **VS Code OSS**: Open-source Visual Studio Code core
- **Heady Systems**: MCP protocol, hs services, and custom tooling

## Key Features

### Core Capabilities
- ✅ Monaco Editor (from VS Code)
- ✅ Theia Extension API compatibility
- ✅ VS Code Extension API compatibility
- ✅ Language Server Protocol (LSP) support
- ✅ Integrated terminal (xterm.js)
- ✅ Git integration
- ✅ File explorer with tree view

### Heady Integration
- ✅ HeadyMCP extension for AI-powered coding
- ✅ Connection to Heady Manager (port 3300)
- ✅ Sacred Geometry UI theme
- ✅ Real-time collaboration via WebSocket
- ✅ Heady Systems service integration

### Extension Ecosystem
- ✅ VS Code extensions compatible
- ✅ Theia extensions compatible
- ✅ Custom HeadyMCP extension marketplace

## Project Structure

```
HeadyIDE/
├── packages/
│   ├── core/                    # Core IDE functionality
│   ├── theia-integration/       # Eclipse Theia components
│   ├── vscode-integration/      # VS Code OSS components
│   ├── heady-mcp-extension/     # HeadyMCP extension
│   └── heady-services/          # Heady Systems integration
├── apps/
│   ├── electron/                # Desktop app (Electron)
│   └── browser/                 # Web-based IDE
├── extensions/
│   └── heady-mcp/               # HeadyMCP extension
└── docs/
    ├── ARCHITECTURE.md
    ├── EXTENSION_API.md
    └── HEADY_INTEGRATION.md
```

## Technology Stack

### Base Frameworks
- **Eclipse Theia** (EPL-2.0 / Apache-2.0)
- **VS Code OSS** (MIT)
- **Monaco Editor** (MIT)

### Runtime
- **Electron** - Desktop application
- **Node.js** - Backend services
- **TypeScript** - Primary language

### Heady Integration
- **MCP Protocol** - Model Context Protocol
- **Heady Manager** - Service orchestration
- **WebSocket** - Real-time communication

## License

This project uses multiple open-source components:
- Eclipse Theia: EPL-2.0 / Apache-2.0
- VS Code OSS: MIT
- Monaco Editor: MIT
- HeadyIDE Custom Code: MIT

## Getting Started

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development server
npm run dev

# Build desktop app
npm run build:electron
```

## Heady Systems Integration

HeadyIDE connects to Heady Manager for:
- AI-powered code completion
- Real-time collaboration
- System monitoring
- MCP service access

Configure connection in `.env`:
```
HEADY_MANAGER_URL=http://localhost:3300
HEADY_API_KEY=your_api_key_here
```
