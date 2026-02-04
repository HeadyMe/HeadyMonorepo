"use strict";
/**
 * @heady/core - Core utilities for Heady ecosystem
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.generateId = generateId;
exports.sleep = sleep;
function generateId() {
    return `heady_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    info(message, ...args) {
        console.log(`[${this.context}] INFO:`, message, ...args);
    }
    error(message, ...args) {
        console.error(`[${this.context}] ERROR:`, message, ...args);
    }
    warn(message, ...args) {
        console.warn(`[${this.context}] WARN:`, message, ...args);
    }
}
exports.Logger = Logger;
exports.default = { generateId, sleep, Logger };
//# sourceMappingURL=index.js.map