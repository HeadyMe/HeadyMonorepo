// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/api/auth.routes.js
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
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken } from '../auth/jwt.js';
import { validate, schemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validate(schemas.register), async (req, res, next) => {
  try {
    const { email, password, name } = req.validatedBody;
    const db = getDatabase();
    
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email, hashedPassword, name, 'editor');
    
    const accessToken = generateAccessToken(userId, email, 'editor');
    const refreshToken = generateRefreshToken(userId);
    
    res.status(201).json({
      user: { id: userId, email, name, role: 'editor' },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const db = getDatabase();
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const db = getDatabase();
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    revokeRefreshToken(refreshToken);
    
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    
    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req, res, next) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
