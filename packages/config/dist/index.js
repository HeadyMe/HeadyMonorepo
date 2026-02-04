"use strict";
/**
 * @heady/config - Configuration management for Heady ecosystem
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
function loadConfig() {
    return {
        apiKey: process.env.HEADY_API_KEY,
        databaseUrl: process.env.DATABASE_URL,
        redisUrl: process.env.REDIS_URL,
        nodeEnv: process.env.NODE_ENV || 'development',
    };
}
exports.default = { loadConfig };
//# sourceMappingURL=index.js.map