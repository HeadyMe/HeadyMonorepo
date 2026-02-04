/**
 * Unified Extension Host
 * 
 * Manages both Theia and VS Code extensions in a single runtime
 */

import { injectable } from 'inversify';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ExtensionManifest, HeadyExtension } from './types';

@injectable()
export class UnifiedExtensionHost {
  private extensions = new Map<string, HeadyExtension>();
  private theiaExtensions = new Map<string, any>();
  private vscodeExtensions = new Map<string, any>();

  /**
   * Load an extension from a directory
   */
  async loadExtension(extensionPath: string): Promise<HeadyExtension> {
    const manifest = await this.readManifest(extensionPath);
    const type = this.detectExtensionType(manifest);

    const extension: HeadyExtension = {
      id: manifest.name,
      manifest,
      type,
      activate: async () => {
        console.log(`[HeadyIDE] Activating extension: ${manifest.name}`);
        
        if (type === 'vscode' || type === 'hybrid') {
          await this.activateVSCodeExtension(extensionPath, manifest);
        }
        
        if (type === 'theia' || type === 'hybrid') {
          await this.activateTheiaExtension(extensionPath, manifest);
        }
      },
      deactivate: async () => {
        console.log(`[HeadyIDE] Deactivating extension: ${manifest.name}`);
        // Cleanup logic
      }
    };

    this.extensions.set(extension.id, extension);
    return extension;
  }

  /**
   * Read extension manifest (package.json)
   */
  private async readManifest(extensionPath: string): Promise<ExtensionManifest> {
    const manifestPath = path.join(extensionPath, 'package.json');
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Detect extension type based on manifest
   */
  private detectExtensionType(manifest: ExtensionManifest): 'vscode' | 'theia' | 'hybrid' {
    const hasVSCode = !!manifest.engines.vscode;
    const hasTheia = !!manifest.engines.theia;
    const hasHeady = !!manifest.engines.headyide;

    if (hasHeady || (hasVSCode && hasTheia)) {
      return 'hybrid';
    }

    if (hasTheia) {
      return 'theia';
    }

    return 'vscode';
  }

  /**
   * Activate a VS Code extension
   */
  private async activateVSCodeExtension(extensionPath: string, manifest: ExtensionManifest): Promise<void> {
    if (!manifest.main) {
      console.warn(`[HeadyIDE] VS Code extension ${manifest.name} has no main entry point`);
      return;
    }

    const mainPath = path.join(extensionPath, manifest.main);
    
    try {
      const extensionModule = require(mainPath);
      
      if (typeof extensionModule.activate === 'function') {
        const context = this.createVSCodeExtensionContext(manifest);
        await extensionModule.activate(context);
        this.vscodeExtensions.set(manifest.name, extensionModule);
      }
    } catch (error) {
      console.error(`[HeadyIDE] Failed to activate VS Code extension ${manifest.name}:`, error);
    }
  }

  /**
   * Activate a Theia extension
   */
  private async activateTheiaExtension(extensionPath: string, manifest: ExtensionManifest): Promise<void> {
    // Theia extensions are typically loaded via dependency injection
    // This is a simplified version
    console.log(`[HeadyIDE] Loading Theia extension: ${manifest.name}`);
    
    try {
      const extensionModule = require(extensionPath);
      this.theiaExtensions.set(manifest.name, extensionModule);
    } catch (error) {
      console.error(`[HeadyIDE] Failed to activate Theia extension ${manifest.name}:`, error);
    }
  }

  /**
   * Create VS Code extension context
   */
  private createVSCodeExtensionContext(manifest: ExtensionManifest): any {
    return {
      subscriptions: [],
      extensionPath: '',
      globalState: new Map(),
      workspaceState: new Map(),
      asAbsolutePath: (relativePath: string) => path.resolve(relativePath),
      storagePath: undefined,
      globalStoragePath: undefined,
      logPath: undefined,
      extensionUri: undefined,
      environmentVariableCollection: undefined,
      extensionMode: 1, // Production
      extension: {
        id: manifest.name,
        extensionUri: undefined,
        extensionPath: '',
        isActive: true,
        packageJSON: manifest,
        exports: undefined,
        activate: async () => {}
      }
    };
  }

  /**
   * Get all loaded extensions
   */
  getExtensions(): HeadyExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Get extension by ID
   */
  getExtension(id: string): HeadyExtension | undefined {
    return this.extensions.get(id);
  }

  /**
   * Unload an extension
   */
  async unloadExtension(id: string): Promise<void> {
    const extension = this.extensions.get(id);
    if (extension) {
      await extension.deactivate();
      this.extensions.delete(id);
      this.vscodeExtensions.delete(id);
      this.theiaExtensions.delete(id);
    }
  }
}
