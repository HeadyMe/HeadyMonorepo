import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.get('/:contentType', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    
    const contentType = db.prepare('SELECT id FROM content_types WHERE name = ? OR id = ?')
      .get(req.params.contentType, req.params.contentType);
    
    if (!contentType) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, u.name as creator_name
      FROM content_entries e
      JOIN users u ON e.created_by = u.id
      WHERE e.content_type_id = ?
    `;
    const params = [contentType.id];
    
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const entries = db.prepare(query).all(...params);
    
    const parsed = entries.map(entry => ({
      ...entry,
      data: JSON.parse(entry.data)
    }));
    
    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

router.get('/:contentType/:id', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    
    const contentType = db.prepare('SELECT id FROM content_types WHERE name = ? OR id = ?')
      .get(req.params.contentType, req.params.contentType);
    
    if (!contentType) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    const entry = db.prepare(`
      SELECT e.*, u.name as creator_name
      FROM content_entries e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ? AND e.content_type_id = ?
    `).get(req.params.id, contentType.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json({
      ...entry,
      data: JSON.parse(entry.data)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:contentType', authenticate, validate(schemas.contentEntry), (req, res, next) => {
  try {
    const db = getDatabase();
    
    const contentType = db.prepare('SELECT id FROM content_types WHERE name = ? OR id = ?')
      .get(req.params.contentType, req.params.contentType);
    
    if (!contentType) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    const { data, status } = req.validatedBody;
    const id = uuidv4();
    const dataJson = JSON.stringify(data);
    
    db.prepare(`
      INSERT INTO content_entries (id, content_type_id, data, status, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, contentType.id, dataJson, status || 'draft', req.user.userId);
    
    const created = db.prepare(`
      SELECT e.*, u.name as creator_name
      FROM content_entries e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `).get(id);
    
    res.status(201).json({
      ...created,
      data: JSON.parse(created.data)
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:contentType/:id', authenticate, validate(schemas.contentEntry), (req, res, next) => {
  try {
    const db = getDatabase();
    
    const contentType = db.prepare('SELECT id FROM content_types WHERE name = ? OR id = ?')
      .get(req.params.contentType, req.params.contentType);
    
    if (!contentType) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    const existing = db.prepare('SELECT id FROM content_entries WHERE id = ? AND content_type_id = ?')
      .get(req.params.id, contentType.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const { data, status } = req.validatedBody;
    const dataJson = JSON.stringify(data);
    
    let publishedAt = null;
    if (status === 'published') {
      publishedAt = new Date().toISOString();
    }
    
    db.prepare(`
      UPDATE content_entries
      SET data = ?, status = ?, updated_at = CURRENT_TIMESTAMP, published_at = ?
      WHERE id = ?
    `).run(dataJson, status || 'draft', publishedAt, existing.id);
    
    const updated = db.prepare(`
      SELECT e.*, u.name as creator_name
      FROM content_entries e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `).get(existing.id);
    
    res.json({
      ...updated,
      data: JSON.parse(updated.data)
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:contentType/:id', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    
    const contentType = db.prepare('SELECT id FROM content_types WHERE name = ? OR id = ?')
      .get(req.params.contentType, req.params.contentType);
    
    if (!contentType) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    const existing = db.prepare('SELECT id FROM content_entries WHERE id = ? AND content_type_id = ?')
      .get(req.params.id, contentType.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    db.prepare('DELETE FROM content_entries WHERE id = ?').run(existing.id);
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
