<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-ide/extensions/heady-mcp/README.md -->
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

# Heady MCP Extension

AI-powered coding assistant for HeadyIDE, VS Code, and Eclipse Theia.

## Features

- **AI Code Completion**: Get intelligent code suggestions powered by Heady Manager
- **Real-time Connection**: WebSocket connection to Heady Manager for instant responses
- **Multi-Language Support**: Works with JavaScript, TypeScript, Python, Java, C#, and more
- **Configurable**: Customize API endpoint, delays, and behavior
- **Status Indicator**: Visual feedback on connection status

## Installation

### In HeadyIDE
HeadyMCP comes pre-installed with HeadyIDE.

### In VS Code
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click "..." menu → "Install from VSIX..."
5. Select the downloaded file

### In Eclipse Theia
1. Download the extension
2. Place in Theia plugins directory
3. Restart Theia

## Configuration

Open Settings and search for "Heady MCP":

- **Manager URL**: URL of your Heady Manager instance (default: `http://localhost:3300`)
- **API Key**: Your Heady API key for authentication
- **Enable Auto Completion**: Automatically show AI suggestions (default: `true`)
- **Completion Delay**: Delay before requesting completions in milliseconds (default: `500`)

## Usage

### Connect to Heady Manager

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Heady MCP: Connect to Manager"
3. Enter your API key when prompted

### Request AI Completion

- **Keyboard**: Press `Ctrl+Space` (or `Cmd+Space` on Mac)
- **Command**: Run "Heady MCP: Request AI Completion"
- **Auto**: Type code and completions appear automatically

### Status Bar

Click the status bar item to open settings:
- `$(cloud) Heady MCP` - Connected
- `$(cloud-offline) Heady MCP` - Disconnected
- `$(sync~spin) Connecting...` - Connecting

## Commands

- `Heady MCP: Connect to Manager` - Connect to Heady Manager
- `Heady MCP: Disconnect` - Disconnect from Heady Manager
- `Heady MCP: Request AI Completion` - Manually request completion
- `Heady MCP: Open Settings` - Open extension settings

## Requirements

- Heady Manager running on accessible URL
- Valid Heady API key
- Network connection to Heady Manager

## Troubleshooting

### Cannot connect to Heady Manager

1. Verify Heady Manager is running: `http://localhost:3300/api/health`
2. Check API key is correct
3. Ensure firewall allows connection
4. Check Manager URL in settings

### No completions appearing

1. Verify connection status in status bar
2. Check "Enable Auto Completion" is enabled
3. Try manual completion with `Ctrl+Space`
4. Check Heady Manager logs for errors

## Development

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Watch for changes
npm run watch

# Package extension
npm run package
```

## License

MIT

## Support

For issues and support, visit: https://github.com/HeadySystems/HeadyIDE
