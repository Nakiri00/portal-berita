/**
 * Email Templates untuk Kamus Mahasiswa
 * Template HTML yang dapat digunakan untuk email reset password dan welcome
 */

// Template untuk Reset Password
const resetPasswordTemplate = (userName, resetLink) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header dengan Logo Kamus Mahasiswa -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 25px; text-align: center; position: relative;">
        <div style="background: white; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="font-size: 32px; font-weight: bold; color: #1e40af; text-align: center; line-height: 1;">
            📚<br><span style="font-size: 8px; display: block; margin-top: -2px;">MAHASISWA</span>
          </div>
        </div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Kamus Mahasiswa</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Portal Berita & Informasi Kampus</p>
      </div>
      
      <div style="padding: 35px; background: #f8fafc;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 22px; font-weight: 600;">Reset Password Anda</h2>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">Halo, <strong>${userName}</strong>!</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px;">
          <p style="color: #475569; line-height: 1.7; margin: 0 0 15px 0; font-size: 15px;">
            Kami menerima permintaan untuk mereset password akun Kamus Mahasiswa Anda. Jika Anda tidak meminta ini, Anda dapat mengabaikan email ini dengan aman.
          </p>
          
          <p style="color: #475569; line-height: 1.7; margin: 0 0 20px 0; font-size: 15px;">
            Untuk membuat password baru, klik tombol di bawah ini:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 15px;
                      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
                      transition: all 0.3s ease;">
              🔐 Reset Password
            </a>
          </div>
          
          <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>💡 Tips Keamanan:</strong><br>
              • Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol<br>
              • Jangan bagikan password dengan siapa pun<br>
              • Ganti password secara berkala untuk keamanan akun Anda
            </p>
          </div>
          
          <p style="color: #64748b; line-height: 1.6; font-size: 14px; margin: 20px 0 0 0;">
            <strong>Link alternatif:</strong><br>
            <a href="${resetLink}" style="color: #3b82f6; word-break: break-all; text-decoration: underline;">${resetLink}</a>
          </p>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
            <strong>⏰ Waktu Terbatas:</strong> Link reset password ini akan berlaku selama <strong>1 jam</strong>. Jika link sudah expired, Anda dapat meminta link baru melalui halaman login.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <p style="color: #64748b; margin: 0; font-size: 13px; line-height: 1.5;">
            <strong>Butuh bantuan?</strong> Hubungi tim support kami di <a href="mailto:support@kamusammahasiswa.com" style="color: #3b82f6;">support@kamusammahasiswa.com</a>
          </p>
        </div>
      </div>
      
      <div style="background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0; color: #94a3b8;">© 2025 Kamus Mahasiswa - Portal Berita & Informasi Kampus</p>
        <p style="margin: 8px 0 0 0; color: #64748b;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
        <div style="margin-top: 15px;">
          <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Kebijakan Privasi</a>
          <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Syarat & Ketentuan</a>
          <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Bantuan</a>
        </div>
      </div>
    </div>
  `;
};

// Template untuk Welcome Email
const welcomeTemplate = (userName, frontendUrl) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <!-- Header dengan Logo Kamus Mahasiswa -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 25px; text-align: center; position: relative;">
        <div style="background: white; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="font-size: 32px; font-weight: bold; color: #1e40af; text-align: center; line-height: 1;">
            📚<br><span style="font-size: 8px; display: block; margin-top: -2px;">MAHASISWA</span>
          </div>
        </div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Kamus Mahasiswa</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Portal Berita & Informasi Kampus</p>
      </div>
      
      <div style="padding: 35px; background: #f8fafc;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 22px; font-weight: 600;">🎉 Selamat Datang!</h2>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">Halo, <strong>${userName}</strong>!</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px;">
          <p style="color: #475569; line-height: 1.7; margin: 0 0 20px 0; font-size: 15px; text-align: center;">
            🎓 <strong>Selamat bergabung di Kamus Mahasiswa!</strong><br>
            Akun Anda telah berhasil dibuat dan siap digunakan.
          </p>
          
          <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">🚀 Fitur yang dapat Anda nikmati:</h3>
            <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>📰 Berita Terkini</strong> - Dapatkan informasi terbaru dari kampus</li>
              <li><strong>💾 Simpan Artikel</strong> - Koleksi artikel favorit untuk dibaca nanti</li>
              <li><strong>👥 Ikuti Penulis</strong> - Follow penulis favorit Anda</li>
              <li><strong>💬 Diskusi Interaktif</strong> - Berpartisipasi dalam diskusi menarik</li>
              <li><strong>🔔 Notifikasi</strong> - Dapatkan notifikasi artikel terbaru</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}" 
               style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;
                      font-size: 15px;
                      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
              🎯 Mulai Jelajahi Kamus Mahasiswa
            </a>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>💡 Tips untuk Anda:</strong><br>
              • Lengkapi profil Anda untuk pengalaman yang lebih personal<br>
              • Aktifkan notifikasi untuk tidak ketinggalan berita terbaru<br>
              • Ikuti topik yang Anda minati untuk konten yang relevan
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <p style="color: #64748b; margin: 0; font-size: 13px; line-height: 1.5;">
            <strong>Ada pertanyaan?</strong> Tim support kami siap membantu di <a href="mailto:support@kamusammahasiswa.com" style="color: #3b82f6;">support@kamusammahasiswa.com</a>
          </p>
        </div>
      </div>
      
      <div style="background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0; color: #94a3b8;">© 2025 Kamus Mahasiswa - Portal Berita & Informasi Kampus</p>
        <p style="margin: 8px 0 0 0; color: #64748b;">Selamat mengeksplorasi dunia kampus bersama kami!</p>
        <div style="margin-top: 15px;">
          <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Kebijakan Privasi</a>
          <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Syarat & Ketentuan</a>
          <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 11px;">Bantuan</a>
        </div>
      </div>
    </div>
  `;
};

// Fungsi untuk generate preview HTML file
const generatePreview = () => {
  const fs = require('fs');
  const path = require('path');
  
  const resetPasswordHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview - Reset Password Email</title>
    </head>
    <body>
      ${resetPasswordTemplate('John Doe', 'http://localhost:5173/reset-password?token=sample-token-123')}
    </body>
    </html>
  `;
  
  const welcomeHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview - Welcome Email</title>
    </head>
    <body>
      ${welcomeTemplate('John Doe', 'http://localhost:5173')}
    </body>
    </html>
  `;
  
  // Simpan file preview
  fs.writeFileSync(path.join(__dirname, 'preview-reset-password.html'), resetPasswordHtml);
  fs.writeFileSync(path.join(__dirname, 'preview-welcome.html'), welcomeHtml);
  
  console.log('✅ Preview files generated:');
  console.log('   - preview-reset-password.html');
  console.log('   - preview-welcome.html');
};

module.exports = {
  resetPasswordTemplate,
  welcomeTemplate,
  generatePreview
};

// Jika file ini dijalankan langsung, generate preview
if (require.main === module) {
  generatePreview();
}
