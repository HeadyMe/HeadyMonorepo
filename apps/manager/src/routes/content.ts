import express, { Request, Response, Router } from 'express';
import { PrismaClient, Prisma, ContentStatus, ContentType } from '@prisma/client';
import { DrupalSyncService } from '../services/drupal-sync.service';

const router: Router = express.Router();
const prisma = new PrismaClient();
const drupalSync = new DrupalSyncService();

// GET /api/content - List content with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      skip, 
      take, 
      status, 
      contentType, 
      organizationId,
      search,
      tag,
      category
    } = req.query;

    const where: Prisma.ContentWhereInput = {};
    
    if (status) where.status = String(status) as ContentStatus;
    if (contentType) where.contentType = String(contentType) as ContentType;
    if (organizationId) where.organizationId = String(organizationId);
    
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { body: { contains: String(search), mode: 'insensitive' } },
        { excerpt: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (tag) {
      where.tags = {
        some: { slug: String(tag) }
      };
    }

    if (category) {
      where.categories = {
        some: { slug: String(category) }
      };
    }

    const contents = await prisma.content.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : 20,
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        tags: true,
        categories: true
      }
    });
    
    const total = await prisma.content.count({ where });
    
    res.json({
      data: contents,
      pagination: {
        total,
        skip: Number(skip) || 0,
        take: Number(take) || 20
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/content/:id - Get single content
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const content = await prisma.content.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        tags: true,
        categories: true
      }
    });
    
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/content/slug/:slug - Get content by slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const content = await prisma.content.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        tags: true,
        categories: true
      }
    });
    
    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/content - Create content
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, slug, body, excerpt, status, contentType, tags, categories, authorId, organizationId, ...rest } = req.body;
    
    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Check for duplicate slug
    const existing = await prisma.content.findUnique({
      where: { slug: finalSlug }
    });
    
    if (existing) {
      res.status(409).json({ error: 'Content with this slug already exists' });
      return;
    }

    const content = await prisma.content.create({
      data: {
        title,
        slug: finalSlug,
        body,
        excerpt,
        status: status || ContentStatus.DRAFT,
        contentType: contentType || ContentType.ARTICLE,
        authorId,
        organizationId,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        ...rest,
        tags: tags ? {
          connectOrCreate: tags.map((tag: string) => ({
            where: { slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            create: { 
              name: tag,
              slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
          }))
        } : undefined,
        categories: categories ? {
          connect: categories.map((catId: string) => ({ id: catId }))
        } : undefined
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        tags: true,
        categories: true
      }
    });
    
    res.status(201).json(content);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/content/:id - Update content
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { tags, categories, ...data } = req.body;
    
    const updateData: Prisma.ContentUpdateInput = { ...data };
    
    if (tags) {
      updateData.tags = {
        set: [],
        connectOrCreate: tags.map((tag: string) => ({
          where: { slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
          create: { 
            name: tag,
            slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }
        }))
      };
    }
    
    if (categories) {
      updateData.categories = {
        set: categories.map((catId: string) => ({ id: catId }))
      };
    }

    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        tags: true,
        categories: true
      }
    });
    
    res.json(content);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/content/:id - Delete content
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.content.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/content/:id/publish - Publish content
router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        tags: true,
        categories: true
      }
    });
    
    res.json(content);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DRUPAL SYNC ROUTES

// POST /api/content/drupal-sync - Trigger Drupal sync
router.post('/drupal-sync', async (req: Request, res: Response) => {
  try {
    const { contentTypes, since, dryRun } = req.body;
    
    const result = await drupalSync.syncFromDrupal({
      contentTypes,
      since: since ? new Date(since) : undefined,
      dryRun
    });
    
    res.json({
      status: 'success',
      result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/content/drupal-sync/status - Get sync status
router.get('/drupal-sync/status', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const status = await drupalSync.getSyncStatus(limit);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/content/:id/drupal-push - Push content to Drupal
router.post('/:id/drupal-push', async (req: Request, res: Response) => {
  try {
    await drupalSync.syncToDrupal(req.params.id);
    res.json({ status: 'success', message: 'Content queued for push to Drupal' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CATEGORY ROUTES

// GET /api/content/categories - List categories
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;
    
    const categories = await prisma.category.findMany({
      where: organizationId ? { organizationId: String(organizationId) } : {},
      include: {
        parent: true,
        children: true,
        _count: { select: { contents: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/content/categories - Create category
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, slug, description, parentId, organizationId } = req.body;
    
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        parentId,
        organizationId
      }
    });
    
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// TAG ROUTES

// GET /api/content/tags - List tags
router.get('/tags/list', async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { contents: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
