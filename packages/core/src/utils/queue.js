// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: packages/core/src/utils/queue.js
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

const Queue = require('bull');

const queues = {};

const getQueue = (name) => {
  if (!queues[name]) {
    queues[name] = new Queue(name, process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  }
  return queues[name];
};

module.exports = { getQueue };
