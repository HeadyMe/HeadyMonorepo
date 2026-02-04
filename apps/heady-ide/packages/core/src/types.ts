// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-ide/packages/core/src/types.ts
// LAYER: root
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

/**
 * Core type definitions for HeadyIDE
 */

export interface HeadyConfig {
  managerUrl: string;
  apiKey: string;
  mcpGatewayUrl: string;
  trustDomain: string;
  appDomain: string;
  features: {
    enableMCP: boolean;
    enableAICompletion: boolean;
    enableRealtimeCollab: boolean;
    enableSacredGeometry: boolean;
  };
}

export interface ExtensionManifest {
  name: string;
  version: string;
  engines: {
    vscode?: string;
    theia?: string;
    headyide?: string;
  };
  main?: string;
  activationEvents?: string[];
  contributes?: Record<string, any>;
}

export interface HeadyExtension {
  id: string;
  manifest: ExtensionManifest;
  type: 'vscode' | 'theia' | 'hybrid';
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}

export interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  governance?: {
    requireConfirmation?: string[];
    allowedPaths?: string[];
    deniedPaths?: string[];
  };
}

export interface HeadyManagerConnection {
  url: string;
  apiKey: string;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(message: any): Promise<any>;
}

export interface SacredGeometryTheme {
  phi: number; // Golden ratio
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  spacing: {
    base: number;
    scale: (level: number) => number;
  };
  animations: {
    breathingDuration: number;
    transitionTiming: string;
  };
}

export interface AICompletionRequest {
  code: string;
  language: string;
  cursor: { line: number; column: number };
  context?: string;
}

export interface AICompletionResponse {
  completions: Array<{
    text: string;
    confidence: number;
    range: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
  }>;
}
