// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/repository/autoSync.js
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

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import auditLogger from '../audit/index.js';
import { getDatabase } from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export class AutoRepositorySync {
  constructor() {
    this.db = getDatabase();
    this.repoPath = path.resolve(process.cwd(), '..');
    this.autoCommitEnabled = true;
    this.autoPushEnabled = true;
    this.syncInterval = null;
    this.initializeSyncTables();
  }

  initializeSyncTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repo_syncs (
        id TEXT PRIMARY KEY,
        sync_type TEXT NOT NULL,
        files_changed INTEGER DEFAULT 0,
        commit_hash TEXT,
        status TEXT DEFAULT 'pending',
        message TEXT,
        error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS file_changes (
        id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        change_type TEXT NOT NULL,
        content_hash TEXT,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_syncs_status ON repo_syncs(status);
      CREATE INDEX IF NOT EXISTS idx_changes_synced ON file_changes(synced);
    `);
  }

  async trackFileChange(filePath, changeType) {
    const id = uuidv4();
    
    this.db.prepare(`
      INSERT INTO file_changes (id, file_path, change_type)
      VALUES (?, ?, ?)
    `).run(id, filePath, changeType);

    if (this.autoCommitEnabled) {
      await this.autoCommit(`Auto-update: ${changeType} ${path.basename(filePath)}`);
    }
  }

  async autoCommit(message = 'Auto-commit: System updates') {
    const syncId = uuidv4();
    
    try {
      this.db.prepare(`
        INSERT INTO repo_syncs (id, sync_type, message, status)
        VALUES (?, 'commit', ?, 'running')
      `).run(syncId, message);

      const status = await this.getGitStatus();
      
      if (status.clean) {
        this.db.prepare(`
          UPDATE repo_syncs SET status = 'skipped', completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(syncId);
        return { skipped: true, reason: 'no_changes' };
      }

      await execAsync('git add .', { cwd: this.repoPath });

      const { stdout: commitOutput } = await execAsync(
        `git commit -m "${message}"`,
        { cwd: this.repoPath }
      );

      const commitHash = await this.getLastCommitHash();

      this.db.prepare(`
        UPDATE repo_syncs 
        SET status = 'completed', commit_hash = ?, files_changed = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(commitHash, status.filesChanged, syncId);

      this.db.prepare(`
        UPDATE file_changes SET synced = 1 WHERE synced = 0
      `).run();

      auditLogger.logSystemEvent({
        event_type: 'auto_commit',
        component: 'repo_sync',
        severity: 'info',
        message: `Auto-committed ${status.filesChanged} files`,
        details: { sync_id: syncId, commit_hash: commitHash, message }
      });

      if (this.autoPushEnabled) {
        await this.autoPush(syncId);
      }

      return {
        committed: true,
        sync_id: syncId,
        commit_hash: commitHash,
        files_changed: status.filesChanged
      };
    } catch (error) {
      this.db.prepare(`
        UPDATE repo_syncs SET status = 'failed', error = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(error.message, syncId);

      auditLogger.logSystemEvent({
        event_type: 'auto_commit_failed',
        component: 'repo_sync',
        severity: 'error',
        message: 'Auto-commit failed',
        details: { sync_id: syncId, error: error.message },
        stack_trace: error.stack
      });

      return { committed: false, error: error.message };
    }
  }

  async autoPush(syncId = null) {
    try {
      const { stdout } = await execAsync('git push', { cwd: this.repoPath });

      if (syncId) {
        this.db.prepare(`
          UPDATE repo_syncs SET message = message || ' (pushed)'
          WHERE id = ?
        `).run(syncId);
      }

      auditLogger.logSystemEvent({
        event_type: 'auto_push',
        component: 'repo_sync',
        severity: 'info',
        message: 'Auto-pushed to remote',
        details: { sync_id: syncId }
      });

      return { pushed: true };
    } catch (error) {
      if (error.message.includes('no upstream')) {
        return { pushed: false, reason: 'no_upstream' };
      }

      auditLogger.logSystemEvent({
        event_type: 'auto_push_failed',
        component: 'repo_sync',
        severity: 'warning',
        message: 'Auto-push failed',
        details: { error: error.message }
      });

      return { pushed: false, error: error.message };
    }
  }

  async getGitStatus() {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.repoPath });
      
      const lines = stdout.trim().split('\n').filter(l => l);
      
      return {
        clean: lines.length === 0,
        filesChanged: lines.length,
        changes: lines.map(line => ({
          status: line.substring(0, 2).trim(),
          file: line.substring(3)
        }))
      };
    } catch (error) {
      return { clean: true, filesChanged: 0, changes: [] };
    }
  }

  async getLastCommitHash() {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD', { cwd: this.repoPath });
      return stdout.trim();
    } catch (error) {
      return null;
    }
  }

  async ensureDependencies() {
    const packageJsonPath = path.join(this.repoPath, 'backend', 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      const { stdout } = await execAsync('npm outdated --json', { 
        cwd: path.join(this.repoPath, 'backend')
      }).catch(() => ({ stdout: '{}' }));

      const outdated = JSON.parse(stdout || '{}');
      
      if (Object.keys(outdated).length > 0) {
        auditLogger.logSystemEvent({
          event_type: 'dependencies_outdated',
          component: 'repo_sync',
          severity: 'info',
          message: `${Object.keys(outdated).length} dependencies outdated`,
          details: { outdated: Object.keys(outdated) }
        });
      }

      return {
        total: Object.keys(packageJson.dependencies || {}).length,
        outdated: Object.keys(outdated).length,
        packages: outdated
      };
    } catch (error) {
      return { total: 0, outdated: 0, error: error.message };
    }
  }

  async updateDependencies(packages = []) {
    try {
      const command = packages.length > 0
        ? `npm update ${packages.join(' ')}`
        : 'npm update';

      await execAsync(command, { cwd: path.join(this.repoPath, 'backend') });

      await this.autoCommit('Auto-update: Dependencies updated');

      auditLogger.logSystemEvent({
        event_type: 'dependencies_updated',
        component: 'repo_sync',
        severity: 'info',
        message: 'Dependencies updated automatically',
        details: { packages: packages.length > 0 ? packages : 'all' }
      });

      return { updated: true, packages };
    } catch (error) {
      return { updated: false, error: error.message };
    }
  }

  startAutoSync(intervalMinutes = 5) {
    if (this.syncInterval) {
      return { started: false, reason: 'already_running' };
    }

    this.syncInterval = setInterval(async () => {
      const status = await this.getGitStatus();
      
      if (!status.clean && status.filesChanged > 0) {
        await this.autoCommit(`Auto-sync: ${status.filesChanged} files changed`);
      }

      const deps = await this.ensureDependencies();
      if (deps.outdated > 0) {
        console.log(`📦 ${deps.outdated} dependencies outdated (auto-update available)`);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`🔄 Auto-sync started (every ${intervalMinutes} minutes)`);
    
    return { started: true, interval_minutes: intervalMinutes };
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🔄 Auto-sync stopped');
      return { stopped: true };
    }
    return { stopped: false, reason: 'not_running' };
  }

  async createBackup() {
    const backupId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.repoPath, 'backups', `backup-${timestamp}`);

    try {
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      
      await execAsync(`git archive --format=tar HEAD | tar -x -C "${backupPath}"`, {
        cwd: this.repoPath
      });

      auditLogger.logSystemEvent({
        event_type: 'backup_created',
        component: 'repo_sync',
        severity: 'info',
        message: 'Repository backup created',
        details: { backup_id: backupId, path: backupPath }
      });

      return { created: true, backup_id: backupId, path: backupPath };
    } catch (error) {
      return { created: false, error: error.message };
    }
  }

  getSyncHistory(limit = 50) {
    const syncs = this.db.prepare(`
      SELECT * FROM repo_syncs 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);

    return syncs;
  }

  getStatistics() {
    return {
      total_syncs: this.db.prepare('SELECT COUNT(*) as count FROM repo_syncs').get().count,
      successful_syncs: this.db.prepare('SELECT COUNT(*) as count FROM repo_syncs WHERE status = "completed"').get().count,
      failed_syncs: this.db.prepare('SELECT COUNT(*) as count FROM repo_syncs WHERE status = "failed"').get().count,
      pending_changes: this.db.prepare('SELECT COUNT(*) as count FROM file_changes WHERE synced = 0').get().count,
      auto_commit_enabled: this.autoCommitEnabled,
      auto_push_enabled: this.autoPushEnabled,
      auto_sync_running: this.syncInterval !== null
    };
  }

  setAutoCommit(enabled) {
    this.autoCommitEnabled = enabled;
    return { auto_commit: enabled };
  }

  setAutoPush(enabled) {
    this.autoPushEnabled = enabled;
    return { auto_push: enabled };
  }
}

export default new AutoRepositorySync();
