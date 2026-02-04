// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/contentTypes.routes.js
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
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    const contentTypes = db.prepare(`
      SELECT id, name, display_name, description, schema, created_at, updated_at
      FROM content_types
      ORDER BY created_at DESC
    `).all();
    
    const parsed = contentTypes.map(ct => ({
      ...ct,
      schema: JSON.parse(ct.schema)
    }));
    
    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    const contentType = db.prepare(`
      SELECT id, name, display_name, description, schema, created_at, updated_at
      FROM content_types
      WHERE id = ? OR name = ?
    `).get(req.params.id, req.params.id);
    
    if (!contentType) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    res.json({
      ...contentType,
      schema: JSON.parse(contentType.schema)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin'), validate(schemas.contentType), (req, res, next) => {
  try {
    const { name, display_name, description, schema } = req.validatedBody;
    const db = getDatabase();
    
    const id = uuidv4();
    const schemaJson = JSON.stringify(schema);
    
    db.prepare(`
      INSERT INTO content_types (id, name, display_name, description, schema)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, display_name, description || '', schemaJson);
    
    const created = db.prepare('SELECT * FROM content_types WHERE id = ?').get(id);
    
    res.status(201).json({
      ...created,
      schema: JSON.parse(created.schema)
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin'), validate(schemas.contentType), (req, res, next) => {
  try {
    const { name, display_name, description, schema } = req.validatedBody;
    const db = getDatabase();
    
    const existing = db.prepare('SELECT id FROM content_types WHERE id = ? OR name = ?').get(req.params.id, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    const schemaJson = JSON.stringify(schema);
    
    db.prepare(`
      UPDATE content_types
      SET name = ?, display_name = ?, description = ?, schema = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, display_name, description || '', schemaJson, existing.id);
    
    const updated = db.prepare('SELECT * FROM content_types WHERE id = ?').get(existing.id);
    
    res.json({
      ...updated,
      schema: JSON.parse(updated.schema)
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    
    const existing = db.prepare('SELECT id FROM content_types WHERE id = ? OR name = ?').get(req.params.id, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Content type not found' });
    }
    
    db.prepare('DELETE FROM content_types WHERE id = ?').run(existing.id);
    
    res.json({ message: 'Content type deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
