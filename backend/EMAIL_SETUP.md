# 📧 Setup Email Gmail untuk Kamus Mahasiswa

Panduan lengkap untuk mengkonfigurasi email Gmail agar fitur reset password berfungsi dengan baik.

## 🚨 **Error yang Diatasi**

```
❌ Email sending failed: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

Error ini terjadi karena:
1. **Email tidak dikonfigurasi** dengan benar
2. **Menggunakan password biasa** bukan App Password
3. **2-Factor Authentication** tidak diaktifkan

## ✅ **Solusi Development Mode**

Sistem sudah diperbaiki dengan fallback untuk development:
- ✅ **Server tetap berjalan** meski email tidak dikonfigurasi
- ✅ **Reset link ditampilkan di console** untuk testing
- ✅ **Tidak ada error** yang mengganggu development

## 🔧 **Setup Email Gmail (Production)**

### **Langkah 1: Aktifkan 2-Factor Authentication**
1. Buka [Google Account Settings](https://myaccount.google.com/)
2. Pilih **Security** → **2-Step Verification**
3. Aktifkan 2-Factor Authentication jika belum

### **Langkah 2: Generate App Password**
1. Masuk ke [Google Account](https://myaccount.google.com/)
2. Pilih **Security** → **2-Step Verification** → **App passwords**
3. Pilih **Mail** dari dropdown
4. Klik **Generate**
5. **Copy password** yang dihasilkan (16 karakter)

### **Langkah 3: Update Config**
Edit file `backend/config.env`:

```env
# Email Configuration
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Contoh:**
```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### **Langkah 4: Restart Server**
```bash
cd backend
npm run dev
```

## 🧪 **Testing Email**

### **1. Test Configuration**
```bash
cd backend
node test-email.js
```

### **2. Test Reset Password**
1. Buka aplikasi di browser
2. Klik "Lupa Password?"
3. Masukkan email
4. Cek console server untuk reset link

### **3. Preview Email Template**
```bash
cd backend/templates
# Buka file HTML di browser:
# - preview-reset-password.html
# - preview-welcome.html
```

## 📋 **Troubleshooting**

### **Error: Invalid login**
- ✅ Pastikan menggunakan **App Password** bukan password biasa
- ✅ Pastikan 2-Factor Authentication sudah aktif
- ✅ Pastikan email benar (tanpa spasi)

### **Error: Connection timeout**
- ✅ Cek koneksi internet
- ✅ Pastikan Gmail tidak diblokir firewall

### **Email tidak terkirim**
- ✅ Cek spam folder
- ✅ Pastikan email tujuan valid
- ✅ Cek console server untuk error details

## 🔒 **Security Best Practices**

### **Environment Variables**
- ✅ **Jangan commit** `config.env` ke git
- ✅ **Gunakan .env** untuk production
- ✅ **Rotate App Password** secara berkala

### **Production Setup**
```env
# Production config
EMAIL_USER=production@yourdomain.com
EMAIL_PASSWORD=your-production-app-password
NODE_ENV=production
```

## 📱 **Development vs Production**

### **Development Mode** (Current)
- ✅ **Fallback aktif** - server tetap berjalan
- ✅ **Reset link di console** untuk testing
- ✅ **Tidak perlu setup email** untuk development

### **Production Mode**
- ✅ **Email terkirim** ke user
- ✅ **Template email** yang menarik
- ✅ **Branding Kamus Mahasiswa** yang konsisten

## 🎯 **Quick Start**

### **Untuk Development:**
```bash
# Server sudah berjalan dengan fallback
cd backend
npm run dev
# Reset link akan muncul di console
```

### **Untuk Production:**
```bash
# 1. Setup Gmail App Password
# 2. Update config.env
# 3. Restart server
npm run dev
```

## 📞 **Support**

Jika masih ada masalah:
1. **Cek console** untuk error details
2. **Test dengan email lain** (Gmail, Yahoo, dll)
3. **Verifikasi App Password** di Google Account
4. **Pastikan 2FA aktif** sebelum generate App Password

---

**Note:** Sistem sudah diperbaiki untuk development. Email akan berfungsi otomatis setelah konfigurasi Gmail yang benar.
