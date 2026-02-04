import express from 'express';
import authRoutes from './auth.routes.js';
import contentTypesRoutes from './contentTypes.routes.js';
import entriesRoutes from './entries.routes.js';
import mediaRoutes from './media.routes.js';
import automationRoutes from './automation.routes.js';
import intelligenceRoutes from './intelligence.routes.js';
import knowledgeRoutes from './knowledge.routes.js';
import repositoryRoutes from './repository.routes.js';
import patternsRoutes from './patterns.routes.js';
import ideRoutes from './ide.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/content-types', contentTypesRoutes);
router.use('/entries', entriesRoutes);
router.use('/media', mediaRoutes);
router.use('/automation', automationRoutes);
router.use('/intelligence', intelligenceRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/repository', repositoryRoutes);
router.use('/patterns', patternsRoutes);
router.use('/ide', ideRoutes);

export default router;
