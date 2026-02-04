// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/index.js
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

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';
import { getDatabase } from './database/index.js';
import apiRoutes from './api/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditMiddleware } from './middleware/auditMiddleware.js';
import { patternAnalysisMiddleware, patternResponseEnhancer } from './middleware/patternMiddleware.js';
import { swaggerSpec } from './utils/swagger.js';
import bootstrap from './bootstrap/index.js';

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(patternAnalysisMiddleware);
app.use(auditMiddleware);
app.use(patternResponseEnhancer);

app.use('/uploads', express.static(config.upload.dir));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1', apiRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await bootstrap.initialize();
    
    app.locals.db = getDatabase();
    
    const server = app.listen(config.port, () => {
      console.log(`🚀 Heady Backend running on port ${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      console.log(`🤖 Automation Systems: ACTIVE`);
      console.log(`\n✨ System ready to accept requests\n`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received`);
      
      server.close(async () => {
        await bootstrap.shutdown();
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
