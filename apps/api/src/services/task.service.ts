// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/api/src/services/task.service.ts
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

import { PrismaClient, Task, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class TaskService {
  async createTask(data: {
    title: string;
    description?: string;
    projectId?: string;
    assigneeId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  }): Promise<Task> {
    
    let projectId = data.projectId;

    // If no project specified, try to find a default one or create 'General'
    if (!projectId || projectId === 'default') {
      const defaultProject = await prisma.project.findFirst({
        where: { name: 'General' }
      });
      
      if (defaultProject) {
        projectId = defaultProject.id;
      } else {
        // Find ANY organization to attach to, or create one if empty
        // For simplicity in this mono-repo setup, let's assume an Org exists or create one.
        let org = await prisma.organization.findFirst();
        if (!org) {
            org = await prisma.organization.create({
                data: {
                    name: 'Heady Systems',
                    type: 'COMMERCIAL'
                }
            });
        }
        
        const newProject = await prisma.project.create({
          data: {
            name: 'General',
            description: 'Default project for general tasks',
            organizationId: org.id
          }
        });
        projectId = newProject.id;
      }
    }

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'PENDING',
        project: {
            connect: { id: projectId }
        },
        assignee: data.assigneeId ? { connect: { id: data.assigneeId } } : undefined
      },
      include: {
        project: true,
        assignee: true,
        automation: true
      }
    });
  }

  async getTasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        project: true,
        assignee: true,
        automation: true
      }
    });
  }

  async getTaskById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        automation: true
      }
    });
  }

  async updateTask(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const { where, data } = params;
    return prisma.task.update({
      data,
      where,
      include: {
        project: true,
        assignee: true,
        automation: true
      }
    });
  }

  async deleteTask(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return prisma.task.delete({
      where
    });
  }
}
