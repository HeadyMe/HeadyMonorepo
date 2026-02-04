<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-ide/START_HERE.md -->
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

# 🚀 HeadyIDE - Start Here

## What is HeadyIDE?

**HeadyIDE** is a hybrid IDE that combines:
- ✅ **Eclipse Theia** (cloud & browser IDE platform)
- ✅ **VS Code OSS** (open-source Visual Studio Code)
- ✅ **Heady Systems** (MCP protocol, AI services, Sacred Geometry UI)

### Key Features
- **Dual Extension Support**: Run both Theia and VS Code extensions
- **AI-Powered Coding**: HeadyMCP extension with AI completions
- **Sacred Geometry Theme**: Golden ratio (φ) based design
- **Real-time Collaboration**: WebSocket connection to Heady Manager
- **Flexible Deployment**: Browser or Desktop (Electron)

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```powershell
# Run installation script
.\scripts\install-dependencies.ps1
```

### Step 2: Build Packages

```powershell
# Build all packages
.\scripts\build-all.ps1
```

### Step 3: Start Heady Manager

```powershell
# In a separate terminal
cd c:\Users\erich\Heady
npm start
```

### Step 4: Start HeadyIDE

```powershell
# Browser mode (Theia)
npm run dev:browser

# OR Desktop mode (Electron)
npm run dev:electron
```

---

## 📁 Project Structure

```
HeadyIDE/
├── packages/
│   ├── core/                 ← Core functionality (Unified Extension Host)
│   ├── theia-integration/    ← Theia components
│   ├── vscode-integration/   ← VS Code components
│   └── heady-services/       ← Heady Systems integration
│
├── apps/
│   ├── browser/              ← Web-based IDE (Theia)
│   └── electron/             ← Desktop app (VS Code OSS)
│
├── extensions/
│   └── heady-mcp/            ← AI-powered coding extension
│
├── scripts/
│   ├── install-dependencies.ps1
│   └── build-all.ps1
│
└── docs/
    ├── ARCHITECTURE.md       ← Technical architecture
    └── SETUP_GUIDE.md        ← Detailed setup guide
```

---

## 🔧 Configuration

Create `.env` file:

```env
HEADY_MANAGER_URL=http://localhost:3300
HEADY_API_KEY=your_api_key_here
MCP_GATEWAY_URL=http://localhost:3301
IDE_PORT=3400
ENABLE_HEADY_MCP=true
ENABLE_AI_COMPLETION=true
ENABLE_SACRED_GEOMETRY_THEME=true
```

---

## 🎨 Features

### 1. Unified Extension Host
- Loads both Theia and VS Code extensions
- Automatic compatibility detection
- Seamless API translation

### 2. HeadyMCP Extension
- AI code completion
- Real-time suggestions
- Multi-language support
- WebSocket connection to Heady Manager

### 3. Sacred Geometry Theme
- Golden ratio (φ = 1.618) based design
- Organic, breathing animations
- Rounded, modern aesthetic
- Optimized layouts

### 4. Heady Systems Integration
- MCP Protocol support
- Connection to Heady Manager
- AI-powered tools
- Real-time collaboration

---

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical design and architecture
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed installation and setup
- **[extensions/heady-mcp/README.md](extensions/heady-mcp/README.md)** - HeadyMCP extension docs

---

## 🛠️ Development Commands

```powershell
# Install dependencies
npm install
.\scripts\install-dependencies.ps1

# Build all packages
npm run build
.\scripts\build-all.ps1

# Development mode
npm run dev              # Browser + Heady Manager
npm run dev:browser      # Browser only
npm run dev:electron     # Desktop only

# Watch mode
npm run watch            # Watch all packages

# Testing
npm test                 # Run all tests

# Clean
npm run clean            # Remove build artifacts
```

---

## 🔌 Extension Development

### Install HeadyMCP in VS Code

```powershell
cd extensions\heady-mcp
npm run build
npm run package
code --install-extension heady-mcp-1.0.0.vsix
```

### Create Custom Extension

1. Create directory in `extensions/`
2. Add `package.json` with engines:
   ```json
   {
     "engines": {
       "vscode": "^1.80.0",
       "theia": "^1.45.0",
       "headyide": "^1.0.0"
     }
   }
   ```
3. Build and test

---

## 🐛 Troubleshooting

### TypeScript Errors

```powershell
# Reinstall dependencies
.\scripts\install-dependencies.ps1
```

### Cannot Connect to Heady Manager

1. Verify Heady Manager is running: `http://localhost:3300/api/health`
2. Check API key in `.env`
3. Check firewall settings

### Build Failures

```powershell
# Clean and rebuild
npm run clean
npm install
.\scripts\build-all.ps1
```

---

## 🎯 Next Steps

1. ✅ **Read [ARCHITECTURE.md](ARCHITECTURE.md)** - Understand the hybrid design
2. ✅ **Explore HeadyMCP** - Try AI code completion
3. ✅ **Customize Theme** - Modify Sacred Geometry settings
4. ✅ **Build Extensions** - Create your own extensions

---

## 📖 Legal & Licensing

### Open-Source Components Used

- **Eclipse Theia**: EPL-2.0 / Apache-2.0 ✅
- **VS Code OSS**: MIT ✅
- **Monaco Editor**: MIT ✅
- **HeadyIDE Custom Code**: MIT ✅

All components are **legally licensed** for use, modification, and distribution.

---

## 💡 Support

- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Heady Systems**: https://headysystems.com

---

## 🚀 Ready to Start?

```powershell
# 1. Install
.\scripts\install-dependencies.ps1

# 2. Build
.\scripts\build-all.ps1

# 3. Start Heady Manager (separate terminal)
cd c:\Users\erich\Heady
npm start

# 4. Start HeadyIDE
npm run dev
```

**Welcome to HeadyIDE!** 🎉
