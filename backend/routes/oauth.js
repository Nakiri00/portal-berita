const express = require('express');
const passport = require('../config/passport');
const { generateToken, createTokenPayload } = require('../utils/jwt');
const User = require('../models/User');
const router = express.Router();

// Check if OAuth is properly configured
const isOAuthConfigured = () => {
  return process.env.GOOGLE_CLIENT_ID && 
         process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
         process.env.GOOGLE_CLIENT_SECRET && 
         process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret';
};

const isFacebookConfigured = () => {
  return process.env.FACEBOOK_APP_ID && 
         process.env.FACEBOOK_APP_ID !== 'your-facebook-app-id' &&
         process.env.FACEBOOK_APP_SECRET && 
         process.env.FACEBOOK_APP_SECRET !== 'your-facebook-app-secret';
};

// Google OAuth Routes
router.get('/google', (req, res) => {
  if (!isOAuthConfigured()) {
    console.log('⚠️  Google OAuth not configured. Redirecting to setup instructions.');
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_not_configured`);
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res);
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  async (req, res) => {
    try {
      // Generate JWT token
      const tokenPayload = createTokenPayload(req.user);
      const token = generateToken(tokenPayload);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=google_callback_failed`);
    }
  }
);

// Facebook OAuth Routes
router.get('/facebook', (req, res) => {
  if (!isFacebookConfigured()) {
    console.log('⚠️  Facebook OAuth not configured. Redirecting to setup instructions.');
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_not_configured`);
  }
  
  passport.authenticate('facebook', {
    scope: ['email']
  })(req, res);
});

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_failed` }),
  async (req, res) => {
    try {
      // Generate JWT token
      const tokenPayload = createTokenPayload(req.user);
      const token = generateToken(tokenPayload);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=facebook`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_callback_failed`);
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Development mode - Mock OAuth for testing
router.get('/dev/google', async (req, res) => {
  try {
    // Create or find mock user for development
    let user = await User.findOne({ email: 'dev.google@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Dev Google User',
        email: 'dev.google@example.com',
        avatar: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        lastLogin: new Date()
      });
      await user.save();
    }

    // Generate JWT token
    const tokenPayload = createTokenPayload(user);
    const token = generateToken(tokenPayload);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google&dev=true`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Dev Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=dev_google_failed`);
  }
});

router.get('/dev/facebook', async (req, res) => {
  try {
    // Create or find mock user for development
    let user = await User.findOne({ email: 'dev.facebook@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Dev Facebook User',
        email: 'dev.facebook@example.com',
        avatar: 'https://via.placeholder.com/150',
        role: 'user',
        isActive: true,
        lastLogin: new Date()
      });
      await user.save();
    }

    // Generate JWT token
    const tokenPayload = createTokenPayload(user);
    const token = generateToken(tokenPayload);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=facebook&dev=true`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Dev Facebook OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=dev_facebook_failed`);
  }
});

// Get current user info (for debugging)
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// OAuth status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    google: {
      configured: isOAuthConfigured(),
      clientId: process.env.GOOGLE_CLIENT_ID ? '***configured***' : 'not configured'
    },
    facebook: {
      configured: isFacebookConfigured(),
      appId: process.env.FACEBOOK_APP_ID ? '***configured***' : 'not configured'
    },
    development: {
      googleMock: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/oauth/dev/google`,
      facebookMock: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/oauth/dev/facebook`
    }
  });
});

module.exports = router;
