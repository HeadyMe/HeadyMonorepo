<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-cms/SETUP.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _  __   __ -->
<!--        | | | || ____|  / \ \  / / -->
<!--        | |_| ||  _|   / _ \ \ V /  -->
<!--        |  _  || |___ / ___ \ | |   -->
<!--        |_| |_||_____/_/   \_\|_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# Heady System - Setup Guide

## 🚀 Quick Start (Recommended)

### Option 1: Local Development (No Docker)

1. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

2. **Initialize Database**
```bash
cd backend
npm run db:init
```

This creates:
- Default admin user: `admin@heady.local` / `admin123`
- Sample content types: Blog Post, Page

3. **Start Backend Server**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3000

4. **Start Frontend (in new terminal)**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

5. **Access the Application**
- Admin Dashboard: http://localhost:5173
- API Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

### Option 2: Docker Deployment

```bash
docker-compose up -d
```

Then initialize the database:
```bash
docker-compose exec backend npm run db:init
```

Access at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📋 System Requirements

- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

## 🔧 Configuration

All backend configuration is in `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DB_PATH=./data/heady.db
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here
CORS_ORIGIN=http://localhost:5173
```

## 📁 Project Structure

```
heady-system/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication
│   │   ├── database/       # Database & models
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Configuration
│   ├── data/               # SQLite database (auto-created)
│   └── storage/            # Uploaded files (auto-created)
├── frontend/               # React admin dashboard
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── contexts/       # React contexts
│       └── services/       # API services
└── docker-compose.yml      # Docker setup
```

## 🎯 Features

### Backend API
- ✅ RESTful API with Express.js
- ✅ SQLite database (zero config)
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (admin, editor)
- ✅ File upload with image processing
- ✅ Content type management
- ✅ Dynamic content entries
- ✅ Media library
- ✅ Auto-generated API documentation (Swagger)
- ✅ Request validation
- ✅ Error handling
- ✅ CORS protection
- ✅ Rate limiting

### Frontend Dashboard
- ✅ Modern React UI with TailwindCSS
- ✅ Authentication & authorization
- ✅ Dashboard with statistics
- ✅ Content type management
- ✅ Entry management
- ✅ Media library with upload
- ✅ Responsive design
- ✅ Token refresh handling

## 🔑 Default Credentials

```
Email: admin@heady.local
Password: admin123
```

**⚠️ Change these in production!**

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Content Types
- `GET /api/v1/content-types` - List all
- `POST /api/v1/content-types` - Create new
- `GET /api/v1/content-types/:id` - Get one
- `PUT /api/v1/content-types/:id` - Update
- `DELETE /api/v1/content-types/:id` - Delete

### Content Entries
- `GET /api/v1/entries/:contentType` - List entries
- `POST /api/v1/entries/:contentType` - Create entry
- `GET /api/v1/entries/:contentType/:id` - Get entry
- `PUT /api/v1/entries/:contentType/:id` - Update entry
- `DELETE /api/v1/entries/:contentType/:id` - Delete entry

### Media
- `POST /api/v1/media/upload` - Upload file
- `GET /api/v1/media` - List files
- `GET /api/v1/media/:id` - Get file
- `DELETE /api/v1/media/:id` - Delete file

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🏗️ Production Build

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
# Serve them with any static file server

# Run backend in production
cd backend
NODE_ENV=production npm start
```

## 🔒 Security Checklist for Production

- [ ] Change JWT secrets in `.env`
- [ ] Change default admin password
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS/SSL
- [ ] Configure rate limiting appropriately
- [ ] Regular database backups
- [ ] Review file upload restrictions
- [ ] Set up monitoring and logging

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Node.js version (18+)
- Run `npm install` again
- Check `.env` file exists

### Frontend won't start
- Check if port 5173 is available
- Verify backend is running
- Run `npm install` again
- Clear browser cache

### Database errors
- Delete `backend/data/` folder
- Run `npm run db:init` again

### Upload errors
- Check `backend/storage/uploads/` exists
- Verify file size limits in `.env`
- Check file type restrictions

## 📦 Dependencies

### Backend
- express - Web framework
- better-sqlite3 - Database
- bcryptjs - Password hashing
- jsonwebtoken - JWT auth
- multer - File uploads
- sharp - Image processing
- joi - Validation
- helmet - Security headers
- cors - CORS handling

### Frontend
- react - UI framework
- react-router-dom - Routing
- axios - HTTP client
- tailwindcss - Styling
- lucide-react - Icons

## 🤝 Contributing

This is a self-contained system designed to be customized for your needs. Feel free to:
- Add new content types
- Customize the UI
- Add new API endpoints
- Extend authentication
- Add webhooks
- Integrate with external services

## 📄 License

MIT License - Use freely for any project!
