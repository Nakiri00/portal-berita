const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const { generateToken, createTokenPayload } = require('../utils/jwt');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0].value || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value || '',
      role: 'user',
      isActive: true,
      lastLogin: new Date()
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
  profileFields: ['id', 'emails', 'name', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Facebook ID
    let user = await User.findOne({ facebookId: profile.id });
    
    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    if (profile.emails && profile.emails[0]) {
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Facebook account to existing user
        user.facebookId = profile.id;
        user.avatar = profile.photos[0].value || user.avatar;
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
    }

    // Create new user
    const newUser = new User({
      facebookId: profile.id,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
      avatar: profile.photos ? profile.photos[0].value : '',
      role: 'user',
      isActive: true,
      lastLogin: new Date()
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    console.error('Facebook OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
