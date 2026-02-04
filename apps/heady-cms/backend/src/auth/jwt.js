// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/auth/jwt.js
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

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/index.js';

export const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
};

export const generateRefreshToken = (userId) => {
  const token = jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
  
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), userId, token, expiresAt.toISOString());
  
  return token;
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    
    const db = getDatabase();
    const storedToken = db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE token = ? AND user_id = ? AND expires_at > datetime('now')
    `).get(token, decoded.userId);
    
    if (!storedToken) {
      throw new Error('Refresh token not found or expired');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const revokeRefreshToken = (token) => {
  const db = getDatabase();
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
};

export const revokeAllUserTokens = (userId) => {
  const db = getDatabase();
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
};
