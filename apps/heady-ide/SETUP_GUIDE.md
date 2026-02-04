<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-ide/SETUP_GUIDE.md -->
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

# HeadyIDE Setup Guide

Complete guide to setting up and running the hybrid Eclipse Theia + VS Code OSS IDE.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **Heady Manager**: Running instance (see Heady Systems setup)

## Quick Start

```bash
# 1. Clone the repository
cd c:\Users\erich\Projects\apps\ide\HeadyIDE

# 2. Install dependencies
npm install

# 3. Bootstrap packages (Lerna)
npx lerna bootstrap

# 4. Build all packages
npm run build

# 5. Start Heady Manager (in separate terminal)
cd c:\Users\erich\Heady
npm start

# 6. Start HeadyIDE
cd c:\Users\erich\Projects\apps\ide\HeadyIDE
npm run dev
```

## Detailed Setup

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Install Theia dependencies
npm run install:theia

# Install VS Code dependencies
npm run install:vscode

# Bootstrap all packages
npx lerna bootstrap
```

### 2. Configure Environment

Create `.env` file in project root:

```env
# Heady Manager Connection
HEADY_MANAGER_URL=http://localhost:3300
HEADY_API_KEY=your_api_key_here

# MCP Configuration
MCP_GATEWAY_URL=http://localhost:3301
MCP_GATEWAY_JWT_SECRET=your_jwt_secret_here

# IDE Configuration
IDE_PORT=3400
IDE_HOST=localhost

# Feature Flags
ENABLE_HEADY_MCP=true
ENABLE_AI_COMPLETION=true
ENABLE_REALTIME_COLLAB=true
ENABLE_SACRED_GEOMETRY_THEME=true
```

### 3. Build Packages

```bash
# Build all packages
npm run build

# Or build individually
cd packages/core && npm run build
cd packages/theia-integration && npm run build
cd packages/vscode-integration && npm run build
cd extensions/heady-mcp && npm run build
```

### 4. Start Heady Manager

HeadyIDE requires Heady Manager to be running:

```bash
# In separate terminal
cd c:\Users\erich\Heady
npm start

# Verify it's running
curl http://localhost:3300/api/health
```

### 5. Run HeadyIDE

#### Browser Mode (Theia-based)

```bash
npm run dev:browser
```

Open browser to: `http://localhost:3400`

#### Desktop Mode (Electron-based)

```bash
npm run dev:electron
```

Desktop app will launch automatically.

## Project Structure

```
HeadyIDE/
├── packages/
│   ├── core/                    # Core functionality
│   │   ├── src/
│   │   │   ├── unified-extension-host.ts
│   │   │   ├── heady-connection.ts
│   │   │   ├── sacred-geometry.ts
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── theia-integration/       # Theia components
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── vscode-integration/      # VS Code components
│   │   ├── src/
│   │   └── package.json
│   │
│   └── heady-services/          # Heady Systems integration
│       ├── src/
│       └── package.json
│
├── apps/
│   ├── browser/                 # Web-based IDE
│   │   ├── src/
│   │   └── package.json
│   │
│   └── electron/                # Desktop app
│       ├── src/
│       └── package.json
│
├── extensions/
│   └── heady-mcp/               # HeadyMCP extension
│       ├── src/
│       │   └── extension.ts
│       ├── package.json
│       └── README.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── EXTENSION_API.md
│   └── HEADY_INTEGRATION.md
│
├── package.json                 # Root package
├── lerna.json                   # Lerna config
├── tsconfig.json                # TypeScript config
└── .env.example                 # Environment template
```

## Development Workflow

### Watch Mode

```bash
# Watch all packages
npm run watch

# Watch specific package
cd packages/core && npm run watch
```

### Testing

```bash
# Run all tests
npm test

# Test specific package
cd packages/core && npm test
```

### Building Extensions

```bash
# Build HeadyMCP extension
cd extensions/heady-mcp
npm run build

# Package as .vsix
npm run package
```

## Installing Extensions

### HeadyMCP Extension

#### In HeadyIDE
Extensions are automatically loaded from `extensions/` directory.

#### In VS Code
```bash
cd extensions/heady-mcp
npm run package
code --install-extension heady-mcp-1.0.0.vsix
```

#### In Theia
Place built extension in Theia plugins directory.

## Troubleshooting

### Build Errors

**Issue**: `Cannot find module 'inversify'`

**Solution**:
```bash
cd packages/core
npm install inversify @types/node @types/ws
```

**Issue**: TypeScript errors

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Connection Issues

**Issue**: Cannot connect to Heady Manager

**Solution**:
1. Verify Heady Manager is running: `http://localhost:3300/api/health`
2. Check `.env` file has correct `HEADY_MANAGER_URL`
3. Verify API key is set

**Issue**: WebSocket connection fails

**Solution**:
1. Check firewall settings
2. Verify WebSocket endpoint: `ws://localhost:3300/ws`
3. Check Heady Manager logs

### Extension Issues

**Issue**: HeadyMCP extension not loading

**Solution**:
1. Verify extension is built: `extensions/heady-mcp/dist/extension.js` exists
2. Check extension manifest: `extensions/heady-mcp/package.json`
3. Restart IDE

## Advanced Configuration

### Custom Theia Plugins

Add to `apps/browser/package.json`:

```json
{
  "dependencies": {
    "@theia/plugin-ext": "^1.45.0",
    "your-custom-plugin": "^1.0.0"
  }
}
```

### Custom VS Code Extensions

Place `.vsix` files in `extensions/` directory.

### Sacred Geometry Theme

Customize in `packages/core/src/sacred-geometry.ts`:

```typescript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
  // ...
}
```

## Production Build

```bash
# Build all packages for production
NODE_ENV=production npm run build

# Build Electron app
npm run build:electron

# Output: apps/electron/dist/
```

## Next Steps

1. **Read Architecture**: See `ARCHITECTURE.md` for design details
2. **Explore Extensions**: Check `extensions/heady-mcp/README.md`
3. **Customize Theme**: Modify Sacred Geometry settings
4. **Add Features**: Extend with custom extensions

## Support

- **Documentation**: `docs/` directory
- **Issues**: GitHub Issues
- **Community**: HeadySystems Discord

## License

MIT - See LICENSE file for details
