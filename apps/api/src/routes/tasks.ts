// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/api/src/routes/tasks.ts
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

import express, { Request, Response, Router } from 'express';
import { TaskService } from '../services/task.service';
import { Prisma } from '@prisma/client';

const router: Router = express.Router();
const taskService = new TaskService();

// GET /api/tasks - List tasks with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      skip, 
      take, 
      status, 
      priority, 
      projectId, 
      assigneeId 
    } = req.query;

    const where: Prisma.TaskWhereInput = {};
    
    if (status) where.status = String(status) as any;
    if (priority) where.priority = String(priority) as any;
    if (projectId) where.projectId = String(projectId);
    if (assigneeId) where.assigneeId = String(assigneeId);

    const tasks = await taskService.getTasks({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks - Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    // Basic validation could go here or use Zod middleware
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const task = await taskService.updateTask({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await taskService.deleteTask({ id: req.params.id });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
