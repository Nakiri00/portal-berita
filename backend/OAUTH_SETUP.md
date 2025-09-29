# 🔐 OAuth Setup - Google & Facebook Login

Panduan lengkap untuk mengkonfigurasi autentikasi OAuth Google dan Facebook untuk Kamus Mahasiswa.

## 🎯 **Fitur OAuth yang Tersedia**

- ✅ **Google OAuth 2.0** - Login dengan akun Google
- ✅ **Facebook OAuth 2.0** - Login dengan akun Facebook
- ✅ **Auto Account Creation** - Buat akun otomatis jika belum ada
- ✅ **Account Linking** - Link OAuth ke akun yang sudah ada
- ✅ **JWT Token Integration** - Terintegrasi dengan sistem JWT yang ada

## 🔧 **Setup Google OAuth**

### **Langkah 1: Buat Google Cloud Project**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Enable Google+ API dan Google Identity API

### **Langkah 2: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Pilih **External** (untuk testing) atau **Internal** (untuk G Suite)
3. Isi informasi aplikasi:
   - **App name**: Kamus Mahasiswa
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com

### **Langkah 3: Create OAuth Credentials**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Pilih **Web application**
4. Tambahkan **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/oauth/google/callback
   https://yourdomain.com/api/oauth/google/callback
   ```

### **Langkah 4: Update Config**
Edit `backend/config.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📘 **Setup Facebook OAuth**

### **Langkah 1: Buat Facebook App**
1. Buka [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App** → **Consumer** → **Next**
3. Isi informasi aplikasi:
   - **App name**: Kamus Mahasiswa
   - **App contact email**: your-email@gmail.com

### **Langkah 2: Configure Facebook Login**
1. Go to **Products** → **Facebook Login** → **Set up**
2. Pilih **Web** platform
3. Tambahkan **Site URL**:
   ```
   http://localhost:5173
   https://yourdomain.com
   ```

### **Langkah 3: Configure OAuth Redirect URIs**
1. Go to **Facebook Login** → **Settings**
2. Tambahkan **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/oauth/facebook/callback
   https://yourdomain.com/api/oauth/facebook/callback
   ```

### **Langkah 4: Update Config**
Edit `backend/config.env`:
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## 🔑 **Environment Configuration**

Update file `backend/config.env`:
```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Backend URL (untuk callback)
BACKEND_URL=http://localhost:5000
```

## 🚀 **Testing OAuth**

### **1. Start Backend Server**
```bash
cd backend
npm run dev
```

### **2. Start Frontend**
```bash
cd ..
npm run dev
```

### **3. Test OAuth Login**
1. Buka `http://localhost:5173`
2. Klik tombol login
3. Pilih **Google** atau **Facebook**
4. Ikuti proses OAuth
5. User akan di-redirect kembali ke aplikasi

## 📋 **OAuth Flow**

### **Google OAuth Flow:**
```
1. User clicks "Login with Google"
2. Redirect to Google OAuth consent screen
3. User authorizes application
4. Google redirects to /api/oauth/google/callback
5. Passport handles authentication
6. Generate JWT token
7. Redirect to frontend with token
8. Frontend stores token and logs user in
```

### **Facebook OAuth Flow:**
```
1. User clicks "Login with Facebook"
2. Redirect to Facebook OAuth consent screen
3. User authorizes application
4. Facebook redirects to /api/oauth/facebook/callback
5. Passport handles authentication
6. Generate JWT token
7. Redirect to frontend with token
8. Frontend stores token and logs user in
```

## 🛠 **Development Mode**

Jika OAuth belum dikonfigurasi, sistem akan:
- ✅ **Server tetap berjalan** tanpa error
- ✅ **Tombol OAuth tersedia** tapi akan redirect ke provider
- ✅ **Error handling** yang baik untuk development

## 🔒 **Security Features**

### **OAuth Security:**
- ✅ **HTTPS required** untuk production
- ✅ **State parameter** untuk CSRF protection
- ✅ **Secure session cookies**
- ✅ **JWT token validation**

### **User Data Protection:**
- ✅ **Minimal data collection** (email, name, avatar)
- ✅ **Account linking** untuk akun yang sudah ada
- ✅ **Secure password handling**

## 📱 **Frontend Integration**

### **Login Buttons:**
```tsx
// Google Login
<Button onClick={() => handleSocialLogin('Google')}>
  Login with Google
</Button>

// Facebook Login
<Button onClick={() => handleSocialLogin('Facebook')}>
  Login with Facebook
</Button>
```

### **OAuth URLs:**
- **Google**: `/api/oauth/google`
- **Facebook**: `/api/oauth/facebook`
- **Callback**: `/auth/callback`

## 🎨 **User Experience**

### **Features:**
- ✅ **One-click login** dengan OAuth
- ✅ **Auto account creation** jika belum ada
- ✅ **Seamless integration** dengan sistem yang ada
- ✅ **Error handling** yang user-friendly

### **UI/UX:**
- ✅ **Loading states** saat OAuth processing
- ✅ **Success/Error messages** dengan toast
- ✅ **Redirect handling** yang smooth

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **1. "Invalid redirect URI"**
- ✅ Pastikan redirect URI sama persis dengan yang dikonfigurasi
- ✅ Gunakan HTTPS untuk production
- ✅ Cek apakah ada trailing slash

#### **2. "App not verified"**
- ✅ Untuk development, tambahkan email ke test users
- ✅ Untuk production, lakukan app verification

#### **3. "OAuth error"**
- ✅ Cek client ID dan secret
- ✅ Pastikan API sudah di-enable
- ✅ Cek domain yang diizinkan

## 📞 **Support**

Jika ada masalah:
1. **Cek console** untuk error details
2. **Verifikasi credentials** di provider dashboard
3. **Test dengan akun lain** untuk isolasi masalah
4. **Cek network tab** untuk request/response

---

**Note:** OAuth sudah terintegrasi dengan sistem yang ada. User yang login dengan OAuth akan memiliki akses yang sama dengan user yang registrasi manual.
