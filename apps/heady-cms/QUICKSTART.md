<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-cms/QUICKSTART.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# Heady CMS - Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Installation

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Initialize Database
```bash
cd backend
npm run db:init
```

This creates:
- ✅ SQLite database at `backend/data/heady.db`
- ✅ Default admin user: `admin@heady.local` / `admin123`
- ✅ Sample content types (Blog Post, Page)

### Step 4: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Heady Backend running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
🏥 Health Check: http://localhost:3000/health
```

### Step 5: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## 🎉 You're Done!

Open your browser to:
- **Admin Dashboard**: http://localhost:5173
- **API Docs**: http://localhost:3000/api-docs

Login with:
- Email: `admin@heady.local`
- Password: `admin123`

## 📝 What's Next?

1. **Explore the Dashboard** - View content types, entries, and media
2. **Create Content** - Add new blog posts or pages
3. **Upload Media** - Try uploading images
4. **Check API Docs** - Visit http://localhost:3000/api-docs
5. **Read Full Docs** - See `SETUP.md` and `API_GUIDE.md`

## 🐛 Troubleshooting

### Backend won't start?
- Make sure port 3000 is free
- Check Node.js version: `node --version` (need 18+)
- Try: `cd backend && rm -rf node_modules && npm install`

### Frontend won't start?
- Make sure port 5173 is free
- Make sure backend is running first
- Try: `cd frontend && rm -rf node_modules && npm install`

### Can't login?
- Make sure you ran `npm run db:init` in the backend folder
- Default credentials: `admin@heady.local` / `admin123`

## 🔧 Commands Cheat Sheet

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run db:init      # Initialize database
npm start            # Production server

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
```

## 📚 Documentation

- `README.md` - Project overview
- `SETUP.md` - Detailed setup guide
- `API_GUIDE.md` - Complete API reference

## 🎯 Key Features

✅ **Zero Dependencies** - Everything runs locally, no external services
✅ **SQLite Database** - No database server needed
✅ **JWT Authentication** - Secure token-based auth
✅ **File Upload** - Local file storage with image processing
✅ **Modern UI** - React + TailwindCSS admin dashboard
✅ **API Documentation** - Auto-generated Swagger docs
✅ **Content Types** - Define custom content structures
✅ **Media Library** - Upload and manage files
✅ **Role-Based Access** - Admin and editor roles

Enjoy using Heady CMS! 🎊
