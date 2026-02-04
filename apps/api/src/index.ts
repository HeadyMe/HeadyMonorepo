// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/api/src/index.ts
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

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.HC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

import taskRouter from './routes/tasks';
import contentRouter from './routes/content';

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.HC_FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/tasks', taskRouter);
app.use('/api/content', contentRouter);

app.get('/health', async (_req: express.Request, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ 
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected',
        websocket: 'active'
      }
    });
  } catch (error: any) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error?.message || 'Unknown error'
    });
  }
});

// API Routes
app.get('/api', (_req, res) => {
  res.json({ 
    message: 'HeadySystems API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      automation: '/api/automation'
    }
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('task:execute', async (data) => {
    // Handle task execution
    socket.emit('task:status', { 
      id: data.id, 
      status: 'processing' 
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.HC_API_PORT || 8000;

async function start() {
  try {
    await redis.connect();
    console.log('✅ Redis connected');
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 HeadySystems API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  await redis.disconnect();
  httpServer.close();
  process.exit(0);
});
