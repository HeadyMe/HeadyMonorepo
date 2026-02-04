/**
 * @heady/core - Core utilities for Heady ecosystem
 */

export function generateId(): string {
  return `heady_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]): void {
    console.log(`[${this.context}] INFO:`, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.context}] ERROR:`, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] WARN:`, message, ...args);
  }
}

export default { generateId, sleep, Logger };
