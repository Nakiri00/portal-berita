# Portal Berita Backend API

Backend API untuk Portal Berita dengan MongoDB dan JWT Authentication.

## 🚀 Fitur

- ✅ **Authentication**: Register, Login, Logout
- ✅ **User Management**: Profile, Update Profile, Change Password
- ✅ **Admin Panel**: Manage Users, Statistics, Role Management
- ✅ **Security**: JWT Tokens, Password Hashing, CORS
- ✅ **Database**: MongoDB dengan Mongoose ODM

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (Local atau MongoDB Atlas)
- npm atau yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Setup Environment Variables:**
```bash
# Copy config.env dan edit sesuai kebutuhan
cp config.env .env
```

3. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Atau gunakan MongoDB Atlas (cloud)
```

4. **Run Development Server:**
```bash
npm run dev
```

5. **Run Production Server:**
```bash
npm start
```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/portal-berita

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout (protected)

### Admin (Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user by ID
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `PUT /api/admin/users/:userId/activate` - Activate user
- `GET /api/admin/stats` - Get user statistics

### Health Check
- `GET /api/health` - API health status

## 🔐 Authentication

API menggunakan JWT (JSON Web Tokens) untuk authentication.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Example Request
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// Use token for protected routes
const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  avatar: String (default: ''),
  bio: String (default: ''),
  role: String (enum: ['user', 'writer', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date (default: Date.now),
  socialLinks: {
    instagram: String,
    facebook: String,
    threads: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚦 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info (development only)"
}
```

## 🛡️ Security Features

- **Password Hashing**: Menggunakan bcryptjs
- **JWT Tokens**: Secure authentication
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Mongoose validation
- **Rate Limiting**: (Bisa ditambahkan)

## 📊 User Roles

1. **user**: User biasa, bisa baca artikel
2. **writer**: Writer, bisa tulis artikel
3. **admin**: Admin, bisa manage semua user

## 🔄 Development

```bash
# Watch mode
npm run dev

# Production build
npm start

# Check logs
npm run dev | tee logs/app.log
```

## 🚀 Deployment

1. **Setup Production Environment:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secure-production-key
```

2. **Deploy to Vercel/Heroku/Railway:**
```bash
# Install dependencies
npm install

# Start production server
npm start
```

## 📝 API Testing

Gunakan Postman, Insomnia, atau curl untuk testing API:

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
