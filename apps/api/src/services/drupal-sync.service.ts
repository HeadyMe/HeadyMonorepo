// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/api/src/services/drupal-sync.service.ts
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

import { PrismaClient, Content, ContentStatus, SyncStatus, Prisma } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export interface DrupalNode {
  nid: string;
  title: string;
  body?: string;
  status: boolean;
  created: number;
  changed: number;
  path?: string;
  type: string;
  field_tags?: Array<{ name: string }>;
  field_categories?: Array<{ name: string }>;
  field_excerpt?: string;
  field_meta_title?: string;
  field_meta_description?: string;
  field_featured_image?: string;
}

export interface SyncOptions {
  contentTypes?: string[];
  since?: Date;
  organizationId?: string;
  dryRun?: boolean;
}

export class DrupalSyncService {
  private drupalBaseUrl: string;
  private apiKey?: string;

  constructor() {
    this.drupalBaseUrl = process.env.DRUPAL_BASE_URL || '';
    this.apiKey = process.env.DRUPAL_API_KEY;
  }

  /**
   * Fetch nodes from Drupal JSON:API
   */
  async fetchDrupalNodes(contentType: string = 'article', since?: Date): Promise<DrupalNode[]> {
    if (!this.drupalBaseUrl) {
      throw new Error('DRUPAL_BASE_URL not configured');
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const url = new URL(`/jsonapi/node/${contentType}`, this.drupalBaseUrl);
    
    if (since) {
      url.searchParams.append('filter[changed][condition][path]', 'changed');
      url.searchParams.append('filter[changed][condition][operator]', '>');
      url.searchParams.append('filter[changed][condition][value]', since.toISOString());
    }

    url.searchParams.append('page[limit]', '50');
    url.searchParams.append('sort', '-changed');

    try {
      const response = await axios.get(url.toString(), { headers });
      return this.transformDrupalResponse(response.data);
    } catch (error: any) {
      console.error('Failed to fetch from Drupal:', error.message);
      throw new Error(`Drupal API error: ${error.message}`);
    }
  }

  /**
   * Transform Drupal JSON:API response to internal format
   */
  private transformDrupalResponse(data: any): DrupalNode[] {
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map((item: any) => ({
      nid: item.id,
      title: item.attributes.title || '',
      body: item.attributes.body?.value || '',
      status: item.attributes.status === '1' || item.attributes.status === true,
      created: item.attributes.created,
      changed: item.attributes.changed,
      path: item.attributes.path?.alias || '',
      type: item.type.split('--')[1] || 'article',
      field_excerpt: item.attributes.field_excerpt,
      field_meta_title: item.attributes.field_meta_title,
      field_meta_description: item.attributes.field_meta_description,
      field_featured_image: item.attributes.field_featured_image?.uri?.url,
    }));
  }

  /**
   * Sync content from Drupal to local database
   */
  async syncFromDrupal(options: SyncOptions = {}): Promise<{ imported: number; updated: number; errors: number }> {
    const { contentTypes = ['article'], since, organizationId, dryRun = false } = options;
    
    const stats = { imported: 0, updated: 0, errors: 0 };
    
    // Create sync log entry
    const syncLog = await prisma.drupalSyncLog.create({
      data: {
        operation: 'import',
        contentType: contentTypes.join(','),
        status: SyncStatus.IN_PROGRESS,
      }
    });

    try {
      for (const contentType of contentTypes) {
        const nodes = await this.fetchDrupalNodes(contentType, since);
        
        for (const node of nodes) {
          try {
            if (dryRun) {
              console.log(`[DRY RUN] Would sync: ${node.title} (nid: ${node.nid})`);
              continue;
            }

            const existing = await prisma.content.findUnique({
              where: { drupalNid: node.nid }
            });

            const contentData = {
              title: node.title,
              slug: this.generateSlug(node.title, node.path),
              body: node.body,
              excerpt: node.field_excerpt,
              status: node.status ? ContentStatus.PUBLISHED : ContentStatus.DRAFT,
              contentType: this.mapContentType(node.type),
              drupalNid: node.nid,
              drupalSyncAt: new Date(),
              drupalUrl: `${this.drupalBaseUrl}/node/${node.nid}`,
              metaTitle: node.field_meta_title,
              metaDescription: node.field_meta_description,
              featuredImage: node.field_featured_image,
              publishedAt: node.status ? new Date(node.created * 1000) : null,
            };

            if (existing) {
              await prisma.content.update({
                where: { id: existing.id },
                data: contentData
              });
              stats.updated++;
            } else {
              // Find or create default organization
              let orgId = organizationId;
              if (!orgId) {
                const org = await prisma.organization.findFirst();
                if (!org) {
                  throw new Error('No organization found for content creation');
                }
                orgId = org.id;
              }

              // Find or create default author
              const author = await prisma.user.findFirst();
              if (!author) {
                throw new Error('No user found for content creation');
              }

              await prisma.content.create({
                data: {
                  ...contentData,
                  organizationId: orgId,
                  authorId: author.id,
                }
              });
              stats.imported++;
            }
          } catch (error: any) {
            console.error(`Failed to sync node ${node.nid}:`, error.message);
            stats.errors++;
          }
        }
      }

      // Update sync log
      await prisma.drupalSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: stats.errors > 0 ? SyncStatus.PARTIAL : SyncStatus.SUCCESS,
          message: `Imported: ${stats.imported}, Updated: ${stats.updated}, Errors: ${stats.errors}`,
          completedAt: new Date(),
        }
      });

      return stats;
    } catch (error: any) {
      await prisma.drupalSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: SyncStatus.FAILED,
          message: error.message,
          completedAt: new Date(),
        }
      });
      throw error;
    }
  }

  /**
   * Push local content to Drupal
   */
  async syncToDrupal(contentId: string): Promise<void> {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { tags: true, categories: true }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Implementation depends on Drupal's write API configuration
    // This is a placeholder for the push logic
    console.log(`Would push content ${contentId} to Drupal`);
  }

  /**
   * Get sync status and recent logs
   */
  async getSyncStatus(limit: number = 10): Promise<any> {
    const logs = await prisma.drupalSyncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const pendingCount = await prisma.content.count({
      where: { drupalSyncAt: null }
    });

    return {
      recentLogs: logs,
      pendingSync: pendingCount,
      drupalConfigured: !!this.drupalBaseUrl
    };
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string, path?: string): string {
    if (path) {
      return path.replace(/^\//, '').replace(/\//g, '-');
    }
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Map Drupal content type to internal type
   */
  private mapContentType(drupalType: string): string {
    const typeMap: Record<string, string> = {
      'article': 'ARTICLE',
      'page': 'PAGE',
      'media': 'MEDIA',
      'document': 'DOCUMENT',
    };
    return typeMap[drupalType] || 'ARTICLE';
  }
}
