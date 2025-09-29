# 🛠️ Development Mode OAuth - Kamus Mahasiswa

Panduan untuk menggunakan OAuth dalam mode development tanpa perlu setup credentials yang rumit.

## 🎯 **Development Mode Features**

- ✅ **Mock OAuth** - Login tanpa setup Google/Facebook credentials
- ✅ **Auto User Creation** - Buat user otomatis untuk testing
- ✅ **JWT Integration** - Menggunakan sistem JWT yang sama
- ✅ **Fallback Handling** - Otomatis fallback jika OAuth tidak dikonfigurasi

## 🚀 **Cara Menggunakan Development Mode**

### **1. Start Server**
```bash
cd backend
npm run dev
```

### **2. Test Development OAuth**
1. Buka `http://localhost:5173`
2. Klik tombol login
3. Pilih **"Login with Google"** atau **"Login with Facebook"**
4. Sistem akan otomatis menggunakan development mode
5. User akan login dengan akun mock

### **3. Development OAuth URLs**
- **Google Dev**: `GET /api/oauth/dev/google`
- **Facebook Dev**: `GET /api/oauth/dev/facebook`
- **OAuth Status**: `GET /api/oauth/status`

## 👤 **Mock Users**

### **Google Development User:**
- **Email**: `dev.google@example.com`
- **Name**: `Dev Google User`
- **Role**: `user`
- **Avatar**: Placeholder image

### **Facebook Development User:**
- **Email**: `dev.facebook@example.com`
- **Name**: `Dev Facebook User`
- **Role**: `user`
- **Avatar**: Placeholder image

## 🔧 **OAuth Status Check**

Check status OAuth dengan mengakses:
```
GET http://localhost:5000/api/oauth/status
```

Response:
```json
{
  "success": true,
  "google": {
    "configured": false,
    "clientId": "not configured"
  },
  "facebook": {
    "configured": false,
    "appId": "not configured"
  },
  "development": {
    "googleMock": "http://localhost:5000/api/oauth/dev/google",
    "facebookMock": "http://localhost:5000/api/oauth/dev/facebook"
  }
}
```

## 🎨 **User Experience**

### **Development Mode Flow:**
```
1. User clicks "Login with Google/Facebook"
2. Redirect to /api/oauth/dev/google atau /api/oauth/dev/facebook
3. System creates/finds mock user
4. Generate JWT token
5. Redirect to frontend with token
6. Frontend logs user in
7. Toast shows "(Development Mode)"
```

### **Error Handling:**
- ✅ **Graceful fallback** jika OAuth tidak dikonfigurasi
- ✅ **Clear error messages** untuk user
- ✅ **Console logging** untuk debugging

## 🔄 **Production vs Development**

### **Development Mode (Current):**
- ✅ **No OAuth setup required**
- ✅ **Mock users** untuk testing
- ✅ **Instant login** untuk development
- ✅ **Same JWT system** seperti production

### **Production Mode:**
- ✅ **Real OAuth** dengan Google/Facebook
- ✅ **Real user accounts** dari OAuth providers
- ✅ **Secure authentication** dengan OAuth 2.0
- ✅ **Same JWT system** seperti development

## 🛠️ **Technical Details**

### **Development OAuth Implementation:**
```javascript
// Mock Google OAuth
router.get('/dev/google', async (req, res) => {
  // Create/find mock user
  let user = await User.findOne({ email: 'dev.google@example.com' });
  
  if (!user) {
    user = new User({
      name: 'Dev Google User',
      email: 'dev.google@example.com',
      // ... other fields
    });
    await user.save();
  }

  // Generate JWT token
  const token = generateToken(createTokenPayload(user));
  
  // Redirect with token
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&provider=google&dev=true`);
});
```

### **Configuration Check:**
```javascript
const isOAuthConfigured = () => {
  return process.env.GOOGLE_CLIENT_ID && 
         process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
         process.env.GOOGLE_CLIENT_SECRET && 
         process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret';
};
```

## 📋 **Testing Checklist**

### **Development Mode Testing:**
- ✅ **Google Dev Login** - Test dengan `/api/oauth/dev/google`
- ✅ **Facebook Dev Login** - Test dengan `/api/oauth/dev/facebook`
- ✅ **User Creation** - Verify mock users created
- ✅ **JWT Token** - Verify token generation
- ✅ **Frontend Integration** - Test login flow
- ✅ **Error Handling** - Test error scenarios

### **Production Mode Testing:**
- ✅ **Real OAuth** - Test dengan credentials yang benar
- ✅ **Account Linking** - Test linking ke akun yang ada
- ✅ **Security** - Verify OAuth security
- ✅ **Error Handling** - Test OAuth errors

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **1. "OAuth not configured"**
- ✅ **Development mode aktif** - ini normal untuk development
- ✅ **Mock OAuth** akan digunakan otomatis

#### **2. "Token not found"**
- ✅ **Check callback URL** - pastikan redirect benar
- ✅ **Check console** untuk error details

#### **3. "User creation failed"**
- ✅ **Check database connection**
- ✅ **Check User model** validation

## 🎯 **Benefits**

### **For Developers:**
- ✅ **No OAuth setup** required untuk development
- ✅ **Instant testing** dengan mock users
- ✅ **Same codebase** untuk dev dan production
- ✅ **Easy debugging** dengan clear error messages

### **For Testing:**
- ✅ **Consistent test data** dengan mock users
- ✅ **Reliable login** tanpa external dependencies
- ✅ **Fast development** cycle
- ✅ **Easy CI/CD** integration

## 📞 **Support**

Jika ada masalah dengan development mode:
1. **Check console** untuk error messages
2. **Verify database** connection
3. **Test OAuth status** endpoint
4. **Check mock user** creation

---

**Note:** Development mode OAuth sudah aktif dan siap digunakan. Tidak perlu setup OAuth credentials untuk development!
