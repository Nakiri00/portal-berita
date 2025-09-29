# 📧 Email Templates - Kamus Mahasiswa

Template email HTML untuk sistem Kamus Mahasiswa dengan branding yang konsisten.

## 🎨 Fitur Template

### ✅ Reset Password Email
- **Logo Kamus Mahasiswa** dengan ikon 📚 dan teks "MAHASISWA"
- **Design modern** dengan gradient biru dan shadow effects
- **Kata-kata yang jelas** untuk reset password
- **Tips keamanan** untuk pengguna
- **Link alternatif** jika tombol tidak berfungsi
- **Warning waktu terbatas** (1 jam)
- **Contact support** untuk bantuan

### ✅ Welcome Email
- **Branding konsisten** dengan reset password
- **Daftar fitur** yang dapat dinikmati pengguna
- **Tips penggunaan** untuk pengalaman terbaik
- **Call-to-action** untuk mulai menggunakan platform

## 📁 File Structure

```
backend/templates/
├── emailTemplates.js          # Template functions
├── preview-reset-password.html # Preview reset password
├── preview-welcome.html       # Preview welcome email
└── README.md                  # Dokumentasi ini
```

## 🚀 Cara Penggunaan

### 1. Generate Preview
```bash
cd backend
node test-email.js
```

### 2. Lihat Preview
Buka file HTML di browser:
- `preview-reset-password.html`
- `preview-welcome.html`

### 3. Test Email (dengan Gmail)
1. Update `config.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

2. Jalankan test:
   ```bash
   node test-email.js
   ```

## 🎯 Fitur Template

### Design Elements
- **Font**: Segoe UI, Tahoma, Geneva, Verdana
- **Color Scheme**: Blue gradient (#1e40af → #3b82f6 → #60a5fa)
- **Logo**: Circular design dengan ikon buku dan teks "MAHASISWA"
- **Layout**: Responsive dengan max-width 600px
- **Shadows**: Modern box-shadow effects

### Content Structure
1. **Header**: Logo dan branding
2. **Greeting**: Personalisasi dengan nama user
3. **Main Content**: Informasi utama dengan styling yang menarik
4. **Call-to-Action**: Tombol dengan gradient dan hover effects
5. **Tips/Info**: Box dengan warna berbeda untuk highlight
6. **Footer**: Copyright dan links

### Security Features
- **Time Limit Warning**: Link berlaku 1 jam
- **Security Tips**: Panduan password yang aman
- **Alternative Link**: Backup jika tombol tidak berfungsi
- **Support Contact**: Bantuan jika ada masalah

## 🔧 Customization

### Mengubah Logo
Edit di `emailTemplates.js`:
```javascript
// Ganti emoji dan teks
📚<br><span style="font-size: 8px;">MAHASISWA</span>
```

### Mengubah Warna
Update gradient colors:
```javascript
// Dari: #1e40af 0%, #3b82f6 50%, #60a5fa 100%
// Ke: warna yang diinginkan
```

### Mengubah Konten
Edit teks di dalam template functions sesuai kebutuhan.

## 📧 Gmail Configuration

### Setup App Password
1. Enable 2-Factor Authentication di Gmail
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" dan generate password
3. Update `config.env` dengan App Password (bukan password biasa)

### Testing
```bash
# Test email configuration
node test-email.js

# Test dengan data real
node -e "
const { sendResetPasswordEmail } = require('./services/emailService');
sendResetPasswordEmail('test@gmail.com', 'http://localhost:5173/reset?token=123', 'Test User')
  .then(console.log)
  .catch(console.error);
"
```

## 🎨 Preview

### Reset Password Email
- Header dengan logo Kamus Mahasiswa
- Pesan reset password yang jelas
- Tombol "🔐 Reset Password" dengan styling menarik
- Tips keamanan dalam box biru
- Warning waktu terbatas dalam box kuning
- Link alternatif dan contact support

### Welcome Email
- Header branding yang sama
- Pesan selamat datang yang hangat
- Daftar fitur dengan emoji
- Tombol "🎯 Mulai Jelajahi Kamus Mahasiswa"
- Tips penggunaan dalam box hijau
- Contact support

## 🔄 Integration

Template ini sudah terintegrasi dengan:
- `backend/services/emailService.js` - Service email utama
- `backend/controllers/authController.js` - Controller registrasi
- `backend/controllers/passwordController.js` - Controller reset password

## 📝 Notes

- Template menggunakan inline CSS untuk kompatibilitas email client
- Responsive design untuk mobile dan desktop
- Emoji digunakan untuk visual appeal yang lebih baik
- Color scheme konsisten dengan brand Kamus Mahasiswa
- Semua text dalam Bahasa Indonesia
