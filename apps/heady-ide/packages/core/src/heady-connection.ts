// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-ide/packages/core/src/heady-connection.ts
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
 * Heady Manager Connection
 * 
 * Manages WebSocket connection to Heady Manager for real-time features
 */

import WebSocket from 'ws';
import { injectable } from 'inversify';
import { HeadyManagerConnection, AICompletionRequest, AICompletionResponse } from './types';

@injectable()
export class HeadyConnection implements HeadyManagerConnection {
  public url: string;
  public apiKey: string;
  public connected: boolean = false;

  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(url: string, apiKey: string) {
    this.url = url;
    this.apiKey = apiKey;
  }

  /**
   * Connect to Heady Manager
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.url.replace('http://', 'ws://').replace('https://', 'wss://');
      
      this.ws = new WebSocket(`${wsUrl}/ws`, {
        headers: {
          'x-heady-api-key': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      this.ws.on('open', () => {
        console.log('[HeadyIDE] Connected to Heady Manager');
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('[HeadyIDE] WebSocket error:', error);
        this.connected = false;
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('[HeadyIDE] Disconnected from Heady Manager');
        this.connected = false;
        this.attemptReconnect();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });
    });
  }

  /**
   * Disconnect from Heady Manager
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  /**
   * Send a message to Heady Manager
   */
  async sendMessage(message: any): Promise<any> {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to Heady Manager');
    }

    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      const payload = {
        id: messageId,
        ...message
      };

      // Set up response handler
      const responseHandler = (data: string) => {
        const response = JSON.parse(data);
        if (response.id === messageId) {
          this.ws?.off('message', responseHandler);
          resolve(response);
        }
      };

      this.ws.on('message', responseHandler);

      // Send message
      this.ws.send(JSON.stringify(payload), (error) => {
        if (error) {
          this.ws?.off('message', responseHandler);
          reject(error);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        this.ws?.off('message', responseHandler);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  /**
   * Request AI code completion
   */
  async requestCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await this.sendMessage({
      type: 'ai_completion',
      payload: request
    });

    return response.payload;
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'ping':
          this.sendMessage({ type: 'pong' });
          break;
        
        case 'notification':
          console.log('[HeadyIDE] Notification:', message.payload);
          break;
        
        default:
          // Message will be handled by response handlers
          break;
      }
    } catch (error) {
      console.error('[HeadyIDE] Failed to parse message:', error);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[HeadyIDE] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[HeadyIDE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[HeadyIDE] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
