// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-ide/extensions/heady-mcp/src/extension.ts
// LAYER: root
// 
//         _   _  _____    _  __   __
//        | | | || ____|  / \ \  / /
//        | |_| ||  _|   / _ \ \ V / 
//        |  _  || |___ / ___ \ | |  
//        |_| |_||_____/_/   \_\|_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

/**
 * HeadyMCP Extension
 * 
 * Provides AI-powered coding assistance through Heady Manager
 */

import * as vscode from 'vscode';
import { HeadyConnection } from '@heady/ide-core';

let headyConnection: HeadyConnection | null = null;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  console.log('HeadyMCP extension is now active');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'headyMcp.openSettings';
  statusBarItem.text = '$(cloud-offline) Heady MCP';
  statusBarItem.tooltip = 'Click to configure Heady MCP';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('headyMcp.connect', async () => {
      await connectToHeadyManager();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('headyMcp.disconnect', async () => {
      await disconnectFromHeadyManager();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('headyMcp.requestCompletion', async () => {
      await requestCompletion();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('headyMcp.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'headyMcp');
    })
  );

  // Register completion provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    ['javascript', 'typescript', 'python', 'java', 'csharp'],
    {
      async provideCompletionItems(document, position, token, context) {
        return await provideAICompletions(document, position);
      }
    },
    '.' // Trigger on dot
  );
  context.subscriptions.push(completionProvider);

  // Auto-connect on startup
  const config = vscode.workspace.getConfiguration('headyMcp');
  if (config.get('apiKey')) {
    await connectToHeadyManager();
  }
}

export function deactivate() {
  if (headyConnection) {
    headyConnection.disconnect();
  }
}

/**
 * Connect to Heady Manager
 */
async function connectToHeadyManager(): Promise<void> {
  const config = vscode.workspace.getConfiguration('headyMcp');
  const managerUrl = config.get<string>('managerUrl') || 'http://localhost:3300';
  const apiKey = config.get<string>('apiKey');

  if (!apiKey) {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter your Heady API Key',
      password: true,
      ignoreFocusOut: true
    });

    if (!input) {
      vscode.window.showWarningMessage('API key is required to connect to Heady Manager');
      return;
    }

    await config.update('apiKey', input, vscode.ConfigurationTarget.Global);
  }

  try {
    statusBarItem.text = '$(sync~spin) Connecting...';
    
    headyConnection = new HeadyConnection(managerUrl, apiKey || '');
    await headyConnection.connect();

    statusBarItem.text = '$(cloud) Heady MCP';
    statusBarItem.tooltip = 'Connected to Heady Manager';
    
    vscode.window.showInformationMessage('Connected to Heady Manager');
  } catch (error) {
    statusBarItem.text = '$(cloud-offline) Heady MCP';
    statusBarItem.tooltip = 'Failed to connect to Heady Manager';
    
    vscode.window.showErrorMessage(`Failed to connect to Heady Manager: ${error}`);
  }
}

/**
 * Disconnect from Heady Manager
 */
async function disconnectFromHeadyManager(): Promise<void> {
  if (headyConnection) {
    await headyConnection.disconnect();
    headyConnection = null;

    statusBarItem.text = '$(cloud-offline) Heady MCP';
    statusBarItem.tooltip = 'Disconnected from Heady Manager';
    
    vscode.window.showInformationMessage('Disconnected from Heady Manager');
  }
}

/**
 * Request AI completion for current cursor position
 */
async function requestCompletion(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  if (!headyConnection || !headyConnection.connected) {
    vscode.window.showWarningMessage('Not connected to Heady Manager');
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const code = document.getText();

  try {
    const response = await headyConnection.requestCompletion({
      code,
      language: document.languageId,
      cursor: { line: position.line, column: position.character }
    });

    if (response.completions.length > 0) {
      const completion = response.completions[0];
      
      // Insert completion
      await editor.edit(editBuilder => {
        editBuilder.insert(position, completion.text);
      });

      vscode.window.showInformationMessage(`AI Completion inserted (${Math.round(completion.confidence * 100)}% confidence)`);
    } else {
      vscode.window.showInformationMessage('No completions available');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to get completion: ${error}`);
  }
}

/**
 * Provide AI completions
 */
async function provideAICompletions(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.CompletionItem[]> {
  if (!headyConnection || !headyConnection.connected) {
    return [];
  }

  const config = vscode.workspace.getConfiguration('headyMcp');
  if (!config.get('enableAutoCompletion')) {
    return [];
  }

  const code = document.getText();
  
  try {
    const response = await headyConnection.requestCompletion({
      code,
      language: document.languageId,
      cursor: { line: position.line, column: position.character }
    });

    return response.completions.map((completion, index) => {
      const item = new vscode.CompletionItem(
        `AI: ${completion.text.substring(0, 50)}...`,
        vscode.CompletionItemKind.Snippet
      );
      
      item.insertText = completion.text;
      item.detail = `Heady AI (${Math.round(completion.confidence * 100)}% confidence)`;
      item.documentation = new vscode.MarkdownString(
        `AI-generated completion from Heady Manager\n\nConfidence: ${Math.round(completion.confidence * 100)}%`
      );
      item.sortText = `0${index}`; // Sort AI completions first
      
      return item;
    });
  } catch (error) {
    console.error('Failed to get AI completions:', error);
    return [];
  }
}
