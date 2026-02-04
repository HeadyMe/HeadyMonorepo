<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: apps/heady-cms/README.md -->
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

# Heady - Self-Contained Headless CMS System

A complete, production-ready headless CMS with all services localized and zero external dependencies.

## 🚀 Features

### **Core CMS Features**
- **Content Management API** - RESTful API for managing content types, entries, and assets
- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Media Management** - Local file storage with image processing
- **Admin Dashboard** - Modern React-based UI for content management
- **Database** - SQLite for zero-config local storage
- **Search** - Full-text search capabilities
- **Webhooks** - Event-driven notifications
- **API Documentation** - Auto-generated OpenAPI/Swagger docs

### **🔴 ELEVATED: Pattern Recognition System**
- **Automatic Repeat Detection** - Detects repeated inputs, auto-escalates urgency
- **Aggression/Frustration Detection** - Identifies user frustration, triggers immediate resolution
- **Urgency Level Detection** - Analyzes language for urgency markers (now, urgent, asap)
- **Auto-Resolution** - Resolves issues automatically when urgency >= 8 or aggression >= 0.7
- **Pattern-First Processing** - Everything broken down to patterns for optimization
- **Continuous Learning** - Improves from every interaction

### **Enterprise Automation**
- **Workflow Engine** - 6 auto-executing workflows (backups, health, optimization)
- **Auto-Scaling** - Scales up/down based on CPU, memory, request load
- **Self-Healing** - Auto-recovers from failures (database locks, high memory, crashes)
- **Intelligent Learning** - Learns patterns, predicts load, suggests optimizations
- **Auto-Discovery** - Finds and registers new services automatically
- **Knowledge System** - Fetches from Wikipedia, MDN, Stack Overflow in background
- **Auto-Sync** - Commits and pushes changes every 5 minutes
- **Complete Audit Trail** - Every action logged with full context

## 📁 Project Structure

```
heady-system/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── api/         # API routes and controllers
│   │   ├── auth/        # Authentication & authorization
│   │   ├── database/    # Database models and migrations
│   │   ├── services/    # Business logic services
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   ├── storage/         # Local file storage
│   └── package.json
├── frontend/            # React admin dashboard
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client services
│   │   └── utils/       # Utility functions
│   └── package.json
├── docker-compose.yml   # Optional Docker setup
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Initialize Database**
```bash
cd backend
npm run db:init
```

4. **Start Backend Server**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:3000

5. **Start Frontend Dashboard**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

### Default Credentials
- **Email**: admin@heady.local
- **Password**: admin123

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:3000/api-docs
- API Base: http://localhost:3000/api/v1

## 🔑 Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Content Types
- `GET /api/v1/content-types` - List all content types
- `POST /api/v1/content-types` - Create content type
- `GET /api/v1/content-types/:id` - Get content type
- `PUT /api/v1/content-types/:id` - Update content type
- `DELETE /api/v1/content-types/:id` - Delete content type

### Content Entries
- `GET /api/v1/entries/:contentType` - List entries
- `POST /api/v1/entries/:contentType` - Create entry
- `GET /api/v1/entries/:contentType/:id` - Get entry
- `PUT /api/v1/entries/:contentType/:id` - Update entry
- `DELETE /api/v1/entries/:contentType/:id` - Delete entry

### Media
- `POST /api/v1/media/upload` - Upload file
- `GET /api/v1/media` - List media files
- `GET /api/v1/media/:id` - Get media file
- `DELETE /api/v1/media/:id` - Delete media file

## 🔧 Configuration

All configuration is in `backend/src/config/index.js`:
- Database path
- JWT secrets
- Upload limits
- CORS settings
- Port configuration

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

## 🐳 Docker Deployment (Optional)

```bash
docker-compose up -d
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📄 License

MIT License - feel free to use for any project!

## 🤝 Contributing

This is a self-contained system. Modify as needed for your use case!
