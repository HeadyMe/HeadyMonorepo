// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/database/init.js
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

import { initDatabase, getDatabase } from './index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const createDefaultUser = async () => {
  const db = getDatabase();
  
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@heady.local');
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'admin@heady.local', hashedPassword, 'Admin User', 'admin');
    
    console.log('✅ Default admin user created');
    console.log('   Email: admin@heady.local');
    console.log('   Password: admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }
};

const createSampleContentTypes = () => {
  const db = getDatabase();
  
  const blogSchema = JSON.stringify({
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true, unique: true },
      { name: 'content', type: 'richtext', required: true },
      { name: 'excerpt', type: 'textarea', required: false },
      { name: 'featured_image', type: 'media', required: false },
      { name: 'author', type: 'text', required: true },
      { name: 'tags', type: 'array', required: false }
    ]
  });
  
  const pageSchema = JSON.stringify({
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true, unique: true },
      { name: 'content', type: 'richtext', required: true },
      { name: 'meta_description', type: 'textarea', required: false }
    ]
  });
  
  const existingBlog = db.prepare('SELECT id FROM content_types WHERE name = ?').get('blog');
  if (!existingBlog) {
    db.prepare(`
      INSERT INTO content_types (id, name, display_name, description, schema)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'blog', 'Blog Post', 'Blog post content type', blogSchema);
    console.log('✅ Blog content type created');
  }
  
  const existingPage = db.prepare('SELECT id FROM content_types WHERE name = ?').get('page');
  if (!existingPage) {
    db.prepare(`
      INSERT INTO content_types (id, name, display_name, description, schema)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'page', 'Page', 'Static page content type', pageSchema);
    console.log('✅ Page content type created');
  }
};

const main = async () => {
  try {
    console.log('🔧 Initializing Heady database...\n');
    
    await initDatabase();
    await createDefaultUser();
    createSampleContentTypes();
    
    console.log('\n✨ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

main();
