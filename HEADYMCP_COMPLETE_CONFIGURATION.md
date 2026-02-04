# HeadyMCP - Complete Server Configuration

**Sacred Geometry MCP Server**  
**Version:** 14.3  
**Date:** 2026-02-04

---

## 🌟 What is HeadyMCP?

**HeadyMCP** is your custom Model Context Protocol server that provides:
- Pattern registry access (13 categories)
- Concept analysis and extraction
- Pattern discovery (6 external sources)
- Checkpoint validation
- Drupal CMS integration
- Content management
- Sacred Geometry orchestration

---

## 📍 HeadyMCP Server Configuration

### Main Server (heady-manager.js)

**Location:** `C:\Users\erich\Heady\heady-manager.js`  
**Port:** 3300  
**Protocol:** MCP (Model Context Protocol)  

**Capabilities:**
- `pattern-registry` - Access all 13 pattern categories
- `concept-analysis` - Extract and analyze concepts
- `pattern-discovery` - Scan external sources
- `checkpoint-validation` - Validate system state
- `drupal-sync` - Sync with Drupal CMS
- `content-management` - CRUD operations

**Start Command:**
```bash
cd C:\Users\erich\Heady
node heady-manager.js
```

**Health Check:**
```bash
curl http://localhost:3300/status
# Returns: {"ok":true,"service":"heady-manager","ts":"timestamp"}
```

### Sub-Servers

**HeadyConductor (port 3400):**
- Location: `C:\Users\erich\CascadeProjects\HeadyMonorepo\apps\heady-conductor\index.js`
- Purpose: Central orchestration engine
- Capabilities: Routing, coordination

**HeadyPatterns (port 8000):**
- Location: `C:\Users\erich\CascadeProjects\HeadyMonorepo\apps\manager\src\index.ts`
- Purpose: Pattern validation and discovery
- Capabilities: Pattern analysis, superiority checking

---

## 🔌 Where HeadyMCP is Configured

### 1. Windsurf

**Config File:** `C:\Users\erich\.windsurf\mcp_config.json`

```json
{
  "mcpServers": {
    "heady-mcp": {
      "command": "node",
      "args": ["C:\\Users\\erich\\Heady\\heady-manager.js"],
      "env": {
        "PORT": "3300",
        "HEADY_MODE": "mcp"
      },
      "description": "🌟 HeadyMCP - Sacred Geometry Orchestration & Pattern Management"
    }
  }
}
```

**How to See It:**
1. Open Windsurf
2. Settings → MCP Servers
3. Look for 🌟 **heady-mcp**
4. Status shows "Connected" when running

### 2. VS Code (Cline Extension)

**Config File:** `C:\Users\erich\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "heady-mcp": {
      "command": "node",
      "args": ["C:\\Users\\erich\\Heady\\heady-manager.js"],
      "env": {
        "PORT": "3300",
        "HEADY_MODE": "mcp"
      }
    }
  }
}
```

**How to See It:**
1. Open VS Code
2. Cline extension → Settings
3. MCP Servers section
4. heady-mcp should be listed

### 3. Claude Desktop

**Config File:** `C:\Users\erich\AppData\Roaming\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "heady-mcp": {
      "command": "node",
      "args": ["C:\\Users\\erich\\Heady\\heady-manager.js"],
      "env": {
        "PORT": "3300",
        "HEADY_MODE": "mcp"
      }
    },
    "heady-conductor": {
      "command": "node",
      "args": ["C:\\Users\\erich\\CascadeProjects\\HeadyMonorepo\\apps\\heady-conductor\\index.js"],
      "env": {
        "PORT": "3400"
      }
    }
  }
}
```

### 4. Docker Desktop MCP Toolkit

**Why You Don't See It:**
Docker Desktop's MCP toolkit only shows MCP servers that are:
1. Running in Docker containers
2. Registered in Docker's MCP registry
3. Published to Docker Hub as MCP-compatible images

**HeadyMCP runs as a Node.js process**, not a Docker container, so it won't appear in Docker Desktop's MCP toolkit.

**To Make It Appear in Docker Desktop:**

**Option 1: Create Docker Image**
```dockerfile
# Dockerfile.headymcp
FROM node:20-alpine
WORKDIR /app
COPY heady-manager.js package.json ./
RUN npm install
EXPOSE 3300
CMD ["node", "heady-manager.js"]
```

**Option 2: Add to docker-compose.yml**
```yaml
services:
  heady-mcp:
    build:
      context: ./
      dockerfile: Dockerfile.headymcp
    container_name: heady-mcp-server
    ports:
      - "3300:3300"
    environment:
      - HEADY_MODE=mcp
    labels:
      - "com.docker.mcp.server=true"
      - "com.docker.mcp.name=heady-mcp"
      - "com.docker.mcp.description=Sacred Geometry Orchestration"
```

---

## 🤖 Cline and Codex MCP Integration

### Should You Integrate Them?

**Cline MCP Server:**
- **What:** AI coding assistant with MCP support
- **Benefits:** Code generation, refactoring, debugging
- **Integration:** ✅ Already configured (you have cline_mcp_settings.json)
- **Recommendation:** **YES** - Beneficial for development

**Codex MCP Server:**
- **What:** OpenAI Codex for code generation
- **Benefits:** Advanced code completion, generation
- **Integration:** Would require OpenAI API key
- **Recommendation:** **YES** - If you have API key in 1Password

**How to Add:**
```json
// Add to .windsurf/mcp_config.json
{
  "mcpServers": {
    "codex": {
      "command": "npx",
      "args": ["-y", "@openai/mcp-server-codex"],
      "env": {
        "OPENAI_API_KEY": "${HC_OPENAI_API_KEY}"
      },
      "description": "🤖 OpenAI Codex - Advanced Code Generation"
    }
  }
}
```

---

## 🎨 Diffusion Models Integration

### Why Integrate Diffusion Models?

**Benefits:**
- Generate Sacred Geometry patterns
- Create visual assets for branding
- Auto-generate UI mockups
- Produce marketing materials
- Enhance documentation with AI-generated diagrams

### Recommended Diffusion Models

**1. Stable Diffusion (Local)**
- **What:** Open-source image generation
- **Use:** Generate Sacred Geometry patterns, UI mockups
- **Integration:** Run locally or via API

**2. DALL-E 3 (OpenAI)**
- **What:** Advanced image generation
- **Use:** High-quality marketing materials
- **Integration:** Via OpenAI API

**3. Midjourney (API)**
- **What:** Artistic image generation
- **Use:** Branding assets, visual content
- **Integration:** Via Discord bot or API

### Integration Plan

**Add to HeadyMonorepo:**

**1. Create Diffusion Service**
```typescript
// apps/heady-diffusion/src/index.ts
import { StableDiffusionPipeline } from '@huggingface/transformers';

export class HeadyDiffusionService {
  async generateSacredGeometry(prompt: string): Promise<Buffer> {
    const enhancedPrompt = `${prompt}, sacred geometry, fibonacci spiral, golden ratio, organic shapes, rounded corners, breathing animation`;
    
    // Generate image
    const image = await this.pipeline(enhancedPrompt);
    return image;
  }
  
  async generateBrandAsset(type: 'logo' | 'banner' | 'icon'): Promise<Buffer> {
    const prompts = {
      logo: 'HEADY logo, sacred geometry, violet and cyan colors, minimalist',
      banner: 'Sacred geometry banner, organic systems, breathing interfaces',
      icon: 'HEADY icon, geometric pattern, app icon style'
    };
    
    return this.generateSacredGeometry(prompts[type]);
  }
}
```

**2. Add MCP Server for Diffusion**
```json
// Add to mcp_config.json
{
  "heady-diffusion": {
    "command": "node",
    "args": ["./apps/heady-diffusion/server.js"],
    "env": {
      "PORT": "3500",
      "HUGGINGFACE_TOKEN": "${HC_HUGGINGFACE_TOKEN}"
    },
    "description": "🎨 Heady Diffusion - Sacred Geometry Image Generation"
  }
}
```

**3. API Endpoints**
```typescript
// POST /api/diffusion/generate
app.post('/api/diffusion/generate', async (req, res) => {
  const { prompt, type } = req.body;
  const image = await diffusionService.generateSacredGeometry(prompt);
  res.contentType('image/png').send(image);
});

// POST /api/diffusion/brand-asset
app.post('/api/diffusion/brand-asset', async (req, res) => {
  const { type } = req.body; // 'logo', 'banner', 'icon'
  const image = await diffusionService.generateBrandAsset(type);
  res.contentType('image/png').send(image);
});
```

---

## 🔗 Branded Links Location

**Where Are They?**

**Desktop Shortcuts (C:\Users\erich\Desktop\):**
- 🌟 Heady Control Panel.url
- 🎨 Heady GitHub.url
- 📚 Heady Documentation.url
- ⚡ Run HeadyControl.bat
- 🔄 Run HeadySync.bat
- 🔨 Run HeadyBuild.bat
- 🚀 Deploy Heady.bat
- HeadyConnection.url
- HeadySystems.url
- Heady API.url
- Drupal CMS.url

**These ARE the branded links!** They have:
- Sacred Geometry emojis (🌟🎨📚⚡🔄🔨🚀)
- ASCII art banners (in .bat files)
- Descriptive names

**To Create More Branded Links:**
```bash
# Create .url file with emoji
echo [InternetShortcut] > "C:\Users\erich\Desktop\🎯 Your Link.url"
echo URL=https://your-url.com >> "C:\Users\erich\Desktop\🎯 Your Link.url"
```

---

## 📋 Complete HeadyMCP Server Config

### Full Configuration (All 3 Servers)

**File:** `C:\Users\erich\CascadeProjects\HeadyMonorepo\mcp-server.json`

```json
{
  "mcpServers": {
    "heady-mcp": {
      "command": "node",
      "args": ["C:\\Users\\erich\\Heady\\heady-manager.js"],
      "env": {
        "PORT": "3300",
        "HEADY_MODE": "mcp",
        "DATABASE_URL": "${DATABASE_URL}",
        "REDIS_URL": "${REDIS_URL}"
      },
      "description": "🌟 HeadyMCP - Sacred Geometry Orchestration & Pattern Management",
      "icon": "✨",
      "capabilities": [
        "pattern-registry",
        "concept-analysis",
        "pattern-discovery",
        "checkpoint-validation",
        "drupal-sync",
        "content-management"
      ],
      "governance": {
        "requireConfirmation": ["write_file", "delete_file", "run_command"],
        "auditAll": true
      }
    },
    "heady-conductor": {
      "command": "node",
      "args": ["C:\\Users\\erich\\CascadeProjects\\HeadyMonorepo\\apps\\heady-conductor\\index.js"],
      "env": {
        "PORT": "3400"
      },
      "description": "🎯 HeadyConductor - Central Orchestration Engine",
      "icon": "🎛️",
      "capabilities": [
        "orchestration",
        "routing",
        "task-coordination"
      ]
    },
    "heady-patterns": {
      "command": "node",
      "args": ["C:\\Users\\erich\\CascadeProjects\\HeadyMonorepo\\apps\\manager\\src\\index.ts"],
      "env": {
        "HC_API_PORT": "8000",
        "DATABASE_URL": "${DATABASE_URL}",
        "REDIS_URL": "${REDIS_URL}"
      },
      "description": "🔍 Heady Patterns - Pattern Validation & Discovery",
      "icon": "📊",
      "capabilities": [
        "pattern-validation",
        "superiority-checking",
        "integration-opportunities",
        "quality-metrics"
      ]
    }
  }
}
```

### Environment Variables Needed

```bash
# In .env file
DATABASE_URL=postgresql://heady:heady123@localhost:5433/headysystems_dev
REDIS_URL=redis://localhost:6380
HC_OPENAI_API_KEY=your_key_from_1password
HC_HUGGINGFACE_TOKEN=your_token_from_1password
```

---

## 🐳 Adding HeadyMCP to Docker Desktop

### Why It's Not Showing

Docker Desktop MCP toolkit only shows:
- Containerized MCP servers
- Servers with Docker labels
- Published MCP images

**HeadyMCP runs as Node.js process** → Not visible in Docker Desktop

### Solution: Dockerize HeadyMCP

**1. Create Dockerfile**
```dockerfile
# C:\Users\erich\Heady\Dockerfile.mcp
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source
COPY heady-manager.js ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Expose MCP port
EXPOSE 3300

# Add MCP labels for Docker Desktop
LABEL com.docker.mcp.server="true"
LABEL com.docker.mcp.name="heady-mcp"
LABEL com.docker.mcp.description="Sacred Geometry Orchestration"
LABEL com.docker.mcp.version="14.3"
LABEL com.docker.mcp.icon="✨"

# Start server
CMD ["node", "heady-manager.js"]
```

**2. Add to docker-compose.yml**
```yaml
services:
  heady-mcp:
    build:
      context: C:\Users\erich\Heady
      dockerfile: Dockerfile.mcp
    container_name: heady-mcp-server
    ports:
      - "3300:3300"
    environment:
      - HEADY_MODE=mcp
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    networks:
      - heady-network
    labels:
      - "com.docker.mcp.server=true"
      - "com.docker.mcp.name=heady-mcp"
      - "com.docker.mcp.description=🌟 Sacred Geometry Orchestration"
    restart: unless-stopped
```

**3. Build and Start**
```bash
cd C:\Users\erich\Heady
docker build -f Dockerfile.mcp -t headymcp:latest .
docker-compose up -d heady-mcp
```

**4. Verify in Docker Desktop**
- Open Docker Desktop
- Go to Containers
- Look for "heady-mcp-server"
- MCP toolkit should now show it

---

## 🤖 Cline Integration (Already Done!)

**Status:** ✅ Cline is already configured!

**Config Location:** `C:\Users\erich\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`

**What Cline Provides:**
- AI-powered code generation
- Intelligent refactoring
- Bug detection and fixing
- Code explanation
- Test generation

**Recommendation:** **YES** - Keep Cline integrated, it's beneficial for development

---

## 📦 Codex MCP Server Integration

### Should You Add It?

**YES** - Codex is beneficial if you have OpenAI API key

**Benefits:**
- Advanced code completion
- Multi-language support
- Context-aware suggestions
- Code translation
- Documentation generation

**How to Add:**

**1. Install Codex MCP Server**
```bash
npm install -g @openai/mcp-server-codex
```

**2. Add to Windsurf Config**
```json
{
  "mcpServers": {
    "codex": {
      "command": "npx",
      "args": ["-y", "@openai/mcp-server-codex"],
      "env": {
        "OPENAI_API_KEY": "${HC_OPENAI_API_KEY}"
      },
      "description": "🤖 OpenAI Codex - Advanced Code Generation"
    }
  }
}
```

**3. Get API Key from 1Password**
- Retrieve HC_OPENAI_API_KEY
- Add to .env file

---

## 🎨 Diffusion Models Integration Plan

### Recommended Models

**1. Stable Diffusion XL**
- **Provider:** Hugging Face
- **Use:** Generate Sacred Geometry patterns
- **Cost:** Free (local) or $0.0015/image (API)

**2. DALL-E 3**
- **Provider:** OpenAI
- **Use:** High-quality brand assets
- **Cost:** $0.04/image (1024x1024)

**3. Midjourney**
- **Provider:** Midjourney
- **Use:** Artistic visuals
- **Cost:** $10/month subscription

### Implementation

**Create apps/heady-diffusion:**
```
apps/heady-diffusion/
├── src/
│   ├── index.ts
│   ├── services/
│   │   ├── stable-diffusion.service.ts
│   │   ├── dalle.service.ts
│   │   └── midjourney.service.ts
│   └── routes/
│       └── diffusion.ts
├── package.json
├── Dockerfile
└── README.md
```

**API Endpoints:**
```typescript
POST /api/diffusion/generate
POST /api/diffusion/sacred-geometry
POST /api/diffusion/brand-asset
POST /api/diffusion/ui-mockup
GET  /api/diffusion/gallery
```

**MCP Server:**
```json
{
  "heady-diffusion": {
    "command": "node",
    "args": ["./apps/heady-diffusion/server.js"],
    "env": {
      "PORT": "3500",
      "HUGGINGFACE_TOKEN": "${HC_HUGGINGFACE_TOKEN}",
      "OPENAI_API_KEY": "${HC_OPENAI_API_KEY}"
    },
    "description": "🎨 Heady Diffusion - Sacred Geometry Image Generation"
  }
}
```

---

## ✅ Summary

**HeadyMCP Configuration:**
- ✅ Configured in Windsurf (with 🌟 branding)
- ✅ Configured in VS Code (Cline)
- ✅ Configured in Claude Desktop
- ❌ Not in Docker Desktop (runs as Node.js process, not container)

**Cline Integration:**
- ✅ Already integrated and beneficial
- ✅ Keep it

**Codex Integration:**
- ⏳ Recommended to add
- ⏳ Requires OpenAI API key from 1Password

**Diffusion Models:**
- ⏳ Highly recommended for Sacred Geometry
- ⏳ Would enhance visual branding
- ⏳ Requires API keys (Hugging Face, OpenAI)

**Branded Links:**
- ✅ Already on desktop (10 shortcuts)
- ✅ 7 have Sacred Geometry emojis and ASCII art

**To See HeadyMCP in Docker Desktop:**
- Create Dockerfile.mcp
- Add to docker-compose.yml
- Build and run as container

---

**HeadyMCP is configured and ready to use! 🌟✨**
