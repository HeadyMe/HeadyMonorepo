// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/media.routes.js
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
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/index.js';
import { authenticate } from '../middleware/auth.js';
import config from '../config/index.js';

const router = express.Router();

if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const db = getDatabase();
    const id = uuidv4();
    const url = `/uploads/${req.file.filename}`;
    
    if (req.file.mimetype.startsWith('image/')) {
      const metadata = await sharp(req.file.path).metadata();
      
      if (req.query.resize) {
        const [width, height] = req.query.resize.split('x').map(Number);
        await sharp(req.file.path)
          .resize(width, height, { fit: 'inside' })
          .toFile(req.file.path + '.resized');
        
        fs.renameSync(req.file.path + '.resized', req.file.path);
      }
    }
    
    db.prepare(`
      INSERT INTO media (id, filename, original_name, mime_type, size, path, url, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.file.path,
      url,
      req.user.userId
    );
    
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    
    res.status(201).json(media);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    const { limit = 50, offset = 0, type } = req.query;
    
    let query = 'SELECT * FROM media';
    const params = [];
    
    if (type) {
      query += ' WHERE mime_type LIKE ?';
      params.push(`${type}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const media = db.prepare(query).all(...params);
    
    res.json(media);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    res.json(media);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }
    
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
