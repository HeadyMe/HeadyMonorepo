// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: packages/config/src/index.ts
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
 * @heady/config - Configuration management for Heady ecosystem
 */

export interface HeadyConfig {
  apiKey?: string;
  databaseUrl?: string;
  redisUrl?: string;
  nodeEnv?: string;
}

export function loadConfig(): HeadyConfig {
  return {
    apiKey: process.env.HEADY_API_KEY,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

export default { loadConfig };
