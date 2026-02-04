<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-ide/ARCHITECTURE.md -->
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

# HeadyIDE Architecture

## Hybrid Design Philosophy

HeadyIDE combines Eclipse Theia and VS Code OSS in a unique hybrid architecture:

### Why This Works

1. **Shared Foundation**: Both use Monaco Editor and similar extension APIs
2. **Compatible Protocols**: Both support Language Server Protocol (LSP)
3. **Extension Compatibility**: Theia was designed to support VS Code extensions
4. **Complementary Strengths**:
   - **Theia**: Better for cloud/browser deployment, modular architecture
   - **VS Code OSS**: Mature desktop experience, extensive extension ecosystem

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     HeadyIDE Frontend                        │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Theia Workbench │         │  VS Code Workbench│         │
│  │  (Browser/Cloud) │         │  (Desktop/Electron)│        │
│  └────────┬─────────┘         └─────────┬────────┘         │
│           │                              │                   │
│  ┌────────┴──────────────────────────────┴────────┐         │
│  │         Unified Extension Host                  │         │
│  │  (Runs both Theia & VS Code extensions)        │         │
│  └────────┬──────────────────────────────┬────────┘         │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
┌───────────┴──────────────────────────────┴──────────────────┐
│                   HeadyIDE Backend                           │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Monaco Editor Core                   │       │
│  │  (Shared text editing, syntax highlighting)      │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Language Server Protocol (LSP)           │       │
│  │  (TypeScript, Python, JavaScript, etc.)          │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Heady Services Layer                │       │
│  │  • MCP Protocol Gateway (port 3301)              │       │
│  │  • Heady Manager Connection (port 3300)          │       │
│  │  • AI-Powered Code Completion                    │       │
│  │  • Real-time Collaboration (WebSocket)           │       │
│  │  • Sacred Geometry Theme Engine                  │       │
│  └──────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Core Editor (Monaco)
- **Source**: VS Code OSS (MIT License)
- **Purpose**: Text editing, syntax highlighting, IntelliSense
- **Shared by**: Both Theia and VS Code workbenches

### 2. Theia Integration
- **Components Used**:
  - `@theia/core` - Application framework
  - `@theia/filesystem` - File system abstraction
  - `@theia/monaco` - Monaco integration
  - `@theia/terminal` - Terminal widget
  - `@theia/git` - Git integration
  - `@theia/plugin-ext` - Extension host

### 3. VS Code OSS Integration
- **Components Used**:
  - Electron shell for desktop app
  - Extension host API
  - Workbench UI components
  - Debug adapter protocol

### 4. Unified Extension Host

The key innovation is a **unified extension host** that:
- Loads both Theia and VS Code extensions
- Translates API calls between formats
- Manages extension lifecycle
- Provides compatibility layer

```typescript
class UnifiedExtensionHost {
  private theiaHost: TheiaExtensionHost;
  private vscodeHost: VSCodeExtensionHost;
  
  async loadExtension(extensionPath: string) {
    const manifest = await this.readManifest(extensionPath);
    
    if (manifest.engines.theia) {
      return this.theiaHost.load(extensionPath);
    }
    
    if (manifest.engines.vscode) {
      return this.vscodeHost.load(extensionPath);
    }
    
    // Try both if compatible
    return this.loadHybrid(extensionPath);
  }
}
```

### 5. Heady Systems Integration

#### MCP Protocol Gateway
- Connects to MCP servers (filesystem, git, memory, etc.)
- Provides AI-powered tools to extensions
- Manages governance and security

#### Heady Manager Connection
- Real-time communication via WebSocket
- AI code completion and suggestions
- System monitoring and health checks

#### Sacred Geometry Theme
- Golden ratio (φ = 1.618) based layouts
- Organic, breathing UI animations
- Rounded, modern aesthetic

## Extension Compatibility Strategy

### API Translation Layer

```typescript
// Theia API → VS Code API
class TheiaToVSCodeAdapter {
  translateCommand(theiaCommand: TheiaCommand): VSCodeCommand {
    return {
      command: theiaCommand.id,
      title: theiaCommand.label,
      arguments: this.translateArgs(theiaCommand.args)
    };
  }
}

// VS Code API → Theia API
class VSCodeToTheiaAdapter {
  translateDisposable(vscodeDisposable: VSCodeDisposable): TheiaDisposable {
    return {
      dispose: () => vscodeDisposable.dispose()
    };
  }
}
```

### Extension Manifest Compatibility

Both formats supported:
```json
// VS Code extension
{
  "engines": { "vscode": "^1.80.0" },
  "activationEvents": ["onLanguage:javascript"]
}

// Theia extension
{
  "engines": { "theia": "^1.45.0" },
  "theiaExtensions": [...]
}

// Hybrid (HeadyIDE)
{
  "engines": { 
    "vscode": "^1.80.0",
    "theia": "^1.45.0",
    "headyide": "^1.0.0"
  }
}
```

## Deployment Models

### 1. Desktop (Electron)
- Primary: VS Code OSS workbench
- Fallback: Theia workbench
- Full system integration

### 2. Browser (Web)
- Primary: Theia workbench
- Cloud-based development
- Remote workspace support

### 3. Hybrid (Best of Both)
- Desktop app with cloud sync
- Local extensions + cloud extensions
- Seamless switching between modes

## Performance Optimization

### Golden Ratio Optimization
Using φ (1.618) for:
- Memory allocation ratios
- CPU time distribution
- UI layout proportions
- Animation timing curves

### Lazy Loading
- Extensions loaded on-demand
- Language servers started when needed
- UI components rendered progressively

## Security Model

### Heady Governance Integration
- All file operations audited
- Destructive actions require confirmation
- API key authentication for Heady services
- JWT tokens for MCP gateway

### Extension Sandboxing
- Extensions run in separate processes
- Limited file system access
- Network requests monitored
- Resource usage capped

## Future Enhancements

1. **Multi-User Collaboration**: Real-time pair programming
2. **AI Pair Programmer**: Integrated Heady AI assistant
3. **Cloud Workspace Sync**: Seamless desktop ↔ browser sync
4. **Extension Marketplace**: HeadyIDE-specific extensions
5. **Sacred Geometry Visualizations**: Code complexity visualization
