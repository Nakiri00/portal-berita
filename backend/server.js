require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/error');
// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const passwordRoutes = require('./routes/password');
const oauthRoutes = require('./routes/oauth');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const readingHistoryRoutes = require("./routes/readingHistory");
const savedArticlesRoutes = require("./routes/savedArticles");
// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(errorMiddleware);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// app.get('/api', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Selamat datang di Portal Berita API!',
//     available_routes: {
//       health: '/api/health',
//       articles: '/api/articles',
//       auth: '/api/auth',
//       oauth: '/api/oauth',
//       admin: '/api/admin',
//       password: '/api/password'
//     }
//   });
// });
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Portal Berita API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/user', userRoutes);
app.use("/api/reading-history", readingHistoryRoutes);
app.use("/api/saved-articles", savedArticlesRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://127.0.0.1:${PORT}/api`);
  console.log(`🏥 Health Check: http://127.0.0.1:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
