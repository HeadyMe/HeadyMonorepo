// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: services/browser-automation/src/index.ts
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

import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

interface TaskConfig {
  id: string;
  type: 'headless' | 'interactive';
  browser: 'chromium' | 'firefox' | 'webkit';
  url?: string;
  actions: Action[];
}

interface Action {
  type: 'goto' | 'click' | 'type' | 'screenshot' | 'wait' | 'evaluate';
  selector?: string;
  value?: string | number;
  code?: string;
}

class BrowserAutomationService {
  private browsers: Map<string, Browser> = new Map();
  private pages: Map<string, Page> = new Map();
  private app: express.Application;
  private io: Server;
  private port: number;

  constructor(port: number = 9222) {
    this.port = port;
    this.app = express();
    const httpServer = createServer(this.app);
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupRoutes();
    this.setupSocketHandlers();
    
    httpServer.listen(port, () => {
      console.log(`🤖 Browser Automation Service running on port ${port}`);
    });
  }

  private setupRoutes() {
    this.app.use(express.json());

    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        browsers: Array.from(this.browsers.keys()),
        pages: Array.from(this.pages.keys())
      });
    });

    this.app.post('/task/execute', async (req, res) => {
      try {
        const task: TaskConfig = req.body;
        const result = await this.executeTask(task);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.post('/browser/launch', async (req, res) => {
      const { id, type = 'chromium', headless = true } = req.body;
      try {
        const browser = await this.launchBrowser(id, type, headless);
        res.json({ 
          success: true, 
          browserId: id,
          wsEndpoint: browser.wsEndpoint()
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.delete('/browser/:id', async (req, res) => {
      const { id } = req.params;
      try {
        await this.closeBrowser(id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('task:execute', async (task: TaskConfig) => {
        try {
          const result = await this.executeTask(task);
          socket.emit('task:complete', { taskId: task.id, result });
        } catch (error) {
          socket.emit('task:error', { 
            taskId: task.id, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      socket.on('browser:screenshot', async ({ pageId }) => {
        try {
          const page = this.pages.get(pageId);
          if (page) {
            const screenshot = await page.screenshot({ encoding: 'base64' });
            socket.emit('screenshot:data', { pageId, data: screenshot });
          }
        } catch (error) {
          socket.emit('screenshot:error', { 
            pageId, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async launchBrowser(id: string, type: string, headless: boolean): Promise<Browser> {
    let browser: Browser;
    
    const options = {
      headless,
      args: headless ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
    };

    switch (type) {
      case 'firefox':
        browser = await firefox.launch(options);
        break;
      case 'webkit':
        browser = await webkit.launch(options);
        break;
      default:
        browser = await chromium.launch(options);
    }

    this.browsers.set(id, browser);
    return browser;
  }

  private async closeBrowser(id: string): Promise<void> {
    const browser = this.browsers.get(id);
    if (browser) {
      await browser.close();
      this.browsers.delete(id);
      
      // Clean up associated pages
      for (const [pageId, page] of this.pages.entries()) {
        if (page.context().browser() === browser) {
          this.pages.delete(pageId);
        }
      }
    }
  }

  private async executeTask(task: TaskConfig): Promise<any> {
    const browserId = `browser-${task.id}`;
    const pageId = `page-${task.id}`;
    
    // Launch browser if not exists
    if (!this.browsers.has(browserId)) {
      await this.launchBrowser(
        browserId, 
        task.browser || 'chromium',
        task.type === 'headless'
      );
    }
    
    const browser = this.browsers.get(browserId)!;
    let page = this.pages.get(pageId);
    
    if (!page) {
      page = await browser.newPage();
      this.pages.set(pageId, page);
    }
    
    const results: any[] = [];
    
    for (const action of task.actions) {
      let result: any;
      
      switch (action.type) {
        case 'goto':
          if (action.value) {
            await page.goto(action.value as string);
            result = { url: page.url() };
          }
          break;
          
        case 'click':
          if (action.selector) {
            await page.click(action.selector);
            result = { clicked: action.selector };
          }
          break;
          
        case 'type':
          if (action.selector && action.value) {
            await page.fill(action.selector, action.value as string);
            result = { typed: action.value, into: action.selector };
          }
          break;
          
        case 'screenshot':
          const screenshot = await page.screenshot({ 
            path: action.value as string || undefined,
            fullPage: true 
          });
          result = { screenshot: action.value || 'captured' };
          break;
          
        case 'wait':
          if (typeof action.value === 'number') {
            await page.waitForTimeout(action.value);
            result = { waited: action.value };
          } else if (action.selector) {
            await page.waitForSelector(action.selector);
            result = { waitedFor: action.selector };
          }
          break;
          
        case 'evaluate':
          if (action.code) {
            result = await page.evaluate(action.code);
          }
          break;
      }
      
      results.push(result);
    }
    
    // Clean up if headless
    if (task.type === 'headless') {
      await this.closeBrowser(browserId);
    }
    
    return results;
  }
}

// Start the service
new BrowserAutomationService(parseInt(process.env.BROWSER_PORT || '9222'));
